import { test } from "node:test";
import assert from "node:assert/strict";
import { scenarioTransfers, PRESENTATION_SCENARIOS } from "./presentationScenarios";

test("one, two and three transfer presentations reset independently", () => {
  for (const count of [1, 2, 3]) {
    const transfers = scenarioTransfers(count);
    assert.equal(transfers.length, count);
    assert.equal(transfers.filter((transfer) => transfer.fund).length, 0);
  }
  const first = scenarioTransfers(1);
  if (first[0]) first[0].fund = "CAL Growth Fund";
  assert.equal(scenarioTransfers(1)[0]?.fund, undefined);
});
test("partial and complete scenarios assign only the specified transfers", () => {
  assert.equal(scenarioTransfers(3, 1).filter((transfer) => !transfer.fund).length, 2);
  assert.equal(scenarioTransfers(3, 3).filter((transfer) => !transfer.fund).length, 0);
});
test("every presentation has a distinct identifier", () => {
  assert.equal(new Set(PRESENTATION_SCENARIOS.map((scenario) => scenario.id)).size, PRESENTATION_SCENARIOS.length);
});