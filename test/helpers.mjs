import { mkdtemp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createApp } from '../src/server.mjs';
import { Store } from '../src/store.mjs';
import { FlightDeck } from '../src/service.mjs';

export const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const NOW = Date.parse('2030-06-15T12:00:00.000Z');

export async function domainFixture(t) {
  const dataDir = await mkdtemp(join(repo, '.test-data-'));
  t.after(() => rm(dataDir, { recursive: true, force: true }));
  const time = { value: NOW };
  const clock = () => time.value;
  const store = await new Store(dataDir).initialize();
  return { dataDir, time, clock, store, service: new FlightDeck(store, clock) };
}

export async function httpFixture(t) {
  const dataDir = await mkdtemp(join(repo, '.test-data-'));
  const time = { value: NOW };
  const fixture = { dataDir, time, server: undefined, base: undefined };
  fixture.start = async () => {
    fixture.server = await createApp({ dataDir, clock: () => time.value });
    fixture.server.listen(0, '127.0.0.1');
    await once(fixture.server, 'listening');
    fixture.base = `http://127.0.0.1:${fixture.server.address().port}`;
  };
  fixture.stop = async () => {
    if (!fixture.server?.listening) return;
    await new Promise((resolve, reject) => fixture.server.close(error => error ? reject(error) : resolve()));
  };
  fixture.request = async (path, { method = 'GET', body, headers = {} } = {}) => {
    const response = await fetch(`${fixture.base}${path}`, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    return {
      status: response.status, headers: response.headers,
      body: response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text,
    };
  };
  fixture.quote = async (overrides = {}) => fixture.request('/api/quotes', {
    method: 'POST',
    body: { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0, ...overrides },
  });
  fixture.book = async (quoteId, key = 'flight-key-0001', callsign = 'Blue Team') =>
    fixture.request('/api/bookings', {
      method: 'POST', body: { quoteId, callsign }, headers: { 'Idempotency-Key': key },
    });
  t.after(async () => {
    await fixture.stop();
    await rm(dataDir, { recursive: true, force: true });
  });
  await fixture.start();
  return fixture;
}

export function quoteBody(overrides = {}) {
  return { flightIds: ['FD101'], passengers: 1, bagsPerPassenger: 0, ...overrides };
}

export const isError = (code, status) => error => error.code === code
  && (status === undefined || error.status === status);
