import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AppError, requireThat } from './errors.mjs';
import { FlightDeck } from './service.mjs';
import { requestIdPattern, Store } from './store.mjs';
import { readStaticFile, themeScriptHash } from './assets.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BODY_LIMIT = 16 * 1024;
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/app.mjs', ['app.mjs', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const loopback = address => address === '127.0.0.1' || address === '::1'
  || address === '::ffff:127.0.0.1';

function contentSecurityPolicy(inlineHashes = []) {
  return `default-src 'self'; script-src 'self'${inlineHashes.map(hash => ` '${hash}'`).join('')}; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`;
}

function boundary(req) {
  requireThat(loopback(req.socket.remoteAddress), 403, 'LOCAL_ONLY', 'Only loopback clients are supported.');
  requireThat(typeof req.headers.host === 'string', 400, 'INVALID_HOST', 'A local Host header is required.');
  let host;
  try {
    host = new URL(`http://${req.headers.host}`);
  } catch {
    throw new AppError(400, 'INVALID_HOST', 'A local Host header is required.');
  }
  requireThat(localHosts.has(host.hostname) && host.host === req.headers.host.toLowerCase()
    && host.pathname === '/' && !host.username && !host.password,
  403, 'LOCAL_ONLY', 'Only localhost and loopback Host headers are supported.');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    requireThat(!req.headers['sec-fetch-site'] || req.headers['sec-fetch-site'] !== 'cross-site',
      403, 'CROSS_ORIGIN', 'Cross-origin writes are not supported.');
    requireThat(req.headers.origin === undefined || req.headers.origin === host.origin,
      403, 'CROSS_ORIGIN', 'Cross-origin writes are not supported.');
  }
}

async function jsonBody(req) {
  requireThat(/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] ?? ''),
    415, 'UNSUPPORTED_MEDIA_TYPE', 'Use Content-Type: application/json.');
  requireThat(!req.headers['content-encoding'] || req.headers['content-encoding'] === 'identity',
    415, 'UNSUPPORTED_ENCODING', 'Compressed request bodies are not supported.');
  if (req.headers['content-length'] !== undefined) {
    requireThat(Number(req.headers['content-length']) <= BODY_LIMIT,
      413, 'BODY_TOO_LARGE', 'JSON bodies are limited to 16 KiB.');
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    length += chunk.length;
    requireThat(length <= BODY_LIMIT, 413, 'BODY_TOO_LARGE', 'JSON bodies are limited to 16 KiB.');
    chunks.push(chunk);
  }
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    return JSON.parse(text);
  } catch {
    throw new AppError(400, 'INVALID_JSON', 'Request body must be valid UTF-8 JSON.');
  }
}

function json(res, status, value, head = false) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(head ? undefined : body);
}

