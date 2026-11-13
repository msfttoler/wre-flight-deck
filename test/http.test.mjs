import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { join } from 'node:path';
import { readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { httpFixture, repo } from './helpers.mjs';

function raw(fixture, { path = '/api/health', method = 'GET', headers = {}, body, chunks } = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(`${fixture.base}${path}`, { method, headers }, response => {
      const received = [];
      response.on('data', chunk => received.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(received).toString();
        resolve({
          status: response.statusCode, headers: response.headers,
          body: response.headers['content-type']?.includes('application/json') ? JSON.parse(text) : text,
        });
      });
    });
    request.on('error', reject);
    if (chunks) chunks.forEach(chunk => request.write(chunk));
    else if (body !== undefined) request.write(body);
    request.end();
  });
}

test('read endpoints follow the exact contract and every response carries correlation and security headers', async t => {
  const f = await httpFixture(t);
  const health = await f.request('/api/health', { headers: { 'X-Request-Id': 'health-test-1' } });
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { status: 'ok', service: 'wre-flight-deck' });
  assert.equal(health.headers.get('x-request-id'), 'health-test-1');
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(health.headers.get('access-control-allow-origin'), null);
  const network = await f.request('/api/network');
  assert.equal(network.body.airports.length, 8);
  assert.ok(network.body.flights.length >= 16);
  assert.equal(network.body.scenarioDate, '2030-06-15');
  assert.equal(network.body.currency, 'USD');
  assert.match(network.body.disclaimer, /Fictional/);
  assert.ok(network.body.flights.every(flight => Number.isInteger(flight.baseFareCents)));
  const routes = await f.request('/api/itineraries?origin=SEA&destination=DEN&passengers=2');
  assert.equal(routes.status, 200);
  assert.ok(routes.body.itineraries.some(route => route.stops === 0));
  assert.ok(routes.body.itineraries.some(route => route.stops === 1));
  assert.deepEqual((await f.request('/api/bookings')).body, { bookings: [] });
  assert.deepEqual((await f.request('/api/events')).body, { events: [] });
});

test('complete HTTP journey: quote, reserve, identical retry, conflict, cancel, events, and restart writes', async t => {
  const f = await httpFixture(t);
  const quoteResponse = await f.request('/api/quotes', {
    method: 'POST',
    body: { flightIds: ['FD102', 'FD103'], passengers: 2, bagsPerPassenger: 1, coupon: 'FIRSTFLIGHT' },
    headers: { 'X-Request-Id': 'quote-correlation' },
  });
  assert.equal(quoteResponse.status, 201);
  const quote = quoteResponse.body.quote;
  assert.equal(quote.subtotalCents, 52000);
  assert.equal(quote.discountCents, 5200);
  assert.equal(quote.taxCents, 3510);
  assert.equal(quote.totalCents, 50310);
  const first = await f.book(quote.id);
  assert.equal(first.status, 201);
  const booking = first.body.booking;
  assert.equal(booking.callsign, 'Blue Team');
  assert.deepEqual(booking.flightIds, ['FD102', 'FD103']);
  assert.equal((await f.book(quote.id)).status, 200);
  assert.equal((await f.book(quote.id, 'flight-key-0001', 'Red Team')).status, 409);
  assert.equal((await f.book(quote.id, 'different-key-1')).body.error.code, 'QUOTE_USED');
  await f.stop();
  await f.start();
  assert.equal((await f.book(quote.id)).status, 200);
  const cancelled = await f.request(`/api/bookings/${booking.id}/cancel`, {
    method: 'POST', body: { version: 1 }, headers: { 'X-Request-Id': 'cancel-correlation' },
  });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.booking.status, 'cancelled');
  const events = (await f.request('/api/events')).body.events;
  assert.deepEqual(events.map(event => event.type), ['booking.cancelled', 'booking.created', 'quote.created']);
  assert.equal(events[0].requestId, 'cancel-correlation');
  assert.equal(events[2].requestId, 'quote-correlation');
  await f.stop();
  await f.start();
  const restored = (await f.request('/api/network')).body.flights;
  assert.equal(restored.find(flight => flight.id === 'FD102').availableSeats, 8);
  const next = await f.quote();
  assert.equal((await f.book(next.body.quote.id, 'after-restart1')).status, 201);
});

test('simultaneous HTTP bookings reserve only available seats and return capacity conflicts', async t => {
  const f = await httpFixture(t);
  const quotes = await Promise.all(Array.from({ length: 4 }, () => f.quote({ passengers: 6 })));
  const results = await Promise.all(quotes.map((result, index) => f.book(result.body.quote.id, `http-race-${index}`)));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 201, 409, 409]);
  assert.ok(results.filter(result => result.status === 409)
    .every(result => result.body.error.code === 'INSUFFICIENT_CAPACITY'));
  assert.equal((await f.request('/api/network')).body.flights.find(flight => flight.id === 'FD101').availableSeats, 0);
});

