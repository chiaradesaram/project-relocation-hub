import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { funds } from "@/data/unitTrusts";
import { ChevronRight, ChevronDown, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/unit-trusts/")({
  component: UnitTrustPortfolio,
});

function UnitTrustPortfolio() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (name: string) =>
    setExpanded(expanded === name ? null : name);

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      {/* Summary */}
      <div className="px-4 mt-3 text-center">
        <p className="type-label-sm text-muted-foreground">
          Total Balance
        </p>
        <p className="type-title-lg tracking-tight text-foreground mt-1">
          LKR 2,450,000
        </p>
        <div className="mt-2 flex items-center justify-center gap-5 type-caption">
          <span className="text-muted-foreground">
            7d{" "}
            <span className="font-semibold text-success">+16,436</span>
          </span>
          <span className="text-muted-foreground">
            30d{" "}
            <span className="font-semibold text-success">+110,250</span>
          </span>
          <span className="text-muted-foreground">
            All{" "}
            <span className="font-semibold text-success">+219,949</span>
          </span>
        </div>
      </div>

      {/* Invest / Redeem */}
      <div className="mx-4 mt-5 flex gap-2.5">
        <button
          onClick={() =>
            navigate({ to: "/invest", search: { product: "unit-trust" } })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-card py-3 transition hover:bg-form-card/60 active:bg-form-card/70"
        >
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span className="type-label text-foreground">Invest</span>
        </button>
        <button
          onClick={() =>
            navigate({
              to: "/redeem",
              search: { product: "unit-trust" },
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-card py-3 transition hover:bg-form-card/60 active:bg-form-card/70"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          <span className="type-label text-foreground">Redeem</span>
        </button>
      </div>

      {/* Fund Cards */}
      <div className="mx-4 mt-5 space-y-2.5">
        {funds.map((fund) => {
          const isOpen = expanded === fund.name;
          return (
            <div
              key={fund.name}
              className="rounded-2xl bg-card overflow-hidden"
            >
              {/* Fund row */}
              <button
                onClick={() => toggle(fund.name)}
                className="flex w-full items-center gap-3 p-4 transition active:bg-form-card/40"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="type-label text-foreground leading-tight">
                    {fund.name}
                  </p>
                  <p className="type-caption text-muted-foreground mt-0.5">
                    {fund.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="type-label text-foreground">
                    {fund.value}
                  </p>
                  {isOpen ? (
                    <div className="mt-1.5 flex items-center justify-end gap-1.5 flex-wrap">
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                        7d {fund.earnings7d}
                      </span>
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                        30d {fund.earnings30d}
                      </span>
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                        All {fund.earningsAll}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-1 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                      All {fund.earningsAll}
                    </span>
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
                <div className="px-3 pb-3 space-y-1">
                  {fund.subAccounts.map((sub) => {
                    const hasGoal = !!sub.goalTarget;
                    const progress = hasGoal
                      ? Math.min((sub.valueNum / sub.goalTarget!) * 100, 100)
                      : 0;

                    return (
                      <Link
                        key={sub.id}
                        to="/unit-trusts/$subAccountId"
                        params={{ subAccountId: sub.id }}
                        className="block rounded-xl bg-background/40 px-3.5 py-3 transition active:bg-form-card/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: sub.dotColor }}
                            />
                            <span className="type-label-sm text-foreground truncate">
                              {sub.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[13px] font-semibold text-foreground">
                              {sub.value}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Earnings + goal progress */}
                        <div className="mt-2 flex items-center justify-end gap-1.5">
                          {hasGoal && (
                            <span className="rounded-full bg-accent-magenta/20 px-2 py-0.5 text-[11px] font-semibold text-accent-magenta">
                              {Math.round(progress)}% of goal
                            </span>
                          )}
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                            All {sub.earningsAll}
                          </span>
                        </div>
                      </Link>
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
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card/60 py-3.5 transition active:bg-form-card/40">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="type-label-sm text-muted-foreground">
            Add new fund
          </span>
        </button>
      </div>
    </MobileLayout>
  );
}
