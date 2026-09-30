import { z } from 'zod';
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { GmailAuthError, createDraft, readMessage, searchMessages } from './gmail.ts';

const PORT = Number(process.env.PORT ?? 8000);

const ok = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

const fail = (error: unknown): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
});

async function run(fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return ok(await fn());
  } catch (error) {
    if (!(error instanceof GmailAuthError)) console.error('[gmail-mcp]', error);
    return fail(error);
  }
}

function buildServer(token: string): McpServer {
  const server = new McpServer({ name: 'gmail', version: '0.1.0' });

  server.registerTool(
    'gmail_search',
    {
      title: 'Cerca email',
      description:
        'Cerca email nella casella Gmail dell\'utente con la sintassi di ricerca Gmail ' +
        '(es. "from:cliente@azienda.it", "subject:reclamo newer_than:7d", "in:draft" per le bozze). ' +
        'Restituisce id, mittente, destinatari, oggetto, data e anteprima. Per il testo completo usa gmail_read.',
      inputSchema: {
        query: z.string().describe('Query di ricerca in sintassi Gmail'),
        max_results: z.number().int().min(1).max(25).default(10).describe('Numero massimo di risultati'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ query, max_results }) => run(() => searchMessages(token, query, max_results)),
  );

  server.registerTool(
    'gmail_read',
    {
      title: 'Leggi email',
      description: 'Legge il contenuto completo di un\'email (o di una bozza) dato il suo id restituito da gmail_search.',
      inputSchema: {
        message_id: z.string().describe('Id del messaggio restituito da gmail_search'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ message_id }) => run(() => readMessage(token, message_id)),
  );

  server.registerTool(
    'gmail_create_draft',
    {
      title: 'Crea bozza',
      description:
        'Salva una nuova email come BOZZA nella casella dell\'utente. Non invia nulla: l\'utente la rivede e la invia da Gmail. ' +
        'Se si risponde a un\'email esistente, passare reply_to_message_id per inserire la bozza nella stessa conversazione.',
      inputSchema: {
        to: z.string().describe('Destinatari, separati da virgola'),
        subject: z.string().describe('Oggetto'),
        body: z.string().describe('Testo dell\'email in testo semplice'),
        cc: z.string().optional().describe('Destinatari in copia, separati da virgola'),
        reply_to_message_id: z.string().optional().describe('Id dell\'email a cui si risponde'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    ({ to, subject, body, cc, reply_to_message_id }) =>
      run(() => createDraft(token, { to, subject, body, cc, replyToMessageId: reply_to_message_id })),
  );

  return server;
}

function bearerToken(req: IncomingMessage): string | undefined {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7).trim() || undefined : undefined;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : undefined;
}

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers }).end(JSON.stringify(body));
}

async function handleMcp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = bearerToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'unauthorized' }, { 'WWW-Authenticate': 'Bearer realm="gmail-mcp"' });
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method not allowed' }, { Allow: 'POST' });
    return;
  }

  const server = buildServer(token);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, await readJson(req));
}

createServer((req, res) => {
  const path = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (path === '/health') return sendJson(res, 200, { status: 'ok' });
  if (path !== '/mcp') return sendJson(res, 404, { error: 'not found' });
  handleMcp(req, res).catch((error: unknown) => {
    console.error('[gmail-mcp]', error);
    if (!res.headersSent) sendJson(res, 500, { error: 'internal error' });
  });
}).listen(PORT, () => console.log(`[gmail-mcp] in ascolto su :${PORT}/mcp`));
