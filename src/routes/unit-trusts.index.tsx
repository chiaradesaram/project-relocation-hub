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
          className="max-h-[88vh] overflow-y-auto rounded-t-[28px] border-0 bg-[radial-gradient(120%_60%_at_50%_0%,color-mix(in_oklch,var(--success)_14%,transparent),transparent_70%),color-mix(in_oklch,var(--card)_72%,transparent)] px-5 pb-9 pt-3 shadow-[0_-20px_60px_-20px_color-mix(in_oklch,var(--background)_80%,transparent)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 h-1 w-9 rounded-full bg-foreground/20" />

          {selectedSubAccount && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <SheetClose asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Close fund details"
                    className="h-9 w-9 shrink-0 rounded-full bg-card/80 shadow-none backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              <div className="mt-4">
                <SheetTitle className="font-display text-[20px] font-semibold leading-tight text-foreground">
                  {selectedSubAccount.name}
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-[13px] text-muted-foreground">
                  {selectedSubAccount.fundName}
                </SheetDescription>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="font-display text-[32px] font-semibold leading-none tracking-tight text-foreground">
                    {selectedSubAccount.value}
                  </p>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-[12px] font-semibold text-success">
                    {selectedSubAccount.returnPct}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="px-1 text-[12px] font-medium text-muted-foreground">Earnings</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "7 days", value: selectedSubAccount.earnings7d },
                    { label: "30 days", value: selectedSubAccount.earnings30d },
                    { label: "All time", value: selectedSubAccount.earningsAll },
                  ].map((e) => (
                    <div
                      key={e.label}
                      className="rounded-2xl bg-card/80 px-3 py-3 text-center backdrop-blur-sm"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground">{e.label}</p>
                      <p className="mt-1 text-[13px] font-semibold text-success">{e.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="px-1 text-[12px] font-medium text-muted-foreground">Portfolio</p>
                <div className="mt-2 divide-y divide-foreground/[0.06] rounded-2xl bg-card/80 backdrop-blur-sm">
                  {[
                    selectedSubAccount.units !== undefined && {
                      label: "Units held",
                      value: selectedSubAccount.units.toLocaleString("en-LK", {
                        maximumFractionDigits: 2,
                      }),
                    },
                    selectedSubAccount.navPerUnit !== undefined && {
                      label: "NAV per unit",
                      value: `LKR ${selectedSubAccount.navPerUnit.toFixed(2)}`,
                    },
                    {
                      label: "Net contributed",
                      value: `LKR ${(
                        selectedSubAccount.valueNum - selectedSubAccount.earningsAllNum
                      ).toLocaleString("en-LK")}`,
                    },
                    {
                      label: "Opened",
                      value: new Date(selectedSubAccount.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    },
                  ]
                    .filter((row): row is { label: string; value: string } => Boolean(row))
                    .map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-[13px] text-muted-foreground">{row.label}</span>
                        <span className="text-[13px] font-semibold text-foreground">
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {selectedSubAccount.activity.length > 0 && (
                <div className="mt-5">
                  <p className="px-1 text-[12px] font-medium text-muted-foreground">
                    Recent activity
                  </p>
                  <div className="mt-2 divide-y divide-foreground/[0.06] rounded-2xl bg-card/80 backdrop-blur-sm">
                    {selectedSubAccount.activity.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06]">
                          {a.type === "invest" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-foreground">
                            {a.type === "invest" ? "Investment" : "Withdrawal"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(a.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {a.method ? ` · ${a.method}` : ""}
                          </p>
                        </div>
                        <p
                          className={`text-[13px] font-semibold ${
                            a.type === "invest" ? "text-success" : "text-foreground"
                          }`}
                        >
                          {a.type === "invest" ? "+" : "−"}LKR {a.amount.toLocaleString("en-LK")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7 grid grid-cols-2 gap-2.5">
                <Button
                  onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })}
                  className="h-12 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Invest
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: "/redeem", search: { product: "unit-trust" } })}
                  className="h-12 rounded-full bg-card/80 text-[14px] font-semibold text-foreground shadow-none backdrop-blur-sm hover:bg-card"
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
