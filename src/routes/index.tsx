import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownToLine, BarChart2, Bell, ChevronRight, Eye, FileText, Gamepad2, HelpCircle, Landmark, Percent, PieChart, Plus, ReceiptText, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { MoversCard, RatesCard, TransactionsCard, UtFundsCard } from "@/components/DashboardWidgets";
import { ReorderSheet } from "@/components/ReorderSheet";
import { DEFAULT_PREFS, QUICK_LINK_LABELS, WIDGET_LABELS, loadDashboardPrefs, saveDashboardPrefs, toggleItem, type DashboardPrefs, type QuickLinkId, type WidgetId } from "@/lib/dashboardPrefs";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Your Investments — CAL" },
    { name: "description", content: "Your CAL investments, portfolio, quick links and market watchlist in one overview." },
    { property: "og:title", content: "Your Investments — CAL" },
    { property: "og:description", content: "Your CAL investments, portfolio, quick links and market watchlist in one overview." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Dashboard,
});

const products = [
  { name: "Unit Trusts", short: "UT", amount: "3,680,000", allocation: "50%", icon: PieChart, tone: "bg-pill text-pill-foreground", dot: "bg-pill", product: "unit-trust" },
  { name: "Equities", short: "EQ", amount: "2,210,000", allocation: "30%", icon: BarChart2, tone: "bg-accent-purple text-foreground", dot: "bg-accent-purple", product: "equities" },
  { name: "Treasuries", short: "TB", amount: "1,480,000", allocation: "20%", icon: Landmark, tone: "bg-allocation-treasuries text-foreground", dot: "bg-allocation-treasuries", product: "treasuries" },
];
const stocks = [
  { symbol: "JKH", name: "John Keells", price: "325.50", change: "+2.4%", positive: true, tone: "text-allocation-treasuries" },
  { symbol: "COMB", name: "Commercial Bank", price: "142.00", change: "+1.8%", positive: true, tone: "text-pill" },
  { symbol: "HNB", name: "Hatton National Bank", price: "268.75", change: "−0.5%", positive: false, tone: "text-accent-purple" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [action, setAction] = useState<"invest" | "redeem" | null>(null);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [prefs, setPrefs] = useState<DashboardPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  useEffect(() => {
    setPrefs(loadDashboardPrefs());
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (prefsLoaded) saveDashboardPrefs(prefs);
  }, [prefs, prefsLoaded]);
  useEffect(() => {
    if (!action) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setAction(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [action]);

  const openProduct = (product: string) => {
    if (product === "unit-trust") navigate({ to: "/unit-trusts" });
    else navigate({ to: "/invest", search: { product } });
  };

  const quickLinkCatalog: Record<QuickLinkId, { label: string; icon: LucideIcon; run: () => void }> = {
    invest: { label: "Invest", icon: Plus, run: () => setAction("invest") },
    redeem: { label: "Redeem", icon: ArrowDownToLine, run: () => setAction("redeem") },
    vstock: { label: "VStock", icon: Gamepad2, run: () => navigate({ to: "/vstock" }) },
    watchlist: { label: "Watchlist", icon: Eye, run: () => document.getElementById("watchlist-title")?.scrollIntoView({ behavior: "smooth", block: "center" }) },
    rates: { label: "Rates", icon: Percent, run: () => navigate({ to: "/rates" }) },
    transactions: { label: "Transactions", icon: ReceiptText, run: () => navigate({ to: "/transactions" }) },
    requests: { label: "Requests", icon: FileText, run: () => navigate({ to: "/requests" }) },
    help: { label: "Help", icon: HelpCircle, run: () => navigate({ to: "/help", search: { topic: "general" } }) },
  };

  const visibleWidgets = prefs.widgetOrder.filter((id) => !prefs.hiddenWidgets.includes(id));
  const visibleLinks = prefs.quickLinkOrder.filter((id) => !prefs.hiddenQuickLinks.includes(id));

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "portfolio":
        return (
          <section key={id} aria-label="Portfolio" className="py-0.5">
            <div className="space-y-1.5">
              {products.map(({ name, amount, icon: Icon, tone, product }) => (
                <Button key={name} variant="ghost" onClick={() => openProduct(product)} className="h-auto min-h-14 w-full justify-start gap-2.5 rounded-xl bg-secondary/60 px-3.5 py-2.5 hover:bg-secondary">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tone}`}><Icon className="size-3.5" /></span>
                  <span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-semibold">{name}</span></span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground/85"><span className="font-normal text-foreground/60">LKR </span>{amount}</span>
                  <ChevronRight className="size-3.5 text-foreground/50" />
                </Button>
              ))}
            </div>
          </section>
        );
      case "quickLinks":
        return (
          <section key={id} aria-labelledby="links-title" className="border-b border-border/40 pb-4 pt-1">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 id="links-title" className="text-sm font-semibold">Quick links</h2>
              <Button variant="ghost" size="icon" className="size-6 text-foreground/65" aria-label="Customise quick links" onClick={() => setLinksOpen(true)}><SlidersHorizontal /></Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {visibleLinks.map((id) => {
                const link = quickLinkCatalog[id];
                const Icon = link.icon;
                return (
                  <Button key={id} variant="ghost" onClick={link.run} className="h-auto flex-col gap-2 rounded-lg p-1 hover:bg-secondary/40">
                    <span className="flex size-10 items-center justify-center rounded-full bg-pill text-pill-foreground"><Icon /></span>
                    <span className="text-xs font-semibold">{link.label}</span>
                  </Button>
                );
              })}
            </div>
          </section>
        );
      case "transactions":
        return <TransactionsCard key={id} />;
      case "aspi":
        return (
          <section key={id} aria-label="ASPI market overview" className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl bg-card/60 px-4 py-3">
            <div><div className="mb-1 flex items-center gap-2"><h2 className="text-xs font-semibold">ASPI</h2><span className="rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-semibold text-success">+1.2%</span></div><p className="text-sm font-bold tabular-nums">12,845.32</p><p className="mt-1 text-xs text-foreground/65">Turnover <span className="font-semibold text-foreground/85">LKR 2.84B</span></p></div>
            <div className="min-w-0"><svg viewBox="0 0 200 50" className="h-12 w-full text-success" role="img" aria-label="ASPI sample trend for the last five days"><path d="M2 42 L20 35 L38 38 L56 25 L75 28 L94 18 L112 22 L132 12 L151 16 L174 10 L198 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg><div className="mt-1 flex justify-between text-[10px] text-foreground/60"><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span></div></div>
          </section>
        );
      case "watchlist":
        return (
          <section key={id} aria-labelledby="watchlist-title" className="pt-1">
            <div className="mb-1 flex items-center justify-between px-1"><h2 id="watchlist-title" className="text-sm font-semibold">Watchlist</h2><Button variant="ghost" size="icon" className="size-6 text-foreground/65" aria-label={watchlistOpen ? "Done editing watchlist" : "Customise watchlist"} onClick={() => setWatchlistOpen(!watchlistOpen)}><SlidersHorizontal /></Button></div>
            <div className="divide-y divide-border/45">
              {stocks.map((stock) => <Button key={stock.symbol} variant="ghost" className="h-auto min-h-16 w-full justify-start gap-3 rounded-none px-1 py-2.5 hover:bg-card/50" onClick={() => navigate({ to: "/invest", search: { product: "equities" } })}><span className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-bold ${stock.tone}`}>{stock.symbol === "COMB" ? "C" : stock.symbol === "HNB" ? "H" : "JK"}</span><span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-semibold">{stock.symbol}</span><span className="block truncate text-xs font-normal text-foreground/65">{stock.name}</span></span><span className="text-right"><span className="block text-[13px] font-semibold tabular-nums">{stock.price}</span><span className={`block text-xs font-semibold ${stock.positive ? "text-success" : "text-destructive"}`}>{stock.change}</span></span><ChevronRight className="size-3.5 text-foreground/45" /></Button>)}
            </div>
            {watchlistOpen && <Button asChild variant="secondary" className="mt-2 w-full text-xs"><Link to="/invest" search={{ product: "equities" }}><Plus />Explore equities</Link></Button>}
          </section>
        );
      case "movers":
        return <MoversCard key={id} />;
      case "utFunds":
        return <UtFundsCard key={id} />;
      case "rates":
        return (
          <RatesCard
            key={id}
            rateOrder={prefs.rateOrder}
            hiddenRates={prefs.hiddenRates}
            onRateOrder={(rateOrder) => setPrefs({ ...prefs, rateOrder })}
            onHiddenRates={(hiddenRates) => setPrefs({ ...prefs, hiddenRates })}
          />
        );
    }
  };

  return (
    <MobileLayout>
      <header className="flex items-center justify-between px-5 pb-3 pt-4">
        <Button variant="ghost" className="h-auto gap-2.5 px-0 hover:bg-transparent" onClick={() => navigate({ to: "/profile" })} aria-label="Profile">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">CS</span>
          <span className="text-left"><span className="block text-xs font-normal text-foreground/70">Good morning</span><span className="block text-sm font-semibold">Chiara</span></span>
        </Button>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="icon" className="rounded-full text-foreground/80" aria-label="Help"><Link to="/help" search={{ topic: "general" }}><HelpCircle /></Link></Button>
          <Button variant="ghost" size="icon" className="relative rounded-full text-foreground/80" onClick={() => navigate({ to: "/notifications" })} aria-label="Notifications"><Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-allocation-treasuries" /></Button>
        </div>
      </header>

      <main className="space-y-3 px-4 pb-5">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="h-auto w-auto max-w-none gap-1.5 px-1 text-xs font-semibold text-pill hover:bg-transparent" onClick={() => setCustomiseOpen(true)}>
            <SlidersHorizontal className="size-3.5 shrink-0" /><span className="whitespace-nowrap">Customise dashboard</span>
          </Button>
        </div>
        <section aria-label="Investment summary" className="rounded-2xl bg-card/70 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-foreground/75">
            <h1>Investments</h1>
          </div>
          <div className="mt-0.5 flex items-baseline gap-2"><p className="text-[28px] font-bold leading-tight tabular-nums text-foreground">7,370,000</p><span className="text-xs font-semibold text-foreground/65">LKR</span></div>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full opacity-45" role="img" aria-label="Allocation: Unit Trusts 50%, Equities 30%, Treasuries 20%"><span className="w-1/2 bg-pill" /><span className="w-[30%] bg-accent-purple" /><span className="w-1/5 bg-allocation-treasuries" /></div>
          <div className="mt-2 flex justify-between">
            {products.map((product) => <span key={product.short} className="flex items-center gap-1.5 text-xs text-foreground/75"><span className={`size-1.5 rounded-full ${product.dot}`} />{product.short}<span className="font-semibold">{product.allocation}</span></span>)}
          </div>
        </section>

        {visibleWidgets.map(renderWidget)}

        <p className="px-1 text-xs text-foreground/50">Illustrative portfolio and market data</p>
      </main>

      {action && <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="action-title"><div className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={() => setAction(null)} /><div className="relative w-full max-w-md rounded-t-3xl bg-card px-7 pb-10 pt-5"><div className="mx-auto mb-5 h-1 w-9 rounded-full bg-foreground/20" /><div className="mb-5 flex items-center justify-between gap-3"><h2 id="action-title" className="text-base font-semibold">{action === "invest" ? "What would you like to invest in?" : "What would you like to redeem?"}</h2><Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-secondary" onClick={() => setAction(null)} aria-label="Close" autoFocus><X /></Button></div><div className="space-y-2">{products.map(({ name, icon: Icon, tone, product }) => <Button key={product} variant="secondary" className="h-16 w-full justify-start gap-3 rounded-xl px-4" onClick={() => { setAction(null); navigate({ to: action === "redeem" ? "/redeem" : "/invest", search: { product } }); }}><span className={`flex size-8 items-center justify-center rounded-full ${tone}`}><Icon /></span><span className="flex-1 text-left">{name}</span><ChevronRight /></Button>)}</div></div></div>}

      {customiseOpen && (
        <ReorderSheet
          title="Customise your dashboard"
          subtitle="Pick the widgets you want to see and arrange them in your order."
          items={prefs.widgetOrder.map((id) => ({ id, label: WIDGET_LABELS[id], on: !prefs.hiddenWidgets.includes(id) }))}
          onToggle={(id) => setPrefs({ ...prefs, hiddenWidgets: toggleItem(prefs.hiddenWidgets, id as WidgetId) })}
          onReorder={(ids) => setPrefs({ ...prefs, widgetOrder: ids as WidgetId[] })}
          onClose={() => setCustomiseOpen(false)}
        />
      )}
      {linksOpen && (
        <ReorderSheet
          title="Quick links"
          subtitle="Pick your shortcuts and arrange them in your order."
          items={prefs.quickLinkOrder.map((id) => ({ id, label: QUICK_LINK_LABELS[id], on: !prefs.hiddenQuickLinks.includes(id) }))}
          onToggle={(id) => setPrefs({ ...prefs, hiddenQuickLinks: toggleItem(prefs.hiddenQuickLinks, id as QuickLinkId) })}
          onReorder={(ids) => setPrefs({ ...prefs, quickLinkOrder: ids as QuickLinkId[] })}
          onClose={() => setLinksOpen(false)}
        />
      )}
    </MobileLayout>
  );
}
