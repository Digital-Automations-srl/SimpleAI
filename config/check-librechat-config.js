const fs = require('fs');
const yaml = require('js-yaml');

const asArray = (v) => (Array.isArray(v) ? v : []);

function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

function envModels(env, key) {
  const raw = env[key];
  if (!raw) {
    return null;
  }
  return raw
    .split(',')
    .map((m) => m.trim().replace(/@.*$/, ''))
    .filter(Boolean);
}

function modelNames(models) {
  if (Array.isArray(models)) {
    return models.map((m) => (typeof m === 'string' ? m : m?.name)).filter(Boolean);
  }
  if (models && typeof models === 'object') {
    return Object.keys(models);
  }
  return [];
}

function checkTitleModels(endpoints, env, problems) {
  const check = (label, titleModel, models) => {
    if (!titleModel || titleModel === 'current_model' || models == null) {
      return;
    }
    if (!models.includes(titleModel)) {
      problems.push(
        `endpoint ${label}: titleModel "${titleModel}" non è tra i modelli dell'endpoint`,
      );
    }
  };

  const azure = endpoints.azureOpenAI;
  if (azure) {
    const fromGroups = asArray(azure.groups).flatMap((g) => modelNames(g.models));
    const models = [...fromGroups, ...(envModels(env, 'AZURE_OPENAI_MODELS') ?? [])];
    check('azureOpenAI', azure.titleModel, models.length ? models : null);
  }

  const anthropic = endpoints.anthropic;
  if (anthropic) {
    const models = [
      ...modelNames(anthropic.vertex?.models),
      ...(envModels(env, 'ANTHROPIC_MODELS') ?? []),
    ];
    check('anthropic', anthropic.titleModel, models.length ? models : null);
  }

  const google = endpoints.google;
  if (google) {
    // Senza GOOGLE_MODELS l'elenco modelli non è noto: non verificabile, nessun problema emesso.
    check('google', google.titleModel, envModels(env, 'GOOGLE_MODELS'));
  }

  for (const c of asArray(endpoints.custom)) {
    check(`custom "${c.name}"`, c.titleModel, modelNames(c.models?.default));
  }
}

/**
 * Versione di rilascio nel nome di un modello: `claude-haiku-5-5` → `5.5`, `qwen3.8-27b` → `3.8`.
 * Si ferma prima di taglie (`27b`, `122b`) e date (`-20250929`).
 */
function releaseVersion(name) {
  const m = name.match(/(?<![\d.])\d{1,2}(?:[.-]\d{1,2}(?![\da-z]))*/i);
  return m ? m[0].replace(/-/g, '.') : '';
}

/** La voce trovata in tabella è del modello stesso e non di una versione o famiglia generica. */
function coversModel(key, model, gptPointReleaseFamily) {
  if (key == null) {
    return false;
  }
  const keyVersion = releaseVersion(key);
  const family = gptPointReleaseFamily(model);
  return (
    keyVersion === releaseVersion(model) ||
    (family != null && keyVersion === releaseVersion(family))
  );
}

function loadModelTables() {
  const api = require('@librechat/api');
  const { tokenValues } = require('@librechat/data-schemas');
  const { gptPointReleaseFamily } = require('librechat-data-provider');
  return {
    findMatchingPattern: api.findMatchingPattern,
    maxTokensMap: api.maxTokensMap,
    tokenValues,
    gptPointReleaseFamily,
  };
}

function configuredModels(endpoints, env) {
  const azure = asArray(endpoints.azureOpenAI?.groups).flatMap((g) =>
    modelNames(g.models).map((model) => ({ endpoint: 'azureOpenAI', model })),
  );
  const anthropic = modelNames(endpoints.anthropic?.vertex?.models).map((model) => ({
    endpoint: 'anthropic',
    model,
  }));
  const google = endpoints.google
    ? (envModels(env, 'GOOGLE_MODELS') ?? []).map((model) => ({ endpoint: 'google', model }))
    : [];
  const custom = asArray(endpoints.custom).flatMap((c) =>
    modelNames(c.models?.default).map((model) => ({
      endpoint: 'custom',
      model,
      override: c.tokenConfig?.[model],
    })),
  );
  return [...azure, ...anthropic, ...google, ...custom];
}

