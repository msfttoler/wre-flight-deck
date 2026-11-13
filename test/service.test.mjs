import test from 'node:test';
import assert from 'node:assert/strict';
import { domainFixture, isError, quoteBody } from './helpers.mjs';
import { Store } from '../src/store.mjs';
import { FlightDeck } from '../src/service.mjs';

const requestId = 'domain-test';
const reserve = (service, quote, key = 'service-key-001', callsign = 'Blue Team') =>
  service.book({ quoteId: quote.id, callsign }, key, requestId);
const flight = (service, id) => service.network().flights.find(item => item.id === id);

test('quotes last exactly fifteen minutes and do not hold seats', async t => {
  const { service, time } = await domainFixture(t);
  const quote = await service.quote(quoteBody({ passengers: 6 }), requestId);
  assert.equal(Date.parse(quote.expiresAt), time.value + 900000);
  assert.equal(quote.availableSeats, 12);
  assert.equal(flight(service, 'FD101').availableSeats, 12);
  assert.equal(service.bookings().length, 0);
  assert.equal(service.events()[0].requestId, requestId);
});

test('booking allocates every leg, cancelling releases exactly once, and quote cannot be reused', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody({ flightIds: ['FD102', 'FD103'], passengers: 3 }), requestId);
  const { booking, replay } = await reserve(service, quote);
  assert.equal(replay, false);
  assert.equal(booking.status, 'confirmed');
  assert.equal(booking.passengers, 3);
  assert.equal(booking.version, 1);
  assert.equal(flight(service, 'FD102').availableSeats, 5);
  assert.equal(flight(service, 'FD103').availableSeats, 5);
  const cancelled = await service.cancel(booking.id, { version: 1 }, requestId);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.version, 2);
  assert.equal(flight(service, 'FD102').availableSeats, 8);
  assert.equal(flight(service, 'FD103').availableSeats, 8);
  await assert.rejects(service.cancel(booking.id, { version: 1 }, requestId), isError('VERSION_CONFLICT', 409));
  await assert.rejects(service.cancel(booking.id, { version: 2 }, requestId), isError('BOOKING_NOT_ACTIVE', 409));
  await assert.rejects(reserve(service, quote, 'another-key-1'), isError('QUOTE_USED', 409));
  const retry = await reserve(service, quote);
  assert.equal(retry.replay, true);
  assert.equal(retry.booking.status, 'cancelled');
  assert.equal(flight(service, 'FD102').availableSeats, 8);
});

test('concurrent all-leg bookings cannot partially allocate or oversell', async t => {
  const { service, store } = await domainFixture(t);
  const connection = await service.quote(quoteBody({
    flightIds: ['FD102', 'FD103'], passengers: 6,
  }), requestId);
  const secondLeg = await service.quote(quoteBody({ flightIds: ['FD103'], passengers: 6 }), requestId);
  await reserve(service, secondLeg);
  const before = store.snapshot();
  await assert.rejects(reserve(service, connection, 'second-key-001'), isError('INSUFFICIENT_CAPACITY', 409));
  assert.deepEqual(store.snapshot(), before);
  assert.equal(flight(service, 'FD102').availableSeats, 8);
  assert.equal(flight(service, 'FD103').availableSeats, 2);
});

test('capacity race serializes the availability check with allocation', async t => {
  const { service } = await domainFixture(t);
  const quotes = await Promise.all(Array.from({ length: 5 }, () =>
    service.quote(quoteBody({ passengers: 6 }), requestId)));
  const results = await Promise.allSettled(quotes.map((quote, index) =>
    reserve(service, quote, `concurrent-key-${index}`)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
  assert.equal(results.filter(result => result.status === 'rejected'
    && result.reason.code === 'INSUFFICIENT_CAPACITY').length, 3);
  assert.equal(service.bookings().length, 2);
  assert.equal(flight(service, 'FD101').availableSeats, 0);
});

test('concurrent identical idempotency requests create exactly one booking and event', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody(), requestId);
  const results = await Promise.all(Array.from({ length: 6 }, () => reserve(service, quote)));
  assert.equal(results.filter(result => !result.replay).length, 1);
  assert.equal(new Set(results.map(result => result.booking.id)).size, 1);
  assert.equal(service.events().filter(event => event.type === 'booking.created').length, 1);
  assert.equal(flight(service, 'FD101').availableSeats, 11);
  await assert.rejects(reserve(service, quote, 'service-key-001', 'Red Team'),
    isError('IDEMPOTENCY_CONFLICT', 409));
});

test('same quote with different keys is single-use, including concurrent requests', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody(), requestId);
  const results = await Promise.allSettled([
    reserve(service, quote, 'single-use-one'), reserve(service, quote, 'single-use-two'),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'QUOTE_USED');
});

for (const [offset, accepted] of [[899999, true], [900000, false], [900001, false]]) {
  test(`quote expiry boundary at ${offset} milliseconds`, async t => {
    const { service, time } = await domainFixture(t);
    const quote = await service.quote(quoteBody(), requestId);
    time.value += offset;
    if (accepted) assert.equal((await reserve(service, quote)).booking.status, 'confirmed');
    else await assert.rejects(reserve(service, quote), isError('QUOTE_EXPIRED', 409));
  });
}

