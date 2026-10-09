import { describe, expect, test } from "bun:test";
import { bankAccountLabel } from "./bankAccountLabel";

describe("selected investment bank accounts", () => {
  test("shows only the bank name and final three digits", () => {
    expect(bankAccountLabel("Commercial Bank", "8001 2345 21")).toBe("Commercial Bank · 521");
    expect(bankAccountLabel("Deutsche Bank", "0078 4521 0036")).toBe("Deutsche Bank · 036");
    expect(bankAccountLabel("HNB", "7700 1234 567")).toBe("HNB · 567");
  });
});