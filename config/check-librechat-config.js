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

function checkLibrechatConfig(yamlText, env = {}) {
  const cfg = yaml.load(yamlText) ?? {};
  const problems = [];
  const specs = new Set(asArray(cfg.modelSpecs?.list).map((s) => s.name));

  checkTitleModels(cfg.endpoints ?? {}, env, problems);

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