test('idempotent retry survives expiry and process restart without a new allocation', async t => {
  const { service, dataDir, time, clock } = await domainFixture(t);
  const quote = await service.quote(quoteBody({ passengers: 2 }), requestId);
  const first = await reserve(service, quote);
  time.value += 900001;
  const restarted = new FlightDeck(await new Store(dataDir).initialize(), clock);
  const retry = await reserve(restarted, quote);
  assert.equal(retry.replay, true);
  assert.deepEqual(retry.booking, first.booking);
  assert.equal(flight(restarted, 'FD101').availableSeats, 10);
  const nextQuote = await restarted.quote(quoteBody({ flightIds: ['FD102'] }), requestId);
  assert.equal((await reserve(restarted, nextQuote, 'restart-key-02')).booking.status, 'confirmed');
  const again = new FlightDeck(await new Store(dataDir).initialize(), clock);
  assert.equal(again.bookings().length, 2);
  assert.equal(flight(again, 'FD102').availableSeats, 7);
});

test('legal operation transitions and gate-only changes maintain optimistic versions', async t => {
  const { service } = await domainFixture(t);
  let updated = await service.updateFlight('FD101', { version: 1, gate: 'Z99' }, requestId);
  assert.equal(updated.status, 'scheduled');
  assert.equal(updated.version, 2);
  for (const status of ['delayed', 'scheduled', 'delayed', 'boarding', 'departed']) {
    updated = await service.updateFlight('FD101', { version: updated.version, status }, requestId);
    assert.equal(updated.status, status);
    assert.equal(updated.gate, 'Z99');
  }
  await assert.rejects(service.updateFlight('FD101', { version: updated.version, gate: 'A01' }, requestId),
    isError('INVALID_TRANSITION', 409));
  await assert.rejects(service.updateFlight('FD101', { version: 1, status: 'scheduled' }, requestId),
    isError('VERSION_CONFLICT', 409));
});

test('illegal transitions and stale competing versions do not change operations', async t => {
  const { service, store } = await domainFixture(t);
  const before = store.snapshot();
  await assert.rejects(service.updateFlight('FD101', { version: 1, status: 'departed' }, requestId),
    isError('INVALID_TRANSITION', 409));
  assert.deepEqual(store.snapshot(), before);
  const results = await Promise.allSettled([
    service.updateFlight('FD101', { version: 1, status: 'boarding' }, requestId),
    service.updateFlight('FD101', { version: 1, gate: 'Z99' }, requestId),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'VERSION_CONFLICT');
  await assert.rejects(service.updateFlight('FD101', { version: 2, status: 'delayed' }, requestId),
    isError('INVALID_TRANSITION', 409));
});

test('cancellation is forbidden after any connected leg departs operationally', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody({ flightIds: ['FD102', 'FD103'] }), requestId);
  const { booking } = await reserve(service, quote);
  let current = flight(service, 'FD103');
  current = await service.updateFlight(current.id, { version: current.version, status: 'boarding' }, requestId);
  await service.updateFlight(current.id, { version: current.version, status: 'departed' }, requestId);
  await assert.rejects(service.cancel(booking.id, { version: booking.version }, requestId),
    isError('DEPARTURE_PASSED', 409));
  assert.equal(flight(service, 'FD102').availableSeats, 7);
});

test('scheduled departure instant also blocks booking, quoting, and cancellation', async t => {
  const { service, time } = await domainFixture(t);
  const bookedQuote = await service.quote(quoteBody(), requestId);
  const { booking } = await reserve(service, bookedQuote);
  time.value = Date.parse('2030-06-15T13:59:00Z');
  const pending = await service.quote(quoteBody(), requestId);
  time.value = Date.parse('2030-06-15T14:00:00Z');
  await assert.rejects(reserve(service, pending, 'departure-key1'), isError('FLIGHT_UNAVAILABLE', 409));
  await assert.rejects(service.quote(quoteBody(), requestId), isError('FLIGHT_UNAVAILABLE', 409));
  await assert.rejects(service.cancel(booking.id, { version: 1 }, requestId), isError('DEPARTURE_PASSED', 409));
});

test('departing a flight after quote invalidates booking without reserving any leg', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody({ flightIds: ['FD102', 'FD103'] }), requestId);
  await service.updateFlight('FD103', { version: 1, status: 'boarding' }, requestId);
  await service.updateFlight('FD103', { version: 2, status: 'departed' }, requestId);
  await assert.rejects(reserve(service, quote), isError('FLIGHT_UNAVAILABLE', 409));
  assert.equal(flight(service, 'FD102').availableSeats, 8);
});

test('event journal is bounded, newest first, and preserves request correlation', async t => {
  const { service } = await domainFixture(t);
  for (let index = 0; index < 205; index++) {
    const current = flight(service, 'FD101');
    await service.updateFlight('FD101', { version: current.version, gate: 'A01' }, `request-${index}`);
  }
  const events = service.events();
  assert.equal(events.length, 200);
  assert.equal(events[0].requestId, 'request-204');
  assert.equal(events.at(-1).requestId, 'request-5');
});

test('returned booking and network objects cannot mutate persisted state', async t => {
  const { service } = await domainFixture(t);
  const quote = await service.quote(quoteBody(), requestId);
  const { booking } = await reserve(service, quote);
  booking.passengers = 999;
  booking.quote.totalCents = 1;
  service.network().flights[0].availableSeats = 999;
  service.network().airports[0].code = 'XXX';
  assert.equal(service.bookings()[0].passengers, 1);
  assert.equal(flight(service, 'FD101').availableSeats, 11);
  assert.equal(service.network().airports[0].code, 'SEA');
});
