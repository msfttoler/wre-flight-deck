import { integer, requireThat } from './errors.mjs';

export function roundBasisPoints(cents, basisPoints) {
  integer(cents, 0, 1000000000, 'amountCents');
  integer(basisPoints, 0, 10000, 'basisPoints');
  return Number((BigInt(cents) * BigInt(basisPoints) + 5000n) / 10000n);
}

export function priceItinerary(legs, passengers, bagsPerPassenger, coupon = '') {
  integer(passengers, 1, 6, 'passengers');
  integer(bagsPerPassenger, 0, 2, 'bagsPerPassenger');
  requireThat(coupon === '' || coupon === 'FIRSTFLIGHT', 400, 'INVALID_COUPON',
    'The supported coupon is FIRSTFLIGHT.');
  requireThat(Array.isArray(legs) && legs.length >= 1 && legs.length <= 2,
    400, 'INVALID_ITINERARY', 'Choose one or two flights.');
  legs.forEach(leg => integer(leg.baseFareCents, 0, 1000000, 'baseFareCents'));
  const farePerPassenger = legs.reduce((sum, leg) => sum + leg.baseFareCents, 0);
  const baseCents = farePerPassenger * passengers;
  const includedBags = farePerPassenger >= 25000 ? 1 : 0;
  const chargedBags = Math.max(0, bagsPerPassenger - includedBags) * passengers;
  const bagCents = chargedBags * 2500;
  const subtotalCents = baseCents + bagCents;
  const discountCents = coupon === 'FIRSTFLIGHT' ? roundBasisPoints(baseCents, 1000) : 0;
  const taxCents = roundBasisPoints(subtotalCents - discountCents, 750);
  return {
    lines: [
      { label: `Base fares (${passengers} passenger${passengers === 1 ? '' : 's'})`, amountCents: baseCents },
      { label: `Bags (${chargedBags} charged; ${includedBags} included per passenger)`, amountCents: bagCents },
    ],
    subtotalCents, discountCents, taxCents,
    totalCents: subtotalCents - discountCents + taxCents,
  };
}