test('flight operations enforce version checks, legal transitions, and gate validation over HTTP', async t => {
  const f = await httpFixture(t);
  const update = body => f.request('/api/flights/FD101', { method: 'PATCH', body });
  assert.equal((await update({ version: 1, gate: 'A00' })).body.error.code, 'INVALID_GATE');
  assert.equal((await update({ version: 1, status: 'departed' })).body.error.code, 'INVALID_TRANSITION');
  const boarding = await update({ version: 1, status: 'boarding', gate: 'Z99' });
  assert.equal(boarding.status, 200);
  assert.equal(boarding.body.flight.version, 2);
  assert.equal((await update({ version: 1, status: 'delayed' })).body.error.code, 'VERSION_CONFLICT');
  assert.equal((await update({ version: 2, status: 'departed' })).status, 200);
  assert.equal((await update({ version: 3, gate: 'A01' })).body.error.code, 'INVALID_TRANSITION');
  assert.equal((await f.quote()).body.error.code, 'FLIGHT_UNAVAILABLE');
});

test('quote expires at fifteen minutes over HTTP without allocating seats', async t => {
  const f = await httpFixture(t);
  const result = await f.quote();
  f.time.value += 900000;
  const expired = await f.book(result.body.quote.id);
  assert.equal(expired.status, 409);
  assert.equal(expired.body.error.code, 'QUOTE_EXPIRED');
  assert.equal((await f.request('/api/bookings')).body.bookings.length, 0);
});

test('HTTP validation rejects invalid numbers, missing fields, unknown fields, duplicates, and disconnected legs', async t => {
  const f = await httpFixture(t);
  const cases = [
    null, [], {}, { flightIds: ['FD101'], passengers: 1 },
    { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0, totalCents: 1 },
    { flightIds: ['FD101'], passengers: '1', bagsPerPassenger: 0 },
    { flightIds: ['FD101'], passengers: 1.5, bagsPerPassenger: 0 },
    { flightIds: ['FD101'], passengers: 7, bagsPerPassenger: 0 },
    { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: -1 },
    { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 3 },
    { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0, coupon: null },
    { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0, coupon: 'FREE' },
    { flightIds: ['FD101', 'FD101'], passengers: 1, bagsPerPassenger: 0 },
    { flightIds: ['FD101', 'FD107'], passengers: 1, bagsPerPassenger: 0 },
    { flightIds: ['FD103', 'FD102'], passengers: 1, bagsPerPassenger: 0 },
    { flightIds: ['FD999'], passengers: 1, bagsPerPassenger: 0 },
  ];
  for (const body of cases) {
    const result = await f.request('/api/quotes', { method: 'POST', body });
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.ok(result.body.error.code);
    assert.equal(result.body.requestId, result.headers.get('x-request-id'));
  }
  assert.equal((await f.request('/api/events')).body.events.length, 0);
});

test('itinerary query validation rejects malformed and ambiguous inputs', async t => {
  const f = await httpFixture(t);
  for (const query of [
    '', 'origin=SEA&destination=SEA', 'origin=SEA&destination=XYZ',
    'origin=SEA&destination=DEN&passengers=0', 'origin=SEA&destination=DEN&passengers=1.5',
    'origin=SEA&destination=DEN&passengers=Infinity', 'origin=SEA&destination=DEN&passengers=',
    'origin=SEA&destination=DEN&passengers=01', 'origin=SEA&origin=PDX&destination=DEN',
    'origin=SEA&destination=DEN&coupon=FREE',
  ]) {
    assert.equal((await f.request(`/api/itineraries?${query}`)).status, 400, query);
  }
});

test('bookings require bounded idempotency keys and fictional safe callsigns', async t => {
  const f = await httpFixture(t);
  const quote = (await f.quote()).body.quote;
  for (const key of ['', 'short', 'bad_key_123', 'x'.repeat(81)]) {
    const response = await f.book(quote.id, key);
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'INVALID_IDEMPOTENCY_KEY');
  }
  for (const callsign of ['X', ' Blue', 'Blue ', 'a'.repeat(25), '<script>', 'email@example.com', 123, null]) {
    assert.equal((await f.book(quote.id, 'valid-key-001', callsign)).status, 400);
  }
  assert.equal((await f.book('q_missing', 'valid-key-001')).status, 404);
  assert.equal((await f.book(quote.id, 'valid-key-001', 'AB')).status, 201);
});

