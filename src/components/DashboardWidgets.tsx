import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronRight, SlidersHorizontal, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

const movers = [
  { symbol: "DIAL", change: 3.1 }, { symbol: "JKH", change: 2.4 }, { symbol: "COMB", change: 1.8 }, { symbol: "HNB", change: -0.5 },
];
const utFunds = [
  { code: "FIO", name: "Fixed Income Opportunities", value: "LKR 1.48M", earned: "+LKR 12,400" },
  { code: "HYF", name: "High Yield", value: "LKR 1.25M", earned: "+LKR 18,900" },
  { code: "IGF", name: "Investment Grade", value: "LKR 950k", earned: "+LKR 6,120" },
];
const allRates = [
  { id: "fio", value: "11.25%", label: "FI Opportunity", note: "30d yield" },
  { id: "tbill", value: "9.85%", label: "91-day T-bill", note: "Auction" },
  { id: "mm", value: "8.95%", label: "Money Market", note: "30d yield" },
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

export function DashboardWidgets() {
  const navigate = useNavigate();
  const [editRates, setEditRates] = useState(false);
  const [shown, setShown] = useState<string[]>(allRates.map((r) => r.id));
  const rates = editRates ? allRates : allRates.filter((r) => shown.includes(r.id));
  return (
    <>
      <section aria-labelledby="movers-title" className="pt-1">
        <WidgetHeader id="movers-title" title="Top movers" right={<span className="text-xs text-foreground/65">Today</span>} />
        <div className="divide-y divide-border/45">
          {movers.map((m, i) => (
            <Button key={m.symbol} variant="ghost" className="h-auto min-h-12 w-full justify-start gap-3 rounded-none px-1 py-2 hover:bg-card/50" onClick={() => navigate({ to: "/invest", search: { product: "equities" } })}>
              <span className="w-4 text-xs text-foreground/60 tabular-nums">{i + 1}</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold">{m.symbol.slice(0, 2)}</span>
              <span className="flex-1 text-left text-[13px] font-semibold">{m.symbol}</span>
              <span className={`text-[13px] font-semibold tabular-nums ${m.change >= 0 ? "text-success" : "text-destructive"}`}>{m.change >= 0 ? "+" : ""}{m.change}%</span>
              <ChevronRight className="size-3.5 text-foreground/45" />
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="ut-title" className="pt-1">
        <WidgetHeader id="ut-title" title="Unit Trust funds" right={<span className="text-xs text-foreground/65">7d earnings</span>} />
        <div className="divide-y divide-border/45">
          {utFunds.map((f) => (
            <Button key={f.code} asChild variant="ghost" className="h-auto min-h-14 w-full justify-start gap-3 rounded-none px-1 py-2.5 hover:bg-card/50">
              <Link to="/unit-trusts">
                <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[13px] font-semibold">{f.name}</span><span className="block text-xs font-normal text-foreground/65">{f.value}</span></span>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold tabular-nums text-success"><Sprout className="size-3.5 shrink-0 text-success/80" />{f.earned}</span>
                <ChevronRight className="size-3.5 text-foreground/45" />
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="rates-title" className="pt-1">
        <WidgetHeader id="rates-title" title="Rates to watch" onCustomise={() => setEditRates(!editRates)} label={editRates ? "Done customising rates" : "Customise rates"} />
        {editRates && <p className="mb-2 px-1 text-xs text-foreground/75">Tap a rate to show or hide it</p>}
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {rates.map((r) => {
            const on = shown.includes(r.id);
            return (
              <button key={r.id} type="button" onClick={() => (editRates ? setShown(on ? shown.filter((x) => x !== r.id) : [...shown, r.id]) : navigate({ to: "/rates" }))}
                className={`min-w-[7.5rem] snap-start rounded-xl bg-card/70 px-3 py-2.5 text-left transition ${editRates && !on ? "opacity-40" : ""} ${editRates && on ? "ring-1 ring-primary" : ""}`}>
                <span className="block text-base font-bold tabular-nums">{r.value}</span>
                <span className="block text-xs font-semibold text-primary">{r.label}</span>
                <span className="mt-1 block text-[11px] text-foreground/65">{r.note}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
