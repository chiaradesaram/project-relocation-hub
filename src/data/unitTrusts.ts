// Shared unit trust portfolio data
// Used by /unit-trusts portfolio view and /unit-trusts/$subAccountId detail view.

export interface ActivityEntry {
  type: "invest" | "redeem";
  amount: number;
  date: string; // ISO
  method?: string;
}

export interface SubAccount {
  id: string;
  fundName: string;
  name: string;
  value: string;
  valueNum: number;
  earnings7d: string;
  earnings7dNum: number;
  earnings30d: string;
  earnings30dNum: number;
  earningsAll: string;
  earningsAllNum: number;
  returnPct: string;
  dotColor: string;
  goalTarget?: number;
  goalLabel?: string;
  goalDeadline?: string; // ISO
  units?: number;
  navPerUnit?: number;
  createdAt: string; // ISO
  activity: ActivityEntry[];
}

export interface Fund {
  name: string;
  description: string;
  value: string;
  earnings7d: string;
  earnings30d: string;
  earningsAll: string;
  returnPct: string;
  subAccounts: SubAccount[];
}

export const funds: Fund[] = [
  {
    name: "Fixed Income Fund",
    description: "3 goals · Stable returns",
    value: "LKR 1,200,000",
    earnings7d: "+9,200",
    earnings30d: "+38,400",
    earningsAll: "+96,000",
    returnPct: "+3.2%",
    subAccounts: [
      {
        id: "fi-retirement",
        fundName: "Fixed Income Fund",
        name: "Retirement",
        value: "LKR 700,000",
        valueNum: 700000,
        earnings7d: "+1,050",
        earnings7dNum: 1050,
        earnings30d: "+4,200",
        earnings30dNum: 4200,
        earningsAll: "+56,000",
        earningsAllNum: 56000,
        returnPct: "+3.4%",
        dotColor: "oklch(0.6 0.2 260)",
        goalTarget: 2000000,
        createdAt: "2022-08-12",
        activity: [
          { type: "invest", amount: 50000, date: "2026-04-02", method: "Standing order" },
          { type: "redeem", amount: 25000, date: "2026-02-18", method: "Instant" },
          { type: "invest", amount: 100000, date: "2026-01-05", method: "Bank transfer" },
        ],
      },
      {
        id: "fi-emergency",
        fundName: "Fixed Income Fund",
        name: "Emergency",
        value: "LKR 350,000",
        valueNum: 350000,
        earnings7d: "+450",
        earnings7dNum: 450,
        earnings30d: "+1,800",
        earnings30dNum: 1800,
        earningsAll: "+22,400",
        earningsAllNum: 22400,
        returnPct: "+2.9%",
        dotColor: "oklch(0.55 0.25 290)",
        createdAt: "2023-03-04",
        activity: [
          { type: "invest", amount: 20000, date: "2026-03-30", method: "Standing order" },
          { type: "redeem", amount: 15000, date: "2025-11-12", method: "Standard" },
        ],
      },
      {
        id: "fi-general",
        fundName: "Fixed Income Fund",
        name: "General",
        value: "LKR 150,000",
        valueNum: 150000,
        earnings7d: "+220",
        earnings7dNum: 220,
        earnings30d: "+900",
        earnings30dNum: 900,
        earningsAll: "+17,600",
        earningsAllNum: 17600,
        returnPct: "+2.6%",
        dotColor: "oklch(0.65 0.18 155)",
        createdAt: "2023-06-21",
        activity: [
          { type: "invest", amount: 10000, date: "2026-04-09", method: "Bank transfer" },
        ],
      },
    ],
  },
  {
    name: "High Yield Fund",
    description: "2 goals · Higher risk",
    value: "LKR 850,000",
    earnings7d: "+12,400",
    earnings30d: "+49,300",
    earningsAll: "+112,500",
    returnPct: "+5.8%",
    subAccounts: [
      {
        id: "hy-growth",
        fundName: "High Yield Fund",
        name: "Growth",
        value: "LKR 550,000",
        valueNum: 550000,
        earnings7d: "+8,100",
        earnings7dNum: 8100,
        earnings30d: "+32,100",
        earnings30dNum: 32100,
        earningsAll: "+72,800",
        earningsAllNum: 72800,
        returnPct: "+6.1%",
        dotColor: "oklch(0.6 0.2 260)",
        goalTarget: 1000000,
        goalLabel: "First million",
        createdAt: "2023-01-15",
        activity: [
          { type: "invest", amount: 75000, date: "2026-04-10", method: "Bank transfer" },
          { type: "redeem", amount: 40000, date: "2026-03-22", method: "Instant" },
          { type: "invest", amount: 60000, date: "2026-02-14", method: "Standing order" },
        ],
      },
      {
        id: "hy-general",
        fundName: "High Yield Fund",
        name: "General",
        value: "LKR 300,000",
        valueNum: 300000,
        earnings7d: "+4,300",
        earnings7dNum: 4300,
        earnings30d: "+17,200",
        earnings30dNum: 17200,
        earningsAll: "+39,700",
        earningsAllNum: 39700,
        returnPct: "+5.4%",
        dotColor: "oklch(0.65 0.18 155)",
        createdAt: "2023-09-02",
        activity: [
          { type: "invest", amount: 30000, date: "2026-03-28", method: "Bank transfer" },
          { type: "redeem", amount: 12000, date: "2026-01-09", method: "Standard" },
        ],
      },
    ],
  },
  {
    name: "Islamic Fund",
    description: "1 goal · Sharia-compliant",
    value: "LKR 400,000",
    earnings7d: "+2,100",
    earnings30d: "+8,400",
    earningsAll: "+11,449",
    returnPct: "+2.1%",
    subAccounts: [
      {
        id: "is-general",
        fundName: "Islamic Fund",
        name: "General",
        value: "LKR 400,000",
        valueNum: 400000,
        earnings7d: "+2,100",
        earnings7dNum: 2100,
        earnings30d: "+8,400",
        earnings30dNum: 8400,
        earningsAll: "+11,449",
        earningsAllNum: 11449,
        returnPct: "+2.1%",
        dotColor: "oklch(0.65 0.18 155)",
        createdAt: "2024-02-19",
        activity: [
          { type: "invest", amount: 50000, date: "2026-04-12", method: "Bank transfer" },
          { type: "redeem", amount: 8000, date: "2026-02-01", method: "Standard" },
          { type: "invest", amount: 25000, date: "2025-12-20", method: "Bank transfer" },
        ],
      },
    ],
  },
];

export function findSubAccount(id: string): SubAccount | undefined {
  for (const fund of funds) {
    const sub = fund.subAccounts.find((s) => s.id === id);
    if (sub) return sub;
  }
  return undefined;
}
