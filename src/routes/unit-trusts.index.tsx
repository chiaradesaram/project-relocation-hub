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
        <div className="mt-2 space-y-2">
          {funds.map((fund) => {
            const isOpen = expandedFund === fund.name;
            return (
              <div key={fund.name} className="overflow-hidden rounded-2xl bg-card">
                <Button
                  variant="ghost"
                  onClick={() => setExpandedFund(isOpen ? null : fund.name)}
                  className="h-auto min-h-[66px] w-full justify-start rounded-2xl bg-form-card/55 px-4 py-3 text-left hover:bg-form-card/70"
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
                  <div className="space-y-1 px-2.5 pb-2.5 pt-2">
                    {fund.subAccounts.map((sub) => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        onClick={() => setSelectedSubAccount(sub)}
                        className="flex h-auto min-h-[58px] w-full items-center justify-between gap-2 rounded-xl bg-background/30 px-3.5 py-2.5 text-left hover:bg-background/45"
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
          className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-0 bg-card px-4 pb-7 pt-3 shadow-none"
        >
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-foreground/20" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-[20px] font-semibold leading-tight">
                {selectedSubAccount?.name}
              </SheetTitle>
              <SheetDescription className="mt-1 text-[13px] text-muted-foreground">
                {selectedSubAccount?.fundName}
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Close fund details"
                className="h-9 w-9 shrink-0 rounded-full bg-form-card/70 shadow-none"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          {selectedSubAccount && (
            <>
              <div className="mt-5 rounded-2xl bg-form-card/55 px-4 py-5 text-center">
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-success/15">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <p className="text-[12px] font-medium text-muted-foreground">Current value</p>
                <p className="mt-1 font-display text-[26px] font-semibold text-foreground">
                  {selectedSubAccount.value}
                </p>
                <p className="mt-1.5 text-[13px] font-semibold text-success">
                  {selectedSubAccount.earningsAll} all time
                </p>
              </div>

              <div className="mt-3 grid grid-cols-3 divide-x divide-foreground/[0.07] rounded-2xl bg-background/30 py-3">
                {[
                  ["7 days", selectedSubAccount.earnings7d],
                  ["30 days", selectedSubAccount.earnings30d],
                  ["All time", selectedSubAccount.earningsAll],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-[13px] font-semibold text-success">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 px-1">
                <Wallet className="h-4 w-4 text-pill" />
                <h3 className="text-[14px] font-semibold text-foreground">Your holding</h3>
              </div>
              <div className="mt-2 divide-y divide-foreground/[0.06] rounded-2xl bg-background/30 px-4">
                {selectedSubAccount.units !== undefined && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-muted-foreground">Units held</span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {selectedSubAccount.units.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {selectedSubAccount.navPerUnit !== undefined && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-muted-foreground">NAV per unit</span>
                    <span className="text-[13px] font-semibold text-foreground">
                      LKR {selectedSubAccount.navPerUnit.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-[13px] text-muted-foreground">Net contributed</span>
                  <span className="text-[13px] font-semibold text-foreground">
                    LKR {(totalInvested - totalRedeemed).toLocaleString("en-LK")}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })}
                  className="h-11 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Invest
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: "/redeem", search: { product: "unit-trust" } })}
                  className="h-11 rounded-xl bg-form-card/70 text-[13px] font-semibold text-foreground shadow-none hover:bg-form-card"
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
