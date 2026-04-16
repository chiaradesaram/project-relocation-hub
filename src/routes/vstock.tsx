import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, Trophy, Zap, Target } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/vstock")({
  component: VStock,
});

const stocks = [
  { name: "JKH", price: "185.50", change: "+2.3%", positive: true },
  { name: "COMB", price: "98.25", change: "-0.8%", positive: false },
  { name: "DIAL", price: "12.40", change: "+5.1%", positive: true },
  { name: "SAMP", price: "62.00", change: "+1.2%", positive: true },
  { name: "HNB", price: "210.00", change: "-1.5%", positive: false },
];

function VStock() {
  const [balance] = useState(1000000);

  return (
    <MobileLayout>
      <PageHeader title="VStock Simulator" showBack />

      {/* Virtual Portfolio */}
      <div className="mx-4 mt-2 gradient-portfolio rounded-2xl p-5 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Virtual Portfolio</p>
        <h2 className="text-2xl font-bold text-foreground mt-1">LKR {balance.toLocaleString()}</h2>
        <p className="text-[11px] text-success mt-1">+15.2% since start</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mx-4 mt-3">
        {[
          { icon: Trophy, label: "Rank", value: "#42" },
          { icon: Target, label: "Trades", value: "28" },
          { icon: TrendingUp, label: "Win Rate", value: "68%" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex-1 glass-card p-3 text-center">
            <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Market */}
      <div className="mx-4 mt-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Market Watchlist</h3>
        <div className="space-y-2">
          {stocks.map((stock) => (
            <div key={stock.name} className="glass-card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                {stock.name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{stock.name}</p>
                <p className="text-[10px] text-muted-foreground">LKR {stock.price}</p>
              </div>
              <p className={`text-xs font-medium ${stock.positive ? "text-success" : "text-destructive"}`}>
                {stock.change}
              </p>
              <button className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-lg font-medium">Trade</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-6">
        <button className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold">
          Start New Competition
        </button>
      </div>
    </MobileLayout>
  );
}
