import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/analytical")({
  component: Analytical,
});

const periods = ["1W", "1M", "3M", "6M", "1Y", "All"];

const performanceData = [
  { fund: "CAL Growth Fund", returns: "+12.5%", risk: "High", nav: "25.43" },
  { fund: "CAL Income Fund", returns: "+6.8%", risk: "Low", nav: "15.21" },
  { fund: "CAL Balanced Fund", returns: "+9.2%", risk: "Medium", nav: "20.15" },
  { fund: "CAL Money Market", returns: "+3.1%", risk: "Low", nav: "10.05" },
];

function Analytical() {
  const [period, setPeriod] = useState("1Y");

  return (
    <MobileLayout>
      <PageHeader title="Analytics" showBack />

      {/* Portfolio Performance */}
      <div className="mx-4 mt-2 glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Portfolio Performance</h3>

        {/* Period Selector */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-4">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="flex items-end gap-1.5 h-32 mb-3">
          {[40, 55, 45, 65, 50, 70, 60, 80, 75, 85, 78, 92].map((h, i) => (
            <div key={i} className="flex-1 gradient-primary rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>

        <div className="flex justify-between text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Returns</p>
            <p className="text-sm font-bold text-success">+7.8%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Invested</p>
            <p className="text-sm font-bold text-foreground">LKR 6.8M</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Current</p>
            <p className="text-sm font-bold text-foreground">LKR 7.4M</p>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="mx-4 mt-4 glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Asset Allocation</h3>
        {[
          { label: "Unit Trusts", pct: "33%", color: "bg-primary" },
          { label: "Equities", pct: "25%", color: "bg-success" },
          { label: "Treasuries", pct: "42%", color: "bg-warning" },
        ].map((item) => (
          <div key={item.label} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.pct}</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full">
              <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
            </div>
          </div>
        ))}
      </div>

      {/* Fund Performance Table */}
      <div className="mx-4 mt-4 mb-4 glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Fund Performance</h3>
        {performanceData.map((fund) => (
          <div key={fund.fund} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
            <div>
              <p className="text-xs font-medium text-foreground">{fund.fund}</p>
              <p className="text-[10px] text-muted-foreground">NAV: {fund.nav} · Risk: {fund.risk}</p>
            </div>
            <p className="text-sm font-bold text-success">{fund.returns}</p>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
