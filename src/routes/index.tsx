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
    name: "Unit Trusts", value: "2,450,000", earnings30d: "+10,500",
    icon: PieChart, path: "/unit-trusts", percentage: 33, color: "oklch(0.6 0.2 260)",
    status: null as string | null,
  },
  {
    name: "Equities", value: "1,820,000", earnings30d: "+22,750",
    icon: BarChart2, path: "/invest?product=equities", percentage: 25, color: "oklch(0.55 0.25 290)",
    status: null as string | null,
  },
  {
    name: "Treasuries", value: "3,100,000", earnings30d: "+12,710",
    icon: Receipt, path: "/invest?product=treasuries", percentage: 42, color: "oklch(0.6 0.2 350)",
    status: "Submitted" as string | null,
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
      {showActionPicker && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowActionPicker(null)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {showActionPicker === "invest" ? "What would you like to invest in?" : "What would you like to redeem?"}
              </h3>
              <button onClick={() => setShowActionPicker(null)} className="rounded-full bg-secondary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            {productOptions.map(({ icon: Icon, label, param }) => (
              <button
                key={param}
                onClick={() => {
                  setShowActionPicker(null);
                  navigate({ to: "/invest", search: { product: param, action: showActionPicker === "redeem" ? "redeem" : undefined } });
                }}
                className="mb-2 flex w-full items-center gap-3 rounded-xl bg-secondary p-4 transition hover:bg-muted/50"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-xs text-muted-foreground">Good morning</p>
          <h1 className="text-xl font-bold text-foreground">CAL Online</h1>
        </div>
        <button onClick={() => navigate({ to: "/profile" })} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mx-4 mt-2 rounded-2xl border border-primary/15 bg-card/90 p-5 backdrop-blur-md">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Portfolio</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowActionPicker("invest")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary transition hover:bg-muted/50"
              title="Invest"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
            </button>
            <button
              onClick={() => setShowActionPicker("redeem")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary transition hover:bg-muted/50"
              title="Redeem"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <DonutChart items={portfolioItems} />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">LKR 7,370,000</h2>
            <p className="mt-1 text-xs">
              <span className="font-medium text-success">+7.8%</span>
              <span className="text-muted-foreground"> · LKR 662,000 all time</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {portfolioItems.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio</h3>
        <div className="divide-y divide-border/30 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md">
          {portfolioItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate({ to: item.path })}
                className="flex w-full items-center gap-3 px-4 py-3 transition hover:bg-muted/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${item.color}1a` }}>
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  {item.status && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                        {item.status}
                      </span>
                      <span className="text-[10px] text-primary">Track application →</span>
                    </div>
                  )}
                </div>
                <div className="mr-1 flex shrink-0 items-center gap-3 text-right">
                  <p className="text-sm font-medium text-foreground">LKR {item.value}</p>
                  <p className="text-xs font-medium text-success">{item.earnings30d}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Overview</h3>
          <button onClick={() => navigate({ to: "/rates" })} className="text-[10px] font-medium text-primary">See All</button>
        </div>
        <div className="divide-y divide-border/30 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md">
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

      <div className="mx-4 mt-4 mb-4">
        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
        <div className="flex gap-2">
          {[
            { icon: Zap, label: "Invest Now", action: () => setShowActionPicker("invest") },
            { icon: Gamepad2, label: "VStock", action: () => navigate({ to: "/vstock" }) },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl border border-border/30 bg-card/60 p-3 backdrop-blur-md transition hover:bg-primary/5">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
