/**
 * Minimal jev fixture for the limits e2e suite; later tasks extend it.
 * Control surface: POST /__e2e/behavior stores a JSON object, POST /__e2e/reset clears it.
 */
const http = require('http');

const PORT = Number(process.env.E2E_JEV_PORT) || 8793;

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
    sendJson(res, 200, { ok: true, service: 'fake-jev-server' });
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
  console.log(`[e2e] fake-jev-server listening on http://127.0.0.1:${PORT}`);
});
