import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Store, newState, validateState } from '../src/store.mjs';
import { domainFixture, quoteBody } from './helpers.mjs';

test('new state persists atomically with private permissions and no leftover pending files', async t => {
  const { dataDir, service } = await domainFixture(t);
  await service.quote(quoteBody(), 'persist-request');
  const saved = JSON.parse(await readFile(join(dataDir, 'state.json'), 'utf8'));
  validateState(saved);
  assert.equal(saved.quotes.length, 1);
  assert.deepEqual(await readdir(dataDir), ['state.json']);
  assert.equal((await stat(join(dataDir, 'state.json'))).mode & 0o777, 0o600);
});

for (const text of ['{broken', '', 'null', '{"schemaVersion":999}', '{"schemaVersion":1,"flights":[]}']) {
  test(`saved invalid JSON/schema fails closed: ${JSON.stringify(text)}`, async t => {
    const { dataDir } = await domainFixture(t);
    await writeFile(join(dataDir, 'state.json'), text);
    await assert.rejects(new Store(dataDir).initialize(), /invalid; refusing to overwrite/);
    assert.equal(await readFile(join(dataDir, 'state.json'), 'utf8'), text);
  });
}

for (const [name, change] of [
  ['overallocated seats', state => { state.flights[0].availableSeats = -1; }],
  ['noninteger seats', state => { state.flights[0].availableSeats = 1.5; }],
  ['inventory without reservation', state => { state.flights[0].availableSeats = 11; }],
  ['tampered fare', state => { state.flights[0].baseFareCents = 1; }],
  ['unknown flight', state => { state.flights[0].id = 'FD999'; }],
  ['missing flight', state => { state.flights.pop(); }],
  ['duplicate flight', state => { state.flights[0] = state.flights[1]; }],
  ['invalid version', state => { state.flights[0].version = Infinity; }],
  ['invalid gate', state => { state.flights[0].gate = 'A00'; }],
  ['invalid operation', state => { state.flights[0].status = 'landing'; }],
]) {
  test(`saved semantic corruption is rejected: ${name}`, () => {
    const state = newState();
    change(state);
    assert.throws(() => validateState(state), /Invalid persisted state/);
  });
}

test('persisted quote pricing tampering and missing idempotency records fail closed', async t => {
  const { dataDir, service, store } = await domainFixture(t);
  const quote = await service.quote(quoteBody(), 'quote-request');
  await service.book({ quoteId: quote.id, callsign: 'Blue Team' }, 'persist-key-001', 'booking-request');
  const valid = store.snapshot();
  for (const change of [
    state => { state.quotes[0].totalCents += 1; },
    state => { state.idempotency = []; },
    state => { state.bookings[0].quote.totalCents += 1; },
    state => { state.idempotency[0].fingerprint = '{}'; },
    state => { state.bookings[0].passengers = 6; },
    state => { state.events[0].requestId = 'unsafe request'; },
  ]) {
    const corrupted = structuredClone(valid);
    change(corrupted);
    await writeFile(join(dataDir, 'state.json'), JSON.stringify(corrupted));
    await assert.rejects(new Store(dataDir).initialize(), /invalid; refusing to overwrite/);
  }
});

test('failed storage write leaves memory unchanged and queue accepts later writes', async t => {
  const { dataDir, service, store } = await domainFixture(t);
  const before = store.snapshot();
  const moved = `${dataDir}-moved`;
  await rename(dataDir, moved);
  try {
    await writeFile(dataDir, 'not a directory');
    await assert.rejects(service.quote(quoteBody(), 'failed-request'), { code: 'ENOTDIR' });
    assert.deepEqual(store.snapshot(), before);
  } finally {
    await rm(dataDir, { force: true });
    await rename(moved, dataDir);
  }
  await service.quote(quoteBody(), 'recovered-request');
  assert.equal(store.snapshot().quotes.length, 1);
  assert.equal((await new Store(dataDir).initialize()).snapshot().quotes.length, 1);
  assert.deepEqual(await readdir(dataDir), ['state.json']);
});

test('failed transaction validation neither writes nor poisons the mutation queue', async t => {
  const { store, dataDir } = await domainFixture(t);
  const before = await readFile(join(dataDir, 'state.json'), 'utf8');
  await assert.rejects(store.mutate(state => { state.flights[0].availableSeats = 999; }),
    /Invalid persisted state/);
  assert.equal(await readFile(join(dataDir, 'state.json'), 'utf8'), before);
  assert.equal(store.snapshot().flights[0].availableSeats, 12);
  const result = await store.mutate(state => {
    state.flights[0].gate = 'Z99';
    state.flights[0].version += 1;
    return state.flights[0];
  });
  assert.equal(result.gate, 'Z99');
});
