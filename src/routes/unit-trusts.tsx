import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { ChevronRight, ChevronDown, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/unit-trusts")({
  component: UnitTrustPortfolio,
});

interface SubAccount {
  name: string;
  value: string;
  earnings30d: string;
  dotColor: string;
}

interface Fund {
  name: string;
  description: string;
  value: string;
  earnings7d: string;
  earnings30d: string;
  earningsAll: string;
  returnPct: string;
  subAccounts: SubAccount[];
}

const funds: Fund[] = [
  {
    name: "Fixed Income Fund",
    description: "3 goals · Stable returns",
    value: "LKR 1,200,000",
    earnings7d: "+9,200",
    earnings30d: "+38,400",
    earningsAll: "+96,000",
    returnPct: "+3.2%",
    subAccounts: [
      { name: "Retirement", value: "LKR 700,000", earnings30d: "+4,200", dotColor: "oklch(0.6 0.2 260)" },
      { name: "Emergency", value: "LKR 350,000", earnings30d: "+1,800", dotColor: "oklch(0.55 0.25 290)" },
      { name: "General", value: "LKR 150,000", earnings30d: "+900", dotColor: "oklch(0.65 0.18 155)" },
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
      { name: "Growth", value: "LKR 550,000", earnings30d: "+32,100", dotColor: "oklch(0.6 0.2 260)" },
      { name: "General", value: "LKR 300,000", earnings30d: "+17,200", dotColor: "oklch(0.65 0.18 155)" },
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
      { name: "General", value: "LKR 400,000", earnings30d: "+8,400", dotColor: "oklch(0.65 0.18 155)" },
    ],
  },
];

function UnitTrustPortfolio() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(funds[0].name);

  const toggle = (name: string) => setExpanded(expanded === name ? null : name);

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      {/* Summary */}
      <div className="px-4 mt-2 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Balance</p>
        <p className="text-3xl font-bold tracking-tight text-foreground mt-1">LKR 2,450,000</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
          <span className="text-muted-foreground">7d <span className="font-medium text-success">+16,436</span></span>
          <span className="text-muted-foreground">30d <span className="font-medium text-success">+110,250</span></span>
          <span className="text-muted-foreground">All <span className="font-medium text-success">+219,949</span></span>
        </div>
      </div>

      {/* Invest / Redeem pills */}
      <div className="mx-4 mt-4 flex gap-2">
        <button
          onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-card/60 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-foreground">Invest</span>
        </button>
        <button
          onClick={() => navigate({ to: "/invest", search: { product: "unit-trust", action: "redeem" } })}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-card/60 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Redeem</span>
        </button>
      </div>

      {/* Fund Cards */}
      <div className="mx-4 mt-5 space-y-3">
        {funds.map((fund) => {
          const isOpen = expanded === fund.name;
          return (
            <div
              key={fund.name}
              className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md overflow-hidden"
            >
              {/* Fund row */}
              <button
                onClick={() => toggle(fund.name)}
                className="flex w-full items-center gap-3 p-4 transition hover:bg-muted/10"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{fund.name}</p>
                  <p className="text-xs text-muted-foreground">{fund.description}</p>
                </div>
                <div className="shrink-0 text-right mr-1">
                  <p className="text-sm font-bold text-foreground">{fund.value}</p>
                  {isOpen ? (
                    <div className="mt-0.5 flex items-center justify-end gap-1.5">
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[9px] font-medium text-success">7d {fund.earnings7d}</span>
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[9px] font-medium text-success">30d {fund.earnings30d}</span>
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[9px] font-medium text-success">All {fund.earningsAll}</span>
                    </div>
                  ) : (
                    <span className="mt-0.5 inline-block rounded-full bg-success/10 px-1.5 py-px text-[9px] font-medium text-success">All time {fund.earningsAll}</span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Sub-accounts */}
              {isOpen && (
                <div className="border-t border-border/20 px-4 pb-3 pt-2 space-y-1">
                  {fund.subAccounts.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center justify-between rounded-xl bg-background/30 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sub.dotColor }} />
                        <span className="text-xs font-medium text-foreground">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-foreground">{sub.value}</span>
                        <span className="text-[10px] font-medium text-success">{sub.earnings30d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new fund */}
      <div className="mx-4 mt-4 mb-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/40 bg-card/30 py-3 transition hover:bg-muted/10">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Add new fund</span>
        </button>
      </div>
    </MobileLayout>
  );
}
