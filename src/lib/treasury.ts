export const TREASURY_MIN_INVESTMENT = 500000;
export const TRANSFER_WINDOW_MINUTES = 30;

export type TreasurySecurity = {
  isin: string;
  kind: "bills" | "bonds";
  maturityDate: string; // ISO yyyy-mm-dd
  rate: number; // annual %, e.g. 8.45
  days: number; // maturity period in days
};

// Illustrative sample securities — not live market offers.
export const treasurySecurities: TreasurySecurity[] = [
  { isin: "LKB09126A034", kind: "bills", maturityDate: "2027-01-22", rate: 7.85, days: 91 },
  { isin: "LKB18227D235", kind: "bills", maturityDate: "2027-04-23", rate: 8.1, days: 182 },
  { isin: "LKB36427J221", kind: "bills", maturityDate: "2027-10-22", rate: 8.45, days: 364 },
  { isin: "LKG00228L159", kind: "bonds", maturityDate: "2028-10-15", rate: 9.25, days: 723 },
  { isin: "LKG00531H017", kind: "bonds", maturityDate: "2031-08-01", rate: 10.1, days: 1743 },
  { isin: "LKG01036E157", kind: "bonds", maturityDate: "2036-05-15", rate: 10.75, days: 3491 },
];

/** Face value received at maturity for a given investment (simple-yield basis). */
export function faceValue(amount: number, rate: number, days: number): number {
  return Math.round(amount * (1 + (rate / 100) * (days / 365)));
}
