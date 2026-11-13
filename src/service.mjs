import { randomUUID } from 'node:crypto';
import { fields, integer, requireThat } from './errors.mjs';
import { airports, currency, disclaimer, planRoutes, scenarioDate, validateLegs } from './network.mjs';
import { priceItinerary } from './pricing.mjs';
import { callsignPattern, EVENT_LIMIT, gatePattern, keyPattern } from './store.mjs';

const transitions = {
  scheduled: ['scheduled', 'delayed', 'boarding'],
  delayed: ['delayed', 'scheduled', 'boarding'],
  boarding: ['boarding', 'departed'],
  departed: [],
};

export class FlightDeck {
  constructor(store, clock = Date.now) {
    this.store = store;
    this.clock = clock;
  }

  now() {
    const value = Number(this.clock());
    if (!Number.isFinite(value)) throw new Error('Clock must return a valid Date or epoch milliseconds.');
    return value;
  }

  network() {
    return { airports: structuredClone(airports), flights: this.store.snapshot().flights, scenarioDate, currency, disclaimer };
  }

  itineraries(origin, destination, passengers = 1) {
    integer(passengers, 1, 6, 'passengers');
    return planRoutes(this.store.snapshot().flights, origin, destination, passengers, this.now());
  }

  bookings() {
    return this.store.snapshot().bookings.reverse();
  }

  events() {
    return this.store.snapshot().events.slice().reverse();
  }

  event(state, type, entityId, detail, requestId, now) {
    state.events.push({
      id: `e_${randomUUID()}`, type, entityId, detail, requestId, at: new Date(now).toISOString(),
    });
    state.events = state.events.slice(-EVENT_LIMIT);
  }

  quote(body, requestId) {
    fields(body, ['flightIds', 'passengers', 'bagsPerPassenger', 'coupon'],
      ['flightIds', 'passengers', 'bagsPerPassenger']);
    return this.store.mutate(state => {
      const now = this.now();
      const legs = validateLegs(body.flightIds, state.flights);
      const coupon = body.coupon === undefined ? '' : body.coupon;
      const pricing = priceItinerary(legs, body.passengers, body.bagsPerPassenger, coupon);
      requireThat(legs.every(leg => leg.status !== 'departed' && Date.parse(leg.departure) > now),
        409, 'FLIGHT_UNAVAILABLE', 'A flight has departed or its scheduled departure has passed.');
      const availableSeats = Math.min(...legs.map(leg => leg.availableSeats));
      requireThat(availableSeats >= body.passengers, 409, 'INSUFFICIENT_CAPACITY',
        'There are not enough seats on every leg.');
      const quote = {
        id: `q_${randomUUID()}`, expiresAt: new Date(now + 15 * 60000).toISOString(),
        flightIds: [...body.flightIds], passengers: body.passengers,
        bagsPerPassenger: body.bagsPerPassenger, coupon, currency, ...pricing, availableSeats,
      };
      state.quotes.push(quote);
      this.event(state, 'quote.created', quote.id, 'Price quoted; seats are not held.', requestId, now);
      return quote;
    });
  }

