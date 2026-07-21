import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Check, Clock } from "lucide-react";

export const Route = createFileRoute("/prototype-b")({
  head: () => ({
    meta: [
      { title: "Prototype B — Transactions" },
      { name: "description", content: "Prototype B: transactions with icon-only status." },
    ],
  }),
  component: PrototypeB,
});

type Status = "Pending" | "Confirmed";

type Tx = {
  name: string;
  product: string;
  subAccount: string;
  date: string;
  value: string;
  positive: boolean;
  status: Status;
};

const sample: Tx[] = [
  { name: "CAL Income Fund", product: "Unit Trusts", subAccount: "Joint · Spouse", date: "Apr 12, 2026", value: "LKR 60,000", positive: true, status: "Pending" },
  { name: "HNB.N0000", product: "Equities", subAccount: "Personal · CDS", date: "Apr 2, 2026", value: "LKR 25,000", positive: false, status: "Pending" },
  { name: "CAL Growth Fund", product: "Unit Trusts", subAccount: "Personal · Main", date: "Apr 13, 2026", value: "LKR 125,000", positive: true, status: "Confirmed" },
  { name: "Treasury Bill 91D", product: "Treasuries", subAccount: "Personal · Main", date: "Apr 12, 2026", value: "LKR 105,000", positive: true, status: "Confirmed" },
  { name: "JKH.N0000", product: "Equities", subAccount: "Personal · CDS", date: "Apr 5, 2026", value: "LKR 3,200", positive: true, status: "Confirmed" },
  { name: "CAL Equity Fund", product: "Unit Trusts", subAccount: "Personal · Main", date: "Apr 8, 2026", value: "LKR 75,000", positive: false, status: "Confirmed" },
];

function PrototypeB() {
  return (
    <MobileLayout>
      <PageHeader title="Prototype B" showBack />

      <p className="px-4 text-xs text-muted-foreground mt-1 mb-3">
        Status shown as icon only — clock for pending, tick for confirmed.
      </p>

      <div className="px-4 space-y-2">
        {sample.map((tx, i) => (
          <div key={i} className="glass-card p-4 flex items-start gap-3 w-full">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                tx.status === "Pending" ? "bg-warning/20" : "bg-success/20"
              }`}
            >
              {tx.status === "Pending" ? (
                <Clock className="w-4 h-4 text-warning" aria-label="Pending" />
              ) : (
                <Check className="w-4 h-4 text-success" strokeWidth={3} aria-label="Confirmed" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {tx.product} · {tx.subAccount}
              </p>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">{tx.date}</p>
            </div>

            <div className="shrink-0">
              <p className={`text-sm font-semibold ${tx.positive ? "text-emerald-300" : "text-foreground"}`}>
                {tx.positive ? "+" : "−"} {tx.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}