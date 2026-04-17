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
    name: "Treasuries", value: null, earnings30d: null,
    icon: Receipt, path: "/invest?product=treasuries", percentage: 42, color: "oklch(0.6 0.2 350)",
    status: "Continue application" as string | null,
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

      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <div>
          <p className="text-[10px] text-muted-foreground/80">Good morning</p>
          <h1 className="text-base font-semibold text-foreground">CAL Online</h1>
        </div>
        <button onClick={() => navigate({ to: "/profile" })} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="mx-4 mt-1.5 rounded-2xl border border-primary/10 bg-card/80 p-4 backdrop-blur-md">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Total Portfolio</p>
        <div className="mt-1.5 flex items-center gap-3">
          <DonutChart items={portfolioItems} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium tracking-tight text-foreground">LKR 7,370,000</h2>
            <p className="mt-0.5 text-[11px]">
              <span className="font-normal text-success">+7.8%</span>
              <span className="text-muted-foreground/80"> · LKR 662,000 all time</span>
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5">
              {portfolioItems.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] text-muted-foreground/80">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invest / Redeem pills */}
      <div className="mx-4 mt-2 flex gap-2">
        <button
          onClick={() => setShowActionPicker("invest")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card/50 border border-border/20 backdrop-blur-md py-2 transition hover:bg-muted/10"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          <span className="text-[11px] font-normal text-foreground">Invest</span>
        </button>
        <button
          onClick={() => setShowActionPicker("redeem")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card/50 border border-border/20 backdrop-blur-md py-2 transition hover:bg-muted/10"
        >
          <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-normal text-foreground">Redeem</span>
        </button>
      </div>

      <div className="mx-4 mt-2.5">
        <div className="rounded-2xl border border-border/20 bg-card/50 backdrop-blur-md overflow-hidden">
          <h3 className="px-3.5 pt-2.5 pb-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Portfolio</h3>
          <div className="divide-y divide-border/15 border-t border-border/15">
            {portfolioItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate({ to: item.path })}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 transition hover:bg-muted/10"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${item.color}1a` }}>
                    <Icon className="h-3 w-3" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-normal text-foreground">{item.name}</p>
                  </div>
                  {item.status ? (
                    <span className="rounded-full bg-[oklch(0.55_0.2_250)]/20 px-2 py-0.5 text-[10px] font-normal text-[oklch(0.75_0.15_250)]">
                      {item.status}
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2 text-right">
                      <p className="text-[12px] font-normal text-foreground">LKR {item.value}</p>
                      <p className="text-[10px] font-normal text-success">{item.earnings30d}</p>
                    </div>
                  )}
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-2.5">
        <div className="rounded-2xl border border-border/20 bg-card/50 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5">
            <h3 className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Market Overview</h3>
            <button onClick={() => navigate({ to: "/rates" })} className="text-[9px] font-normal text-primary/80">See All</button>
          </div>
          <div className="divide-y divide-border/15 border-t border-border/15">
            {marketData.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-3.5 py-1.5">
                <p className="text-[12px] font-normal text-foreground">{item.name}</p>
                <p className="text-[12px] font-normal text-muted-foreground">{item.value}</p>
                <p className={`text-[10px] font-normal ${item.positive ? "text-success" : "text-destructive"}`}>
                  {item.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-2.5 mb-3">
        <div className="rounded-2xl border border-border/20 bg-card/50 backdrop-blur-md overflow-hidden p-2.5">
          <h3 className="px-1 pb-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Quick Actions</h3>
          <div className="flex gap-2">
            {[
              { icon: Zap, label: "Invest Now", action: () => setShowActionPicker("invest") },
              { icon: Gamepad2, label: "VStock", action: () => navigate({ to: "/vstock" }) },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border/20 bg-card/30 p-2.5 transition hover:bg-primary/5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-normal text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
