const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('./helpers');

const configPath = path.resolve(__dirname, 'machines.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// CLI args
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultVal;
}
const DAYS = parseInt(getArg('days', '30'), 10);
const CSV_OUTPUT = args.includes('--csv');
const MACHINE_FILTER = getArg('machine', null);
const FROM_DATE = getArg('from', null);
const TO_DATE = getArg('to', null);

function parseBoundary(value, endOfDay) {
  if (!value) return null;
  const iso = value.includes('T') ? value : `${value}T${endOfDay ? '23:59:59.999Z' : '00:00:00.000Z'}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    console.red(`Data invalida: ${value}. Usa formato YYYY-MM-DD o ISO8601.`);
    process.exit(1);
  }
  return d;
}

const fromDate = parseBoundary(FROM_DATE, false);
const toDate = parseBoundary(TO_DATE, true);
const USE_RANGE = fromDate !== null && toDate !== null;
if ((fromDate && !toDate) || (!fromDate && toDate)) {
  console.red('Specifica sia --from che --to, oppure nessuno dei due.');
  process.exit(1);
}

// Convert Windows backslash paths to forward slashes for bash/ssh
const sshKey = config.ssh.keyPath.replace(/\\/g, '/');
const sshUser = config.ssh.user;
const defaultPort = config.ssh.defaultPort || 22;
const mongoContainer = config.mongo.container;
const mongoDb = config.mongo.database;

const machines = config.machines
  .filter((m) => m.enabled !== false)
  .filter((m) => !MACHINE_FILTER || m.name.toLowerCase().includes(MACHINE_FILTER.toLowerCase()));

if (machines.length === 0) {
  console.red('Nessuna macchina attiva trovata. Controlla config/machines.json');
  process.exit(1);
}

function sshExec(machine, mongoQuery) {
  const port = machine.port || defaultPort;
  const host = `${sshUser}@${machine.host}`;
  const escapedQuery = mongoQuery.replace(/'/g, "'\\''");
  const remoteCmd = `docker exec ${mongoContainer} mongosh ${mongoDb} --quiet --eval '${escapedQuery}'`;

  const args = [];
  if (sshKey) args.push('-i', sshKey);
  args.push(
    '-p', String(port),
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ConnectTimeout=15',
    '-o', 'PreferredAuthentications=publickey',
    '-o', 'BatchMode=yes',
    host,
    remoteCmd,
  );

  try {
    const result = execFileSync('ssh', args, { encoding: 'utf8', timeout: 120000 });
    return result.trim();
  } catch (err) {
    console.red(`  Errore connessione a ${machine.name} (${machine.host}): ${err.message.split('\n')[0]}`);
    return null;
  }
}

function parseJsonResult(raw) {
  if (!raw) return null;
  try {
    // mongosh --quiet can still prepend warnings, find the JSON part
    const jsonStart = raw.indexOf('[');
    const jsonObjStart = raw.indexOf('{');
    const start = jsonStart >= 0 && (jsonObjStart < 0 || jsonStart < jsonObjStart) ? jsonStart : jsonObjStart;
    if (start < 0) return null;
    return JSON.parse(raw.slice(start));
  } catch {
    return null;
  }
}

const sinceMs = DAYS * 24 * 60 * 60 * 1000;
const MATCH_CREATED_AT = USE_RANGE
  ? `{ $gte: new Date("${fromDate.toISOString()}"), $lte: new Date("${toDate.toISOString()}") }`
  : `{ $gte: new Date(Date.now() - ${sinceMs}) }`;

// Queries — output EJSON-relaxed (default mongosh)
const QUERY_PLATFORM = `
JSON.stringify(db.transactions.aggregate([
  { $match: { createdAt: ${MATCH_CREATED_AT} } },
  { $group: {
      _id: null,
      totalTokenValue: { $sum: { $abs: "$tokenValue" } },
      promptTokens: { $sum: { $cond: [{ $eq: ["$tokenType", "prompt"] }, { $abs: "$rawAmount" }, 0] } },
      completionTokens: { $sum: { $cond: [{ $eq: ["$tokenType", "completion"] }, { $abs: "$rawAmount" }, 0] } },
      totalTransactions: { $sum: 1 },
      uniqueUsers: { $addToSet: "$user" }
  }},
  { $project: {
      _id: 0,
      totalTokenValue: 1,
      promptTokens: 1,
      completionTokens: 1,
      totalTokens: { $add: ["$promptTokens", "$completionTokens"] },
      totalTransactions: 1,
      activeUsers: { $size: "$uniqueUsers" }
  }}
]).toArray())
`.replace(/\n/g, ' ');

const QUERY_PER_USER = `
JSON.stringify(db.transactions.aggregate([
  { $match: { createdAt: ${MATCH_CREATED_AT} } },
  { $group: {
      _id: "$user",
      tokenValue: { $sum: { $abs: "$tokenValue" } },
      promptTokens: { $sum: { $cond: [{ $eq: ["$tokenType", "prompt"] }, { $abs: "$rawAmount" }, 0] } },
      completionTokens: { $sum: { $cond: [{ $eq: ["$tokenType", "completion"] }, { $abs: "$rawAmount" }, 0] } },
      txCount: { $sum: 1 }
  }},
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
  { $unwind: "$u" },
  { $project: {
      _id: 0,
      name: "$u.name",
      email: "$u.email",
      tokenValue: 1,
      promptTokens: 1,
      completionTokens: 1,
      totalTokens: { $add: ["$promptTokens", "$completionTokens"] },
      txCount: 1
  }},
  { $sort: { totalTokens: -1 } }
]).toArray())
`.replace(/\n/g, ' ');

const QUERY_PER_MODEL = `
JSON.stringify(db.transactions.aggregate([
  { $match: { createdAt: ${MATCH_CREATED_AT} } },
  { $group: {
      _id: { model: "$model", tokenType: "$tokenType" },
      tokenValue: { $sum: { $abs: "$tokenValue" } },
      totalTokens: { $sum: { $abs: "$rawAmount" } },
      avgTokens: { $avg: { $abs: "$rawAmount" } },
      count: { $sum: 1 }
  }},
  { $project: {
      _id: 0,
      model: "$_id.model",
      tokenType: "$_id.tokenType",
      tokenValue: 1,
      totalTokens: 1,
      avgTokens: { $round: ["$avgTokens", 0] },
      count: 1
  }},
  { $sort: { totalTokens: -1 } }
]).toArray())
`.replace(/\n/g, ' ');

const QUERY_USERS_TOTAL = `db.users.countDocuments({})`;

const PROVIDERS = ['openai', 'google'];
const PROVIDER_LABELS = {
  openai: 'OpenAI / Azure',
  google: 'Google (Gemini + Claude via Vertex)',
};

function classifyProvider(model) {
  if (!model) return 'other';
  const m = String(model).toLowerCase();
  if (m.startsWith('gpt') || /^o[1-9]/.test(m)) return 'openai';
  if (m.includes('gemini') || m.includes('claude')) return 'google';
  return 'other';
}

const QUERY_ACTIVITY = `
JSON.stringify(db.messages.aggregate([
  { $match: { createdAt: ${MATCH_CREATED_AT} } },
  { $group: { _id: "$user", msgs: { $sum: 1 } } },
  { $group: { _id: null, totalMsgs: { $sum: "$msgs" }, avgMsgs: { $avg: "$msgs" }, userCount: { $sum: 1 } } },
  { $project: { _id: 0, totalMsgs: 1, avgMsgs: { $round: ["$avgMsgs", 1] }, userCount: 1 } }
]).toArray())
`.replace(/\n/g, ' ');

// Main
const periodLabel = USE_RANGE
  ? `${fromDate.toISOString().slice(0, 10)} → ${toDate.toISOString().slice(0, 10)}`
  : `ultimi ${DAYS} giorni`;
console.purple('============================================');
console.purple('  SimpleAI — Remote Cost Report (Token)');
console.purple(`  Periodo: ${periodLabel}`);
console.purple(`  Macchine: ${machines.map((m) => m.name).join(', ')}`);
console.purple('============================================\n');

const allResults = [];

for (const machine of machines) {
  console.cyan(`\n>>> ${machine.name} (${machine.host})`);
  console.gray('  Connessione SSH...');

  // Total users
  const totalUsersRaw = sshExec(machine, QUERY_USERS_TOTAL);
  const totalUsers = totalUsersRaw ? parseInt(totalUsersRaw, 10) : 0;

  // Platform summary
  const platformRaw = sshExec(machine, QUERY_PLATFORM);
  const platform = parseJsonResult(platformRaw);
  const ps = platform && platform[0] ? platform[0] : null;

  if (!ps) {
    console.red(`  Nessuna transazione trovata su ${machine.name}`);
    allResults.push({ machine: machine.name, host: machine.host, error: true });
    continue;
  }

  console.purple(`\n  --- Riepilogo ---`);
  console.log(`  Utenti registrati:    ${totalUsers}`);
  console.log(`  Utenti attivi:        ${ps.activeUsers}`);
  console.log(`  Token prompt:         ${ps.promptTokens.toLocaleString()}`);
  console.log(`  Token completion:     ${ps.completionTokens.toLocaleString()}`);
  console.log(`  Token totali:         ${ps.totalTokens.toLocaleString()}`);
  console.log(`  Transazioni:          ${ps.totalTransactions.toLocaleString()}`);

  // Per user
  const perUserRaw = sshExec(machine, QUERY_PER_USER);
  const perUser = parseJsonResult(perUserRaw) || [];

  if (perUser.length > 0) {
    console.purple(`\n  --- Token per utente ---`);
    const userTable = perUser.map((u) => ({
      Nome: u.name,
      Email: u.email,
      Prompt: u.promptTokens.toLocaleString(),
      Completion: u.completionTokens.toLocaleString(),
      Totale: u.totalTokens.toLocaleString(),
      Transazioni: u.txCount,
    }));
    console.table(userTable);
  }

  // Per model
  const perModelRaw = sshExec(machine, QUERY_PER_MODEL);
  const perModel = parseJsonResult(perModelRaw) || [];

  if (perModel.length > 0) {
    console.purple(`  --- Token per modello ---`);
    const modelTable = perModel.map((m) => ({
      Modello: m.model || '(unknown)',
      Tipo: m.tokenType,
      'Token Totali': m.totalTokens.toLocaleString(),
      'Avg Token/Tx': m.avgTokens,
      Transazioni: m.count,
    }));
    console.table(modelTable);
  }

  // Activity
  const activityRaw = sshExec(machine, QUERY_ACTIVITY);
  const activity = parseJsonResult(activityRaw);
  const act = activity && activity[0] ? activity[0] : null;

  if (act) {
    console.purple(`  --- Attivita' ---`);
    console.log(`  Messaggi totali:       ${act.totalMsgs.toLocaleString()}`);
    console.log(`  Media messaggi/utente: ${act.avgMsgs}`);
  }

  // Token per user average
  const avgTokensPerUser = ps.activeUsers > 0 ? Math.round(ps.totalTokens / ps.activeUsers) : 0;

  console.purple(`\n  --- Sintesi ---`);
  console.log(`  Token medi per utente attivo: ${avgTokensPerUser.toLocaleString()}`);

  allResults.push({
    machine: machine.name,
    host: machine.host,
    error: false,
    totalUsers,
    activeUsers: ps.activeUsers,
    promptTokens: ps.promptTokens,
    completionTokens: ps.completionTokens,
    totalTokens: ps.totalTokens,
    totalTransactions: ps.totalTransactions,
    avgTokensPerUser,
    totalMessages: act ? act.totalMsgs : 0,
    avgMsgsPerUser: act ? act.avgMsgs : 0,
    perUser,
    perModel,
  });
}

