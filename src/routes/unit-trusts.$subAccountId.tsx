import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { findSubAccount } from "@/data/unitTrusts";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Target,
  Calendar,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/unit-trusts/$subAccountId")({
  loader: ({ params }) => {
    const sub = findSubAccount(params.subAccountId);
    if (!sub) throw notFound();
    return { sub };
  },
  component: SubAccountDetail,
  notFoundComponent: () => (
    <MobileLayout>
      <PageHeader title="Not found" showBack />
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          This sub-account doesn’t exist.
        </p>
        <Link
          to="/unit-trusts"
          className="mt-4 inline-block text-xs font-medium text-primary"
        >
          Back to portfolio
        </Link>
      </div>
    </MobileLayout>
  ),
});

const formatLKR = (n: number) => `LKR ${n.toLocaleString("en-LK")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function SubAccountDetail() {
  const { sub } = Route.useLoaderData();
  const navigate = useNavigate();

  const lastInvest = sub.activity.find((a) => a.type === "invest");
  const lastRedeem = sub.activity.find((a) => a.type === "redeem");

  const hasGoal = !!sub.goalTarget;
  const progress = hasGoal
    ? Math.min((sub.valueNum / sub.goalTarget!) * 100, 100)
    : 0;
  const remaining = hasGoal ? Math.max(sub.goalTarget! - sub.valueNum, 0) : 0;

  return (
    <MobileLayout>
      <PageHeader title={sub.name} showBack />

      {/* Hero balance */}
      <div className="px-4 mt-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: sub.dotColor }}
          />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {sub.fundName}
          </p>
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
          {sub.value}
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px]">
          <span className="text-muted-foreground">
            7d <span className="font-medium text-success">{sub.earnings7d}</span>
          </span>
          <span className="text-muted-foreground">
            30d <span className="font-medium text-success">{sub.earnings30d}</span>
          </span>
          <span className="text-muted-foreground">
            All <span className="font-medium text-success">{sub.earningsAll}</span>
          </span>
        </div>
      </div>

      {/* Quick actions */}
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
            navigate({ to: "/redeem", search: { product: "unit-trust" } })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-card/60 py-2.5 backdrop-blur-md transition hover:bg-muted/10"
        >
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Redeem</span>
        </button>
      </div>

      {/* Performance card */}
      <section className="mx-4 mt-5">
        <div className="mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Performance
          </h2>
        </div>
        <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                7 days
              </p>
              <p className="mt-1 text-sm font-semibold text-success">
                {sub.earnings7d}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                30 days
              </p>
              <p className="mt-1 text-sm font-semibold text-success">
                {sub.earnings30d}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                All time
              </p>
              <p className="mt-1 text-sm font-semibold text-success">
                {sub.earningsAll}
              </p>
            </div>
          </div>
          <div className="mt-3 border-t border-border/20 pt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Annualised return
            </span>
            <span className="text-xs font-semibold text-success">
              {sub.returnPct}
            </span>
          </div>
        </div>
      </section>

      {/* Goal */}
      {hasGoal && (
        <section className="mx-4 mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Goal
            </h2>
          </div>
          <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-foreground">
                {sub.goalLabel}
              </p>
              <p className="text-xs font-semibold text-primary">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {sub.value} of {formatLKR(sub.goalTarget!)}
              </span>
              <span>{formatLKR(remaining)} to go</span>
            </div>
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section className="mx-4 mt-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent activity
          </h2>
        </div>
        <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="rounded-full bg-success/10 p-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  Last creation
                </p>
                {lastInvest ? (
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(lastInvest.date)}
                    {lastInvest.method && ` · ${lastInvest.method}`}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    No investments yet
                  </p>
                )}
              </div>
            </div>
            {lastInvest && (
              <p className="text-xs font-semibold text-foreground">
                +{formatLKR(lastInvest.amount)}
              </p>
            )}
          </div>

          <div className="border-t border-border/20" />

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="rounded-full bg-muted/20 p-1.5">
                <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  Last redemption
                </p>
                {lastRedeem ? (
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(lastRedeem.date)}
                    {lastRedeem.method && ` · ${lastRedeem.method}`}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    No redemptions yet
                  </p>
                )}
              </div>
            </div>
            {lastRedeem && (
              <p className="text-xs font-semibold text-foreground">
                −{formatLKR(lastRedeem.amount)}
              </p>
            )}
          </div>
        </div>

        <Link
          to="/transactions"
          className="mt-2 flex items-center justify-between rounded-xl border border-border/30 bg-card/40 px-4 py-2.5 transition hover:bg-muted/10"
        >
          <span className="text-xs font-medium text-foreground">
            View all transactions
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </section>

      {/* Account info */}
      <section className="mx-4 mt-4 mb-8">
        <div className="rounded-2xl border border-border/30 bg-card/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Sub-account
            </span>
            <span className="text-[11px] font-medium text-foreground">
              {sub.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Fund</span>
            <span className="text-[11px] font-medium text-foreground">
              {sub.fundName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Opened</span>
            <span className="text-[11px] font-medium text-foreground">
              {formatDate(sub.createdAt)}
            </span>
          </div>
        </div>
      </section>
    </MobileLayout>
  );
}
