/**
 * Jev (TypeSafe) fixture for the limits e2e suite (G1).
 * POST /v1/systemone -> by behavior.mode: 'ok' (default) picks e2e-mock-provider-a with high
 * confidence, 'error' answers 500, 'slow' answers after behavior.slowMs (default 10000).
 * GET /__e2e/requests -> {count} of /v1/systemone calls since the last reset.
 * Control surface: POST /__e2e/behavior stores a JSON object, POST /__e2e/reset clears it.
 */
const http = require('http');

const PORT = Number(process.env.E2E_JEV_PORT) || 8793;

let behavior = {};
let requests = 0;

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

  if (req.method === 'GET' && url.pathname === '/__e2e/requests') {
    sendJson(res, 200, { count: requests });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/systemone') {
    requests += 1;
    await readBody(req);
    const mode = behavior.mode || 'ok';
    const okBody = {
      model: 'e2e-jev',
      answers: {
        model: {
          type: 'choice',
          choice: 'e2e-mock-provider-a',
          confidence: 0.99,
          probabilities: { 'e2e-mock-provider-a': 0.99, 'e2e-mock-provider-b': 0.01 },
        },
      },
      usage: { input_tokens: 1, output_tokens: 1 },
    };
    if (mode === 'error') {
      sendJson(res, 500, { error: { message: 'E2E jev failure' } });
    } else if (mode === 'slow') {
      setTimeout(
        () => {
          if (!res.writableEnded && !res.destroyed) {
            sendJson(res, 200, okBody);
          }
        },
        Number(behavior.slowMs) || 10000,
      );
    } else {
      sendJson(res, 200, okBody);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/__e2e/reset') {
    behavior = {};
    requests = 0;
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