/**
 * Un modello configurato che non ha una voce propria nelle tabelle di contesto (`tokens.ts`) e
 * di prezzo (`tx.ts`) parte lo stesso, ma con valori di ripiego: contesto potato a 32K o a 100K,
 * addebito a tariffa generica. Un `tokenConfig` completo sull'endpoint custom lo copre.
 */
function checkModelTables(endpoints, env, problems, tables) {
  for (const { endpoint, model, override } of configuredModels(endpoints, env)) {
    if (override?.context != null && override.prompt != null && override.completion != null) {
      continue;
    }
    const ctxKey = tables.findMatchingPattern(model, tables.maxTokensMap[endpoint] ?? {});
    if (!coversModel(ctxKey, model, tables.gptPointReleaseFamily)) {
      problems.push(
        `modello "${model}" (${endpoint}): contesto non in tabella (voce trovata: ${ctxKey ? `"${ctxKey}"` : 'nessuna'})`,
      );
    }
    const priceKey = tables.findMatchingPattern(model, tables.tokenValues);
    if (!coversModel(priceKey, model, tables.gptPointReleaseFamily)) {
      problems.push(
        `modello "${model}" (${endpoint}): prezzo non in tabella (voce trovata: ${priceKey ? `"${priceKey}"` : 'nessuna'})`,
      );
    }
  }
}

/**
 * Un allegato accettato in Automatico viene filtrato a ogni turno con i tipi ammessi
 * dall'endpoint del modello scelto: un tipo che un candidato non ammette sparisce dalla
 * cronologia quando il router passa a quel candidato. Solo i tipi che diventano testo:
 * immagini, audio e video dipendono da cosa il fornitore sa leggere.
 */
function checkRouterFileTypes(cfg, problems) {
  const {
    mergeFileConfig,
    fullMimeTypesList,
    getEndpointFileConfig,
    hasTextExtractionPath,
  } = require('librechat-data-provider');
  const fileConfig = mergeFileConfig(cfg.fileConfig);
  const accepts = (endpoint, type) =>
    fileConfig.checkType(type, getEndpointFileConfig({ fileConfig, endpoint }).supportedMimeTypes);
  const textTypes = fullMimeTypesList.filter(
    (type) => hasTextExtractionPath(type) && !/^(image|audio|video)\//.test(type),
  );
  const specs = new Map(asArray(cfg.modelSpecs?.list).map((s) => [s.name, s]));

  for (const spec of specs.values()) {
    const routerEndpoint = spec.router && spec.preset?.endpoint;
    if (!routerEndpoint) {
      continue;
    }
    const accepted = textTypes.filter((type) => accepts(routerEndpoint, type));
    for (const name of Object.keys(spec.router.candidates ?? {})) {
      const endpoint = specs.get(name)?.preset?.endpoint;
      if (!endpoint || endpoint === routerEndpoint) {
        continue;
      }
      const missing = accepted.filter((type) => !accepts(endpoint, type));
      if (missing.length > 0) {
        problems.push(
          `modelSpecs "${spec.name}": allegati ammessi da ${routerEndpoint} ma non da "${name}" (${endpoint}), spariscono quando il router passa a quel modello: ${missing.join(', ')}`,
        );
      }
    }
  }
}

/**
 * `engineTTS` è un'impostazione per-utente del client (localStorage, selezionabile dalle
 * impostazioni vocali), quindi il TTS server è raggiungibile dagli utenti a prescindere dal yaml.
 * Nessuna chiave del yaml lo impedisce: `speechTab.textToSpeech: false` è solo un default che
 * il localStorage dell'utente scavalca, e il client ripiega su `browser` solo quando
 * `speech.tts` manca. Senza un provider in `speech.tts` ogni richiesta TTS logga
 * "No TTS schema is set": si segnala quindi sempre.
 */
