export const TREASURY_MIN_INVESTMENT = 500000;
export const TRANSFER_WINDOW_MINUTES = 30;
export const TREASURY_JUSTPAY_MIN = 40000;
export const TREASURY_JUSTPAY_MAX = 74940;

export function validTreasuryJustpayAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= TREASURY_JUSTPAY_MIN && amount <= TREASURY_JUSTPAY_MAX;
}

export type TreasurySecurity = {
  isin: string;
  kind: "bills" | "bonds";
  maturityDate: string; // ISO yyyy-mm-dd
  rate: number; // annual yield %, e.g. 8.45
  couponRate?: number; // bonds only, annual %, paid semi-annually
  days: number; // maturity period in days
};

// Illustrative sample securities — not live market offers.
export const treasurySecurities: TreasurySecurity[] = [
  { isin: "LKB09126A034", kind: "bills", maturityDate: "2027-01-22", rate: 7.85, days: 91 },
  { isin: "LKB09126B012", kind: "bills", maturityDate: "2027-01-29", rate: 7.88, days: 98 },
  { isin: "LKB12627C118", kind: "bills", maturityDate: "2027-02-26", rate: 7.95, days: 126 },
  { isin: "LKB18227D235", kind: "bills", maturityDate: "2027-04-23", rate: 8.1, days: 182 },
  { isin: "LKB18227E019", kind: "bills", maturityDate: "2027-05-07", rate: 8.14, days: 196 },
  { isin: "LKB27327G144", kind: "bills", maturityDate: "2027-07-23", rate: 8.28, days: 273 },
  { isin: "LKB36427J221", kind: "bills", maturityDate: "2027-10-22", rate: 8.45, days: 364 },
  { isin: "LKG00228L159", kind: "bonds", maturityDate: "2028-10-15", rate: 9.25, couponRate: 9.0, days: 723 },
  { isin: "LKG00329A011", kind: "bonds", maturityDate: "2029-01-01", rate: 9.5, couponRate: 10.75, days: 801 },
  { isin: "LKG00430F157", kind: "bonds", maturityDate: "2030-06-15", rate: 9.8, couponRate: 9.25, days: 1331 },
  { isin: "LKG00531H017", kind: "bonds", maturityDate: "2031-08-01", rate: 10.1, couponRate: 11.0, days: 1743 },
  { isin: "LKG00833C015", kind: "bonds", maturityDate: "2033-03-15", rate: 10.4, couponRate: 10.0, days: 2335 },
  { isin: "LKG01036E157", kind: "bonds", maturityDate: "2036-05-15", rate: 10.75, couponRate: 11.5, days: 3491 },
];

const halfYearsLeft = (days: number) => Math.max(1, Math.ceil(days / 182.5));

/** Bond price per 100 face, discounting semi-annual coupons at the yield. */
export function bondPrice(rate: number, couponRate: number, days: number): number {
  const n = halfYearsLeft(days);
  const y = rate / 200;
  const c = couponRate / 2;
  let p = 100 / (1 + y) ** n;
  for (let k = 1; k <= n; k++) p += c / (1 + y) ** k;
  return p;
}

/** Face value received at maturity for a given investment. */
export function faceValue(amount: number, rate: number, days: number, couponRate?: number): number {
  if (couponRate !== undefined) return Math.round((amount / bondPrice(rate, couponRate, days)) * 100);
  return Math.round(amount * (1 + (rate / 100) * (days / 365)));
}

/** Semi-annual coupon schedule, counted back from maturity. */
export function couponSchedule(
  face: number,
  couponRate: number,
  maturityDate: string,
  days: number,
): { date: Date; amount: number }[] {
  const n = halfYearsLeft(days);
  const each = Math.round((face * couponRate) / 200);
  const end = new Date(`${maturityDate}T00:00:00`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end);
    d.setMonth(d.getMonth() - 6 * (n - 1 - i));
    return { date: d, amount: each };
  });
}
