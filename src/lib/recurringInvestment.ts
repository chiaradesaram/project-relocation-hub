export const RECURRING_INVESTMENT_KEY = "recurringInvestmentPlan";
export const RECURRING_INVESTMENT_SAVED_KEY = "recurringInvestmentSaved";

export type RecurringInvestmentPlan = {
  amount: string;
  fund: string;
  account: string;
  bank: string;
  startDate: string;
  frequency: string;
  active: boolean;
};

export function readRecurringInvestment(): RecurringInvestmentPlan | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(RECURRING_INVESTMENT_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<RecurringInvestmentPlan>;
    if (
      typeof parsed.amount !== "string" ||
      typeof parsed.fund !== "string" ||
      typeof parsed.account !== "string" ||
      typeof parsed.bank !== "string" ||
      typeof parsed.startDate !== "string" ||
      typeof parsed.frequency !== "string"
    ) {
      return null;
    }

    return {
      amount: parsed.amount,
      fund: parsed.fund,
      account: parsed.account,
      bank: parsed.bank,
      startDate: parsed.startDate,
      frequency: parsed.frequency,
      active: parsed.active !== false,
    };
  } catch {
    return null;
  }
}