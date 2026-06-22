import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import { Link } from "@tanstack/react-router";
import { Bell, BarChart2, Receipt, PieChart, X, Plus, Minus, Gamepad2, ChevronRight, Coins, Eye, FileText, HelpCircle, Sparkles, MoreHorizontal, EyeOff, Settings2, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    icon: BarChart2, path: "/invest?product=equities", percentage: 30, color: "oklch(0.55 0.25 280)",
    status: null as string | null,
  },
  {
    name: "Treasuries", value: null, earnings30d: null,
    icon: Receipt, path: "/invest?product=treasuries", percentage: 40, color: "oklch(0.6 0.2 350)",
    status: "In Approval" as string | null,
  },
];

const watchlist = [
  { symbol: "JKH", price: "325.50", change: "+2.4%", positive: true },
  { symbol: "COMB", price: "142.00", change: "+1.8%", positive: true },
  { symbol: "HNB", price: "268.75", change: "-0.5%", positive: false },
];

const aspiSeries = [12620, 12690, 12655, 12780, 12845];

const RATE_CATALOG: { id: string; name: string; short: string; rate: string; tenor: string }[] = [
  { id: "fiof",   name: "Fixed Income Opportunity Fund", short: "FI Opportunity", rate: "11.25%", tenor: "30d yield" },
  { id: "tbill91",name: "91-Day Treasury Bill",          short: "91-Day T-Bill",  rate: "9.85%",  tenor: "Latest auction" },
  { id: "tbill364",name:"364-Day Treasury Bill",         short: "364-Day T-Bill", rate: "10.45%", tenor: "Latest auction" },
  { id: "cmm",    name: "CAL Money Market Fund",         short: "Money Market",   rate: "8.95%",  tenor: "30d yield" },
  { id: "cif",    name: "CAL Income Fund",               short: "Income Fund",    rate: "9.85%",  tenor: "30d yield" },
  { id: "cbf",    name: "CAL Balanced Fund",             short: "Balanced Fund",  rate: "9.20%",  tenor: "30d yield" },
  { id: "cgf",    name: "CAL Growth Fund",               short: "Growth Fund",    rate: "12.50%", tenor: "30d yield" },
];
const DEFAULT_RATES = ["fiof", "tbill91", "cmm"];
const RATES_KEY = "dashboard.trackedRates.v1";

const QUICK_ACTION_CATALOG: { id: string; label: string; icon: typeof Gamepad2; to: string }[] = [
  { id: "vstock",     label: "VStock",     icon: Gamepad2,   to: "/vstock" },
  { id: "dividends",  label: "Dividends",  icon: Coins,      to: "/transactions" },
  { id: "watchlist",  label: "Watchlist",  icon: Eye,        to: "/invest" },
  { id: "research",   label: "Research",   icon: FileText,   to: "/learn" },
  { id: "learn",      label: "Learn",      icon: Sparkles,   to: "/learn" },
  { id: "help",       label: "Help",       icon: HelpCircle, to: "/help" },
  { id: "rates",      label: "Rates",      icon: TrendingUp, to: "/invest" },
  { id: "txns",       label: "Activity",   icon: Receipt,    to: "/transactions" },
];
const DEFAULT_QUICK_ACTIONS = ["vstock", "dividends", "watchlist"];
const QUICK_KEY = "dashboard.quickActions.v1";

const recentTransactions = [
  { id: "t1", kind: "invest" as const, name: "CAL Income Fund",   sub: "Today, 10:42",   amount: "-LKR 250,000" },
  { id: "t2", kind: "redeem" as const, name: "Money Market Fund", sub: "Yesterday",      amount: "+LKR 75,000"  },
  { id: "t3", kind: "invest" as const, name: "91-Day T-Bill",     sub: "May 14",         amount: "-LKR 500,000" },
];

type WidgetKey = "portfolio" | "watchlist" | "aspi" | "rates" | "transactions" | "quick";
const ALL_WIDGETS: { key: WidgetKey; label: string }[] = [
  { key: "portfolio", label: "Portfolio" },
  { key: "watchlist", label: "Watchlist" },
  { key: "aspi", label: "ASPI snapshot" },
  { key: "rates", label: "Rates to watch" },
  { key: "transactions", label: "Latest transactions" },
  { key: "quick", label: "Quick actions" },
];
const STORAGE_KEY = "dashboard.hiddenWidgets.v1";