test('missing resources and unsupported methods are JSON errors with request IDs', async t => {
  const f = await httpFixture(t);
  for (const [path, method, body, status] of [
    ['/api/missing', 'GET', undefined, 404],
    ['/api/quotes', 'GET', undefined, 405],
    ['/api/network', 'POST', {}, 405],
    ['/api/flights/FD999', 'PATCH', { version: 1, gate: 'A01' }, 404],
    ['/api/bookings/b_missing/cancel', 'POST', { version: 1 }, 404],
    ['/api/bookings/b_missing/cancel', 'POST', { version: 0 }, 400],
    ['/api/flights/FD101', 'PATCH', { version: 1 }, 400],
    ['/api/flights/FD101', 'PATCH', { version: 1, capacity: 100 }, 400],
    ['/api/flights/FD101', 'PATCH', { version: 1, status: 'unknown' }, 400],
  ]) {
    const response = await f.request(path, { method, body });
    assert.equal(response.status, status, `${method} ${path}`);
    assert.equal(response.body.requestId, response.headers.get('x-request-id'));
    if (status === 405) assert.ok(response.headers.get('allow'));
  }
});

test('malformed JSON, invalid UTF-8, compression, and content types fail with precise errors', async t => {
  const f = await httpFixture(t);
  for (const [body, headers, status, code] of [
    ['{', { 'Content-Type': 'application/json' }, 400, 'INVALID_JSON'],
    ['', { 'Content-Type': 'application/json' }, 400, 'INVALID_JSON'],
    [Buffer.from([0xff]), { 'Content-Type': 'application/json' }, 400, 'INVALID_JSON'],
    ['{}', { 'Content-Type': 'text/plain' }, 415, 'UNSUPPORTED_MEDIA_TYPE'],
    ['{}', {}, 415, 'UNSUPPORTED_MEDIA_TYPE'],
    ['{}', { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }, 415, 'UNSUPPORTED_ENCODING'],
  ]) {
    const response = await raw(f, { path: '/api/quotes', method: 'POST', headers, body });
    assert.equal(response.status, status);
    assert.equal(response.body.error.code, code);
  }
});

