import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { funds } from "@/data/unitTrusts";
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

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
        <div className="mt-2 overflow-hidden rounded-2xl bg-card">
          {funds.map((fund, index) => (
            <Button
              key={fund.name}
              variant="ghost"
              onClick={() => setOpenFund(fund)}
              className={`h-auto min-h-[66px] w-full justify-start rounded-none px-4 py-3 text-left hover:bg-form-card/35 ${
                index > 0 ? "border-t border-foreground/[0.06]" : ""
              }`}
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
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            </Button>
          ))}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenFund(null)}
                  className="ml-3 h-8 w-8 shrink-0 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3">
                <p className="text-[22px] font-bold tracking-tight text-foreground">
                  {openFund.value}
                </p>
                <div className="mt-3 grid grid-cols-3 divide-x divide-foreground/[0.07] rounded-xl bg-background/35 py-2.5">
                  <span className="text-center text-[11px] text-muted-foreground">
                    7 days <strong className="mt-0.5 block text-[12px] font-semibold text-success">{openFund.earnings7d}</strong>
                  </span>
                  <span className="text-center text-[11px] text-muted-foreground">
                    30 days <strong className="mt-0.5 block text-[12px] font-semibold text-success">{openFund.earnings30d}</strong>
                  </span>
                  <span className="text-center text-[11px] text-muted-foreground">
                    All time <strong className="mt-0.5 block text-[12px] font-semibold text-success">{openFund.earningsAll}</strong>
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
