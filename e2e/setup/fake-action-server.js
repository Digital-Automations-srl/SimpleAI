/**
 * Action fixture for the limits e2e suite (F2/F4).
 * GET /ok -> {"result":"E2E action ok"}; GET /error -> 500; GET /slow -> answers after
 * behavior.slowMs (default 60000); GET /huge -> JSON of behavior.hugeBytes (default 2 000 000).
 * Control surface: POST /__e2e/behavior stores a JSON object, POST /__e2e/reset clears it.
 */
const http = require('http');

const PORT = Number(process.env.E2E_ACTION_PORT) || 8792;

let behavior = {};

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    sendJson(res, 200, { ok: true, service: 'fake-action-server' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/ok') {
    sendJson(res, 200, { result: 'E2E action ok' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/error') {
    sendJson(res, 500, { error: 'E2E action failure' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/slow') {
    const slowMs = Number(behavior.slowMs) || 60000;
    setTimeout(() => {
      if (!res.writableEnded && !res.destroyed) {
        sendJson(res, 200, { result: 'E2E action slow ok' });
      }
    }, slowMs);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/huge') {
    const bytes = Number(behavior.hugeBytes) || 2000000;
    sendJson(res, 200, { result: 'x'.repeat(bytes) });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/__e2e/reset') {
    behavior = {};
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/__e2e/behavior') {
    behavior = await readBody(req);
    sendJson(res, 200, { ok: true, behavior });
    return;
  }

  sendJson(res, 404, { error: { message: `Unhandled ${req.method} ${url.pathname}` } });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[e2e] fake-action-server listening on http://127.0.0.1:${PORT}`);
});
