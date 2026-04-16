import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Target,
  X,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/unit-trusts")({
  component: UnitTrustPortfolio,
});

interface SubAccount {
  id: string;
  name: string;
  value: string;
  valueNum: number;
  earnings30d: string;
  dotColor: string;
  goalTarget?: number;
  goalLabel?: string;
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

const initialFunds: Fund[] = [
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
        name: "Retirement",
        value: "LKR 700,000",
        valueNum: 700000,
        earnings30d: "+4,200",
        dotColor: "oklch(0.6 0.2 260)",
        goalTarget: 2000000,
        goalLabel: "Retire at 55",
      },
      {
        id: "fi-emergency",
        name: "Emergency",
        value: "LKR 350,000",
        valueNum: 350000,
        earnings30d: "+1,800",
        dotColor: "oklch(0.55 0.25 290)",
      },
      {
        id: "fi-general",
        name: "General",
        value: "LKR 150,000",
        valueNum: 150000,
        earnings30d: "+900",
        dotColor: "oklch(0.65 0.18 155)",
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
        name: "Growth",
        value: "LKR 550,000",
        valueNum: 550000,
        earnings30d: "+32,100",
        dotColor: "oklch(0.6 0.2 260)",
        goalTarget: 1000000,
        goalLabel: "First million",
      },
      {
        id: "hy-general",
        name: "General",
        value: "LKR 300,000",
        valueNum: 300000,
        earnings30d: "+17,200",
        dotColor: "oklch(0.65 0.18 155)",
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
        name: "General",
        value: "LKR 400,000",
        valueNum: 400000,
        earnings30d: "+8,400",
        dotColor: "oklch(0.65 0.18 155)",
      },
    ],
  },
];

type GoalStep = "pick-fund" | "name-goal" | "set-target" | "done";

