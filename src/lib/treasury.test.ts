import { describe, expect, it } from "vitest";
import { TREASURY_MIN_INVESTMENT, TRANSFER_WINDOW_MINUTES, faceValue } from "./treasury";

describe("treasury rules", () => {
  it("minimum investment is LKR 500,000", () => {
    expect(TREASURY_MIN_INVESTMENT).toBe(500000);
  });
  it("transfer window is 30 minutes", () => {
    expect(TRANSFER_WINDOW_MINUTES).toBe(30);
  });
  it("face value of LKR 500,000 at 8% for 365 days is LKR 540,000", () => {
    expect(faceValue(500000, 8, 365)).toBe(540000);
  });
});
