import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  TrendingUp,
  ArrowUpRight,
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

type Product = "ut" | "equity" | "treasuries";

const productLabel: Record<Product, string> = {
  ut: "UT",
  equity: "Equity",
  treasuries: "Treasuries",
};

type Item =
  | {
      kind: "request";
      label: string;
      detail: string;
      date: string;
      value?: string;
      product: Product;
      icon: "request" | "recurring" | "flip";
    }
  | {
      kind: "movement";
      label: string;
      detail?: string;
      date: string;
      value: string;
      positive: boolean;
      product: Product;
      icon: "in" | "out" | "flip";
    };

// Requests and cash movements are separate items — some movements have no
// request behind them (ad-hoc cash in, payouts without requests).
const sample: Item[] = [
  {
    kind: "request",
    label: "Bank Transfer Request CAL Income Fund",
    detail: "Investment",
    date: "13 Apr 2026",
    value: "LKR 60,000",
    product: "ut",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Paid into CAL Income Fund",
    date: "13 Apr 2026",
    value: "LKR 60,000",
    positive: true,
    product: "ut",
    icon: "in",
  },
  {
    kind: "request",
    label: "Redemption CAL Equity Fund",
    detail: "Redemption",
    date: "12 Apr 2026",
    value: "LKR 75,000",
    product: "ut",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Paid out",
    detail: "To Commercial Bank ····21",
    date: "12 Apr 2026",
    value: "LKR 75,000",
    positive: false,
    product: "ut",
    icon: "out",
  },
  {
    kind: "request",
    label: "Recurring Investment",
    detail: "CAL Income Fund · Monthly",
    date: "12 Apr 2026",
    product: "ut",
    icon: "recurring",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Recurring investment",
    date: "12 Apr 2026",
    value: "LKR 25,000",
    positive: true,
    product: "ut",
    icon: "in",
  },
  {
    kind: "request",
    label: "Equity Funding Request",
    detail: "Fund equity cash balance",
    date: "10 Apr 2026",
    value: "LKR 100,000",
    product: "equity",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Funded from Unit Trust",
    date: "10 Apr 2026",
    value: "LKR 100,000",
    positive: true,
    product: "equity",
    icon: "in",
  },
  {
    kind: "request",
    label: "T-Bill Purchase Request",
    detail: "Treasury bill · 91 days",
    date: "8 Apr 2026",
    value: "LKR 250,000",
    product: "treasuries",
    icon: "request",
  },
  {
    kind: "movement",
    label: "Paid out",
    detail: "Settled from cash balance",
    date: "8 Apr 2026",
    value: "LKR 250,000",
    positive: false,
    product: "treasuries",
    icon: "out",
  },
  {
    kind: "request",
    label: "Fund Flip Request",
    detail: "CAL Equity Fund → CAL Income Fund",
    date: "8 Apr 2026",
    value: "LKR 40,000",
    product: "ut",
    icon: "flip",
  },
  {
    kind: "movement",
    label: "Flip completed",
    detail: "CAL Equity Fund → CAL Income Fund",
    date: "8 Apr 2026",
    value: "LKR 40,000",
    positive: true,
    product: "ut",
    icon: "flip",
  },
  {
    kind: "movement",
    label: "Cash in",
    detail: "Sampath Bank",
    date: "6 Apr 2026",
    value: "LKR 300,000",
    positive: true,
    product: "ut",
    icon: "in",
  },
];

const products: { key: Product; label: string }[] = [
  { key: "ut", label: "Unit Trust" },
  { key: "equity", label: "Equities" },
  { key: "treasuries", label: "Treasuries" },
];

const requestIcon = {
  request: FileText,
  recurring: Repeat,
  flip: ArrowLeftRight,
};

const movementIcon = {
  in: TrendingUp,
  out: ArrowUpRight,
  flip: ArrowLeftRight,
};

function PrototypeActivity() {
  const [product, setProduct] = useState<Product>("ut");

  const groups = sample
    .filter((item) => item.product === product)
    .reduce<Record<string, Item[]>>((acc, item) => {
      (acc[item.date] ??= []).push(item);
      return acc;
    }, {});

  return (
    <MobileLayout>
      <PageHeader title="Activity log — B" showBack />

      <div className="px-4 pt-1">
        <div className="flex gap-2 rounded-full bg-card/60 backdrop-blur-md p-1">
          {products.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setProduct(p.key)}
              className={cn(
                "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                product === p.key
                  ? "text-white bg-[color-mix(in_oklch,var(--pill)_24%,var(--surface-2))]"
                  : "text-muted-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
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
                          {item.value && (
                            <p className="text-xs font-semibold text-foreground/80 mt-0.5">{item.value}</p>
                          )}
                        </div>
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
