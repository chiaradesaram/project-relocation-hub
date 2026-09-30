import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { funds, type Fund } from "@/data/unitTrusts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Plus, X } from "lucide-react";

export const Route = createFileRoute("/unit-trusts/")({
  component: UnitTrustPortfolio,
});

function UnitTrustPortfolio() {
  const navigate = useNavigate();
  const [openFund, setOpenFund] = useState<UnitTrustFund | null>(null);

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      {/* Summary */}
      <div className="px-4 mt-3 text-center">
        <p className="text-[12px] text-muted-foreground">Total Balance</p>
        <p className="mt-1 text-[26px] font-bold tracking-tight text-foreground">
          LKR 2,450,000
        </p>
        <div className="mt-2 flex items-center justify-center gap-5 text-[12px]">
          <span className="text-muted-foreground">
            7d <span className="font-semibold text-success">+16,436</span>
          </span>
          <span className="text-muted-foreground">
            30d <span className="font-semibold text-success">+110,250</span>
          </span>
          <span className="text-muted-foreground">
            All <span className="font-semibold text-success">+219,949</span>
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
          <span className="text-[14px] font-semibold text-foreground">Invest</span>
        </button>
        <button
          onClick={() =>
            navigate({ to: "/redeem", search: { product: "unit-trust" } })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-card py-3 transition hover:bg-form-card/60 active:bg-form-card/70"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-[14px] font-semibold text-foreground">Redeem</span>
        </button>
      </div>

      {/* Fund Cards */}
      <div className="mx-4 mt-5 space-y-2.5">
        {funds.map((fund) => (
          <button
            key={fund.name}
            onClick={() => setOpenFund(fund)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left transition active:bg-form-card/40"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-tight text-foreground">
                {fund.name}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {fund.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[14px] font-semibold text-foreground">
                {fund.value}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-success">
                All {fund.earningsAll}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Add new fund */}
      <div className="mx-4 mt-4 mb-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card/60 py-3.5 transition active:bg-form-card/40">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-muted-foreground">
            Add new fund
          </span>
        </button>
      </div>

      {/* Fund detail sheet */}
      <Sheet open={!!openFund} onOpenChange={(o) => !o && setOpenFund(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-card px-4 pb-8">
          {openFund && (
            <>
              <div className="flex items-center justify-between pt-1">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {openFund.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {openFund.description}
                  </p>
                </div>
                <button
                  onClick={() => setOpenFund(null)}
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-[22px] font-bold tracking-tight text-foreground">
                  {openFund.value}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                    7d {openFund.earnings7d}
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                    30d {openFund.earnings30d}
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                    All {openFund.earningsAll}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {openFund.subAccounts.map((sub) => (
                  <Link
                    key={sub.id}
                    to="/unit-trusts/$subAccountId"
                    params={{ subAccountId: sub.id }}
                    className="flex items-center justify-between gap-2 rounded-xl bg-background/40 px-3.5 py-3 transition active:bg-form-card/40"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sub.dotColor }}
                      />
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {sub.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="text-right">
                        <p className="text-[13px] font-semibold text-foreground">
                          {sub.value}
                        </p>
                        <p className="text-[11px] font-semibold text-success">
                          All {sub.earningsAll}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