function UnitTrustPortfolio() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(initialFunds[0].name);
  const [funds] = useState<Fund[]>(initialFunds);

  // Goal creation state
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [goalStep, setGoalStep] = useState<GoalStep>("pick-fund");
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const toggle = (name: string) =>
    setExpanded(expanded === name ? null : name);

  const openGoalSheet = () => {
    setGoalStep("pick-fund");
    setSelectedFund(null);
    setGoalName("");
    setGoalTarget("");
    setGoalSheetOpen(true);
  };

  const handlePickFund = (fundName: string) => {
    setSelectedFund(fundName);
    setGoalStep("name-goal");
  };

  const handleNameNext = () => {
    if (goalName.trim()) setGoalStep("set-target");
  };

  const handleCreateGoal = () => {
    setGoalStep("done");
    setTimeout(() => setGoalSheetOpen(false), 1200);
  };

  const formatLKR = (n: number) =>
    `LKR ${n.toLocaleString("en-LK")}`;

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      {/* Summary */}
      <div className="px-4 mt-2 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Total Balance
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground mt-1">
          LKR 2,450,000
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
          <span className="text-muted-foreground">
            7d{" "}
            <span className="font-medium text-success">+16,436</span>
          </span>
          <span className="text-muted-foreground">
            30d{" "}
            <span className="font-medium text-success">+110,250</span>
          </span>
          <span className="text-muted-foreground">
            All{" "}
            <span className="font-medium text-success">+219,949</span>
          </span>
        </div>
      </div>

      {/* Invest / Redeem / Goals pills */}
      <div className="mx-4 mt-4 flex gap-2">
        <button
          onClick={() =>
            navigate({ to: "/invest", search: { product: "unit-trust" } })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-card/60 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-foreground">Invest</span>
        </button>
        <button
          onClick={() =>
            navigate({
              to: "/invest",
              search: { product: "unit-trust", action: "redeem" },
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-card/60 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Redeem</span>
        </button>
        <button
          onClick={openGoalSheet}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border/30 bg-card/60 px-3.5 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Goal</span>
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
                className="flex w-full items-center gap-2 p-3.5 transition hover:bg-muted/10"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    {fund.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {fund.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-bold text-foreground">
                    {fund.value}
                  </p>
                  {isOpen ? (
                    <div className="mt-0.5 flex items-center justify-end gap-1 flex-wrap">
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[8px] font-medium text-success">
                        7d {fund.earnings7d}
                      </span>
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[8px] font-medium text-success">
                        30d {fund.earnings30d}
                      </span>
                      <span className="rounded-full bg-success/10 px-1.5 py-px text-[8px] font-medium text-success">
                        All {fund.earningsAll}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-0.5 inline-block rounded-full bg-success/10 px-1.5 py-px text-[8px] font-medium text-success">
                      All {fund.earningsAll}
                    </span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Sub-accounts with goal progress */}
              {isOpen && (
                <div className="border-t border-border/20 px-4 pb-3 pt-2 space-y-1.5">
                  {fund.subAccounts.map((sub) => {
                    const hasGoal = !!sub.goalTarget;
                    const progress = hasGoal
                      ? Math.min((sub.valueNum / sub.goalTarget!) * 100, 100)
                      : 0;

                    return (
                      <div
                        key={sub.id}
                        className="rounded-xl bg-background/30 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: sub.dotColor }}
                            />
                            <span className="text-xs font-medium text-foreground">
                              {sub.name}
                            </span>
                            {hasGoal && (
                              <span className="text-[9px] text-muted-foreground/70">
                                · {sub.goalLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-foreground">
                              {sub.value}
                            </span>
                            <span className="text-[10px] font-medium text-success">
                              {sub.earnings30d}
                            </span>
                          </div>
                        </div>

                        {/* Goal progress bar */}
                        {hasGoal && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-[3px] rounded-full bg-border/30 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              {Math.round(progress)}% of{" "}
                              {formatLKR(sub.goalTarget!)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
          <span className="text-xs font-medium text-muted-foreground">
            Add new fund
          </span>
        </button>
      </div>

      {/* Goal Creation Sheet */}
      <Sheet open={goalSheetOpen} onOpenChange={setGoalSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8">
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {goalStep === "pick-fund" && "Create a goal"}
                {goalStep === "name-goal" && "Name your goal"}
                {goalStep === "set-target" && "Set your target"}
                {goalStep === "done" && "Goal created!"}
              </SheetTitle>
              <button
                onClick={() => setGoalSheetOpen(false)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>

          <div className="px-5 mt-4">
            {/* Step 1: Pick a fund */}
            {goalStep === "pick-fund" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Which fund should this goal invest in?
                </p>
                {funds.map((fund) => (
                  <button
                    key={fund.name}
                    onClick={() => handlePickFund(fund.name)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-background/40 px-4 py-3 transition hover:bg-muted/10"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {fund.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {fund.returnPct} return · {fund.subAccounts.length} sub-accounts
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Name the goal */}
            {goalStep === "name-goal" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Into <span className="text-foreground font-medium">{selectedFund}</span>
                </p>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Goal name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New car, House deposit"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-border/30 bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition"
                  />
                </div>
                <button
                  onClick={handleNameNext}
                  disabled={!goalName.trim()}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Set target */}
            {goalStep === "set-target" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{goalName}</span>{" "}
                  · {selectedFund}
                </p>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Target amount (LKR)
                  </label>
                  <input
                    type="number"
                    placeholder="1,000,000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-border/30 bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition"
                  />
                </div>
                <div className="flex gap-2">
                  {[500000, 1000000, 2500000, 5000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGoalTarget(String(preset))}
                      className="flex-1 rounded-lg border border-border/30 bg-background/30 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:bg-muted/10 hover:text-foreground"
                    >
                      {(preset / 1000000).toFixed(preset < 1000000 ? 1 : 0)}M
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreateGoal}
                  disabled={!goalTarget || Number(goalTarget) <= 0}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create goal
                </button>
              </div>
            )}

            {/* Step 4: Done */}
            {goalStep === "done" && (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="rounded-full bg-success/15 p-3">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {goalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: LKR {Number(goalTarget).toLocaleString("en-LK")} · {selectedFund}
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
