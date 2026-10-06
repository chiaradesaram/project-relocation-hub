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
        <div className="mt-2 space-y-2">
          {funds.map((fund) => {
            const isOpen = expandedFund === fund.name;
            return (
              <div key={fund.name} className="overflow-hidden rounded-2xl bg-card">
                <Button
                  variant="ghost"
                  onClick={() => setExpandedFund(isOpen ? null : fund.name)}
                  className="h-auto min-h-[66px] w-full justify-start rounded-none px-4 py-3 text-left hover:bg-form-card/35"
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
                  <div className="space-y-1.5 px-3 pb-3">
                    {fund.subAccounts.map((sub) => (
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

    </MobileLayout>
  );
}
