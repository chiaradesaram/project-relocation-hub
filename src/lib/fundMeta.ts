// Shared fund metadata for tags shown in fund pickers.
// Popular funds: Income, High Yield and Fixed Income funds.
// Default fund: the fund the user has set as their default.

export function isPopularFund(name: string): boolean {
  return /income fund|high yield|fixed income/i.test(name);
}

// The user's chosen default fund per product area.
export const DEFAULT_UNIT_TRUST_FUND = "Fixed Income Fund";
export const DEFAULT_INVEST_FUND = "CAL Income Fund";
