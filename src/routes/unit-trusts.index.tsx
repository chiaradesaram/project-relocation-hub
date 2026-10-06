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
          className="max-h-[88vh] overflow-y-auto rounded-t-[28px] border-0 bg-background/80 px-5 pb-9 pt-3 shadow-none backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 h-1 w-9 rounded-full bg-foreground/20" />

          {selectedSubAccount && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-success" />
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

              <div className="mt-5 text-center">
                <SheetTitle className="font-display text-[17px] font-semibold leading-tight text-foreground">
                  {selectedSubAccount.name}
                </SheetTitle>
                <SheetDescription className="mt-1 text-[13px] text-muted-foreground">
                  {selectedSubAccount.fundName}
                </SheetDescription>
                <p className="mt-4 font-display text-[34px] font-semibold leading-none tracking-tight text-foreground">
                  {selectedSubAccount.value}
                </p>
                <p className="mt-2 text-[14px] font-semibold text-success">
                  {selectedSubAccount.earningsAll} all time
                </p>
              </div>

              <div className="mt-7 flex justify-center gap-2">
                <span className="rounded-full bg-card/80 px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground backdrop-blur-sm">
                  7d {selectedSubAccount.earnings7d}
                </span>
                <span className="rounded-full bg-card/80 px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground backdrop-blur-sm">
                  30d {selectedSubAccount.earnings30d}
                </span>
                <span className="rounded-full bg-success/15 px-3.5 py-1.5 text-[12px] font-semibold text-success backdrop-blur-sm">
                  All {selectedSubAccount.earningsAll}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2.5">
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