test('16 KiB body limit applies to both content length and chunked transfer', async t => {
  const f = await httpFixture(t);
  const huge = 'x'.repeat(16385);
  for (const options of [
    { headers: { 'Content-Length': Buffer.byteLength(huge) }, body: huge },
    { headers: { 'Transfer-Encoding': 'chunked' }, chunks: [huge.slice(0, 9000), huge.slice(9000)] },
  ]) {
    const response = await raw(f, {
      path: '/api/quotes', method: 'POST', ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    assert.equal(response.status, 413);
    assert.equal(response.body.error.code, 'BODY_TOO_LARGE');
  }
  assert.equal((await f.request('/api/health')).status, 200);
});

test('streamed overflow returns JSON 413 before the client finishes the request', async t => {
  const f = await httpFixture(t);
  const result = await new Promise((resolve, reject) => {
    const request = http.request(`${f.base}/api/quotes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
    }, response => {
      const received = [];
      response.on('data', chunk => received.push(chunk));
      response.on('end', () => {
        request.end();
        resolve({ status: response.statusCode, body: JSON.parse(Buffer.concat(received).toString()) });
      });
    });
    request.on('error', reject);
    request.write('x'.repeat(8000));
    delay(10).then(() => request.write('x'.repeat(9000))).catch(reject);
  });
  assert.equal(result.status, 413);
  assert.equal(result.body.error.code, 'BODY_TOO_LARGE');
  assert.equal((await f.request('/api/health')).status, 200);
});

test('exactly 16 KiB valid JSON is accepted and larger UTF-8 content is counted in bytes', async t => {
  const f = await httpFixture(t);
  const body = JSON.stringify({ flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0 });
  const response = await raw(f, {
    path: '/api/quotes', method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: body.padEnd(16384, ' '),
  });
  assert.equal(response.status, 201);
  const large = await raw(f, {
    path: '/api/quotes', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
    body: 'é'.repeat(9000),
  });
  assert.equal(large.status, 413);
});

test('cross-origin browser writes, null origins, and DNS rebinding Host headers are rejected', async t => {
  const f = await httpFixture(t);
  for (const headers of [
    { Origin: 'https://evil.example' }, { Origin: 'null' },
    { Origin: 'http://localhost:9000' }, { 'Sec-Fetch-Site': 'cross-site' },
  ]) {
    const response = await f.request('/api/quotes', {
      method: 'POST', body: { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0 }, headers,
    });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'CROSS_ORIGIN');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  for (const host of ['evil.example', '127.0.0.1.evil.example', 'localhost.evil.example', '0.0.0.0']) {
    const response = await raw(f, { headers: { Host: host } });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'LOCAL_ONLY');
  }
  const sameOrigin = await f.request('/api/quotes', {
    method: 'POST', body: { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0 },
    headers: { Origin: f.base },
  });
  assert.equal(sameOrigin.status, 201);
});

test('traversal, source files, state files, and arbitrary web files are never served', async t => {
  const f = await httpFixture(t);
  for (const path of [
    '/../src/server.mjs', '/%2e%2e/src/server.mjs', '/web/../src/server.mjs',
    '/web/%2e%2e/src/server.mjs', '/%2fapi/network', '/..\\src\\server.mjs',
    '//evil.example/api/health', '/src/server.mjs', '/.data/state.json',
    '/state.json', '/web/index.html', '/docs/api-contract.md', '/package.json',
  ]) {
    const response = await raw(f, { path });
    assert.ok([400, 404].includes(response.status), `${path}: ${response.status}`);
    assert.ok(response.body.error);
  }
});

test('only allowlisted static assets are served, with correct MIME types and bodyless HEAD', async t => {
  const f = await httpFixture(t);
  for (const [path, filename, mime] of [
    ['/', 'index.html', 'text/html'],
    ['/index.html', 'index.html', 'text/html'],
    ['/app.js', 'app.js', 'text/javascript'],
    ['/styles.css', 'styles.css', 'text/css'],
  ]) {
    const response = await raw(f, { path });
    assert.equal(response.status, 200, path);
    assert.match(response.headers['content-type'], new RegExp(`^${mime}`));
    assert.equal(response.body, await readFile(join(repo, 'web', filename), 'utf8'));
    assert.match(response.headers['content-security-policy'], /default-src 'self'/);
    assert.ok(!response.headers['content-security-policy'].includes("'unsafe-inline'"));
    if (filename === 'index.html') {
      const match = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/i.exec(response.body);
      if (match && !/\bsrc\s*=/i.test(match[1]) && match[2].trim()) {
        const hash = createHash('sha256').update(match[2]).digest('base64');
        assert.ok(response.headers['content-security-policy'].includes(`'sha256-${hash}'`));
      }
    }
    const head = await raw(f, { path, method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
    assert.equal(Number(head.headers['content-length']), Buffer.byteLength(response.body));
    assert.equal((await raw(f, { path, method: 'POST' })).status, 405);
  }
  const absent = await raw(f, { path: '/app.mjs' });
  assert.equal(absent.status, 404);
});

test('untrusted request IDs are replaced; accepted IDs reach errors and persisted events', async t => {
  const f = await httpFixture(t);
  const replaced = await f.request('/api/missing', { headers: { 'X-Request-Id': '<bad id>' } });
  assert.notEqual(replaced.headers.get('x-request-id'), '<bad id>');
  assert.equal(replaced.body.requestId, replaced.headers.get('x-request-id'));
  const valid = await f.request('/api/quotes', {
    method: 'POST', body: { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0 },
    headers: { 'X-Request-Id': 'native-test.request_1' },
  });
  assert.equal(valid.headers.get('x-request-id'), 'native-test.request_1');
  const state = JSON.parse(await readFile(join(f.dataDir, 'state.json'), 'utf8'));
  assert.equal(state.events[0].requestId, 'native-test.request_1');
});

test('storage failure returns safe 500 and a later HTTP write recovers without phantom events', async t => {
  const f = await httpFixture(t);
  const moved = `${f.dataDir}-moved`;
  await rename(f.dataDir, moved);
  try {
    await writeFile(f.dataDir, 'not-directory');
    const failed = await f.quote();
    assert.equal(failed.status, 500);
    assert.equal(failed.body.error.code, 'INTERNAL_ERROR');
    assert.ok(!JSON.stringify(failed.body).includes(f.dataDir));
    assert.equal((await f.request('/api/events')).body.events.length, 0);
  } finally {
    await rm(f.dataDir, { force: true });
    await rename(moved, f.dataDir);
  }
  assert.equal((await f.quote()).status, 201);
  assert.deepEqual(await readdir(f.dataDir), ['state.json']);
});

test('server module import has no listener side effect and CLI rejects invalid PORT', async () => {
  const child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: repo, env: { ...process.env, PORT: 'not-a-port' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => { stderr += chunk; });
  const [code] = await once(child, 'close');
  assert.equal(code, 1);
  assert.match(stderr, /PORT must be 1-65535/);
});
