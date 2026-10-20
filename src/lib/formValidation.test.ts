import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getFormIssues } from "./formValidation";

describe("enabled review validation", () => {
  test("identifies every unfilled field when review is requested", () => {
    assert.deepEqual(getFormIssues([
      { field: "Amount", message: "Enter an amount", valid: false },
      { field: "Fund", message: "Choose a fund", valid: false },
      { field: "Bank account", message: "Choose a bank account", valid: true },
    ]), [{ field: "Amount", message: "Enter an amount" }, { field: "Fund", message: "Choose a fund" }]);
  });
  test("clears guidance once all required fields are complete", () => {
    assert.deepEqual(getFormIssues([{ field: "Amount", message: "Enter an amount", valid: true }]), []);
  });
  test("keeps invalid amounts and missing authorisation from proceeding", () => {
    assert.deepEqual(getFormIssues([
      { field: "Amount", message: "Choose an amount within your balance", valid: false },
      { field: "Authorisation", message: "Confirm your authorisation", valid: false },
    ]).map((issue) => issue.field), ["Amount", "Authorisation"]);
  });
});