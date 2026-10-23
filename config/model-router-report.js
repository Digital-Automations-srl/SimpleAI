const path = require('path');
const mongoose = require('mongoose');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { silentExit } = require('./helpers');
const { RouterDecision, Message, Transaction } =
  require('@librechat/data-schemas').createModels(mongoose);
const connect = require('./connect');

// Uso: npm run router-report -- --days=7 [--sample=10]
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseFloat(arg.split('=')[1]) : defaultVal;
}

const DAYS = getArg('days', 7);
const SAMPLE = getArg('sample', 10);
const sinceDate = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

const TOKEN_VALUE_TO_USD = 1 / 1000000;
const JEV_USD_PER_MILLION_INPUT = 0.042;

const pct = (part, total) => (total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '-');
const usd = (value) => `$${value.toFixed(4)}`;

async function costByMessage(messageIds) {
  const rows = await Transaction.aggregate([
    { $match: { messageId: { $in: messageIds } } },
    { $group: { _id: '$messageId', tokenValue: { $sum: '$tokenValue' } } },
  ]);
  return new Map(rows.map((row) => [row._id, Math.abs(row.tokenValue) * TOKEN_VALUE_TO_USD]));
}

/**
 * A decision is stored when its request closes, before the answer exists: it belongs to the
 * first assistant message of its conversation created after it.
 */
async function matchResponses(decisions) {
  const conversationIds = [...new Set(decisions.map((d) => d.conversationId).filter(Boolean))];
  const messages = await Message.find(
    {
      conversationId: { $in: conversationIds },
      isCreatedByUser: false,
      createdAt: { $gte: sinceDate },
    },
    'messageId parentMessageId conversationId createdAt feedback',
  )
    .sort({ createdAt: 1 })
    .lean();
  const byConversation = new Map();
  for (const message of messages) {
    const list = byConversation.get(message.conversationId) ?? [];
    list.push(message);
    byConversation.set(message.conversationId, list);
  }

  const matched = new Map();
  const ordered = [...decisions].sort((a, b) => a.createdAt - b.createdAt);
  for (const decision of ordered) {
    const candidates = byConversation.get(decision.conversationId) ?? [];
    const index = candidates.findIndex((m) => m.createdAt >= decision.createdAt);
    if (index >= 0) {
      matched.set(decision._id.toString(), candidates[index]);
      candidates.splice(index, 1);
    }
  }
  return matched;
}

