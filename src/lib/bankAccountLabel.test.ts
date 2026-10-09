import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { bankAccountLabel } from "./bankAccountLabel";

describe("selected investment bank accounts", () => {
  test("shows only the bank name and final three digits", () => {
    assert.equal(bankAccountLabel("Commercial Bank", "8001 2345 21"), "Commercial Bank · 521");
    assert.equal(bankAccountLabel("Deutsche Bank", "0078 4521 0036"), "Deutsche Bank · 036");
    assert.equal(bankAccountLabel("HNB", "7700 1234 567"), "HNB · 567");
  });
});