function checkTts(cfg, problems) {
  const configured = Object.entries(cfg.speech?.tts ?? {}).filter(
    ([k, v]) => k !== 'allowedAddresses' && v && typeof v === 'object' && Object.keys(v).length > 0,
  );
  if (configured.length === 0) {
    problems.push(
      'speech: speech.tts non configurato ma il TTS server è raggiungibile dagli utenti (motore esterno selezionabile)',
    );
  }
}

function checkLibrechatConfig(yamlText, env = {}, tables = loadModelTables()) {
  const cfg = yaml.load(yamlText) ?? {};
  const problems = [];
  const specs = new Set(asArray(cfg.modelSpecs?.list).map((s) => s.name));

  checkTitleModels(cfg.endpoints ?? {}, env, problems);
  checkModelTables(cfg.endpoints ?? {}, env, problems, tables);

  for (const tier of asArray(cfg.modelFallback?.tiers)) {
    for (const name of asArray(tier)) {
      if (!specs.has(name)) {
        problems.push(`modelFallback.tiers: "${name}" non è un name di modelSpecs.list`);
      }
    }
  }

  for (const spec of asArray(cfg.modelSpecs?.list)) {
    if (!spec.router) {
      continue;
    }
    const { fallback, candidates } = spec.router;
    if (fallback && !specs.has(fallback)) {
      problems.push(`modelSpecs "${spec.name}": router.fallback "${fallback}" non è una spec`);
    }
    for (const name of Object.keys(candidates ?? {})) {
      if (!specs.has(name)) {
        problems.push(`modelSpecs "${spec.name}": router.candidates "${name}" non è una spec`);
      }
    }
  }

  const builderSpec = cfg.agentBuilder?.spec;
  if (builderSpec && !specs.has(builderSpec)) {
    problems.push(`agentBuilder.spec: "${builderSpec}" non è un name di modelSpecs.list`);
  }

  checkRouterFileTypes(cfg, problems);
  checkTts(cfg, problems);
  return problems;
}

/** Separa i problemi in nuovi, noti (in lista) e voci della lista non più presenti. */
function applyKnown(problems, known) {
  const knownMap = new Map(known.map((k) => [k.problem, k.ref]));
  const nuovi = problems.filter((p) => !knownMap.has(p));
  const noti = problems
    .filter((p) => knownMap.has(p))
    .map((p) => ({ problem: p, ref: knownMap.get(p) }));
  const risolti = known.filter((k) => !problems.includes(k.problem));
  return { nuovi, noti, risolti };
}

function main(argv) {
  const args = argv.slice(2);
  const opt = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? null : args[i + 1];
  };
  const file = args.find(
    (a, i) => !a.startsWith('--') && !['--env', '--known'].includes(args[i - 1]),
  );
  if (!file) {
    console.error(
      'uso: node config/check-librechat-config.js <librechat.yaml> [--env <.env>] [--known <file.json>]',
    );
    return 2;
  }
  const envFile = opt('--env');
  const knownFile = opt('--known');
  const env = envFile ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};
  const known = knownFile ? JSON.parse(fs.readFileSync(knownFile, 'utf8')) : [];
  const { nuovi, noti, risolti } = applyKnown(
    checkLibrechatConfig(fs.readFileSync(file, 'utf8'), env),
    known,
  );
  for (const n of noti) {
    console.log(`noto: ${n.problem} [${n.ref}]`);
  }
  for (const r of risolti) {
    console.log(`risolto, togliere dalla lista: ${r.problem}`);
  }
  for (const p of nuovi) {
    console.log(p);
  }
  return nuovi.length ? 1 : 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { checkLibrechatConfig, applyKnown, parseEnv, main };
