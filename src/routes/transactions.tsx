import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/transactions")({
  component: Transactions,
});

const filters = ["All", "Investments", "Redemptions", "Dividends", "Transfers"];

const transactions = [
  { name: "CAL Growth Fund", type: "Buy", amount: "+500 units", date: "Apr 13, 2026", value: "LKR 125,000", positive: true },
  { name: "Treasury Bill Maturity", type: "Maturity", amount: "LKR 105,000", date: "Apr 12, 2026", value: "LKR 105,000", positive: true },
  { name: "CAL Equity Fund", type: "Redeem", amount: "-200 units", date: "Apr 8, 2026", value: "LKR 75,000", positive: false },
  { name: "CAL Income Fund", type: "Dividend", amount: "LKR 3,200", date: "Apr 5, 2026", value: "LKR 3,200", positive: true },
  { name: "CAL Balanced Fund", type: "Buy", amount: "+1,000 units", date: "Apr 1, 2026", value: "LKR 250,000", positive: true },
  { name: "CAL Money Market", type: "Buy", amount: "+2,000 units", date: "Mar 28, 2026", value: "LKR 200,000", positive: true },
  { name: "CAL Growth Fund", type: "Redeem", amount: "-100 units", date: "Mar 25, 2026", value: "LKR 25,000", positive: false },
  { name: "Fund Flip", type: "Transfer", amount: "Growth → Income", date: "Mar 20, 2026", value: "LKR 50,000", positive: true },
];

function Transactions() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <MobileLayout>
      <PageHeader title="Transactions" showBack />

      {/* Filters */}
      <div className="flex gap-2 px-4 mt-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeFilter === f
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="px-4 mt-3 space-y-2">
        {transactions.map((tx, i) => (
          <div key={i} className="glass-card p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.positive ? "bg-success/20" : "bg-destructive/20"}`}>
              {tx.positive ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{tx.name}</p>
              <p className="text-[10px] text-muted-foreground">{tx.type} · {tx.date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">{tx.value}</p>
              <p className={`text-[10px] ${tx.positive ? "text-success" : "text-destructive"}`}>{tx.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