// Aggregate across all machines
const validResults = allResults.filter((r) => !r.error);

// Provider matrix: { machine: { openai: {prompt, completion}, google: {prompt, completion} } }
const providerMatrix = {};
const providerTotals = {
  openai: { prompt: 0, completion: 0 },
  google: { prompt: 0, completion: 0 },
};
const unclassifiedModels = new Set();
for (const r of validResults) {
  providerMatrix[r.machine] = {
    openai: { prompt: 0, completion: 0 },
    google: { prompt: 0, completion: 0 },
  };
  for (const m of r.perModel) {
    const provider = classifyProvider(m.model);
    if (provider === 'other') {
      unclassifiedModels.add(m.model || '(unknown)');
      continue;
    }
    const bucket = m.tokenType === 'prompt' ? 'prompt' : 'completion';
    providerMatrix[r.machine][provider][bucket] += m.totalTokens;
    providerTotals[provider][bucket] += m.totalTokens;
  }
}

if (validResults.length > 1) {
  console.purple('\n============================================');
  console.purple('  AGGREGATO TUTTE LE MACCHINE');
  console.purple('============================================');

  const totals = validResults.reduce(
    (acc, r) => ({
      totalUsers: acc.totalUsers + r.totalUsers,
      activeUsers: acc.activeUsers + r.activeUsers,
      promptTokens: acc.promptTokens + r.promptTokens,
      completionTokens: acc.completionTokens + r.completionTokens,
      totalTokens: acc.totalTokens + r.totalTokens,
      totalTransactions: acc.totalTransactions + r.totalTransactions,
      totalMessages: acc.totalMessages + r.totalMessages,
    }),
    { totalUsers: 0, activeUsers: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, totalTransactions: 0, totalMessages: 0 },
  );

  const avgPerUser = totals.activeUsers > 0 ? Math.round(totals.totalTokens / totals.activeUsers) : 0;

  console.log(`  Utenti registrati totali:  ${totals.totalUsers}`);
  console.log(`  Utenti attivi totali:      ${totals.activeUsers}`);
  console.log(`  Token prompt totali:       ${totals.promptTokens.toLocaleString()}`);
  console.log(`  Token completion totali:   ${totals.completionTokens.toLocaleString()}`);
  console.log(`  Token totali:              ${totals.totalTokens.toLocaleString()}`);
  console.log(`  Token medi per utente:     ${avgPerUser.toLocaleString()}`);
  console.log(`  Messaggi totali:           ${totals.totalMessages.toLocaleString()}`);

  const machineTable = validResults.map((r) => ({
    Macchina: r.machine,
    'Utenti Attivi': r.activeUsers,
    'Token Prompt': r.promptTokens.toLocaleString(),
    'Token Completion': r.completionTokens.toLocaleString(),
    'Token Totali': r.totalTokens.toLocaleString(),
    'Avg Token/Utente': r.avgTokensPerUser.toLocaleString(),
  }));
  console.table(machineTable);

  // Provider share — quote per ripartizione fatture
  console.purple('\n============================================');
  console.purple('  QUOTE PER PROVIDER (per ripartizione fatture)');
  console.purple('============================================');
  if (unclassifiedModels.size > 0) {
    console.yellow(`  Modelli non classificati ed esclusi: ${[...unclassifiedModels].join(', ')}`);
  }

  for (const p of PROVIDERS) {
    const totP = providerTotals[p].prompt;
    const totC = providerTotals[p].completion;
    const totAll = totP + totC;
    if (totAll === 0) {
      console.gray(`\n  ${PROVIDER_LABELS[p]}: nessun token nel periodo`);
      continue;
    }
    console.purple(`\n  --- ${PROVIDER_LABELS[p]} ---`);
    const rows = validResults.map((r) => {
      const cell = providerMatrix[r.machine][p];
      const total = cell.prompt + cell.completion;
      return {
        Macchina: r.machine,
        'Token Prompt': cell.prompt.toLocaleString(),
        '% Prompt': totP > 0 ? `${((cell.prompt / totP) * 100).toFixed(2)}%` : '—',
        'Token Completion': cell.completion.toLocaleString(),
        '% Completion': totC > 0 ? `${((cell.completion / totC) * 100).toFixed(2)}%` : '—',
        'Token Totali': total.toLocaleString(),
        '% Totale': `${((total / totAll) * 100).toFixed(2)}%`,
      };
    });
    rows.push({
      Macchina: 'TOTALE',
      'Token Prompt': totP.toLocaleString(),
      '% Prompt': '100.00%',
      'Token Completion': totC.toLocaleString(),
      '% Completion': '100.00%',
      'Token Totali': totAll.toLocaleString(),
      '% Totale': '100.00%',
    });
    console.table(rows);
  }
}

