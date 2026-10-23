import { test } from "node:test";
import assert from "node:assert/strict";
import { TREASURY_MIN_INVESTMENT, TRANSFER_WINDOW_MINUTES, faceValue } from "./treasury";

test("minimum investment is LKR 500,000", () => {
  assert.equal(TREASURY_MIN_INVESTMENT, 500000);
});
test("transfer window is 30 minutes", () => {
  assert.equal(TRANSFER_WINDOW_MINUTES, 30);
});
test("face value of LKR 500,000 at 8% for 365 days is LKR 540,000", () => {
  assert.equal(faceValue(500000, 8, 365), 540000);
});
