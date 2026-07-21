import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, Clock, Check, X, CalendarDays, CalendarCheck2, LifeBuoy, ChevronRight, Hash, Tag, PieChart, BarChart3, Receipt } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/transactions")({
  component: Transactions,
});

const productFilters = ["All", "Unit Trusts", "Equities", "Treasuries"] as const;
type Product = (typeof productFilters)[number];

const subFiltersByProduct: Record<Product, string[]> = {
  All: ["All"],
  "Unit Trusts": ["All", "Investments", "Redemptions", "Pending"],
  Equities: ["All", "Pay In", "Pay Out", "Dividends"],
  Treasuries: ["All", "Investments", "Maturities", "Pending"],
};

type Status = "Confirmed" | "Pending";

type Tx = {
  name: string;
  product: Product;
  kind: string; // Investment, Redemption, Dividend, Pay In, Pay Out, Maturity
  subAccount: string;
  date: string;
  value: string;
  positive: boolean;
  status: Status;
  fund?: string;
  createdDate?: string;
  reflectedDate?: string;
  units?: number;
  unitPrice?: string;
};

const transactions: Tx[] = [
  { name: "CAL Income Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Joint · Spouse", date: "Apr 12, 2026", value: "LKR 60,000", positive: true, status: "Pending", fund: "Fixed Income Opportunities Fund", createdDate: "Apr 12, 2026 · 09:24", reflectedDate: "Apr 15, 2026", units: 3421.52, unitPrice: "LKR 17.54" },
  { name: "HNB.N0000", product: "Equities", kind: "Pay Out", subAccount: "Personal · CDS", date: "Apr 2, 2026", value: "LKR 25,000", positive: false, status: "Pending", createdDate: "Apr 2, 2026 · 14:10", reflectedDate: "Apr 5, 2026" },
  { name: "Treasury Bond 5Y", product: "Treasuries", kind: "Investment", subAccount: "Personal · Main", date: "Mar 30, 2026", value: "LKR 500,000", positive: true, status: "Pending", createdDate: "Mar 30, 2026 · 11:02", reflectedDate: "Apr 3, 2026" },
  { name: "CAL Growth Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 13, 2026", value: "LKR 125,000", positive: true, status: "Confirmed", fund: "Growth Opportunities Fund", units: 5208.33, unitPrice: "LKR 24.00" },
  { name: "Treasury Bill 91D", product: "Treasuries", kind: "Maturity", subAccount: "Personal · Main", date: "Apr 12, 2026", value: "LKR 105,000", positive: true, status: "Confirmed" },
  { name: "CAL Equity Fund", product: "Unit Trusts", kind: "Redemption", subAccount: "Personal · Main", date: "Apr 8, 2026", value: "LKR 75,000", positive: false, status: "Confirmed", fund: "Equity Fund", units: 2142.86, unitPrice: "LKR 35.00" },
  { name: "JKH.N0000", product: "Equities", kind: "Dividend", subAccount: "Personal · CDS", date: "Apr 5, 2026", value: "LKR 3,200", positive: true, status: "Confirmed" },
  { name: "COMB.N0000", product: "Equities", kind: "Pay In", subAccount: "Personal · CDS", date: "Apr 3, 2026", value: "LKR 50,000", positive: true, status: "Confirmed" },
  { name: "CAL Balanced Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 1, 2026", value: "LKR 250,000", positive: true, status: "Confirmed", fund: "Balanced Fund", units: 8771.93, unitPrice: "LKR 28.50" },
  { name: "CAL Money Market", product: "Unit Trusts", kind: "Investment", subAccount: "Corporate · Ops", date: "Mar 28, 2026", value: "LKR 200,000", positive: true, status: "Confirmed", fund: "Money Market Fund", units: 12987.01, unitPrice: "LKR 15.40" },
  { name: "DIAL.N0000", product: "Equities", kind: "Pay Out", subAccount: "Personal · CDS", date: "Mar 22, 2026", value: "LKR 18,000", positive: false, status: "Confirmed" },
];

