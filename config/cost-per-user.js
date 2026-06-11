const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { silentExit } = require('./helpers');
const { User, Conversation, Message, Transaction, Balance } =
  require('@librechat/data-schemas').createModels(mongoose);
const connect = require('./connect');

// Parse CLI arguments
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseFloat(arg.split('=')[1]) : defaultVal;
}

const DAYS = getArg('days', 30);
const INFRA_COST = getArg('infra', 0);
const DEV_COST = getArg('dev', 0);
const ANCILLARY_COST = getArg('ancillary', 0);
const CSV_OUTPUT = args.includes('--csv');

const sinceDate = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

// tokenCredits to USD: 1,000,000 tokenCredits = $1 USD
// tokenValue in transactions uses the same scale
const TOKEN_VALUE_TO_USD = 1 / 1000000;

(async () => {
  await connect();

  console.purple('============================================');
  console.purple(`  SimpleAI — Cost Per User Report`);
  console.purple(`  Period: last ${DAYS} days`);
  console.purple('============================================\n');

  // 1. User counts
  const totalUsers = await User.countDocuments({});
  const activeUserIds = await Transaction.distinct('user', { createdAt: { $gte: sinceDate } });
  const activeUsers = activeUserIds.length;

  console.cyan(`[1/5] Utenti`);
  console.log(`  Registrati: ${totalUsers}`);
  console.log(`  Attivi (con transazioni): ${activeUsers}\n`);

  // 2. Platform summary — total API cost from transactions
  const [platformSummary] = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sinceDate } } },
    {
      $group: {
        _id: null,
        totalTokenValue: { $sum: '$tokenValue' },
        totalRawTokens: { $sum: { $abs: '$rawAmount' } },
        totalTransactions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        models: { $addToSet: '$model' },
      },
    },
    {
      $project: {
        totalCostUSD: { $multiply: [{ $abs: '$totalTokenValue' }, TOKEN_VALUE_TO_USD] },
        totalRawTokens: 1,
        totalTransactions: 1,
        activeUserCount: { $size: '$uniqueUsers' },
        modelsUsed: '$models',
      },
    },
  ]);

  if (!platformSummary) {
    console.red('Nessuna transazione trovata nel periodo selezionato.');
    silentExit(1);
  }

  console.cyan(`[2/5] Riepilogo piattaforma`);
  console.log(`  Costo API totale: $${platformSummary.totalCostUSD.toFixed(2)} USD`);
  console.log(`  Token totali: ${platformSummary.totalRawTokens.toLocaleString()}`);
  console.log(`  Transazioni: ${platformSummary.totalTransactions.toLocaleString()}`);
  console.log(`  Modelli usati: ${platformSummary.modelsUsed.filter(Boolean).join(', ')}\n`);

  // 3. Cost per user
  const perUserCosts = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sinceDate } } },
    {
      $group: {
        _id: '$user',
        totalTokenValue: { $sum: '$tokenValue' },
        totalRawTokens: { $sum: { $abs: '$rawAmount' } },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        name: '$userInfo.name',
        email: '$userInfo.email',
        totalTokenValue: 1,
        totalRawTokens: 1,
        transactionCount: 1,
        apiCostUSD: { $multiply: [{ $abs: '$totalTokenValue' }, TOKEN_VALUE_TO_USD] },
      },
    },
    { $sort: { apiCostUSD: -1 } },
  ]);

  console.cyan(`[3/5] Costo API per utente`);
  const userTable = perUserCosts.map((u) => ({
    Nome: u.name,
    Email: u.email,
    'Costo API ($)': u.apiCostUSD.toFixed(4),
    Token: u.totalRawTokens.toLocaleString(),
    Transazioni: u.transactionCount,
  }));
  console.table(userTable);

  // 4. Cost breakdown by model
  const modelBreakdown = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sinceDate } } },
    {
      $group: {
        _id: { model: '$model', tokenType: '$tokenType' },
        totalTokenValue: { $sum: '$tokenValue' },
        totalRawTokens: { $sum: { $abs: '$rawAmount' } },
        avgTokensPerTx: { $avg: { $abs: '$rawAmount' } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        model: '$_id.model',
        tokenType: '$_id.tokenType',
        costUSD: { $multiply: [{ $abs: '$totalTokenValue' }, TOKEN_VALUE_TO_USD] },
        totalRawTokens: 1,
        avgTokensPerTx: { $round: ['$avgTokensPerTx', 0] },
        count: 1,
      },
    },
    { $sort: { costUSD: -1 } },
  ]);

  console.cyan(`\n[4/5] Breakdown per modello`);
  const modelTable = modelBreakdown.map((m) => ({
    Modello: m.model || '(unknown)',
    Tipo: m.tokenType,
    'Costo ($)': m.costUSD.toFixed(4),
    'Token Totali': m.totalRawTokens.toLocaleString(),
    'Avg Token/Tx': m.avgTokensPerTx,
    Transazioni: m.count,
  }));
  console.table(modelTable);

  // 5. Activity metrics
  const activityData = [];
  for (const userId of activeUserIds) {
    const convos = await Conversation.countDocuments({ user: userId, createdAt: { $gte: sinceDate } });
    const msgs = await Message.countDocuments({ user: userId, createdAt: { $gte: sinceDate } });
    activityData.push({ userId, conversations: convos, messages: msgs });
  }

  const totalConvos = activityData.reduce((s, a) => s + a.conversations, 0);
  const totalMsgs = activityData.reduce((s, a) => s + a.messages, 0);
  const avgConvos = activeUsers > 0 ? (totalConvos / activeUsers).toFixed(1) : 0;
  const avgMsgs = activeUsers > 0 ? (totalMsgs / activeUsers).toFixed(1) : 0;

  console.cyan(`\n[5/5] Metriche attivita'`);
  console.log(`  Conversazioni totali: ${totalConvos}`);
  console.log(`  Messaggi totali: ${totalMsgs}`);
  console.log(`  Media conversazioni/utente: ${avgConvos}`);
  console.log(`  Media messaggi/utente: ${avgMsgs}`);

  // Final cost model
  const apiCostTotal = platformSummary.totalCostUSD;
  const totalMonthlyCost = apiCostTotal + INFRA_COST + DEV_COST + ANCILLARY_COST;
  const costPerUser = activeUsers > 0 ? totalMonthlyCost / activeUsers : 0;
  const apiCostPerUser = activeUsers > 0 ? apiCostTotal / activeUsers : 0;

  console.purple('\n============================================');
  console.purple('  MODELLO DI COSTO');
  console.purple('============================================');
  console.log(`  Costo API totale:        $${apiCostTotal.toFixed(2)}`);
  console.log(`  Costo infrastruttura:    $${INFRA_COST.toFixed(2)}  ${INFRA_COST === 0 ? '(usa --infra=N)' : ''}`);
  console.log(`  Costo sviluppo:          $${DEV_COST.toFixed(2)}  ${DEV_COST === 0 ? '(usa --dev=N)' : ''}`);
  console.log(`  Costi ancillari:         $${ANCILLARY_COST.toFixed(2)}  ${ANCILLARY_COST === 0 ? '(usa --ancillary=N)' : ''}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  TOTALE MENSILE:          $${totalMonthlyCost.toFixed(2)}`);
  console.log(`  Utenti attivi:           ${activeUsers}`);
  console.log(`  COSTO PER UTENTE:        $${costPerUser.toFixed(2)}/mese`);
  console.log(`    di cui API:            $${apiCostPerUser.toFixed(2)}/mese`);

  // Scaling projections
  const infraBreakpoints = [
    { users: 10, multiplier: 1 },
    { users: 50, multiplier: 1.5 },
    { users: 100, multiplier: 2 },
    { users: 500, multiplier: 4.5 },
  ];

  const devBreakpoints = [
    { users: 10, multiplier: 1 },
    { users: 50, multiplier: 1.25 },
    { users: 100, multiplier: 1.5 },
    { users: 500, multiplier: 2 },
  ];

  console.purple('\n============================================');
  console.purple('  PROIEZIONI DI SCALING');
  console.purple('============================================');

  const projections = infraBreakpoints.map((bp, i) => {
    const projApiCost = apiCostPerUser * bp.users;
    const projInfraCost = INFRA_COST * bp.multiplier;
    const projDevCost = DEV_COST * devBreakpoints[i].multiplier;
    const projTotal = projApiCost + projInfraCost + projDevCost + ANCILLARY_COST;
    const projPerUser = projTotal / bp.users;
    return {
      Utenti: bp.users,
      'API ($)': projApiCost.toFixed(2),
      'Infra ($)': projInfraCost.toFixed(2),
      'Dev ($)': projDevCost.toFixed(2),
      'Ancillari ($)': ANCILLARY_COST.toFixed(2),
      'Totale ($)': projTotal.toFixed(2),
      'Per Utente ($)': projPerUser.toFixed(2),
    };
  });
  console.table(projections);

  // CSV export
  if (CSV_OUTPUT) {
    const csvLines = [];

    // Section 1: Summary
    csvLines.push('=== RIEPILOGO PIATTAFORMA ===');
    csvLines.push('Metrica,Valore');
    csvLines.push(`Periodo (giorni),${DAYS}`);
    csvLines.push(`Utenti registrati,${totalUsers}`);
    csvLines.push(`Utenti attivi,${activeUsers}`);
    csvLines.push(`Costo API totale (USD),${apiCostTotal.toFixed(4)}`);
    csvLines.push(`Token totali,${platformSummary.totalRawTokens}`);
    csvLines.push(`Transazioni totali,${platformSummary.totalTransactions}`);
    csvLines.push(`Media conversazioni/utente,${avgConvos}`);
    csvLines.push(`Media messaggi/utente,${avgMsgs}`);
    csvLines.push('');

    // Section 2: Per user
    csvLines.push('=== COSTO PER UTENTE ===');
    csvLines.push('Nome,Email,Costo API (USD),Token,Transazioni');
    for (const u of perUserCosts) {
      csvLines.push(`"${u.name}","${u.email}",${u.apiCostUSD.toFixed(4)},${u.totalRawTokens},${u.transactionCount}`);
    }
    csvLines.push('');

    // Section 3: Per model
    csvLines.push('=== BREAKDOWN PER MODELLO ===');
    csvLines.push('Modello,Tipo Token,Costo (USD),Token Totali,Avg Token/Tx,Transazioni');
    for (const m of modelBreakdown) {
      csvLines.push(`"${m.model || '(unknown)'}", ${m.tokenType},${m.costUSD.toFixed(4)},${m.totalRawTokens},${m.avgTokensPerTx},${m.count}`);
    }
    csvLines.push('');

    // Section 4: Cost model
    csvLines.push('=== MODELLO DI COSTO ===');
    csvLines.push('Categoria,Costo (USD)');
    csvLines.push(`Costo API,${apiCostTotal.toFixed(2)}`);
    csvLines.push(`Infrastruttura,${INFRA_COST.toFixed(2)}`);
    csvLines.push(`Sviluppo,${DEV_COST.toFixed(2)}`);
    csvLines.push(`Ancillari,${ANCILLARY_COST.toFixed(2)}`);
    csvLines.push(`TOTALE MENSILE,${totalMonthlyCost.toFixed(2)}`);
    csvLines.push(`COSTO PER UTENTE,${costPerUser.toFixed(2)}`);
    csvLines.push('');

    // Section 5: Projections
    csvLines.push('=== PROIEZIONI SCALING ===');
    csvLines.push('Utenti,API (USD),Infra (USD),Dev (USD),Ancillari (USD),Totale (USD),Per Utente (USD)');
    for (const p of projections) {
      csvLines.push(`${p.Utenti},${p['API ($)']},${p['Infra ($)']},${p['Dev ($)']},${p['Ancillari ($)']},${p['Totale ($)']},${p['Per Utente ($)']}`);
    }

    const csvPath = path.resolve(__dirname, '..', `cost-per-user-${new Date().toISOString().slice(0, 10)}.csv`);
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    console.green(`\nCSV esportato: ${csvPath}`);
  }

  silentExit(0);
})();

process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    console.error('There was an uncaught error:');
    console.error(err);
  }
  if (!err.message.includes('fetch failed')) {
    process.exit(1);
  }
});
