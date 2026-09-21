// Shared fund metadata for tags shown in fund pickers.
// Popular funds: Income, High Yield and Fixed Income funds.

export function isPopularFund(name: string): boolean {
  return /income fund|high yield|fixed income/i.test(name);
}

// Placeholder annual rates shown in the "View rates" sheet — swap for real figures.
export const FUND_RATES: Record<string, string> = {
  "CAL Growth Fund": "18.2% p.a.",
  "CAL Income Fund": "9.6% p.a.",
  "CAL Balanced Fund": "12.1% p.a.",
  "CAL Money Market Fund": "7.8% p.a.",
};
