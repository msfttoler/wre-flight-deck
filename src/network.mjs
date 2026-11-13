import { requireThat } from './errors.mjs';

export const scenarioDate = '2030-06-15';
export const currency = 'USD';
export const disclaimer = 'Fictional 2030 schedule, aircraft, inventory, and service tax. Not live aviation information, real bookings, or legal tax advice.';
export const airports = [
  { code: 'SEA', name: 'Seattle Flight Deck', city: 'Seattle', lat: 47.45, lon: -122.31 },
  { code: 'PDX', name: 'Portland Flight Deck', city: 'Portland', lat: 45.59, lon: -122.60 },
  { code: 'SFO', name: 'San Francisco Flight Deck', city: 'San Francisco', lat: 37.62, lon: -122.38 },
  { code: 'LAX', name: 'Los Angeles Flight Deck', city: 'Los Angeles', lat: 33.94, lon: -118.41 },
  { code: 'DEN', name: 'Denver Flight Deck', city: 'Denver', lat: 39.86, lon: -104.67 },
  { code: 'BOI', name: 'Boise Flight Deck', city: 'Boise', lat: 43.56, lon: -116.22 },
  { code: 'PHX', name: 'Phoenix Flight Deck', city: 'Phoenix', lat: 33.43, lon: -112.01 },
  { code: 'SLC', name: 'Salt Lake Flight Deck', city: 'Salt Lake City', lat: 40.79, lon: -111.98 },
];

const rows = [
  ['FD101', 'SEA', 'DEN', '14:00', '16:45', 24000, 12, 'A01'],
  ['FD102', 'SEA', 'PDX', '13:00', '14:00', 12000, 8, 'A02'],
  ['FD103', 'PDX', 'DEN', '15:00', '17:20', 14000, 8, 'B01'],
  ['FD104', 'SEA', 'BOI', '13:30', '15:00', 13000, 6, 'A03'],
  ['FD105', 'BOI', 'DEN', '15:45', '17:25', 12000, 6, 'B02'],
  ['FD106', 'SEA', 'SFO', '14:30', '16:40', 18000, 10, 'A04'],
  ['FD107', 'SFO', 'LAX', '17:30', '19:00', 12000, 10, 'C01'],
  ['FD108', 'SFO', 'DEN', '17:30', '20:00', 17000, 8, 'C02'],
  ['FD109', 'LAX', 'PHX', '19:50', '21:10', 13000, 8, 'D01'],
  ['FD110', 'PHX', 'DEN', '22:00', '23:50', 15000, 8, 'E01'],
  ['FD111', 'SEA', 'SLC', '14:00', '16:00', 16000, 10, 'A05'],
  ['FD112', 'SLC', 'DEN', '17:00', '18:30', 14000, 10, 'F01'],
  ['FD113', 'DEN', 'SEA', '18:00', '20:55', 25000, 12, 'G01'],
  ['FD114', 'DEN', 'LAX', '18:30', '21:00', 22000, 10, 'G02'],
  ['FD115', 'PDX', 'SFO', '15:00', '16:50', 15000, 8, 'B03'],
  ['FD116', 'LAX', 'SEA', '15:00', '17:55', 28000, 12, 'D02'],
  ['FD117', 'BOI', 'SLC', '16:00', '17:10', 12000, 6, 'B04'],
  ['FD118', 'PHX', 'SLC', '15:00', '16:40', 15000, 8, 'E02'],
];

export function initialFlights() {
  return rows.map(([id, origin, destination, departure, arrival, baseFareCents, capacity, gate]) => ({
    id, number: id, origin, destination,
    departure: `${scenarioDate}T${departure}:00.000Z`,
    arrival: `${scenarioDate}T${arrival}:00.000Z`,
    aircraft: 'Fictional FD-80', capacity, baseFareCents, availableSeats: capacity,
    status: 'scheduled', gate, version: 1,
  }));
}

export function distanceKm(origin, destination) {
  const a = airports.find(airport => airport.code === origin);
  const b = airports.find(airport => airport.code === destination);
  const radians = degrees => degrees * Math.PI / 180;
  const h = Math.sin(radians(b.lat - a.lat) / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat))
    * Math.sin(radians(b.lon - a.lon) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function validateLegs(flightIds, flights) {
  requireThat(Array.isArray(flightIds) && flightIds.length >= 1 && flightIds.length <= 2
    && flightIds.every(id => typeof id === 'string') && new Set(flightIds).size === flightIds.length,
  400, 'INVALID_ITINERARY', 'Choose one or two distinct flight IDs.');
  const legs = flightIds.map(id => flights.find(flight => flight.id === id));
  requireThat(legs.every(Boolean), 400, 'INVALID_ITINERARY', 'A flight ID is unknown.');
  requireThat(legs.every(leg => Date.parse(leg.arrival) > Date.parse(leg.departure)),
    400, 'INVALID_ITINERARY', 'Flight arrival must follow departure.');
  if (legs.length === 2) {
    const [first, second] = legs;
    const connection = (Date.parse(second.departure) - Date.parse(first.arrival)) / 60000;
    requireThat(first.destination === second.origin && first.origin !== second.destination
      && connection >= 35 && connection <= 180,
    400, 'INVALID_ITINERARY', 'Connections must join airports and allow 35-180 minutes.');
  }
  return legs;
}

export function itinerary(legs) {
  const first = legs[0];
  const last = legs.at(-1);
  return {
    id: legs.map(leg => leg.id).join('-'),
    flightIds: legs.map(leg => leg.id),
    origin: first.origin, destination: last.destination,
    departure: first.departure, arrival: last.arrival,
    durationMinutes: Math.round((Date.parse(last.arrival) - Date.parse(first.departure)) / 60000),
    stops: legs.length - 1,
    availableSeats: Math.min(...legs.map(leg => leg.availableSeats)),
    baseFareCents: legs.reduce((sum, leg) => sum + leg.baseFareCents, 0),
    distanceKm: legs.reduce((sum, leg) => sum + distanceKm(leg.origin, leg.destination), 0),
  };
}

export function planRoutes(flights, origin, destination, passengers, now) {
  requireThat(airports.some(airport => airport.code === origin)
    && airports.some(airport => airport.code === destination) && origin !== destination,
  400, 'INVALID_ROUTE', 'Choose two different supported airports.');
  const available = flights.filter(flight => flight.status !== 'departed'
    && Date.parse(flight.departure) > now && flight.availableSeats >= passengers);
  const routes = [];
  for (const first of available.filter(flight => flight.origin === origin)) {
    if (first.destination === destination) routes.push(itinerary([first]));
    else {
      for (const second of available.filter(flight =>
        flight.origin === first.destination && flight.destination === destination)) {
        const minutes = (Date.parse(second.departure) - Date.parse(first.arrival)) / 60000;
        if (minutes >= 35 && minutes <= 180) routes.push(itinerary([first, second]));
      }
    }
  }
  return routes.sort((a, b) => a.durationMinutes - b.durationMinutes
    || a.baseFareCents - b.baseFareCents || a.id.localeCompare(b.id));
}
