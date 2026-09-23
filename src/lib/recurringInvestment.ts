export const RECURRING_INVESTMENT_PLANS_KEY = "recurringInvestmentPlans";
export const RECURRING_INVESTMENT_KEY = "recurringInvestmentPlan"; // legacy single-plan key
export const RECURRING_INVESTMENT_SAVED_KEY = "recurringInvestmentSaved";

export type RecurringInvestmentPlan = {
  id: string;
  amount: string;
  fund: string;
  account: string;
  bank: string;
  startDate: string;
  frequency: string;
  active: boolean;
};

export function newRecurringInvestmentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function coercePlan(parsed: Partial<RecurringInvestmentPlan>): RecurringInvestmentPlan | null {
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
    id: typeof parsed.id === "string" && parsed.id ? parsed.id : newRecurringInvestmentId(),
    amount: parsed.amount,
    fund: parsed.fund,
    account: parsed.account,
    bank: parsed.bank,
    startDate: parsed.startDate,
    frequency: parsed.frequency,
    active: parsed.active !== false,
  };
}

export function readRecurringInvestments(): RecurringInvestmentPlan[] {
  if (typeof window === "undefined") return [];

  const listRaw = window.localStorage.getItem(RECURRING_INVESTMENT_PLANS_KEY);
  if (listRaw) {
    try {
      const parsed = JSON.parse(listRaw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((p) => coercePlan(p as Partial<RecurringInvestmentPlan>))
          .filter((p): p is RecurringInvestmentPlan => p !== null);
      }
    } catch {
      // fall through to legacy key
    }
  }

  // Migrate the legacy single-plan key on read
  const legacy = window.localStorage.getItem(RECURRING_INVESTMENT_KEY);
  if (!legacy) return [];

  try {
    const plan = coercePlan(JSON.parse(legacy) as Partial<RecurringInvestmentPlan>);
    return plan ? [plan] : [];
  } catch {
    return [];
  }
}

export function writeRecurringInvestments(plans: RecurringInvestmentPlan[]) {
  window.localStorage.setItem(RECURRING_INVESTMENT_PLANS_KEY, JSON.stringify(plans));
  if (window.localStorage.getItem(RECURRING_INVESTMENT_KEY)) {
    window.localStorage.removeItem(RECURRING_INVESTMENT_KEY);
  }
}

export function readRecurringInvestment(): RecurringInvestmentPlan | null {
  return readRecurringInvestments()[0] ?? null;
}