function Dashboard() {
  const navigate = useNavigate();
  const [showActionPicker, setShowActionPicker] = useState<"invest" | "redeem" | null>(null);
  // Demo flag — would come from user/account state in production
  const [isFirstTimeInvestor, setIsFirstTimeInvestor] = useState(true);
  const [hidden, setHidden] = useState<Set<WidgetKey>>(new Set());
  const [customizing, setCustomizing] = useState(false);
  const [trackedRates, setTrackedRates] = useState<string[]>(DEFAULT_RATES);
  const [editingRates, setEditingRates] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>(DEFAULT_QUICK_ACTIONS);
  const [editingQuick, setEditingQuick] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setHidden(new Set(JSON.parse(raw)));
      const r = typeof window !== "undefined" ? window.localStorage.getItem(RATES_KEY) : null;
      if (r) setTrackedRates(JSON.parse(r));
      const q = typeof window !== "undefined" ? window.localStorage.getItem(QUICK_KEY) : null;
      if (q) setQuickActions(JSON.parse(q));
    } catch {}
  }, []);

  const persist = (next: Set<WidgetKey>) => {
    setHidden(new Set(next));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {}
  };
  const hideWidget = (k: WidgetKey) => { const n = new Set(hidden); n.add(k); persist(n); };
  const showWidget = (k: WidgetKey) => { const n = new Set(hidden); n.delete(k); persist(n); };
  const isVisible = (k: WidgetKey) => !hidden.has(k);

  const persistRates = (next: string[]) => {
    setTrackedRates(next);
    try { window.localStorage.setItem(RATES_KEY, JSON.stringify(next)); } catch {}
  };
  const toggleRate = (id: string) => {
    if (trackedRates.includes(id)) persistRates(trackedRates.filter((x) => x !== id));
    else persistRates([...trackedRates, id]);
  };

  const persistQuick = (next: string[]) => {
    setQuickActions(next);
    try { window.localStorage.setItem(QUICK_KEY, JSON.stringify(next)); } catch {}
  };
  const toggleQuick = (id: string) => {
    if (quickActions.includes(id)) persistQuick(quickActions.filter((x) => x !== id));
    else persistQuick([...quickActions, id]);
  };

  const productOptions = [
    { icon: PieChart, label: "Unit Trusts", param: "unit-trust" },
    { icon: BarChart2, label: "Equities", param: "equities" },
    { icon: Receipt, label: "Treasuries", param: "treasuries" },
  ];

  const WidgetMenu = ({ widget, tone = "muted" }: { widget: WidgetKey; tone?: "muted" | "light" }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
            tone === "light"
              ? "text-white/60 hover:bg-white/10 hover:text-white"
              : "text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground"
          }`}
          aria-label="Widget options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => hideWidget(widget)} className="text-xs">
          <EyeOff className="mr-2 h-3.5 w-3.5" /> Hide widget
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCustomizing(true)} className="text-xs">
          <Settings2 className="mr-2 h-3.5 w-3.5" /> Customize dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ASPI sparkline geometry
  const sparkW = 96, sparkH = 32;
  const sMin = Math.min(...aspiSeries), sMax = Math.max(...aspiSeries);
  const sRange = sMax - sMin || 1;
  const sparkPoints = aspiSeries.map((v, i) => {
    const x = (i / (aspiSeries.length - 1)) * sparkW;
    const y = sparkH - ((v - sMin) / sRange) * sparkH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const aspiPositive = aspiSeries[aspiSeries.length - 1] >= aspiSeries[0];

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

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex items-center gap-2.5 -ml-1 pr-2 py-1 rounded-full transition hover:bg-muted/30"
          aria-label="Profile"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.22_290)] text-[12px] font-semibold text-primary-foreground">
            CO
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10.5px] text-muted-foreground/80">Good morning</span>
            <span className="text-[13.5px] font-semibold text-foreground -mt-0.5">CAL Online</span>
          </span>
        </button>
        <div className="flex items-center -mr-1">
          <Link
            to="/help"
            search={{ topic: "general" }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Link>
          <button
            onClick={() => navigate({ to: "/notifications" })}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent-magenta ring-2 ring-background" />
          </button>
        </div>
      </div>

      <div
        className="relative mx-4 mt-1.5 overflow-hidden rounded-2xl px-5 pt-5 pb-4 shadow-sm"
        style={{
          background: "oklch(0.34 0.10 275)",
        }}
      >
        <p className="text-[12px] font-medium text-white/60 tracking-wide text-center">Total Portfolio Value</p>
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
          <div className="relative overflow-hidden rounded-2xl bg-primary/15 backdrop-blur-md p-3.5">
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pill py-2.5 transition hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5 text-pill-foreground" strokeWidth={3} />
          <span className="text-[12px] font-semibold text-pill-foreground">Invest</span>
        </button>
        <button
          onClick={() => setShowActionPicker("redeem")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pill/15 py-2.5 transition hover:bg-pill/25"
        >
          <Minus className="h-3.5 w-3.5 text-pill" strokeWidth={3} />
          <span className="text-[12px] font-semibold text-pill">Redeem</span>
        </button>
      </div>

      {/* Portfolio card – purple style */}
      {isVisible("portfolio") && (
      <div className="mx-4 mt-3.5">
        <div
          className="rounded-2xl overflow-hidden p-3.5"
          style={{ background: "oklch(0.32 0.12 275)" }}
        >
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="text-[15px] font-semibold text-white">Portfolio</h3>
            <WidgetMenu widget="portfolio" tone="light" />
          </div>
          <div className="flex flex-col gap-2">
            {portfolioItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate({ to: item.path })}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 transition hover:brightness-110"
                  style={{ background: "oklch(0.40 0.12 275)" }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: item.color }}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-semibold text-white leading-tight">{item.name}</p>
                    {item.earnings30d && (
                      <p className="text-[12px] font-medium text-[oklch(0.88_0.18_155)] mt-0.5 leading-tight">
                        {item.earnings30d}
                      </p>
                    )}
                  </div>
                  {item.status ? (
                    <span className="rounded-full bg-accent-cyan/15 px-2.5 py-0.5 text-[12px] font-medium text-accent-cyan">
                      {item.status}
                    </span>
                  ) : (
                    <p className="shrink-0 text-[13px] font-semibold text-white">
                      {item.value ? `LKR ${item.value}` : "Pending"}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Quick actions */}
      {isVisible("quick") && (
      <div className="mx-4 mt-3.5">
        <div className="rounded-2xl bg-card backdrop-blur-md overflow-hidden p-2.5">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <h3 className="text-[13px] font-medium text-muted-foreground">Quick actions</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingQuick(true)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
                aria-label="Customize quick actions"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
              <WidgetMenu widget="quick" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {quickActions
              .map((id) => QUICK_ACTION_CATALOG.find((a) => a.id === id))
              .filter((a): a is (typeof QUICK_ACTION_CATALOG)[number] => Boolean(a))
              .map(({ id, icon: Icon, label, to }) => (
                <button
                  key={id}
                  onClick={() => navigate({ to })}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-1 py-3 transition hover:bg-primary/20 hover:border-primary/40"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[12px] font-medium text-foreground whitespace-nowrap">{label}</span>
                </button>
              ))}
            {quickActions.length < 8 && (
              <button
                onClick={() => setEditingQuick(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 bg-card/30 px-1 py-3 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12px] font-normal text-muted-foreground whitespace-nowrap">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Watchlist */}
      {isVisible("watchlist") && (
        <div className="mx-4 mt-3.5">
          <div className="rounded-2xl overflow-hidden p-3.5" style={{ background: "oklch(0.28 0.05 275)" }}>
            <div className="flex items-center justify-between pb-2.5">
              <h3 className="text-[15px] font-semibold text-white">Watchlist</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate({ to: "/invest" })}
                  className="text-[12px] font-medium text-[oklch(0.78_0.16_295)] hover:brightness-110 transition"
                >
                  Manage
                </button>
                <WidgetMenu widget="watchlist" tone="light" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {watchlist.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => navigate({ to: "/invest" })}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-[oklch(0.85_0.12_295)]"
                    style={{ background: "oklch(0.38 0.10 275)" }}
                  >
                    {s.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13.5px] font-semibold text-white leading-tight">{s.symbol}</p>
                    <p className="text-[12px] text-white/55 mt-0.5">LKR {s.price}</p>
                  </div>
                  <p className={`text-[13px] font-semibold ${s.positive ? "text-[oklch(0.85_0.18_155)]" : "text-[oklch(0.72_0.20_25)]"}`}>
                    {s.change}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASPI snapshot */}
      {isVisible("aspi") && (
        <div className="mx-4 mt-3.5">
          <button
            onClick={() => navigate({ to: "/rates" })}
            className="w-full text-left rounded-2xl bg-card backdrop-blur-md overflow-hidden p-3.5 transition hover:bg-card/70"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-muted-foreground">ASPI</span>
                <span className={`flex items-center gap-0.5 text-[12px] font-semibold ${aspiPositive ? "text-success" : "text-destructive"}`}>
                  {aspiPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  +1.2%
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <WidgetMenu widget="aspi" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[20px] font-bold text-foreground leading-none">12,845.32</p>
                <p className="text-[10.5px] text-muted-foreground mt-1.5">
                  Turnover <span className="text-foreground font-medium">LKR 2.84B</span>
                </p>
                <p className="text-[12px] text-muted-foreground/80 mt-0.5">Last 5 days</p>
              </div>
              <svg width={sparkW} height={sparkH} className="shrink-0 overflow-visible">
                <defs>
                  <linearGradient id="aspiGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={aspiPositive ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.22 25)"} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={aspiPositive ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.22 25)"} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,${sparkH} ${sparkPoints} ${sparkW},${sparkH}`} fill="url(#aspiGrad)" />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke={aspiPositive ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.22 25)"}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Rates to watch */}
      {isVisible("rates") && (
        <div className="mx-4 mt-3.5">
          <div className="rounded-2xl overflow-hidden p-3.5" style={{ background: "oklch(0.28 0.05 275)" }}>
            <div className="flex items-center justify-between pb-2.5">
              <h3 className="text-[15px] font-semibold text-white">Rates to watch</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingRates(true)}
                  className="text-[12px] font-medium text-[oklch(0.78_0.16_295)] hover:brightness-110 transition"
                >
                  Edit
                </button>
                <WidgetMenu widget="rates" tone="light" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {trackedRates
                .map((id) => RATE_CATALOG.find((r) => r.id === id))
                .filter((r): r is (typeof RATE_CATALOG)[number] => !!r)
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate({ to: "/rates" })}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
                  >
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight truncate">{r.short}</p>
                      <p className="text-[12px] text-white/55 mt-0.5">{r.tenor}</p>
                    </div>
                    <p className="text-[14px] font-semibold text-white tabular-nums">{r.rate}</p>
                  </button>
                ))}
              <button
                onClick={() => setEditingRates(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Add rate to track"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-[12px] font-medium">Add rate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Latest transactions */}
      {isVisible("transactions") && (
        <div className="mx-4 mt-3.5">
          <div className="rounded-2xl bg-card backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5">
              <h3 className="text-[13px] font-medium text-muted-foreground">Latest transactions</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate({ to: "/transactions" })} className="text-[12px] font-medium text-primary hover:brightness-110 transition">See all</button>
                <WidgetMenu widget="transactions" />
              </div>
            </div>
            <div className="divide-y divide-border/15 border-t border-border/15">
              {recentTransactions.slice(0, 2).map((t) => {
                const isInvest = t.kind === "invest";
                const Icon = isInvest ? ArrowUpRight : ArrowDownLeft;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate({ to: "/transactions" })}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 transition hover:bg-primary/5"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isInvest ? "bg-primary/15 text-primary" : "bg-[oklch(0.85_0.18_155)]/15 text-[oklch(0.78_0.18_155)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[12.5px] font-medium text-foreground leading-tight truncate">{t.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{t.sub}</p>
                    </div>
                    <p className={`text-[12.5px] font-semibold ${isInvest ? "text-foreground" : "text-[oklch(0.78_0.18_155)]"}`}>
                      {t.amount}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* Customize entry */}
      <div className="mx-4 mt-2 mb-4 flex justify-center">
        <button
          onClick={() => setCustomizing(true)}
          className="flex items-center gap-1.5 rounded-full bg-muted/30 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
        >
          <Settings2 className="h-3 w-3" />
          Customize dashboard
        </button>
      </div>

      {customizing && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCustomizing(false)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Customize dashboard</h3>
              <button onClick={() => setCustomizing(false)} className="rounded-full bg-secondary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-[11.5px] text-muted-foreground">Choose which widgets appear on your dashboard.</p>
            <div className="flex flex-col gap-2">
              {ALL_WIDGETS.map((w) => {
                const visible = !hidden.has(w.key);
                return (
                  <button
                    key={w.key}
                    onClick={() => (visible ? hideWidget(w.key) : showWidget(w.key))}
                    className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 transition hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium text-foreground">{w.label}</span>
                    <span
                      className={`relative h-5 w-9 rounded-full transition ${visible ? "bg-primary" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${visible ? "left-[18px]" : "left-0.5"}`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {editingQuick && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditingQuick(false)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Quick actions</h3>
              <button onClick={() => setEditingQuick(false)} className="rounded-full bg-secondary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-[11.5px] text-muted-foreground">Pick the shortcuts you want on your dashboard.</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTION_CATALOG.map((a) => {
                const on = quickActions.includes(a.id);
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleQuick(a.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-3 transition ${
                      on ? "bg-primary/15 ring-1 ring-primary/40" : "bg-secondary hover:bg-muted/50"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${on ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-left text-sm font-medium text-foreground">{a.label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        on ? "bg-primary text-primary-foreground" : "bg-muted/60 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {editingRates && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditingRates(false)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Track rates</h3>
              <button onClick={() => setEditingRates(false)} className="rounded-full bg-secondary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-[11.5px] text-muted-foreground">Pick the product rates you want to see on your dashboard.</p>
            <div className="flex flex-col gap-2">
              {RATE_CATALOG.map((r) => {
                const on = trackedRates.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRate(r.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition ${
                      on ? "bg-primary/15 ring-1 ring-primary/40" : "bg-secondary hover:bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">{r.tenor} · {r.rate}</p>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        on ? "bg-primary text-primary-foreground" : "bg-muted/60 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
