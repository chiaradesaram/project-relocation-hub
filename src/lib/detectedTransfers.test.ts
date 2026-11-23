import { test } from "node:test";
import assert from "node:assert/strict";
import { applyTransferFund, SAMPLE_TRANSFERS, TRANSFER_REFLECTION_WORKING_DAYS } from "./detectedTransfers";

test("each detected transfer receives its own fund without assigning the others", () => {
  const first = applyTransferFund(SAMPLE_TRANSFERS, "sample-1", "CAL Income Fund");
  assert.equal(first[0]?.fund, "CAL Income Fund");
  assert.equal(first[1]?.fund, undefined);
  assert.equal(first[2]?.fund, undefined);
  const second = applyTransferFund(first, "sample-2", "CAL Growth Fund");
  assert.equal(second[0]?.fund, "CAL Income Fund");
  assert.equal(second[1]?.fund, "CAL Growth Fund");
  assert.equal(second.filter((transfer) => !transfer.fund).length, 1);
});

test("a confirmed transfer cannot be assigned twice or to an unavailable fund", () => {
  const confirmed = applyTransferFund(SAMPLE_TRANSFERS, "sample-1", "CAL Income Fund");
  assert.equal(applyTransferFund(confirmed, "sample-1", "CAL Growth Fund")[0]?.fund, "CAL Income Fund");
  assert.equal(applyTransferFund(SAMPLE_TRANSFERS, "sample-2", "Unknown fund"), SAMPLE_TRANSFERS);
});

test("assigned transfers are reflected in one working day", () => {
  assert.equal(TRANSFER_REFLECTION_WORKING_DAYS, 1);
});