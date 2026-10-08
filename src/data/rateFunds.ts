export type Risk = "Low" | "Medium" | "High";

export type Fund = {
  name: string;
  slug: string;
  category: "Fixed income" | "Equity" | "Balanced";
  icon: number;
  rate: string;
  yield30d: string;
  unitPrice: string;
  priceAsOf: string;
  fundSize: string;
  needsSignup: boolean;
  description: string;
  factsheet: string;
  risk: Risk;
  composition: { label: string; pct: number; color: string }[];
};

export const fundsData: Fund[] = [
  {
    name: "CAL Growth Fund", slug: "growth", category: "Equity", icon: 0, rate: "28.54", yield30d: "12.5%", unitPrice: "28.54", priceAsOf: "Apr 14, 2026", fundSize: "LKR 2.1B", needsSignup: false,
    description: "Aims for long-term capital appreciation by investing primarily in equities listed on the CSE.", factsheet: "#",
    risk: "High",
    composition: [
      { label: "Equities", pct: 75, color: "var(--portfolio-purple)" },
      { label: "Bonds", pct: 15, color: "var(--portfolio-blue)" },
      { label: "T-Bills", pct: 10, color: "var(--success)" },
    ],
  },
  {
    name: "CAL Income Fund", slug: "income", category: "Fixed income", icon: 1, rate: "15.21", yield30d: "6.8%", unitPrice: "15.21", priceAsOf: "Apr 14, 2026", fundSize: "LKR 1.5B", needsSignup: false,
    description: "Focuses on generating regular income through investments in fixed income securities.", factsheet: "#",
    risk: "Low",
    composition: [
      { label: "T-Bills", pct: 55, color: "var(--success)" },
      { label: "Bonds", pct: 40, color: "var(--portfolio-blue)" },
      { label: "Cash", pct: 5, color: "var(--portfolio-purple)" },
    ],
  },
  {
    name: "CAL Balanced Fund", slug: "balanced", category: "Balanced", icon: 2, rate: "20.15", yield30d: "9.2%", unitPrice: "20.15", priceAsOf: "Apr 14, 2026", fundSize: "LKR 800M", needsSignup: false,
    description: "A diversified fund that balances equity and fixed income investments.", factsheet: "#",
    risk: "Medium",
    composition: [
      { label: "Equities", pct: 45, color: "var(--portfolio-purple)" },
      { label: "Bonds", pct: 35, color: "var(--portfolio-blue)" },
      { label: "T-Bills", pct: 20, color: "var(--success)" },
    ],
  },
  {
    name: "CAL Money Market Fund", slug: "money-market", category: "Fixed income", icon: 3, rate: "10.05", yield30d: "3.1%", unitPrice: "10.05", priceAsOf: "Apr 14, 2026", fundSize: "LKR 3.2B", needsSignup: false,
    description: "Invests in short-term, high-quality money market instruments.", factsheet: "#",
    risk: "Low",
    composition: [
      { label: "T-Bills", pct: 70, color: "var(--success)" },
      { label: "Cash", pct: 25, color: "var(--portfolio-purple)" },
      { label: "Repos", pct: 5, color: "var(--portfolio-blue)" },
    ],
  },
  {
    name: "CAL Equity Fund", slug: "equity", category: "Equity", icon: 4, rate: "32.80", yield30d: "15.2%", unitPrice: "32.80", priceAsOf: "Apr 14, 2026", fundSize: "LKR 950M", needsSignup: true,
    description: "Invests in a concentrated portfolio of high-conviction equity picks on the CSE.", factsheet: "#",
    risk: "High",
    composition: [
      { label: "Equities", pct: 90, color: "var(--portfolio-purple)" },
      { label: "Cash", pct: 10, color: "var(--portfolio-blue)" },
    ],
  },
  {
    name: "CAL Fixed Income Fund", slug: "fixed-income", category: "Fixed income", icon: 5, rate: "12.34", yield30d: "5.5%", unitPrice: "12.34", priceAsOf: "Apr 14, 2026", fundSize: "LKR 1.8B", needsSignup: true,
    description: "Targets stable returns from a diversified portfolio of fixed income securities.", factsheet: "#",
    risk: "Low",
    composition: [
      { label: "Bonds", pct: 60, color: "var(--portfolio-blue)" },
      { label: "T-Bills", pct: 35, color: "var(--success)" },
      { label: "Cash", pct: 5, color: "var(--portfolio-purple)" },
    ],
  },
];