(async () => {
  await connect();

  console.purple('============================================');
  console.purple('  SimpleAI — Report router automatico (Jev)');
  console.purple(`  Periodo: ultimi ${DAYS} giorni`);
  console.purple('============================================\n');

  const decisions = await RouterDecision.find({ createdAt: { $gte: sinceDate } }).lean();
  if (decisions.length === 0) {
    console.red('Nessuna decisione del router nel periodo selezionato.');
    silentExit(0);
  }

  const responseByDecision = await matchResponses(decisions);
  const responses = [...responseByDecision.values()];
  const costs = await costByMessage(responses.map((m) => m.messageId));

  const bySpec = new Map();
  const fallbacks = new Map();
  const tools = new Map();
  let jevTokens = 0;
  let latencyTotal = 0;
  for (const decision of decisions) {
    const response = responseByDecision.get(decision._id.toString());
    const stats = bySpec.get(decision.spec) ?? {
      count: 0,
      confidence: 0,
      scored: 0,
      cost: 0,
      thumbsDown: 0,
      thumbsUp: 0,
    };
    stats.count += 1;
    if (decision.confidence != null) {
      stats.confidence += decision.confidence;
      stats.scored += 1;
    }
    stats.cost += costs.get(response?.messageId) ?? 0;
    stats.thumbsDown += response?.feedback?.rating === 'thumbsDown' ? 1 : 0;
    stats.thumbsUp += response?.feedback?.rating === 'thumbsUp' ? 1 : 0;
    bySpec.set(decision.spec, stats);

    if (decision.fallbackReason) {
      fallbacks.set(decision.fallbackReason, (fallbacks.get(decision.fallbackReason) ?? 0) + 1);
    }
    for (const tool of decision.tools ?? []) {
      tools.set(tool, (tools.get(tool) ?? 0) + 1);
    }
    jevTokens += decision.inputTokens ?? 0;
    latencyTotal += decision.latencyMs ?? 0;
  }

  console.cyan('[1/4] Distribuzione per modello');
  console.table(
    [...bySpec.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([spec, s]) => ({
        modello: spec,
        risposte: s.count,
        quota: pct(s.count, decisions.length),
        'confidenza media': s.scored > 0 ? (s.confidence / s.scored).toFixed(2) : '-',
        'costo totale': usd(s.cost),
        'costo/risposta': usd(s.count > 0 ? s.cost / s.count : 0),
        '👍': s.thumbsUp,
        '👎': s.thumbsDown,
      })),
  );

  console.cyan('\n[2/4] Costo: automatico vs scelta manuale');
  const routedCost = [...bySpec.values()].reduce((sum, s) => sum + s.cost, 0);
  const routedIds = new Set(responses.map((m) => m.messageId));
  const [manual] = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sinceDate }, messageId: { $nin: [...routedIds, null] } } },
    {
      $group: {
        _id: null,
        tokenValue: { $sum: '$tokenValue' },
        messages: { $addToSet: '$messageId' },
      },
    },
  ]);
  const manualCost = Math.abs(manual?.tokenValue ?? 0) * TOKEN_VALUE_TO_USD;
  const manualCount = manual?.messages?.length ?? 0;
  const jevCost = (jevTokens / 1000000) * JEV_USD_PER_MILLION_INPUT;
  console.log(
    `  Automatico: ${responses.length} risposte, ${usd(routedCost)} (+ Jev ${usd(jevCost)}), ` +
      `${usd(responses.length > 0 ? (routedCost + jevCost) / responses.length : 0)}/risposta`,
  );
  console.log(
    `  Manuale:    ${manualCount} risposte, ${usd(manualCost)}, ` +
      `${usd(manualCount > 0 ? manualCost / manualCount : 0)}/risposta`,
  );

  console.cyan('\n[3/4] Affidabilità di Jev');
  console.log(`  Decisioni: ${decisions.length}`);
  console.log(`  Latenza media: ${Math.round(latencyTotal / decisions.length)} ms`);
  const fallbackTotal = [...fallbacks.values()].reduce((sum, n) => sum + n, 0);
  console.log(`  Fallback: ${fallbackTotal} (${pct(fallbackTotal, decisions.length)})`);
  for (const [reason, count] of fallbacks) {
    console.log(`    - ${reason}: ${count}`);
  }
  console.log('  Strumenti accesi da Jev:');
  for (const [tool, count] of tools) {
    console.log(`    - ${tool}: ${count} (${pct(count, decisions.length)})`);
  }

  console.cyan(`\n[4/4] Campione da giudicare a mano (${SAMPLE} decisioni casuali)`);
  const sample = [...decisions].sort(() => Math.random() - 0.5).slice(0, SAMPLE);
  const parentIds = sample
    .map((d) => responseByDecision.get(d._id.toString())?.parentMessageId)
    .filter(Boolean);
  const userMessages = await Message.find(
    { messageId: { $in: parentIds } },
    'messageId text',
  ).lean();
  const textById = new Map(userMessages.map((m) => [m.messageId, m.text ?? '']));
  for (const decision of sample) {
    const parentId = responseByDecision.get(decision._id.toString())?.parentMessageId;
    const text = (textById.get(parentId) ?? '(risposta non trovata)')
      .replace(/\s+/g, ' ')
      .slice(0, 160);
    const confidence = decision.confidence != null ? decision.confidence.toFixed(2) : '-';
    console.log(`  • [${decision.spec} @ ${confidence}] ${text}`);
  }

  silentExit(0);
})();

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error:');
  console.error(err);
  process.exit(1);
});
