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

  it('segnala TTS attivo senza configurazione', () => {
    expect(checkLibrechatConfig(bad).some((x) => x.includes('speech: sintesi vocale'))).toBe(true);
  });

  it('TTS con motore browser (default) non richiede configurazione', () => {
    const y = `${ok}\nspeech:\n  speechTab:\n    textToSpeech: true\n`;
    expect(checkLibrechatConfig(y)).toEqual([]);
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
