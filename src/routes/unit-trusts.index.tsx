import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { funds, type SubAccount } from "@/data/unitTrusts";
import {
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  X,
  TrendingUp,
  Pencil,
} from "lucide-react";

export const Route = createFileRoute("/unit-trusts/")({
  head: () => ({
    meta: [
      { title: "Unit Trust Portfolio | CAL Digital" },
      {
        name: "description",
        content: "View your CAL unit trust balance, returns, and fund holdings.",
      },
      { property: "og:title", content: "Unit Trust Portfolio | CAL Digital" },
      {
        property: "og:description",
        content: "View your CAL unit trust balance, returns, and fund holdings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UnitTrustPortfolio,
});

function UnitTrustPortfolio() {
  const navigate = useNavigate();
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [selectedSubAccount, setSelectedSubAccount] = useState<SubAccount | null>(null);

  const totalInvested = selectedSubAccount?.activity
    .filter((entry) => entry.type === "invest")
    .reduce((total, entry) => total + entry.amount, 0) ?? 0;
  const totalRedeemed = selectedSubAccount?.activity
    .filter((entry) => entry.type === "redeem")
    .reduce((total, entry) => total + entry.amount, 0) ?? 0;

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      <div className="px-5 pt-5 text-center">
        <p className="text-[13px] font-medium text-muted-foreground">Total balance</p>
        <p className="mt-1.5 font-display text-[28px] font-semibold leading-tight text-foreground">
          LKR 2,450,000
        </p>
        <p className="mt-2 text-[14px] font-semibold text-success">
          +LKR 219,949 all time
        </p>
      </div>

      <div className="mx-5 mt-6 flex justify-center gap-3">
        <Button
          onClick={() =>
            navigate({ to: "/invest", search: { product: "unit-trust" } })
          }
          className="h-10 rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
        >
          <ArrowUpRight className="h-4 w-4" />
          Invest
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            navigate({ to: "/redeem", search: { product: "unit-trust" } })
          }
          className="h-10 rounded-full bg-card px-5 text-[13px] font-semibold text-foreground shadow-none hover:bg-form-card/70"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          Redeem
        </Button>
      </div>

      <section className="mx-4 mt-8">
        <h2 className="px-1 text-[13px] font-semibold text-foreground">Your funds</h2>
        <div className="mt-2 space-y-2.5">
          {funds.map((fund) => {
            const isOpen = expandedFund === fund.name;
            return (
              <div key={fund.name} className="overflow-hidden rounded-2xl bg-card">
                <Button
                  variant="ghost"
                  onClick={() => setExpandedFund(isOpen ? null : fund.name)}
                  className="flex h-auto min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl bg-transparent px-4 py-3 text-left hover:bg-foreground/[0.04]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-tight text-foreground">
                      {fund.name}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-success">
                      +LKR {fund.earningsAll.replace(/^\+/, "")} all time
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-[14px] font-semibold text-foreground">
                    {fund.value}
                  </p>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </Button>

                {isOpen && (
                  <div className="space-y-1.5 px-2 pb-2.5 pt-1.5">
                    {fund.subAccounts.map((sub) => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        onClick={() => setSelectedSubAccount(sub)}
                        className="flex h-auto min-h-[56px] w-full items-center justify-between gap-2 rounded-xl bg-foreground/[0.06] px-3.5 py-2.5 text-left transition-colors hover:bg-foreground/[0.09] active:bg-foreground/[0.12]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
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
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mx-4 mb-6 mt-3">
        <Button
          variant="ghost"
          className="h-11 w-full rounded-xl text-[13px] font-semibold text-pill hover:bg-card/70 hover:text-pill"
        >
          <Plus className="h-4 w-4" />
          Add new fund
        </Button>
      </div>

      <Sheet
        open={selectedSubAccount !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSubAccount(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-0 bg-background px-4 pb-8 pt-3 shadow-none"
        >
          <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-foreground/20" />

          {selectedSubAccount && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
                  <TrendingUp className="h-7 w-7 text-success" />
                </div>
                <SheetClose asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Close fund details"
                    className="h-9 w-9 shrink-0 rounded-full bg-card shadow-none"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle className="font-display text-[24px] font-bold leading-tight text-foreground">
                    {selectedSubAccount.name}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-[14px] text-muted-foreground">
                    {selectedSubAccount.fundName}
                  </SheetDescription>
                </div>
                <p className="shrink-0 font-display text-[24px] font-bold leading-tight text-success">
                  {selectedSubAccount.earningsAll}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate({ to: "/unit-trusts" })}
                className="mt-6 flex w-full items-center gap-3 rounded-full bg-card py-2 pl-2 pr-3 text-left transition-colors hover:bg-foreground/[0.06] active:bg-foreground/[0.09]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <TrendingUp className="h-4.5 w-4.5 text-success" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-foreground">
                    {selectedSubAccount.fundName}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    View fund details
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              <button
                type="button"
                className="mt-2 flex w-full items-center gap-3 rounded-full bg-card py-2 pl-2 pr-3 text-left transition-colors hover:bg-foreground/[0.06] active:bg-foreground/[0.09]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pill/15">
                  <Pencil className="h-4.5 w-4.5 text-pill" />
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold text-foreground">
                  Add notes and #tags
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              <p className="mt-7 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                History
              </p>
              <div className="mt-2 divide-y divide-foreground/[0.07] rounded-2xl bg-card px-4">
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-[15px] text-foreground">Current value</span>
                  <span className="text-[15px] font-bold text-foreground">
                    {selectedSubAccount.value}
                  </span>
                </div>
                {selectedSubAccount.units !== undefined && (
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[15px] text-foreground">Units held</span>
                    <span className="text-[15px] font-bold text-foreground">
                      {selectedSubAccount.units.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {selectedSubAccount.navPerUnit !== undefined && (
                  <div className="flex items-start justify-between py-3.5">
                    <span>
                      <span className="block text-[15px] text-foreground">NAV per unit</span>
                      <span className="block text-[12px] text-muted-foreground">
                        {selectedSubAccount.units !== undefined
                          ? `For ${selectedSubAccount.units.toLocaleString("en-LK", { maximumFractionDigits: 0 })} units`
                          : ""}
                      </span>
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      LKR {selectedSubAccount.navPerUnit.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between py-3.5">
                  <span>
                    <span className="block text-[15px] text-foreground">Net contributed</span>
                    <span className="block text-[12px] text-muted-foreground">
                      {selectedSubAccount.activity.length} transactions
                    </span>
                  </span>
                  <span className="text-[15px] font-bold text-foreground">
                    LKR {(totalInvested - totalRedeemed).toLocaleString("en-LK")}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })}
                  className="h-11 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Invest
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: "/redeem", search: { product: "unit-trust" } })}
                  className="h-11 rounded-full bg-card text-[13px] font-semibold text-foreground shadow-none hover:bg-foreground/[0.06]"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Redeem
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </MobileLayout>
  );
}
