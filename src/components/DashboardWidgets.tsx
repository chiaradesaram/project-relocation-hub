import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronRight, SlidersHorizontal, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReorderSheet } from "@/components/ReorderSheet";
import { moveItem, toggleItem } from "@/lib/dashboardPrefs";

const movers = [
  { symbol: "DIAL", change: 3.1 }, { symbol: "JKH", change: 2.4 }, { symbol: "COMB", change: 1.8 }, { symbol: "HNB", change: -0.5 },
];
const utFunds = [
  { code: "FIO", name: "Fixed Income Opportunities", value: "LKR 1.48M", earned: "+LKR 12,400" },
  { code: "HYF", name: "High Yield", value: "LKR 1.25M", earned: "+LKR 18,900" },
  { code: "IGF", name: "Investment Grade", value: "LKR 950k", earned: "+LKR 6,120" },
];
export const allRates = [
  { id: "fio", value: "11.25%", label: "FI Opportunity", note: "30d yield" },
  { id: "income", value: "10.10%", label: "Income Fund", note: "30d yield" },
  { id: "growth", value: "12.40%", label: "Growth Fund", note: "30d yield" },
  { id: "balanced", value: "10.85%", label: "Balanced Fund", note: "30d yield" },
  { id: "mm", value: "8.95%", label: "Money Market", note: "30d yield" },
  { id: "tbill", value: "9.85%", label: "91-day T-bill", note: "Auction" },
  { id: "usd", value: "303.40", label: "USD / LKR", note: "CBSL" },
];

function WidgetHeader({ id, title, right, onCustomise, label }: { id: string; title: string; right?: ReactNode; onCustomise?: () => void; label?: string }) {
  return (
    <div className="mb-1 flex items-center justify-between px-1">
      <h2 id={id} className="text-sm font-semibold">{title}</h2>
      <div className="flex items-center gap-2">{right}{onCustomise && <Button variant="ghost" size="icon" className="size-6 text-foreground/65" aria-label={label} onClick={onCustomise}><SlidersHorizontal /></Button>}</div>
    </div>
  );
}

export function MoversCard() {
  const navigate = useNavigate();
  return (
    <section aria-labelledby="movers-title" className="rounded-2xl bg-card/70 px-4 py-3">
      <WidgetHeader id="movers-title" title="Top movers" right={<span className="text-xs text-foreground/65">Today</span>} />
      <div className="divide-y divide-border/45">
        {movers.map((m, i) => (
          <Button key={m.symbol} variant="ghost" className="h-auto min-h-12 w-full justify-start gap-3 rounded-none px-1 py-2 hover:bg-secondary/40" onClick={() => navigate({ to: "/invest", search: { product: "equities" } })}>
            <span className="w-4 text-xs text-foreground/60 tabular-nums">{i + 1}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold">{m.symbol.slice(0, 2)}</span>
            <span className="flex-1 text-left text-[13px] font-semibold">{m.symbol}</span>
            <span className={`text-[13px] font-semibold tabular-nums ${m.change >= 0 ? "text-success" : "text-destructive"}`}>{m.change >= 0 ? "+" : ""}{m.change}%</span>
            <ChevronRight className="size-3.5 text-foreground/45" />
          </Button>
        ))}
      </div>
    </section>
  );
}

export function UtFundsCard() {
  return (
    <section aria-labelledby="ut-title" className="rounded-2xl bg-card/70 px-4 py-3">
      <WidgetHeader id="ut-title" title="Unit Trust funds" right={<span className="flex items-center gap-1 text-xs font-semibold text-foreground/70"><Sprout className="size-3.5 text-success/80" />7d earnings</span>} />
      <div className="divide-y divide-border/45">
        {utFunds.map((f) => (
          <Button key={f.code} asChild variant="ghost" className="h-auto min-h-14 w-full justify-start gap-3 rounded-none px-1 py-2.5 hover:bg-secondary/40">
            <Link to="/unit-trusts">
              <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[13px] font-semibold">{f.name}</span><span className="block text-xs font-normal text-foreground/65">{f.value}</span></span>
              <span className="text-[13px] font-semibold tabular-nums text-success">{f.earned}</span>
              <ChevronRight className="size-3.5 text-foreground/45" />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}

type RatesCardProps = {
  rateOrder: string[];
  hiddenRates: string[];
  onRateOrder: (order: string[]) => void;
  onHiddenRates: (hidden: string[]) => void;
};

export function RatesCard({ rateOrder, hiddenRates, onRateOrder, onHiddenRates }: RatesCardProps) {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const ordered = rateOrder.map((id) => allRates.find((r) => r.id === id)).filter((r): r is (typeof allRates)[number] => Boolean(r));
  const visible = ordered.filter((r) => !hiddenRates.includes(r.id));
  return (
    <section aria-labelledby="rates-title" className="rounded-2xl bg-card/70 px-4 py-3">
      <WidgetHeader id="rates-title" title="Rates to watch" onCustomise={() => setSheetOpen(true)} label="Customise rates" />
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {visible.map((r) => (
          <button key={r.id} type="button" onClick={() => navigate({ to: "/rates" })}
            className="min-w-[7.5rem] snap-start rounded-xl bg-secondary/60 px-3 py-2.5 text-left transition">
            <span className="block text-base font-bold tabular-nums">{r.value}</span>
            <span className="block text-xs font-semibold text-primary">{r.label}</span>
            <span className="mt-1 block text-[11px] text-foreground/65">{r.note}</span>
          </button>
        ))}
      </div>
      {sheetOpen && (
        <ReorderSheet
          title="Rates to watch"
          subtitle="Pick the rates you want and arrange them in your order."
          items={ordered.map((r) => ({ id: r.id, label: r.label, hint: `${r.value} · ${r.note}`, on: !hiddenRates.includes(r.id) }))}
          onToggle={(id) => onHiddenRates(toggleItem(hiddenRates, id))}
          onReorder={(ids) => onRateOrder(ids)}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </section>
  );
}
