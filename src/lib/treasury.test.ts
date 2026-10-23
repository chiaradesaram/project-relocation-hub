import { test } from "node:test";
import assert from "node:assert/strict";
import { TREASURY_MIN_INVESTMENT, TRANSFER_WINDOW_MINUTES, TREASURY_JUSTPAY_MIN, TREASURY_JUSTPAY_MAX, validTreasuryJustpayAmount, faceValue, bondPrice, couponSchedule } from "./treasury";

test("treasury Justpay minimum is LKR 40,000, inclusive", () => {
  assert.equal(TREASURY_JUSTPAY_MIN, 40000);
  assert.equal(validTreasuryJustpayAmount(39999.99), false);
  assert.equal(validTreasuryJustpayAmount(40000), true);
});
test("treasury Justpay maximum is LKR 74,940, inclusive", () => {
  assert.equal(TREASURY_JUSTPAY_MAX, 74940);
  assert.equal(validTreasuryJustpayAmount(74940), true);
  assert.equal(validTreasuryJustpayAmount(74940.01), false);
  assert.equal(validTreasuryJustpayAmount(Infinity), false);
});

test("minimum investment is LKR 500,000", () => {
  assert.equal(TREASURY_MIN_INVESTMENT, 500000);
});
test("transfer window is 30 minutes", () => {
  assert.equal(TRANSFER_WINDOW_MINUTES, 30);
});
test("face value of LKR 500,000 at 8% for 365 days is LKR 540,000", () => {
  assert.equal(faceValue(500000, 8, 365), 540000);
});
test("bond priced at par when yield equals coupon", () => {
  assert.equal(Math.round(bondPrice(10, 10, 730) * 100) / 100, 100);
});
test("coupon payments are semi-annual: LKR 1,000,000 at 10% pays LKR 50,000 each", () => {
  const s = couponSchedule(1000000, 10, "2028-10-15", 730);
  assert.equal(s.length, 4);
  assert.equal(s[0].amount, 50000);
});
