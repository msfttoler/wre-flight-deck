# Flight Deck API contract

The application runs as one Node.js process with independently testable domain
modules. All amounts are integer USD cents. The schedule and aircraft are
fictional product data, not live aviation information. This is not a system for
operating an aircraft or handling real bookings.

## Read endpoints

- `GET /api/health`: `{status:"ok", service:"wre-flight-deck"}`.
- `GET /api/network`: `{airports, flights, scenarioDate, currency, disclaimer}`.
  Airports: `{code,name,city,lat,lon}`.
  Flights: `{id,number,origin,destination,departure,arrival,aircraft,capacity,
  baseFareCents,availableSeats,status,gate,version}`. Times are ISO UTC.
- `GET /api/itineraries?origin=SEA&destination=DEN&passengers=1`:
  `{itineraries}`. Each: `{id,flightIds,origin,destination,departure,arrival,
  durationMinutes,stops,availableSeats,baseFareCents,distanceKm}`.
  Support direct and one-connection routes, with 35-180 minute connections.
- `GET /api/bookings`: `{bookings}`. No personal passenger data.
- `GET /api/events`: `{events}`, newest first, bounded.
  Event: `{id,type,entityId,at,detail,requestId}`.

## Write endpoints

JSON request bodies, at most 16 KiB. Errors use HTTP status and
`{error:{code,message},requestId}`. Every response includes `X-Request-Id`.

- `POST /api/quotes`: `{flightIds,passengers,bagsPerPassenger,coupon}`.
  Returns `{quote}` with `{id,expiresAt,flightIds,passengers,bagsPerPassenger,
  coupon,currency,lines,subtotalCents,discountCents,taxCents,totalCents,
  availableSeats}`. Each line: `{label,amountCents}`.
  Optional coupon `FIRSTFLIGHT` takes 10% off base fares, not bags.
  One bag costs 2500 cents per passenger per itinerary.
  Base fare per passenger of at least 25000 cents includes the first bag.
  A fictional 750-basis-point service tax applies after discount, half up,
  once on the total taxable amount. Do not represent this as legal tax advice.
  Passengers 1-6; bags per passenger 0-2. Quotes expire after 15 minutes.
- `POST /api/bookings`: `{quoteId,callsign}` and an `Idempotency-Key` header
  (8-80 letters/digits/hyphens). Returns `{booking}`, 201 first time, 200
  for an identical retry. Callsign is a 2-24 character fictional team label.
  Booking: `{id,reference,callsign,status,quote,createdAt,version,flightIds,
  passengers}`. Check all legs atomically before allocating any seats.
  A quote is single-use except for an identical idempotent retry.
- `POST /api/bookings/:id/cancel`: `{version}` -> `{booking}`.
  Reject stale versions and cancellation after any leg has departed.
- `PATCH /api/flights/:id`: `{version,status,gate}` -> `{flight}`.
  Legal transitions: scheduled -> delayed/boarding; delayed -> scheduled/boarding;
  boarding -> departed. Gate changes can retain status.
  Boarding/departed require a gate matching A01-Z99.
  No transition out of departed. Reject stale versions.

## Runtime and boundaries

`npm start` starts on `127.0.0.1:3000`. `PORT` and `DATA_DIR` are optional.
Application state is in ignored `.data/`, persisted by atomic replacement.
Tests use isolated temporary directories and the native `node --test` runner.
The application has no runtime packages and does not call external services.
Reject cross-origin browser writes, don't enable CORS, and don't serve state
files. Local-only, single-process development scope: no authentication or
multi-instance database guarantees. Do not expose it on a public interface.

The browser uses these endpoints, never separate hardcoded business logic.
Never describe local application events as GitHub webhook or hosted CI evidence.
