import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  TrendingUp,
  ArrowUpRight,
  Coins,
  Repeat,
  ArrowLeftRight,
  FileText,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prototype-activity")({
  head: () => ({
    meta: [
      { title: "Prototype — Activity log B" },
      { name: "description", content: "Prototype B: activity log with requests and cash movements as separate items." },
    ],
  }),
  component: PrototypeActivity,
});

type Item =
  | {
      kind: "request";
      label: string;
      detail: string;
      date: string;
      value?: string;
      icon: "request" | "recurring" | "flip";
    }
  | {
      kind: "movement";
      label: string;
      detail?: string;
      date: string;
      value: string;
      positive: boolean;
      icon: "in" | "out" | "dividend" | "flip";
    };

// Requests and cash movements are separate items — some movements have no
// request behind them (dividends, ad-hoc cash in, payouts without requests).
const sample: Item[] = [
  {
    kind: "request",
    label: "CAL Income Fund Request",
    detail: "Investment · Joint · Spouse",
    date: "13 Apr 2026",
    value: "LKR 60,000",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Paid into CAL Income Fund",
    date: "13 Apr 2026",
    value: "LKR 60,000",
    positive: true,
    icon: "in",
  },
  {
    kind: "request",
    label: "Payout Request",
    detail: "Redemption · CAL Equity Fund · Personal",
    date: "12 Apr 2026",
    value: "LKR 75,000",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Paid out",
    detail: "To Commercial Bank ····21",
    date: "12 Apr 2026",
    value: "LKR 75,000",
    positive: false,
    icon: "out",
  },
  {
    kind: "request",
    label: "Recurring Investment",
    detail: "CAL Income Fund · Personal · Monthly",
    date: "12 Apr 2026",
    icon: "recurring",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Recurring investment",
    date: "12 Apr 2026",
    value: "LKR 25,000",
    positive: true,
    icon: "in",
  },
  {
    kind: "movement",
    label: "Dividend",
    detail: "JKH.N0000 · Personal · CDS",
    date: "10 Apr 2026",
    value: "LKR 3,200",
    positive: true,
    icon: "dividend",
  },
  {
    kind: "request",
    label: "Fund Flip Request",
    detail: "CAL Equity Fund → CAL Income Fund",
    date: "8 Apr 2026",
    value: "LKR 40,000",
    icon: "flip",
  },
  {
    kind: "movement",
    label: "Flip completed",
    detail: "CAL Equity Fund → CAL Income Fund",
    date: "8 Apr 2026",
    value: "LKR 40,000",
    positive: true,
    icon: "flip",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Sampath Bank · Personal · Main",
    date: "6 Apr 2026",
    value: "LKR 300,000",
    positive: true,
    icon: "in",
  },
];

const groups = sample.reduce<Record<string, Item[]>>((acc, item) => {
  (acc[item.date] ??= []).push(item);
  return acc;
}, {});

const requestIcon = {
  request: FileText,
  recurring: Repeat,
  flip: ArrowLeftRight,
};

const movementIcon = {
  in: TrendingUp,
  out: ArrowUpRight,
  dividend: Coins,
  flip: ArrowLeftRight,
};

function PrototypeActivity() {
  return (
    <MobileLayout>
      <PageHeader title="Activity log — B" showBack />

      <p className="px-4 text-xs text-foreground/70 mt-1 mb-3">
        Requests and cash movements are separate items — like Splitwise, some payments have no request behind them.
      </p>

      <div className="px-4 pb-6 space-y-4">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-foreground/70 mb-2 px-1">{date}</p>
            <div className="rounded-2xl bg-card/60 backdrop-blur-md px-4">
              {items.map((item, i) => {
                if (item.kind === "request") {
                  const Icon = requestIcon[item.icon];
                  return (
                    <div key={i} className={cn(i > 0 && "border-t border-border/40")}>
                      <div className="flex items-center gap-3 py-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "color-mix(in oklch, var(--pill) 20%, transparent)" }}
                        >
                          <Icon className="w-5 h-5 text-pill" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-foreground truncate">{item.label}</p>
                          <p className="text-xs text-foreground/60 truncate">{item.detail}</p>
                        </div>
                        {item.value && (
                          <p className="text-[15px] font-semibold text-foreground shrink-0">
                            {item.value}
                            <span className="text-[11px] font-medium ml-1 opacity-70">LKR</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                // Movement — standalone, Splitwise-style payment line
                const Icon = movementIcon[item.icon];
                return (
                  <div key={i} className={cn(i > 0 && "border-t border-border/40")}>
                    <div className="flex items-center gap-3 py-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: item.positive
                            ? "color-mix(in oklch, var(--success) 16%, transparent)"
                            : "color-mix(in oklch, var(--border) 45%, transparent)",
                        }}
                      >
                        {item.icon === "in" ? (
                          <Banknote className="w-[18px] h-[18px] text-success" />
                        ) : (
                          <Icon className="w-[18px] h-[18px] text-foreground/80" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-foreground truncate">{item.label}</p>
                        {item.detail && <p className="text-xs text-foreground/60 truncate">{item.detail}</p>}
                      </div>
                      <p
                        className={cn(
                          "text-[14px] font-semibold shrink-0",
                          item.positive ? "text-success" : "text-foreground"
                        )}
                      >
                        {item.positive ? "+" : "−"} {item.value}
                      </p>
                    </div>
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
