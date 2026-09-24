import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, ArrowUpRight, Coins, Repeat, ArrowLeftRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prototype-activity")({
  head: () => ({
    meta: [
      { title: "Prototype — Activity log B" },
      { name: "description", content: "Prototype B: activity log pairing requests with their cash movements." },
    ],
  }),
  component: PrototypeActivity,
});

type Activity = {
  // A "request" row (neutral, no status) with an optional cash movement under it,
  // or a standalone movement with no request behind it.
  label: string;
  detail: string;
  date: string;
  requestValue?: string;
  movement?: {
    label: string;
    value: string;
    positive: boolean;
    icon: "in" | "out" | "dividend" | "recurring" | "flip";
  };
};

const sample: Activity[] = [
  {
    label: "CAL Income Fund Request",
    detail: "Investment · Joint · Spouse",
    date: "13 Apr 2026",
    requestValue: "LKR 60,000",
    movement: { label: "Cash in", value: "LKR 60,000", positive: true, icon: "in" },
  },
  {
    label: "Payout Request",
    detail: "Redemption · CAL Equity Fund · Personal",
    date: "12 Apr 2026",
    requestValue: "LKR 75,000",
    movement: { label: "Paid out", value: "LKR 75,000", positive: false, icon: "out" },
  },
  {
    label: "Recurring Investment",
    detail: "CAL Income Fund · Personal · Monthly",
    date: "12 Apr 2026",
    movement: { label: "Cash in", value: "LKR 25,000", positive: true, icon: "recurring" },
  },
  {
    label: "Dividend",
    detail: "JKH.N0000 · Personal · CDS",
    date: "10 Apr 2026",
    movement: { label: "Cash in", value: "LKR 3,200", positive: true, icon: "dividend" },
  },
  {
    label: "Fund Flip Request",
    detail: "CAL Equity Fund → CAL Income Fund",
    date: "8 Apr 2026",
    requestValue: "LKR 40,000",
    movement: { label: "Flip completed", value: "LKR 40,000", positive: true, icon: "flip" },
  },
  {
    label: "Cash In",
    detail: "Sampath Bank · Personal · Main",
    date: "6 Apr 2026",
    movement: { label: "Cash in", value: "LKR 300,000", positive: true, icon: "in" },
  },
];

const groups = sample.reduce<Record<string, Activity[]>>((acc, a) => {
  (acc[a.date] ??= []).push(a);
  return acc;
}, {});

const movementIcon = {
  in: TrendingUp,
  out: ArrowUpRight,
  dividend: Coins,
  recurring: Repeat,
  flip: ArrowLeftRight,
};

function PrototypeActivity() {
  return (
    <MobileLayout>
      <PageHeader title="Activity log — B" showBack />

      <p className="px-4 text-xs text-foreground/70 mt-1 mb-3">
        Requests shown neutrally, with the cash movement underneath. Some movements have no request at all.
      </p>

      <div className="px-4 pb-6 space-y-4">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-foreground/70 mb-2 px-1">{date}</p>
            <div className="rounded-2xl bg-card/60 backdrop-blur-md px-4">
              {items.map((a, i) => {
                const Icon = a.movement ? movementIcon[a.movement.icon] : FileText;
                return (
                  <div key={i} className={cn(i > 0 && "border-t border-border/40")}>
                    {/* Request row — neutral, no status */}
                    <div className="flex items-center gap-3 pt-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "color-mix(in oklch, var(--pill) 20%, transparent)" }}
                      >
                        <Icon className="w-5 h-5 text-pill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-foreground truncate">{a.label}</p>
                        <p className="text-xs text-foreground/60 truncate">{a.detail}</p>
                      </div>
                      {a.requestValue && (
                        <p className="text-[15px] font-semibold text-foreground shrink-0">
                          {a.requestValue}
                          <span className="text-[11px] font-medium ml-1 opacity-70">LKR</span>
                        </p>
                      )}
                    </div>

                    {/* Cash movement — small indented line, Splitwise-style */}
                    {a.movement && (
                      <div className="flex items-center gap-3 pt-2.5 pb-3.5 pl-6">
                        <div className="self-stretch w-px shrink-0" style={{ background: "color-mix(in oklch, var(--border) 70%, transparent)" }} />
                        <div className="flex-1 min-w-0 flex items-center gap-2.5 pl-3">
                          <p className="text-[13px] text-foreground/70 truncate flex-1">{a.movement.label}</p>
                          <p
                            className={cn(
                              "text-[13px] font-semibold shrink-0",
                              a.movement.positive ? "text-success" : "text-foreground"
                            )}
                          >
                            {a.movement.positive ? "+" : "−"} {a.movement.value}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
