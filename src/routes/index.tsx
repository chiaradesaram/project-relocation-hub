import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import { Link } from "@tanstack/react-router";
import { Bell, BarChart2, Receipt, PieChart, X, Plus, Minus, Gamepad2, ChevronRight, Coins, Eye, FileText, HelpCircle, Sparkles, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const portfolioItems = [
  {
    name: "Unit Trusts", value: "2,450,000", earnings30d: "+10,500",
    icon: PieChart, path: "/unit-trusts", percentage: 30, color: "oklch(0.6 0.2 260)",
    status: null as string | null,
  },
  {
    name: "Equities", value: "1,820,000", earnings30d: "+22,750",
    icon: BarChart2, path: "/invest?product=equities", percentage: 30, color: "oklch(0.55 0.25 290)",
    status: null as string | null,
  },
  {
    name: "Treasuries", value: null, earnings30d: null,
    icon: Receipt, path: "/invest?product=treasuries", percentage: 40, color: "oklch(0.6 0.2 350)",
    status: "In Approval" as string | null,
  },
];

const marketData = [
  { name: "ASPI", value: "12,845.32", change: "+1.2%", positive: true },
  { name: "S&P SL20", value: "4,231.10", change: "-0.3%", positive: false },
  { name: "91-Day T-Bill", value: "9.85%", change: "+0.05%", positive: true },
];

function Dashboard() {
  const navigate = useNavigate();
  const [showActionPicker, setShowActionPicker] = useState<"invest" | "redeem" | null>(null);
  // Demo flag — would come from user/account state in production
  const [isFirstTimeInvestor, setIsFirstTimeInvestor] = useState(true);

  const productOptions = [
    { icon: PieChart, label: "Unit Trusts", param: "unit-trust" },
    { icon: BarChart2, label: "Equities", param: "equities" },
    { icon: Receipt, label: "Treasuries", param: "treasuries" },
  ];

  const WidgetMenu = () => (
    <button
      onClick={(e) => e.stopPropagation()}
      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground transition"
      aria-label="More options"
    >
      <MoreHorizontal className="h-3.5 w-3.5" />
    </button>
  );

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
                  if (showActionPicker === "redeem") {
                    navigate({ to: "/redeem", search: { product: param } });
                  } else {
                    navigate({ to: "/invest", search: { product: param } });
                  }
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
        <div className="flex items-center gap-1.5">
          <Link
            to="/help"
            search={{ topic: "general" }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Link>
          <button onClick={() => navigate({ to: "/profile" })} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div
        className="relative mx-4 mt-1.5 overflow-hidden rounded-2xl px-5 pt-5 pb-4 shadow-sm"
        style={{
          background: "linear-gradient(160deg, oklch(0.35 0.12 285), oklch(0.25 0.08 285))",
        }}
      >
        <p className="text-[11px] font-medium text-white/60 tracking-wide text-center">Total Portfolio Value</p>
        <h2 className="mt-2 text-center text-[32px] font-bold tracking-tight text-white leading-none">
          LKR 7,370,000
        </h2>
        <p className="mt-1.5 text-center text-[12px] text-[oklch(0.88_0.18_155)] font-medium">
          +LKR 662,000 · 7.8%
          <span className="text-white/45 font-normal"> for month</span>
        </p>
      </div>

      {isFirstTimeInvestor && (
        <div className="mx-4 mt-2">
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-primary/15 backdrop-blur-md p-3.5">
            <button
              onClick={() => setIsFirstTimeInvestor(false)}
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background/30 text-muted-foreground hover:text-foreground transition"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              onClick={() => navigate({ to: "/get-started" })}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary/60">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <div className="min-w-0 flex-1 pr-5">
                <p className="text-[12px] font-semibold text-foreground leading-tight">New here? Let's get you started</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                  Not sure what to invest in? Take a 30-second quiz to find a fund that fits you.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            </button>
          </div>
        </div>
      )}

      {/* Invest / Redeem buttons under hero */}
      <div className="mx-4 mt-2.5 flex gap-2">
        <button
          onClick={() => setShowActionPicker("invest")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 transition hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
          <span className="text-[12px] font-semibold text-primary-foreground">Invest</span>
        </button>
        <button
          onClick={() => setShowActionPicker("redeem")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted/40 py-2.5 transition hover:bg-muted/60"
        >
          <Minus className="h-3.5 w-3.5 text-foreground" strokeWidth={3} />
          <span className="text-[12px] font-semibold text-foreground">Redeem</span>
        </button>
      </div>

      {/* Portfolio card – purple style */}
      <div className="mx-4 mt-3.5">
        <div
          className="rounded-2xl overflow-hidden p-3.5"
          style={{ background: "oklch(0.45 0.18 285)" }}
        >
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="text-[15px] font-semibold text-white">Portfolio</h3>
            <WidgetMenu />
          </div>
          <div className="flex flex-col gap-2">
            {portfolioItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate({ to: item.path })}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 transition hover:brightness-110"
                  style={{ background: "oklch(0.50 0.16 285)" }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: item.color }}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left leading-tight">
                    <p className="text-[13px] font-semibold text-white">{item.name}</p>
                    <p className="text-[12px] text-white/85 mt-0.5">
                      {item.value ? `LKR ${item.value}` : "Pending"}
                      {item.earnings30d && (
                        <span className="ml-1.5 text-[oklch(0.88_0.18_155)] font-medium">{item.earnings30d}</span>
                      )}
                    </p>
                  </div>
                  {item.status && (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70">
                      {item.status}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3.5">
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5">
            <h3 className="text-[13px] font-medium text-muted-foreground">Market overview</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate({ to: "/rates" })} className="text-[12px] font-medium text-primary hover:brightness-110 transition">View all</button>
              <WidgetMenu />
            </div>
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

      <div className="mx-4 mt-3.5 mb-3">
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden p-2.5">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <h3 className="text-[13px] font-medium text-muted-foreground">Quick actions</h3>
            <WidgetMenu />
          </div>
          <div className="flex gap-1.5">
            {[
              { icon: Gamepad2, label: "VStock", action: () => navigate({ to: "/vstock" }) },
              { icon: Coins, label: "Dividends", action: () => navigate({ to: "/transactions" }) },
              { icon: Eye, label: "Watchlist", action: () => navigate({ to: "/invest" }) },
              { icon: FileText, label: "Research", action: () => navigate({ to: "/learn" }) },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border/40 bg-card/30 px-1 py-2.5 transition hover:bg-primary/5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[9.5px] font-normal text-foreground whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
