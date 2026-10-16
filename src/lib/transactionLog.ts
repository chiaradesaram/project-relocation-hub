export type LogItem = {
  label: string;
  amount: number;
  date: string;
  kind: "in" | "out" | "flip" | "recurring" | "dividend";
};

export const logItems: LogItem[] = [
  { label: "Investment", amount: 125000, date: "13 Apr 2026", kind: "in" },
  { label: "Recurring Investment", amount: 25000, date: "12 Apr 2026", kind: "recurring" },
  { label: "Fund Flip", amount: 40000, date: "12 Apr 2026", kind: "flip" },
  { label: "Investment", amount: 105000, date: "12 Apr 2026", kind: "in" },
  { label: "Redemption", amount: -75000, date: "8 Apr 2026", kind: "out" },
  { label: "Dividend", amount: 3200, date: "5 Apr 2026", kind: "dividend" },
  { label: "Redemption", amount: -30000, date: "2 Apr 2026", kind: "out" },
  { label: "Recurring Investment", amount: 25000, date: "12 Mar 2026", kind: "recurring" },
];

/** Most recent entries, newest first — shared by the Transactions log tab and the dashboard widget. */
export const latestLogItems = logItems.slice(0, 3);
