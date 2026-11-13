import test from 'node:test';
import assert from 'node:assert/strict';
import { airports, distanceKm, initialFlights, planRoutes, validateLegs } from '../src/network.mjs';
import { NOW } from './helpers.mjs';

test('fictional network has all eight airports and useful direct and connecting SEA-DEN routes', () => {
  assert.deepEqual(airports.map(airport => airport.code).sort(),
    ['BOI', 'DEN', 'LAX', 'PDX', 'PHX', 'SEA', 'SFO', 'SLC']);
  const routes = planRoutes(initialFlights(), 'SEA', 'DEN', 1, NOW);
  assert.ok(routes.some(route => route.flightIds.join() === 'FD101' && route.stops === 0));
  assert.ok(routes.some(route => route.flightIds.join() === 'FD102,FD103' && route.stops === 1));
  assert.ok(routes.some(route => route.flightIds.join() === 'FD104,FD105'));
  const direct = routes.find(route => route.flightIds.join() === 'FD101');
  assert.equal(direct.durationMinutes, 165);
  assert.equal(direct.baseFareCents, 24000);
  assert.equal(direct.availableSeats, 12);
  assert.ok(direct.distanceKm > 1500 && direct.distanceKm < 1800);
  assert.ok(routes.every((route, index) => !index || routes[index - 1].durationMinutes <= route.durationMinutes));
});

test('route distance is symmetric and zero for the same airport', () => {
  assert.equal(distanceKm('SEA', 'DEN'), distanceKm('DEN', 'SEA'));
  assert.equal(distanceKm('SEA', 'SEA'), 0);
});

test('itinerary uses minimum seats and sums fares and distances across legs', () => {
  const flights = initialFlights();
  flights.find(flight => flight.id === 'FD103').availableSeats = 2;
  const route = planRoutes(flights, 'SEA', 'DEN', 2, NOW).find(item => item.id === 'FD102-FD103');
  assert.equal(route.availableSeats, 2);
  assert.equal(route.baseFareCents, 26000);
  assert.equal(route.distanceKm, distanceKm('SEA', 'PDX') + distanceKm('PDX', 'DEN'));
  assert.equal(route.durationMinutes, 260);
  assert.ok(!planRoutes(flights, 'SEA', 'DEN', 3, NOW).some(item => item.id === route.id));
});

for (const [minutes, valid] of [[34, false], [35, true], [180, true], [181, false], [-1, false]]) {
  test(`connection window ${minutes} minutes is ${valid ? 'accepted' : 'rejected'}`, () => {
    const flights = initialFlights().filter(flight => ['FD102', 'FD103'].includes(flight.id));
    const second = flights[1];
    second.departure = new Date(Date.parse(flights[0].arrival) + minutes * 60000).toISOString();
    second.arrival = new Date(Date.parse(second.departure) + 120 * 60000).toISOString();
    assert.equal(planRoutes(flights, 'SEA', 'DEN', 1, NOW).length, valid ? 1 : 0);
    if (valid) assert.equal(validateLegs(['FD102', 'FD103'], flights).length, 2);
    else assert.throws(() => validateLegs(['FD102', 'FD103'], flights), { code: 'INVALID_ITINERARY' });
  });
}

test('departed, past, and sold-out legs are excluded from route search', () => {
  const flights = initialFlights();
  flights.find(flight => flight.id === 'FD101').status = 'departed';
  flights.find(flight => flight.id === 'FD103').availableSeats = 0;
  const routes = planRoutes(flights, 'SEA', 'DEN', 1, NOW);
  assert.ok(routes.length > 0);
  assert.ok(routes.every(route => !route.flightIds.some(id => ['FD101', 'FD103'].includes(id))));
  assert.deepEqual(planRoutes(flights, 'SEA', 'DEN', 1, Date.parse('2030-06-16T00:00:00Z')), []);
});

for (const ids of [[], ['FD101', 'FD101'], ['missing'], ['FD101', 'FD107'],
  ['FD103', 'FD102'], ['FD102', 'FD103', 'FD114'], null, 'FD101', [101]]) {
  test(`reject invalid or disconnected legs ${JSON.stringify(ids)}`, () => {
    assert.throws(() => validateLegs(ids, initialFlights()), { code: 'INVALID_ITINERARY' });
  });
}

test('reject invalid leg dates and circular itineraries', () => {
  const flights = initialFlights();
  flights[0].arrival = flights[0].departure;
  assert.throws(() => validateLegs(['FD101'], flights), { code: 'INVALID_ITINERARY' });
  assert.throws(() => validateLegs(['FD101', 'FD113'], initialFlights()), { code: 'INVALID_ITINERARY' });
});

test('reject unknown or same-airport routes', () => {
  for (const [origin, destination] of [['SEA', 'SEA'], ['SEA', 'XYZ'], [undefined, 'DEN'], ['sea', 'DEN']]) {
    assert.throws(() => planRoutes(initialFlights(), origin, destination, 1, NOW), { code: 'INVALID_ROUTE' });
  }
});
