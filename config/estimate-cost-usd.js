const fs = require('fs');
const path = require('path');

// Prezzi USD per 1M token (listino aprile 2026, input/output)
const PRICING = {
  'claude-opus-4-6':        { in: 5.00,  out: 25.00 },
  'claude-opus-4-5':        { in: 5.00,  out: 25.00 },
  'claude-sonnet-4-6':      { in: 3.00,  out: 15.00 },
  'claude-sonnet-4-5':      { in: 3.00,  out: 15.00 },
  'claude-haiku-4-5':       { in: 1.00,  out:  5.00 },
  'gpt-5':                  { in: 1.25,  out: 10.00 },
  'gpt-5.1':                { in: 1.25,  out: 10.00 },
  'gpt-5.2':                { in: 0.875, out:  7.00 },
  'gemini-2.5-pro':         { in: 1.25,  out: 10.00 },
  'gemini-2.5-flash':       { in: 0.15,  out:  0.60 },
  'gemini-2.5-flash-image': { in: 0.15,  out:  0.60 },
  'gemini-3-pro-preview':   { in: 2.00,  out: 12.00 },
  'gemini-3.1-pro-preview': { in: 2.00,  out: 12.00 },
  'gemini-3-flash-preview': { in: 0.50,  out:  3.00 },
};
// Fallback per agenti (modello sottostante non tracciato) → tier Sonnet
const AGENT_PRICING = { in: 3.00, out: 15.00 };

function priceFor(model) {
  if (PRICING[model]) return PRICING[model];
  if (model.startsWith('agent_')) return AGENT_PRICING;
  return null;
}

// Parse CSV
const csvPath = process.argv[2] || path.resolve(__dirname, '..', 'cost-remote-2026-04-17.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split('\n');

// Structure: per machine → per model → {prompt, completion}
const machines = {};
let currentMachine = null;
let section = null; // 'summary' | 'users' | 'models'
const summaries = {}; // machine → {active, registered}

for (const line of lines) {
  const machineMatch = line.match(/^=== (\S+) \(/);
  if (machineMatch) {
    currentMachine = machineMatch[1];
    machines[currentMachine] = {};
    summaries[currentMachine] = {};
    section = 'summary';
    continue;
  }
  if (line.startsWith('--- Modelli')) { section = 'models'; continue; }
  if (line.startsWith('--- Utenti')) { section = 'users'; continue; }
  if (!currentMachine) continue;

  if (section === 'summary') {
    const ar = line.match(/^Utenti attivi,(\d+)/);
    if (ar) summaries[currentMachine].active = parseInt(ar[1], 10);
    const rr = line.match(/^Utenti registrati,(\d+)/);
    if (rr) summaries[currentMachine].registered = parseInt(rr[1], 10);
  }

  if (section === 'models') {
    const m = line.match(/^"([^"]+)",(prompt|completion),(\d+),/);
    if (m) {
      const [, model, type, tokens] = m;
      if (!machines[currentMachine][model]) machines[currentMachine][model] = { prompt: 0, completion: 0 };
      machines[currentMachine][model][type] += parseInt(tokens, 10);
    }
  }
}

// Compute cost per model (aggregate fleet)
const fleetModel = {};
const unknownModels = new Set();
for (const [machine, models] of Object.entries(machines)) {
  for (const [model, tok] of Object.entries(models)) {
    const price = priceFor(model);
    if (!price) { unknownModels.add(model); continue; }
    if (!fleetModel[model]) fleetModel[model] = { prompt: 0, completion: 0, costUSD: 0 };
    const cost = (tok.prompt / 1e6) * price.in + (tok.completion / 1e6) * price.out;
    fleetModel[model].prompt += tok.prompt;
    fleetModel[model].completion += tok.completion;
    fleetModel[model].costUSD += cost;
  }
}

// Per-machine total cost
const perMachine = {};
for (const [machine, models] of Object.entries(machines)) {
  let cost = 0;
  for (const [model, tok] of Object.entries(models)) {
    const price = priceFor(model);
    if (!price) continue;
    cost += (tok.prompt / 1e6) * price.in + (tok.completion / 1e6) * price.out;
  }
  perMachine[machine] = cost;
}

// Output
console.log('\n=== STIMA COSTO API USD (30 GG) ===\n');

console.log('Per modello:');
const modelTable = Object.entries(fleetModel)
  .map(([m, v]) => ({
    Modello: m,
    'Token prompt (M)': (v.prompt / 1e6).toFixed(2),
    'Token compl (M)': (v.completion / 1e6).toFixed(2),
    'Costo USD': v.costUSD.toFixed(2),
  }))
  .sort((a, b) => parseFloat(b['Costo USD']) - parseFloat(a['Costo USD']));
console.table(modelTable);

const totalUSD = Object.values(fleetModel).reduce((s, v) => s + v.costUSD, 0);
console.log(`\nTotale fleet: $${totalUSD.toFixed(2)} USD / 30 giorni\n`);

console.log('Per macchina:');
const totalActive = Object.values(summaries).reduce((s, m) => s + (m.active || 0), 0);
const totalReg = Object.values(summaries).reduce((s, m) => s + (m.registered || 0), 0);
const machineTable = Object.entries(perMachine).map(([m, cost]) => ({
  Macchina: m,
  'Attivi': summaries[m].active,
  'Reg': summaries[m].registered,
  'Costo USD': cost.toFixed(2),
  '$/utente attivo': (cost / summaries[m].active).toFixed(2),
  '$/utente reg':    (cost / summaries[m].registered).toFixed(2),
}));
console.table(machineTable);

console.log(`\nCosto per utente attivo (media fleet):      $${(totalUSD / totalActive).toFixed(2)}/mese`);
console.log(`Costo per utente registrato (media fleet):  $${(totalUSD / totalReg).toFixed(2)}/mese`);
console.log(`Utenti attivi totali:    ${totalActive}`);
console.log(`Utenti registrati tot.:  ${totalReg}`);

if (unknownModels.size) {
  console.log(`\nModelli senza pricing (ignorati): ${[...unknownModels].join(', ')}`);
}
