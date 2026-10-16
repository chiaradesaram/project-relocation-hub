export type WidgetId = "portfolio" | "quickLinks" | "aspi" | "watchlist" | "movers" | "utFunds" | "rates";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  portfolio: "Portfolio",
  quickLinks: "Quick links",
  aspi: "Market overview (ASPI)",
  watchlist: "Watchlist",
  movers: "Top movers",
  utFunds: "Unit Trust funds",
  rates: "Rates to watch",
};

export type QuickLinkId = "invest" | "redeem" | "vstock" | "watchlist" | "rates" | "transactions" | "requests" | "help";

export const QUICK_LINK_LABELS: Record<QuickLinkId, string> = {
  invest: "Invest",
  redeem: "Redeem",
  vstock: "VStock",
  watchlist: "Watchlist",
  rates: "Rates",
  transactions: "Transactions",
  requests: "Requests",
  help: "Help",
};

export type DashboardPrefs = {
  widgetOrder: WidgetId[];
  hiddenWidgets: WidgetId[];
  quickLinkOrder: QuickLinkId[];
  hiddenQuickLinks: QuickLinkId[];
  rateOrder: string[];
  hiddenRates: string[];
};

export const DEFAULT_PREFS: DashboardPrefs = {
  widgetOrder: ["portfolio", "quickLinks", "aspi", "watchlist", "movers", "utFunds", "rates"],
  hiddenWidgets: [],
  quickLinkOrder: ["invest", "redeem", "vstock", "watchlist", "rates", "transactions", "requests", "help"],
  hiddenQuickLinks: ["rates", "transactions", "requests", "help"],
  rateOrder: ["fio", "income", "growth", "balanced", "mm", "tbill", "usd"],
  hiddenRates: [],
};

const KEY = "cal-dashboard-prefs";

export function loadDashboardPrefs(): DashboardPrefs {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<DashboardPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveDashboardPrefs(prefs: DashboardPrefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable; keep session-only prefs
  }
}

export function moveItem<T>(arr: T[], id: T, dir: -1 | 1): T[] {
  const i = arr.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function toggleItem<T>(arr: T[], id: T): T[] {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}