// Await createApp before server.listen(0, '127.0.0.1') in native integration tests.
export async function createApp({ dataDir = join(root, '.data'), clock = Date.now } = {}) {
  const store = await new Store(resolve(dataDir)).initialize();
  const service = new FlightDeck(store, clock);
  const inlineHashes = [];
  try {
    const html = (await readStaticFile(join(root, 'web', 'index.html'))).toString('utf8');
    const hash = themeScriptHash(html);
    if (hash) inlineHashes.push(hash);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const server = http.createServer({ maxHeaderSize: 16384 }, async (req, res) => {
    const suppliedId = req.headers['x-request-id'];
    const requestId = typeof suppliedId === 'string' && requestIdPattern.test(suppliedId)
      ? suppliedId : randomUUID();
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', contentSecurityPolicy(inlineHashes));
    try {
      boundary(req);
      requireThat(typeof req.url === 'string' && req.url.startsWith('/') && !req.url.startsWith('//'),
        400, 'INVALID_PATH', 'Use an origin-relative request path.');
      const rawPath = req.url.split('?')[0];
      requireThat(!rawPath.includes('%') && !rawPath.includes('\\')
        && !rawPath.split('/').some(part => part === '.' || part === '..'),
      400, 'INVALID_PATH', 'Encoded and traversal paths are not supported.');
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      const method = req.method;
      if (path === '/api/health' && method === 'GET') {
        return json(res, 200, { status: 'ok', service: 'wre-flight-deck' });
      }
      if (path === '/api/network' && method === 'GET') return json(res, 200, service.network());
      if (path === '/api/itineraries' && method === 'GET') {
        requireThat([...url.searchParams.keys()].every(key =>
          ['origin', 'destination', 'passengers'].includes(key))
          && ['origin', 'destination', 'passengers'].every(key => url.searchParams.getAll(key).length <= 1),
        400, 'INVALID_QUERY', 'Unsupported or duplicate query parameters.');
        const passengersText = url.searchParams.get('passengers') ?? '1';
        requireThat(/^[1-6]$/.test(passengersText), 400, 'INVALID_VALUE', 'passengers must be 1-6.');
        return json(res, 200, { itineraries: service.itineraries(
          url.searchParams.get('origin'), url.searchParams.get('destination'), Number(passengersText),
        ) });
      }
      if (path === '/api/bookings' && method === 'GET') return json(res, 200, { bookings: service.bookings() });
      if (path === '/api/events' && method === 'GET') return json(res, 200, { events: service.events() });
      if (path === '/api/quotes' && method === 'POST') {
        return json(res, 201, { quote: await service.quote(await jsonBody(req), requestId) });
      }
      if (path === '/api/bookings' && method === 'POST') {
        const result = await service.book(await jsonBody(req), req.headers['idempotency-key'], requestId);
        return json(res, result.replay ? 200 : 201, { booking: result.booking });
      }
      const cancel = /^\/api\/bookings\/([A-Za-z0-9_-]+)\/cancel$/.exec(path);
      if (cancel && method === 'POST') {
        return json(res, 200, { booking: await service.cancel(cancel[1], await jsonBody(req), requestId) });
      }
      const flight = /^\/api\/flights\/([A-Za-z0-9_-]+)$/.exec(path);
      if (flight && method === 'PATCH') {
        return json(res, 200, { flight: await service.updateFlight(flight[1], await jsonBody(req), requestId) });
      }
      const allowedMethods = {
        '/api/health': 'GET', '/api/network': 'GET', '/api/itineraries': 'GET',
        '/api/bookings': 'GET, POST', '/api/events': 'GET', '/api/quotes': 'POST',
      }[path] ?? (cancel ? 'POST' : flight ? 'PATCH' : staticFiles.has(path) ? 'GET, HEAD' : undefined);
      if (allowedMethods && !(staticFiles.has(path) && ['GET', 'HEAD'].includes(method))) {
        res.setHeader('Allow', allowedMethods);
        throw new AppError(405, 'METHOD_NOT_ALLOWED', `Use ${allowedMethods}.`);
      }
      if (staticFiles.has(path) && ['GET', 'HEAD'].includes(method)) {
        const [filename, mime] = staticFiles.get(path);
        const filenamePath = join(root, 'web', filename);
        let content;
        try {
          content = await readStaticFile(filenamePath);
        } catch (error) {
          if (['ENOENT', 'ELOOP', 'ENOTDIR'].includes(error.code)) {
            throw new AppError(404, 'NOT_FOUND', 'File not found.');
          }
          throw error;
        }
        res.writeHead(200, {
          'Content-Type': mime, 'Content-Length': content.length, 'Cache-Control': 'no-cache',
        });
        return res.end(method === 'HEAD' ? undefined : content);
      }
      throw new AppError(404, 'NOT_FOUND', 'Endpoint not found.');
    } catch (error) {
      if (!res.headersSent && !res.destroyed) {
        const known = error instanceof AppError;
        json(res, known ? error.status : 500, {
          error: {
            code: known ? error.code : 'INTERNAL_ERROR',
            message: known ? error.message : 'The operation could not be completed. No uncommitted changes were applied.',
          },
          requestId,
        }, req.method === 'HEAD');
      }
    } finally {
      // Drain rejected small bodies without accepting them as application input.
      if (!req.complete && !req.destroyed) req.resume();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 1000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const text = process.env.PORT ?? '3000';
    requireThat(/^\d+$/.test(text) && Number(text) >= 1 && Number(text) <= 65535,
      400, 'INVALID_PORT', 'PORT must be 1-65535.');
    const server = await createApp({ dataDir: process.env.DATA_DIR });
    server.on('error', error => {
      console.error(`Flight Deck could not listen: ${error.message}`);
      process.exitCode = 1;
    });
    server.listen(Number(text), '127.0.0.1', () => {
      console.log(`Flight Deck: http://127.0.0.1:${text} (fictional local-only product)`);
    });
    const shutdown = () => server.close(error => {
      if (error) process.exitCode = 1;
    });
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error(`Flight Deck did not start: ${error.message}`);
    process.exitCode = 1;
  }
}
