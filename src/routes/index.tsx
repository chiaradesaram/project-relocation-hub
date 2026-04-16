import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import { Bell, BarChart2, Receipt, PieChart, X, ArrowUpRight, ArrowDownLeft, Zap, Gamepad2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const portfolioItems = [
  {
    name: "Unit Trusts", value: "2,450,000", earnings: "+110,250",
    icon: PieChart, path: "/unit-trusts", percentage: 33, color: "oklch(0.6 0.2 260)",
  },
  {
    name: "Equities", value: "1,820,000", earnings: "+227,500",
    icon: BarChart2, path: "/invest?product=equities", percentage: 25, color: "oklch(0.55 0.25 290)",
  },
  {
    name: "Treasuries", value: "3,100,000", earnings: "+127,100",
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
  const r = 36, cx = 50, cy = 50, strokeW = 8;
  const circumference = 2 * Math.PI * r;
  const gap = 3;

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      {items.map((item, i) => {
        const fraction = item.percentage / total;
        const dashLen = Math.max(0, fraction * circumference - gap);
        const dashOffset = -(cumulative / total) * circumference - gap / 2;
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
        <button onClick={() => navigate({ to: "/profile" })} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Portfolio Card — dark purple, translucent with pie chart */}
      <div className="mx-4 mt-2 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/15 p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Portfolio</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowActionPicker("invest")}
              className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition"
              title="Invest"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
            </button>
            <button
              onClick={() => setShowActionPicker("redeem")}
              className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition"
              title="Redeem"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <DonutChart items={portfolioItems} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">LKR 7,370,000</h2>
            <p className="text-xs mt-1">
              <span className="text-success font-medium">+7.8%</span>
              <span className="text-muted-foreground"> · LKR 662,000 all time</span>
            </p>
            <div className="flex gap-3 mt-2">
              {portfolioItems.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown — clean rows with chevron */}
      <div className="mx-4 mt-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Portfolio</h3>
        <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 divide-y divide-border/30">
          {portfolioItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.name} onClick={() => navigate({ to: item.path })} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-primary/5 transition">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color + "1a" }}>
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-sm font-medium text-foreground">LKR {item.value}</p>
                  <p className="text-xs text-success font-medium">{item.earnings}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Market Overview */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Overview</h3>
          <button onClick={() => navigate({ to: "/rates" })} className="text-[10px] text-primary font-medium">See All</button>
        </div>
        <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 divide-y divide-border/30">
          {marketData.map((item) => (
            <div key={item.name} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-foreground">{item.value}</p>
              <p className={`text-xs font-medium ${item.positive ? "text-success" : "text-destructive"}`}>
                {item.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mt-4 mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Quick Actions</h3>
        <div className="flex gap-2">
          {[
            { icon: Zap, label: "Invest Now", action: () => setShowActionPicker("invest") },
            { icon: Gamepad2, label: "VStock", action: () => navigate({ to: "/vstock" }) },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 hover:bg-primary/5 transition">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-foreground font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