const subToKinds: Record<string, string[]> = {
  All: [],
  Investments: ["Investment"],
  Redemptions: ["Redemption"],
  Pending: [], // status filter
  "Pay In": ["Pay In"],
  "Pay Out": ["Pay Out"],
  Dividends: ["Dividend"],
  Maturities: ["Maturity"],
};

function StatusIcon({ status, positive }: { status: Status; positive: boolean }) {
  if (status === "Pending") return <Clock className="w-4 h-4 text-warning" />;
  return positive ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-muted-foreground" />;
}

function Transactions() {
  const [product, setProduct] = useState<Product>("All");
  const sub = "All";
  const [openTx, setOpenTx] = useState<Tx | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [activePreset, setActivePreset] = useState<string | null>("All time");

  const presets = [
    { label: "Last 7 days", v: 7 as const },
    { label: "Last 30 days", v: 30 as const },
    { label: "Last 90 days", v: 90 as const },
    { label: "This month", v: "month" as const },
    { label: "All time", v: "all" as const },
  ];

  const computePreset = (v: number | "month" | "all"): DateRange | undefined => {
    if (v === "all") return undefined;
    if (v === "month") {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    }
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - v + 1);
    return { from, to };
  };

  const openDatePicker = () => {
    setDraftRange(range);
    setDateOpen(true);
  };

  const applyDraft = () => {
    setRange(draftRange);
    setDateOpen(false);
  };

  const rangeLabel = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : format(range.from, "MMM d, yyyy")
    : "Any date";

  const filtered = transactions
    .filter((tx) => {
      if (product !== "All" && tx.product !== product) return false;
      if (range?.from) {
        const txDate = new Date(tx.date);
        const from = new Date(range.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(range.to ?? range.from);
        to.setHours(23, 59, 59, 999);
        if (txDate < from || txDate > to) return false;
      }
      if (sub === "All") return true;
      if (sub === "Pending") return tx.status === "Pending";
      const allowedKinds = subToKinds[sub] ?? [];
      return allowedKinds.includes(tx.kind);
    })
    .sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      return 0;
    });

  return (
    <MobileLayout>
      <PageHeader title="Transactions" showBack helpTopic="transactions" />

      {/* Product Filters */}
      <div className="flex gap-2 px-4 mt-2 overflow-x-auto pb-2">
        {productFilters.map((f) => (
          <button
            key={f}
            onClick={() => setProduct(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              product === f
                ? "bg-pill text-pill-foreground"
                : "bg-pill/20 text-pill"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2 px-4 mt-1">
        <button
          type="button"
          onClick={openDatePicker}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            range?.from
              ? "bg-pill text-pill-foreground"
              : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {rangeLabel}
        </button>
        {range?.from && (
          <button
            type="button"
            onClick={() => { setRange(undefined); setActivePreset("All time"); }}
            aria-label="Clear date range"
            className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Wise-style Date Range Picker Drawer */}
      <Drawer open={dateOpen} onOpenChange={setDateOpen}>
        <DrawerContent className="bg-[var(--surface-1)] border-none rounded-t-[28px] px-5 pb-6 max-h-[92vh]">
          <div className="flex items-center justify-between pt-2 pb-3">
            <DrawerTitle className="text-lg font-semibold">Filter by date</DrawerTitle>
            <button
              type="button"
              onClick={() => setDateOpen(false)}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selected range summary */}
          <p className="text-sm text-muted-foreground mb-4">
            {draftRange?.from
              ? draftRange.to && draftRange.to.getTime() !== draftRange.from.getTime()
                ? `${format(draftRange.from, "MMM d, yyyy")} – ${format(draftRange.to, "MMM d, yyyy")}`
                : `${format(draftRange.from, "MMM d, yyyy")} – Pick end date`
              : "All transactions"}
          </p>

          {/* Preset chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map((p) => {
              const isActive = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setActivePreset(p.label);
                    setDraftRange(computePreset(p.v));
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Calendar */}
          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={(r) => {
              setDraftRange(r);
              setActivePreset(null);
            }}
            numberOfMonths={1}
            defaultMonth={draftRange?.from ?? new Date()}
            className={cn("pointer-events-auto mx-auto mb-4")}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDraftRange(undefined);
                setActivePreset("All time");
              }}
              className="flex-1 py-3 rounded-full text-sm font-medium bg-white/[0.06] text-foreground hover:bg-white/[0.1] transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyDraft}
              className="flex-[2] py-3 rounded-full text-sm font-semibold bg-foreground text-background"
            >
              Apply
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Transaction List */}
      <div className="px-4 mt-3 space-y-2">
        {filtered.map((tx, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenTx(tx)}
            className="glass-card p-4 flex items-start gap-3 w-full text-left hover:bg-white/[0.03] transition"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                tx.status === "Pending"
                  ? "bg-warning/15"
                  : tx.positive
                    ? "bg-success/20"
                    : "bg-muted/40"
              }`}
            >
              <StatusIcon status={tx.status} positive={tx.positive} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                <span
                  aria-label={tx.status}
                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    tx.status === "Pending"
                      ? "bg-warning/15 text-warning"
                      : "bg-success/20 text-success"
                  }`}
                >
                  {tx.status === "Pending" ? (
                    <Clock className="w-2.5 h-2.5" />
                  ) : (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {product === "All" ? `${tx.product} · ${tx.subAccount}` : tx.subAccount}
              </p>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">{tx.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${tx.positive ? "text-emerald-300" : "text-foreground"}`}>
                {tx.positive ? "+" : "−"} {tx.value}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">No transactions found</p>
        )}
      </div>

      <Drawer open={!!openTx} onOpenChange={(o) => !o && setOpenTx(null)}>
        <DrawerContent className="bg-[var(--surface-1)] border-none rounded-t-[28px] px-5 pb-8">
          <div className="flex justify-end pt-2 pb-4">
            <button
              type="button"
              onClick={() => setOpenTx(null)}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <DrawerHeader className="text-left p-0 pb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-pill/20 flex items-center justify-center text-pill shrink-0">
                {openTx?.product === "Unit Trusts" && <PieChart className="w-4 h-4" />}
                {openTx?.product === "Equities" && <BarChart3 className="w-4 h-4" />}
                {openTx?.product === "Treasuries" && <Receipt className="w-4 h-4" />}
              </div>
              <DrawerTitle className="text-xl font-semibold">{openTx?.name}</DrawerTitle>
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                openTx?.status === "Pending"
                  ? "bg-warning/15 text-warning"
                  : "bg-success/20 text-success"
              }`}>
                {openTx?.status === "Pending" ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3" strokeWidth={3} />}
                {openTx?.status}
              </div>
            </div>
            <DrawerDescription>
              {openTx?.product} · {openTx?.subAccount} · {openTx?.positive ? "+" : "−"} {openTx?.value}
            </DrawerDescription>
          </DrawerHeader>

          <div className="rounded-2xl bg-white/[0.04] divide-y divide-white/[0.06] mb-4">
            {openTx?.fund && (
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">Fund</p>
                <p className="text-xs text-muted-foreground truncate">{openTx?.fund}</p>
              </div>
            )}
            {openTx?.product === "Unit Trusts" && (
              <>
                <div className="p-4">
                  <p className="text-sm font-semibold text-foreground">Units</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {openTx?.units?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? "—"}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-foreground">Unit price</p>
                  <p className="text-xs text-muted-foreground truncate">{openTx?.unitPrice ?? "—"}</p>
                </div>
              </>
            )}
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground">Created date</p>
              <p className="text-xs text-muted-foreground truncate">{openTx?.createdDate ?? openTx?.date}</p>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground">Reflected on the portal by</p>
              <p className="text-xs text-muted-foreground truncate">{openTx?.reflectedDate ?? openTx?.date}</p>
            </div>
          </div>

          <a
            href="#"
            className="rounded-2xl bg-white/[0.04] flex items-center gap-3 p-4"
          >
            <div className="w-10 h-10 rounded-xl bg-pill/90 flex items-center justify-center text-pill-foreground">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Got an issue with this transaction?</p>
              <p className="text-xs text-muted-foreground truncate">We'll help you sort it out</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
}
