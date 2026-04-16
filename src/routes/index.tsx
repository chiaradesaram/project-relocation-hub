import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import { TrendingUp, Bell, ChevronRight, Zap, Gamepad2, BarChart2, Receipt, PieChart, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const portfolioItems = [
  {
    name: "Unit Trusts", value: "2,450,000", earnings30d: "110,250", allTime: "219,000",
    icon: PieChart, path: "/unit-trusts", percentage: 33, color: "oklch(0.6 0.2 260)",
  },
  {
    name: "Equities", value: "1,820,000", earnings30d: "227,500", allTime: "315,000",
    icon: BarChart2, path: "/invest?product=equities", percentage: 25, color: "oklch(0.55 0.25 290)",
  },
  {
    name: "Treasuries", value: "3,100,000", earnings30d: "127,100", allTime: "128,000",
    icon: Receipt, path: "/invest?product=treasuries", percentage: 42, color: "oklch(0.6 0.2 350)",
  },
];

const marketData = [
  { name: "ASPI", value: "12,845.32", change: "+1.2%", positive: true },
  { name: "S&P SL20", value: "4,231.10", change: "-0.3%", positive: false },
  { name: "91-Day T-Bill", value: "9.85%", change: "+0.05%", positive: true },
];

const DonutChart = ({ items }: { items: typeof portfolioItems }) => {
  const total = items.reduce((s, i) => s + i.percentage, 0);
  let cumulative = 0;
  const r = 44, cx = 50, cy = 50, strokeW = 7;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      {items.map((item, i) => {
        const fraction = item.percentage / total;
        const dashLen = fraction * circumference;
        const dashOffset = -(cumulative / total) * circumference;
        cumulative += item.percentage;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const [showActionPicker, setShowActionPicker] = useState<"invest" | "redeem" | null>(null);

  const productOptions = [
    { icon: PieChart, label: "Unit Trusts", param: "unit-trust" },
    { icon: BarChart2, label: "Equities", param: "equities" },
    { icon: Receipt, label: "Treasuries", param: "treasuries" },
  ];

  return (
    <MobileLayout>
      {/* Action Picker Overlay */}
      {showActionPicker && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowActionPicker(null)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">
                {showActionPicker === "invest" ? "What would you like to invest in?" : "What would you like to redeem?"}
              </h3>
              <button onClick={() => setShowActionPicker(null)} className="p-1 rounded-full bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            {productOptions.map(({ icon: Icon, label, param }) => (
              <button
                key={param}
                onClick={() => {
                  setShowActionPicker(null);
                  navigate({ to: "/invest", search: { product: param, action: showActionPicker === "redeem" ? "redeem" : undefined } });
                }}
                className="w-full flex items-center gap-3 p-4 bg-secondary rounded-xl hover:bg-muted/50 transition mb-2"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Good morning</p>
          <h1 className="text-xl font-bold text-foreground">CAL Online</h1>
        </div>
        <button onClick={() => navigate({ to: "/profile" })} className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <Bell className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Portfolio Hero Card */}
      <div className="mx-4 mt-2 gradient-portfolio rounded-2xl p-5 flex items-center gap-4">
        <DonutChart items={portfolioItems} />
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Portfolio</p>
          <p className="text-xs text-muted-foreground mt-1">LKR</p>
          <h2 className="text-2xl font-bold text-foreground">7,370,000</h2>
          <p className="text-[10px] mt-1">
            <span className="text-success">+7.8% all time</span>
            <span className="text-muted-foreground"> · LKR 662,000</span>
          </p>
          <div className="flex gap-2 mt-2">
            {portfolioItems.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      <div className="mx-4 mt-4 glass-card p-3">
        <h3 className="text-xs font-semibold text-foreground mb-2 px-1">Portfolio</h3>
        {portfolioItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.name} onClick={() => navigate({ to: item.path })} className="w-full flex items-center gap-3 p-3 hover:bg-muted/20 transition rounded-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "33" }}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-foreground">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">LKR {item.value}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-muted-foreground">30d</p>
                <p className="text-[11px] text-success font-medium">LKR {item.earnings30d}</p>
                <p className="text-[9px] text-muted-foreground">All time</p>
                <p className="text-[11px] text-success font-medium">LKR {item.allTime}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Invest / Redeem buttons */}
      <div className="mx-4 mt-3 flex gap-2">
        <button onClick={() => setShowActionPicker("invest")} className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold">
          Invest
        </button>
        <button onClick={() => setShowActionPicker("redeem")} className="flex-1 bg-secondary text-foreground py-2.5 rounded-xl text-xs font-semibold border border-border/50">
          Redeem
        </button>
      </div>

      {/* Market Overview */}
      <div className="mx-4 mt-4 glass-card p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-foreground">Market Overview</h3>
          <button onClick={() => navigate({ to: "/rates" })} className="text-[10px] text-primary font-medium">See All</button>
        </div>
        {marketData.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-2 px-1">
            <div>
              <p className="text-xs font-medium text-foreground">{item.name}</p>
            </div>
            <p className="text-xs text-foreground">{item.value}</p>
            <p className={`text-xs font-medium ${item.positive ? "text-success" : "text-destructive"}`}>
              {item.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mt-4 mb-4 glass-card p-3">
        <h3 className="text-xs font-semibold text-foreground mb-2 px-1">Quick Actions</h3>
        <div className="flex gap-2">
          {[
            { icon: Zap, label: "Invest Now", action: () => setShowActionPicker("invest") },
            { icon: Gamepad2, label: "VStock", action: () => navigate({ to: "/vstock" }) },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="flex-1 flex flex-col items-center gap-1 p-3 bg-secondary rounded-xl hover:bg-muted/50 transition">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-[10px] text-foreground font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
