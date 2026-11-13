import test from 'node:test';
import assert from 'node:assert/strict';
import { priceItinerary, roundBasisPoints } from '../src/pricing.mjs';

test('pricing charges one bag per itinerary, not once per leg', () => {
  const price = priceItinerary([{ baseFareCents: 12000 }, { baseFareCents: 12000 }], 2, 1);
  assert.equal(price.subtotalCents, 53000);
  assert.equal(price.taxCents, 3975);
  assert.equal(price.totalCents, 56975);
});

test('FIRSTFLIGHT discounts fares only and tax applies once after discount', () => {
  const price = priceItinerary([{ baseFareCents: 12005 }], 3, 2, 'FIRSTFLIGHT');
  assert.equal(price.lines[0].amountCents, 36015);
  assert.equal(price.lines[1].amountCents, 15000);
  assert.equal(price.subtotalCents, 51015);
  assert.equal(price.discountCents, 3602);
  assert.equal(price.taxCents, 3556);
  assert.equal(price.totalCents, 50969);
});

test('tax half-up rounding and discount half-up rounding use integer arithmetic', () => {
  assert.equal(roundBasisPoints(20, 750), 2);
  assert.equal(roundBasisPoints(19, 750), 1);
  assert.equal(roundBasisPoints(21, 750), 2);
  assert.equal(roundBasisPoints(5, 1000), 1);
  assert.equal(roundBasisPoints(0, 750), 0);
  assert.equal(roundBasisPoints(1000000000, 10000), 1000000000);
});

for (const [fare, bags, charged] of [
  [24999, 0, 0], [24999, 1, 2500], [24999, 2, 5000],
  [25000, 0, 0], [25000, 1, 0], [25000, 2, 2500], [25001, 1, 0],
]) {
  test(`bag threshold: ${fare} cents, ${bags} bags charges ${charged} per passenger`, () => {
    const price = priceItinerary([{ baseFareCents: fare }], 2, bags);
    assert.equal(price.lines[1].amountCents, charged * 2);
    assert.equal(price.totalCents, price.subtotalCents - price.discountCents + price.taxCents);
  });
}

test('combined itinerary fare determines included bag before coupon or passenger multiplier', () => {
  assert.equal(priceItinerary([{ baseFareCents: 12000 }, { baseFareCents: 13000 }],
    1, 1, 'FIRSTFLIGHT').lines[1].amountCents, 0);
  assert.equal(priceItinerary([{ baseFareCents: 12000 }], 3, 1).lines[1].amountCents, 7500);
});

for (const passengers of [0, -1, 7, 1.5, '2', null, NaN, Infinity]) {
  test(`reject invalid passenger count ${String(passengers)}`, () => {
    assert.throws(() => priceItinerary([{ baseFareCents: 12000 }], passengers, 0), { status: 400 });
  });
}

for (const bags of [-1, 3, 0.5, '1', null, Infinity]) {
  test(`reject invalid bag count ${String(bags)}`, () => {
    assert.throws(() => priceItinerary([{ baseFareCents: 12000 }], 1, bags), { status: 400 });
  });
}

for (const fare of [-1, 1.5, NaN, Infinity, '12000', Number.MAX_SAFE_INTEGER]) {
  test(`reject unsafe fare ${String(fare)}`, () => {
    assert.throws(() => priceItinerary([{ baseFareCents: fare }], 1, 0), { status: 400 });
  });
}

test('reject unsupported coupons rather than silently ignoring them', () => {
  for (const coupon of ['firstflight', 'FREE', null, 10, {}, []]) {
    assert.throws(() => priceItinerary([{ baseFareCents: 12000 }], 1, 0, coupon), { status: 400 });
  }
});

test('money helper rejects invalid inputs', () => {
  for (const [amount, rate] of [[-1, 750], [Infinity, 750], [1.1, 750], [100, 750.1], [100, 10001]]) {
    assert.throws(() => roundBasisPoints(amount, rate), { status: 400 });
  }
});
