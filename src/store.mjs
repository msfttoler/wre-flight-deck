import { mkdir, readFile, open, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initialFlights, validateLegs } from './network.mjs';
import { priceItinerary } from './pricing.mjs';

export const EVENT_LIMIT = 200;
export const callsignPattern = /^[A-Za-z0-9][A-Za-z0-9 -]{1,23}$/;
export const keyPattern = /^[A-Za-z0-9-]{8,80}$/;
export const requestIdPattern = /^[A-Za-z0-9._-]{1,80}$/;
export const gatePattern = /^[A-Z](?:0[1-9]|[1-9][0-9])$/;
const statuses = ['scheduled', 'delayed', 'boarding', 'departed'];
const iso = value => typeof value === 'string' && Number.isFinite(Date.parse(value))
  && new Date(value).toISOString() === value;
const positive = value => Number.isSafeInteger(value) && value >= 1;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const assert = (condition, message) => {
  if (!condition) throw new Error(`Invalid persisted state: ${message}`);
};
const shape = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const identity = (value, prefix) => typeof value === 'string'
  && new RegExp(`^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).test(value);

export function newState() {
  return { schemaVersion: 1, flights: initialFlights(), quotes: [], bookings: [], idempotency: [], events: [] };
}

export function validateState(state) {
  assert(shape(state, ['schemaVersion', 'flights', 'quotes', 'bookings', 'idempotency', 'events'])
    && state.schemaVersion === 1, 'unsupported schema');
  for (const key of ['flights', 'quotes', 'bookings', 'idempotency', 'events']) {
    assert(Array.isArray(state[key]), `${key} must be an array`);
  }
  const baseline = initialFlights();
  assert(state.flights.length === baseline.length, 'schedule size');
  const unique = (items, key) => new Set(items.map(item => item[key])).size === items.length;
  assert(unique(state.flights, 'id'), 'duplicate flight');
  for (const flight of state.flights) {
    const original = baseline.find(item => item.id === flight.id);
    assert(original, 'unknown flight');
    assert(shape(flight, Object.keys(original)), 'flight shape');
    for (const key of Object.keys(original).filter(key =>
      !['availableSeats', 'status', 'gate', 'version'].includes(key))) {
      assert(flight[key] === original[key], `changed schedule field ${key}`);
    }
    assert(Number.isSafeInteger(flight.availableSeats)
      && flight.availableSeats >= 0 && flight.availableSeats <= flight.capacity, 'seat count');
    assert(positive(flight.version) && statuses.includes(flight.status)
      && typeof flight.gate === 'string' && gatePattern.test(flight.gate), 'flight operation fields');
  }
  assert(unique(state.quotes, 'id') && unique(state.bookings, 'id')
    && unique(state.bookings, 'reference') && unique(state.idempotency, 'key'), 'duplicate identity');
  for (const quote of state.quotes) {
    assert(shape(quote, ['id', 'expiresAt', 'flightIds', 'passengers', 'bagsPerPassenger', 'coupon',
      'currency', 'lines', 'subtotalCents', 'discountCents', 'taxCents', 'totalCents', 'availableSeats']),
    'quote shape');
    assert(identity(quote.id, 'q') && iso(quote.expiresAt), 'quote identity');
    assert(quote.currency === 'USD' && typeof quote.coupon === 'string', 'quote currency or coupon');
    const legs = validateLegs(quote.flightIds, state.flights);
    const expected = priceItinerary(legs, quote.passengers, quote.bagsPerPassenger, quote.coupon);
    for (const key of Object.keys(expected)) assert(equal(quote[key], expected[key]), `quote ${key}`);
    assert(Number.isSafeInteger(quote.availableSeats) && quote.availableSeats >= quote.passengers
      && quote.availableSeats <= Math.min(...legs.map(leg => leg.capacity)), 'quote inventory');
  }
  const usedQuotes = new Set();
  for (const booking of state.bookings) {
    assert(shape(booking, ['id', 'reference', 'callsign', 'status', 'quote', 'createdAt',
      'version', 'flightIds', 'passengers']), 'booking shape');
    assert(identity(booking.id, 'b')
      && typeof booking.reference === 'string' && /^FD-[A-F0-9]{12}$/.test(booking.reference),
    'booking identity');
    assert(typeof booking.callsign === 'string' && callsignPattern.test(booking.callsign)
      && booking.callsign.trim() === booking.callsign && iso(booking.createdAt), 'booking details');
    assert(['confirmed', 'cancelled'].includes(booking.status)
      && booking.version === (booking.status === 'confirmed' ? 1 : 2), 'booking status');
    const quote = state.quotes.find(item => item.id === booking.quote?.id);
    assert(quote && equal(booking.quote, quote)
      && equal(booking.flightIds, quote.flightIds) && booking.passengers === quote.passengers,
    'booking quote');
    assert(Date.parse(booking.createdAt) < Date.parse(quote.expiresAt), 'booking after expiry');
    assert(!usedQuotes.has(quote.id), 'reused quote');
    usedQuotes.add(quote.id);
  }
  for (const flight of state.flights) {
    const occupied = state.bookings.filter(booking => booking.status === 'confirmed'
      && booking.flightIds.includes(flight.id)).reduce((sum, booking) => sum + booking.passengers, 0);
    assert(flight.availableSeats === flight.capacity - occupied, 'inventory does not match reservations');
  }
  assert(state.idempotency.length === state.bookings.length, 'missing idempotency record');
  assert(unique(state.idempotency, 'bookingId'), 'duplicate booking key');
  for (const entry of state.idempotency) {
    assert(shape(entry, ['key', 'fingerprint', 'bookingId']), 'idempotency shape');
    const booking = state.bookings.find(item => item.id === entry.bookingId);
    assert(typeof entry.key === 'string' && keyPattern.test(entry.key) && booking
      && entry.fingerprint === JSON.stringify({ quoteId: booking.quote.id, callsign: booking.callsign }),
    'idempotency record');
  }
  assert(state.events.length <= EVENT_LIMIT && unique(state.events, 'id'), 'event journal size or identity');
  for (const event of state.events) {
    assert(shape(event, ['id', 'type', 'entityId', 'at', 'detail', 'requestId']), 'event shape');
    assert(identity(event.id, 'e') && iso(event.at)
      && ['quote.created', 'booking.created', 'booking.cancelled', 'flight.updated'].includes(event.type)
      && typeof event.entityId === 'string' && typeof event.detail === 'string'
      && typeof event.requestId === 'string' && requestIdPattern.test(event.requestId), 'event record');
  }
}

export class Store {
  #state;
  #tail = Promise.resolve();

  constructor(dataDir) {
    this.dataDir = dataDir;
    this.filename = join(dataDir, 'state.json');
  }

  async initialize() {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    let text;
    try {
      text = await readFile(this.filename, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (text !== undefined) {
      try {
        this.#state = JSON.parse(text);
        validateState(this.#state);
      } catch (error) {
        throw new Error('Saved Flight Deck state is invalid; refusing to overwrite it.', { cause: error });
      }
    } else {
      this.#state = newState();
      await this.#persist(this.#state);
    }
    return this;
  }

  snapshot() {
    return structuredClone(this.#state);
  }

  async #persist(state) {
    const pending = join(this.dataDir, `.state-${randomUUID()}.pending`);
    let handle;
    try {
      handle = await open(pending, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(state)}\n`, 'utf8');
      await handle.sync();
      await handle.close();
      handle = undefined;
      await rename(pending, this.filename);
    } finally {
      await handle?.close().catch(() => {});
      await unlink(pending).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }

  mutate(operation) {
    const pending = this.#tail.then(async () => {
      const draft = this.snapshot();
      const result = await operation(draft);
      validateState(draft);
      await this.#persist(draft);
      this.#state = draft;
      return structuredClone(result);
    });
    this.#tail = pending.catch(() => {});
    return pending;
  }
}
