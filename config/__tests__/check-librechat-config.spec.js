const fs = require('fs');
const os = require('os');
const path = require('path');
const { checkLibrechatConfig, applyKnown, parseEnv, main } = require('../check-librechat-config');

const fx = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const ok = fx('ok.librechat.yaml');
const bad = fx('bad.librechat.yaml');

describe('checkLibrechatConfig', () => {
  it('ok.librechat.yaml non ha problemi', () => {
    expect(checkLibrechatConfig(ok)).toEqual([]);
  });

  it("segnala titleModel assente tra i modelli dell'endpoint", () => {
    const p = checkLibrechatConfig(bad);
    expect(p.some((x) => x.includes('titleModel "gpt-5"'))).toBe(true);
    expect(p.some((x) => x.includes('titleModel "claude-haiku-4-5"'))).toBe(true);
  });

  it("accetta titleModel definito in ANTHROPIC_MODELS dell'env", () => {
    const env = parseEnv(fx('models.env'));
    const p = checkLibrechatConfig(bad, env);
    expect(p.some((x) => x.includes('titleModel "claude-haiku-4-5"'))).toBe(false);
    expect(p.some((x) => x.includes('titleModel "gpt-5"'))).toBe(true);
  });

  it('segnala tier di modelFallback senza spec', () => {
    expect(checkLibrechatConfig(bad).some((x) => x.includes('"auto-ghost"'))).toBe(true);
  });

  it('segnala fallback o candidato del router senza spec', () => {
    const p = checkLibrechatConfig(bad);
    expect(p.some((x) => x.includes('router.fallback "auto-nope"'))).toBe(true);
    expect(p.some((x) => x.includes('router.candidates "auto-phantom"'))).toBe(true);
  });

  it('segnala agentBuilder.spec inesistente', () => {
    expect(
      checkLibrechatConfig(bad).some((x) => x.includes('agentBuilder.spec: "auto-missing"')),
    ).toBe(true);
  });

  it('segnala speech.tts assente anche senza impostazioni speech', () => {
    expect(checkLibrechatConfig(bad).some((x) => x.includes('speech.tts non configurato'))).toBe(
      true,
    );
  });

  it('segnala speech.tts senza provider utilizzabile', () => {
    const y = `${bad}
speech:
  tts:
    openai: {}
    allowedAddresses: ['localhost:8020']
`;
    expect(checkLibrechatConfig(y).some((x) => x.includes('speech.tts non configurato'))).toBe(
      true,
    );
  });

  it('speechTab.textToSpeech: false non disattiva il TTS server (solo un default)', () => {
    const y = `${bad}
speech:
  speechTab:
    textToSpeech: false
`;
    expect(checkLibrechatConfig(y).some((x) => x.includes('speech.tts non configurato'))).toBe(
      true,
    );
  });

  it('speech.tts con un provider configurato è ok', () => {
    expect(checkLibrechatConfig(ok).some((x) => x.startsWith('speech:'))).toBe(false);
  });

  it('titleModel Google senza GOOGLE_MODELS non è verificabile: nessun problema', () => {
    const y = ok.replace('endpoints:\n', 'endpoints:\n  google:\n    titleModel: gemini-x\n');
    expect(checkLibrechatConfig(y)).toEqual([]);
  });
});