  book(body, key, requestId) {
    fields(body, ['quoteId', 'callsign']);
    requireThat(typeof key === 'string' && keyPattern.test(key), 400, 'INVALID_IDEMPOTENCY_KEY',
      'Idempotency-Key must contain 8-80 letters, digits, or hyphens.');
    requireThat(typeof body.quoteId === 'string' && body.quoteId.length <= 80,
      400, 'INVALID_VALUE', 'quoteId must be a quote ID.');
    requireThat(typeof body.callsign === 'string' && callsignPattern.test(body.callsign)
      && body.callsign.trim() === body.callsign, 400, 'INVALID_CALLSIGN',
    'Use a 2-24 character fictional team callsign: letters, digits, spaces, and hyphens.');
    const fingerprint = JSON.stringify({ quoteId: body.quoteId, callsign: body.callsign });
    return this.store.mutate(state => {
      const existing = state.idempotency.find(entry => entry.key === key);
      if (existing) {
        requireThat(existing.fingerprint === fingerprint, 409, 'IDEMPOTENCY_CONFLICT',
          'This Idempotency-Key was already used with a different request.');
        return { booking: state.bookings.find(booking => booking.id === existing.bookingId), replay: true };
      }
      const now = this.now();
      const quote = state.quotes.find(item => item.id === body.quoteId);
      requireThat(quote, 404, 'QUOTE_NOT_FOUND', 'Quote not found.');
      requireThat(!state.bookings.some(booking => booking.quote.id === quote.id), 409, 'QUOTE_USED',
        'This quote has already been used.');
      requireThat(Date.parse(quote.expiresAt) > now, 409, 'QUOTE_EXPIRED', 'Request a fresh quote.');
      const legs = validateLegs(quote.flightIds, state.flights);
      requireThat(legs.every(leg => leg.status !== 'departed' && Date.parse(leg.departure) > now),
        409, 'FLIGHT_UNAVAILABLE', 'A flight has departed or its scheduled departure has passed.');
      requireThat(legs.every(leg => leg.availableSeats >= quote.passengers),
        409, 'INSUFFICIENT_CAPACITY', 'There are not enough seats on every leg.');
      for (const leg of legs) {
        leg.availableSeats -= quote.passengers;
        leg.version += 1;
      }
      const booking = {
        id: `b_${randomUUID()}`, reference: `FD-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
        callsign: body.callsign, status: 'confirmed', quote: structuredClone(quote),
        createdAt: new Date(now).toISOString(), version: 1,
        flightIds: [...quote.flightIds], passengers: quote.passengers,
      };
      state.bookings.push(booking);
      state.idempotency.push({ key, fingerprint, bookingId: booking.id });
      this.event(state, 'booking.created', booking.id, 'Seats reserved on every leg.', requestId, now);
      return { booking, replay: false };
    });
  }

  cancel(id, body, requestId) {
    fields(body, ['version']);
    integer(body.version, 1, Number.MAX_SAFE_INTEGER, 'version');
    return this.store.mutate(state => {
      const booking = state.bookings.find(item => item.id === id);
      requireThat(booking, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
      requireThat(booking.version === body.version, 409, 'VERSION_CONFLICT', 'Refresh the booking version.');
      requireThat(booking.status === 'confirmed', 409, 'BOOKING_NOT_ACTIVE', 'Booking is already cancelled.');
      const now = this.now();
      const legs = validateLegs(booking.flightIds, state.flights);
      requireThat(legs.every(leg => leg.status !== 'departed' && Date.parse(leg.departure) > now),
        409, 'DEPARTURE_PASSED', 'A booking cannot be cancelled after any leg has departed.');
      for (const leg of legs) {
        leg.availableSeats += booking.passengers;
        leg.version += 1;
      }
      booking.status = 'cancelled';
      booking.version += 1;
      this.event(state, 'booking.cancelled', booking.id, 'Seats released on every leg.', requestId, now);
      return booking;
    });
  }

  updateFlight(id, body, requestId) {
    fields(body, ['version', 'status', 'gate'], ['version']);
    integer(body.version, 1, Number.MAX_SAFE_INTEGER, 'version');
    requireThat(Object.hasOwn(body, 'status') || Object.hasOwn(body, 'gate'),
      400, 'INVALID_BODY', 'Provide a status or a gate.');
    if (Object.hasOwn(body, 'status')) {
      requireThat(typeof body.status === 'string' && Object.hasOwn(transitions, body.status),
        400, 'INVALID_STATUS', 'Unknown flight status.');
    }
    if (Object.hasOwn(body, 'gate')) {
      requireThat(typeof body.gate === 'string' && gatePattern.test(body.gate),
        400, 'INVALID_GATE', 'Gate must match A01-Z99.');
    }
    return this.store.mutate(state => {
      const flight = state.flights.find(item => item.id === id);
      requireThat(flight, 404, 'FLIGHT_NOT_FOUND', 'Flight not found.');
      requireThat(flight.version === body.version, 409, 'VERSION_CONFLICT', 'Refresh the flight version.');
      const status = body.status ?? flight.status;
      const gate = body.gate ?? flight.gate;
      requireThat(transitions[flight.status].includes(status), 409, 'INVALID_TRANSITION',
        'This flight status transition is not allowed.');
      requireThat(!['boarding', 'departed'].includes(status) || gatePattern.test(gate),
        400, 'INVALID_GATE', 'Boarding and departure require a valid gate.');
      flight.status = status;
      flight.gate = gate;
      flight.version += 1;
      this.event(state, 'flight.updated', flight.id, `Status ${status}; gate ${gate}.`, requestId, this.now());
      return flight;
    });
  }
}