// CSV export
if (CSV_OUTPUT) {
  const csvLines = [];
  const date = new Date().toISOString().slice(0, 10);

  csvLines.push(`SimpleAI Remote Cost Report — ${date} — ${periodLabel}`);
  csvLines.push('');

  for (const r of validResults) {
    csvLines.push(`=== ${r.machine} (${r.host}) ===`);
    csvLines.push('Metrica,Valore');
    csvLines.push(`Utenti registrati,${r.totalUsers}`);
    csvLines.push(`Utenti attivi,${r.activeUsers}`);
    csvLines.push(`Token prompt,${r.promptTokens}`);
    csvLines.push(`Token completion,${r.completionTokens}`);
    csvLines.push(`Token totali,${r.totalTokens}`);
    csvLines.push(`Transazioni,${r.totalTransactions}`);
    csvLines.push(`Avg token/utente,${r.avgTokensPerUser}`);
    csvLines.push(`Messaggi totali,${r.totalMessages}`);
    csvLines.push(`Avg messaggi/utente,${r.avgMsgsPerUser}`);
    csvLines.push('');

    csvLines.push(`--- Utenti (${r.machine}) ---`);
    csvLines.push('Nome,Email,Token Prompt,Token Completion,Token Totali,Transazioni');
    for (const u of r.perUser) {
      csvLines.push(`"${u.name}","${u.email}",${u.promptTokens},${u.completionTokens},${u.totalTokens},${u.txCount}`);
    }
    csvLines.push('');

    csvLines.push(`--- Modelli (${r.machine}) ---`);
    csvLines.push('Modello,Tipo,Token Totali,Avg Token/Tx,Transazioni');
    for (const m of r.perModel) {
      csvLines.push(`"${m.model || '(unknown)'}",${m.tokenType},${m.totalTokens},${m.avgTokens},${m.count}`);
    }
    csvLines.push('');
  }

  if (validResults.length > 1) {
    csvLines.push('=== QUOTE PER PROVIDER (ripartizione fatture) ===');
    if (unclassifiedModels.size > 0) {
      csvLines.push(`Modelli esclusi: ${[...unclassifiedModels].join('; ')}`);
    }
    csvLines.push('');
    for (const p of PROVIDERS) {
      const totP = providerTotals[p].prompt;
      const totC = providerTotals[p].completion;
      const totAll = totP + totC;
      csvLines.push(`--- ${PROVIDER_LABELS[p]} ---`);
      csvLines.push('Macchina,Token Prompt,% Prompt,Token Completion,% Completion,Token Totali,% Totale');
      if (totAll === 0) {
        csvLines.push('(nessun token nel periodo)');
        csvLines.push('');
        continue;
      }
      for (const r of validResults) {
        const cell = providerMatrix[r.machine][p];
        const total = cell.prompt + cell.completion;
        const pPct = totP > 0 ? ((cell.prompt / totP) * 100).toFixed(2) : '0.00';
        const cPct = totC > 0 ? ((cell.completion / totC) * 100).toFixed(2) : '0.00';
        const tPct = ((total / totAll) * 100).toFixed(2);
        csvLines.push(`${r.machine},${cell.prompt},${pPct}%,${cell.completion},${cPct}%,${total},${tPct}%`);
      }
      csvLines.push(`TOTALE,${totP},100.00%,${totC},100.00%,${totAll},100.00%`);
      csvLines.push('');
    }
  }

  const csvPath = path.resolve(__dirname, '..', `cost-remote-${date}.csv`);
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
  console.green(`\nCSV esportato: ${csvPath}`);
}

console.purple('\nDone.');