describe('tabelle di contesto e prezzo dei modelli', () => {
  const withCustom = (model, tokenConfig = '') =>
    `endpoints:\n  custom:\n    - name: X\n      models:\n        default: ["${model}"]\n${tokenConfig}`;
  const modelProblems = (y, env) =>
    checkLibrechatConfig(y, env).filter((p) => p.startsWith('modello '));

  it('modelli con voci proprie (anche point release GPT): nessun problema', () => {
    const y = `endpoints:
  azureOpenAI:
    groups:
      - group: D
        models:
          gpt-6.1-sol: { deploymentName: gpt-6.1-sol }
          gpt-5.6-terra: { deploymentName: gpt-5.6-terra }
  anthropic:
    vertex:
      models:
        claude-haiku-5-5: { deploymentName: claude-haiku-5-5 }
        claude-sonnet-5-5: { deploymentName: claude-sonnet-5-5 }
`;
    expect(modelProblems(y)).toEqual([]);
  });

  it('modello assente dalle tabelle: segnala contesto e prezzo', () => {
    const p = modelProblems(withCustom('glm5.2'));
    expect(p.some((x) => x.includes('"glm5.2"') && x.includes('contesto'))).toBe(true);
    expect(p.some((x) => x.includes('"glm5.2"') && x.includes('prezzo'))).toBe(true);
  });

  it('modello che cade su una voce di versione diversa: segnala il prezzo', () => {
    const p = modelProblems(withCustom('qwen3.8-27b'));
    expect(
      p.some((x) => x.includes('"qwen3.8-27b"') && x.includes('prezzo') && x.includes('"qwen3"')),
    ).toBe(true);
    expect(p.some((x) => x.includes('"qwen3.8-27b"') && x.includes('contesto'))).toBe(false);
  });

  it('Claude sulla voce generica "claude-": segnalato', () => {
    const y = `endpoints:\n  anthropic:\n    vertex:\n      models:\n        claude-newfamily-1: { deploymentName: x }\n`;
    const p = modelProblems(y);
    expect(p.some((x) => x.includes('"claude-newfamily-1"') && x.includes('"claude-"'))).toBe(true);
  });

  it("tokenConfig completo sull'endpoint custom copre il modello", () => {
    const tc =
      '      tokenConfig:\n        glm5.2: { prompt: 1, completion: 3, context: 131072 }\n';
    expect(modelProblems(withCustom('glm5.2', tc))).toEqual([]);
  });

  it('controlla anche i modelli di GOOGLE_MODELS', () => {
    const y = 'endpoints:\n  google:\n    streamRate: 5\n';
    expect(modelProblems(y, { GOOGLE_MODELS: 'gemini-2.5-flash,gemini-3-flash-preview' })).toEqual(
      [],
    );
    expect(modelProblems(y, { GOOGLE_MODELS: 'gemini-9-ultra' }).length).toBeGreaterThan(0);
  });
});

describe('--known', () => {
  const known = (problem) => [{ problem, ref: 'design §8' }];

  it('problema noto: non fallisce', () => {
    const problems = checkLibrechatConfig(bad);
    const r = applyKnown(
      problems,
      problems.map((p) => ({ problem: p, ref: 'design §8' })),
    );
    expect(r.nuovi).toEqual([]);
    expect(r.noti).toHaveLength(problems.length);
  });

  it('problema nuovo: fallisce', () => {
    const problems = checkLibrechatConfig(bad);
    const r = applyKnown(problems, known(problems[0]));
    expect(r.nuovi).toHaveLength(problems.length - 1);
  });

  it('voce nota non più presente: segnalata come risolta', () => {
    const r = applyKnown([], known('vecchio problema'));
    expect(r.risolti).toEqual(known('vecchio problema'));
    expect(r.nuovi).toEqual([]);
  });

  it('CLI: exit 1 con problemi nuovi, 0 se tutti noti', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const badPath = path.join(__dirname, 'fixtures', 'bad.librechat.yaml');
    expect(main(['node', 'x', badPath])).toBe(1);
    const tmp = path.join(os.tmpdir(), `known-${process.pid}.json`);
    fs.writeFileSync(
      tmp,
      JSON.stringify(checkLibrechatConfig(bad).map((problem) => ({ problem, ref: 'design §8' }))),
    );
    expect(main(['node', 'x', badPath, '--known', tmp])).toBe(0);
    fs.unlinkSync(tmp);
    log.mockRestore();
  });
});

describe('file_produzione/librechat.yaml', () => {
  const prod = fs.readFileSync(
    path.join(__dirname, '..', '..', 'file_produzione', 'librechat.yaml'),
    'utf8',
  );

  it('ogni titleModel punta a un modello abilitato sul suo endpoint', () => {
    expect(checkLibrechatConfig(prod).filter((p) => p.includes('titleModel'))).toEqual([]);
  });

  it('nessun problema di titleModel è tollerato in known.json', () => {
    const known = JSON.parse(fx('../../check-librechat-config.known.json'));
    expect(known.filter((k) => k.problem.includes('titleModel'))).toEqual([]);
  });
});
