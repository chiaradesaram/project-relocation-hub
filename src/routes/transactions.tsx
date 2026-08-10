import { createFileRoute, Link } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Check, Clock, X, CalendarDays, LifeBuoy, ChevronRight, Repeat } from "lucide-react";
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
  All: [],
  "Unit Trusts": ["Pending", "Confirmed", "Completed"],
  Equities: ["Pay In", "Pay Out", "Stocks", "Divs", "Pending", "Confirmed"],
  Treasuries: [],
};

type Status = "Confirmed" | "Pending" | "Completed";

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
  fromFund?: string;
  toFund?: string;
  createdDate?: string;
  redeemByDate?: string;
  reflectedDate?: string;
  units?: number;
  unitPrice?: string;
  trades?: { time: string; side: "Buy" | "Sell"; shares: number; price: string }[];
  bankName: string;
  bankAccount: string;
  // Treasury instrument details
  isin?: string;
  faceValue?: string;
  purchasePrice?: string;
  yieldRate?: string;
  couponRate?: string;
  couponFrequency?: string;
  couponsPaid?: number;
  couponsRemaining?: number;
  couponsPaidValue?: string;
  nextCouponDate?: string;
  issueDate?: string;
  maturityDate?: string;
  repoRate?: string;
  repoTenor?: string;
  collateral?: string;
  interestEarned?: string;
  discount?: string;
  reinvestable?: boolean;
};

const calBank = { name: "CAL Deutsche Bank", account: "DE89 3704 0044 0532 0130 00" };

const transactions: Tx[] = [
  { name: "CAL Income Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Joint · Spouse", date: "Apr 12, 2026", value: "LKR 60,000", positive: true, status: "Pending", fund: "Fixed Income Opportunities Fund", createdDate: "Apr 12, 2026 · 09:24", reflectedDate: "Apr 15, 2026", units: 3421.52, unitPrice: "LKR 17.54", bankName: "Commercial Bank", bankAccount: "8001234521" },
  { name: "HNB.N0000", product: "Equities", kind: "Pay Out", subAccount: "Personal · CDS", date: "Apr 2, 2026", value: "LKR 25,000", positive: false, status: "Pending", createdDate: "Apr 2, 2026 · 14:10", reflectedDate: "Apr 5, 2026", bankName: "Sampath Bank", bankAccount: "1100568832" },
  { name: "Treasury Bond 5Y", product: "Treasuries", kind: "Bond Purchase", subAccount: "Personal · Main", date: "Mar 30, 2026", value: "LKR 500,000", positive: true, status: "Pending", createdDate: "Mar 30, 2026 · 11:02", reflectedDate: "Apr 3, 2026", bankName: "HNB", bankAccount: "0452201209", isin: "LKB00530A157", faceValue: "LKR 500,000", purchasePrice: "98.42", yieldRate: "13.05% p.a.", couponRate: "13.00%", couponFrequency: "Semi-annual", couponsPaid: 0, couponsRemaining: 10, couponsPaidValue: "LKR 0", nextCouponDate: "Sep 30, 2026", issueDate: "Mar 30, 2026", maturityDate: "Mar 30, 2031" },
  { name: "CAL Growth Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 13, 2026", value: "LKR 125,000", positive: true, status: "Confirmed", fund: "Growth Opportunities Fund", units: 5208.33, unitPrice: "LKR 24.00", bankName: "Commercial Bank", bankAccount: "8001234521" },
  { name: "Treasury Bill 91D", product: "Treasuries", kind: "Bill Purchase", subAccount: "Personal · Main", date: "Apr 12, 2026", value: "LKR 105,000", positive: true, status: "Confirmed", createdDate: "Apr 12, 2026 · 10:15", reflectedDate: "Apr 14, 2026", bankName: "HNB", bankAccount: "0452201209", isin: "LKA09126J121", faceValue: "LKR 108,700", purchasePrice: "96.60", yieldRate: "12.85% p.a.", discount: "LKR 3,700", issueDate: "Apr 12, 2026", maturityDate: "Jul 12, 2026", reinvestable: true },
  { name: "Treasury Bond 5Y", product: "Treasuries", kind: "Coupon Received", subAccount: "Personal · Main", date: "Apr 10, 2026", value: "LKR 32,500", positive: true, status: "Confirmed", createdDate: "Apr 10, 2026 · 08:05", reflectedDate: "Apr 10, 2026", bankName: "HNB", bankAccount: "0452201209", isin: "LKB00530A157", faceValue: "LKR 500,000", couponRate: "13.00%", couponFrequency: "Semi-annual", couponsPaid: 3, couponsRemaining: 7, couponsPaidValue: "LKR 97,500", nextCouponDate: "Oct 10, 2026", maturityDate: "Mar 30, 2031", reinvestable: true },
  { name: "Treasury Bond 5Y", product: "Treasuries", kind: "Coupon Paid Out", subAccount: "Personal · Main", date: "Apr 11, 2026", value: "LKR 32,500", positive: false, status: "Completed", createdDate: "Apr 11, 2026 · 09:30", reflectedDate: "Apr 11, 2026", bankName: "HNB", bankAccount: "0452201209", isin: "LKB00530A157", faceValue: "LKR 500,000", couponRate: "13.00%", couponFrequency: "Semi-annual", couponsPaid: 3, couponsRemaining: 7, couponsPaidValue: "LKR 97,500", nextCouponDate: "Oct 10, 2026", maturityDate: "Mar 30, 2031" },
  { name: "Treasury Bond 10Y", product: "Treasuries", kind: "Coupon Received", subAccount: "Personal · Main", date: "Mar 15, 2026", value: "LKR 48,750", positive: true, status: "Completed", createdDate: "Mar 15, 2026 · 08:02", reflectedDate: "Mar 15, 2026", bankName: "Commercial Bank", bankAccount: "8001234521", isin: "LKB01034C019", faceValue: "LKR 750,000", couponRate: "13.00%", couponFrequency: "Semi-annual", couponsPaid: 6, couponsRemaining: 14, couponsPaidValue: "LKR 292,500", nextCouponDate: "Sep 15, 2026", maturityDate: "Mar 15, 2034", reinvestable: true },
  { name: "Treasury Bond 10Y", product: "Treasuries", kind: "Coupon Paid Out", subAccount: "Personal · Main", date: "Mar 16, 2026", value: "LKR 48,750", positive: false, status: "Completed", createdDate: "Mar 16, 2026 · 09:12", reflectedDate: "Mar 16, 2026", bankName: "Commercial Bank", bankAccount: "8001234521", isin: "LKB01034C019", faceValue: "LKR 750,000", couponRate: "13.00%", couponFrequency: "Semi-annual", couponsPaid: 6, couponsRemaining: 14, couponsPaidValue: "LKR 292,500", nextCouponDate: "Sep 15, 2026", maturityDate: "Mar 15, 2034" },
  { name: "Repo · 30 Days", product: "Treasuries", kind: "Repo Placement", subAccount: "Personal · Main", date: "Mar 20, 2026", value: "LKR 300,000", positive: true, status: "Confirmed", createdDate: "Mar 20, 2026 · 11:40", reflectedDate: "Mar 20, 2026", bankName: "Sampath Bank", bankAccount: "1100568832", repoRate: "9.60% p.a.", repoTenor: "30 days", collateral: "Treasury Bill 182D · LKA18226G214", maturityDate: "Apr 19, 2026", interestEarned: "LKR 7,200" },
  { name: "Repo · 30 Days", product: "Treasuries", kind: "Repo Maturity", subAccount: "Personal · Main", date: "Apr 19, 2026", value: "LKR 307,200", positive: false, status: "Pending", createdDate: "Apr 19, 2026 · 09:00", reflectedDate: "Apr 21, 2026", bankName: "Sampath Bank", bankAccount: "1100568832", repoRate: "9.60% p.a.", repoTenor: "30 days", collateral: "Treasury Bill 182D · LKA18226G214", maturityDate: "Apr 19, 2026", interestEarned: "LKR 7,200", reinvestable: true },
  { name: "CAL Equity Fund", product: "Unit Trusts", kind: "Redemption", subAccount: "Personal · Main", date: "Apr 8, 2026", value: "LKR 75,000", positive: false, status: "Confirmed", fund: "Equity Fund", units: 2142.86, unitPrice: "LKR 35.00", bankName: "Sampath Bank", bankAccount: "1100568832" },
  { name: "JKH.N0000", product: "Equities", kind: "Dividend", subAccount: "Personal · CDS", date: "Apr 5, 2026", value: "LKR 3,200", positive: true, status: "Confirmed", bankName: "Commercial Bank", bankAccount: "8001234521" },
  { name: "COMB.N0000", product: "Equities", kind: "Pay In", subAccount: "Personal · CDS", date: "Apr 3, 2026", value: "LKR 50,000", positive: true, status: "Confirmed", bankName: "HNB", bankAccount: "0452201209" },
  { name: "CAL Balanced Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 1, 2026", value: "LKR 250,000", positive: true, status: "Confirmed", fund: "Balanced Fund", units: 8771.93, unitPrice: "LKR 28.50", bankName: "Sampath Bank", bankAccount: "1100568832" },
  { name: "CAL Money Market", product: "Unit Trusts", kind: "Investment", subAccount: "Corporate · Ops", date: "Mar 28, 2026", value: "LKR 200,000", positive: true, status: "Confirmed", fund: "Money Market Fund", units: 12987.01, unitPrice: "LKR 15.40", bankName: "Commercial Bank", bankAccount: "8001234521" },
  { name: "Growth Opportunities Fund", product: "Unit Trusts", kind: "Fund Flip", subAccount: "Personal · Main", date: "Apr 6, 2026", value: "LKR 80,000", positive: true, status: "Completed", fromFund: "Fixed Income Opportunities Fund", toFund: "Growth Opportunities Fund", createdDate: "Apr 6, 2026 · 10:12", redeemByDate: "Apr 8, 2026", reflectedDate: "Apr 9, 2026", units: 3333.33, unitPrice: "LKR 24.00", bankName: "Commercial Bank", bankAccount: "8001234521" },
  { name: "Money Market Fund", product: "Unit Trusts", kind: "Fund Flip", subAccount: "Corporate · Ops", date: "Mar 25, 2026", value: "LKR 120,000", positive: true, status: "Completed", fromFund: "Growth Opportunities Fund", toFund: "Money Market Fund", createdDate: "Mar 25, 2026 · 14:44", redeemByDate: "Mar 27, 2026", reflectedDate: "Mar 28, 2026", units: 7792.21, unitPrice: "LKR 15.40", bankName: "HNB", bankAccount: "0452201209" },
  { name: "DIAL.N0000", product: "Equities", kind: "Pay Out", subAccount: "Personal · CDS", date: "Mar 22, 2026", value: "LKR 18,000", positive: false, status: "Confirmed", bankName: "Sampath Bank", bankAccount: "1100568832" },
  {
    name: "LOLC.N0000", product: "Equities", kind: "Stock Buy", subAccount: "Personal · CDS",
    date: "Apr 10, 2026", value: "LKR 42,000", positive: false, status: "Confirmed",
    createdDate: "Apr 10, 2026 · 10:15", reflectedDate: "Apr 10, 2026",
    bankName: "Commercial Bank", bankAccount: "8001234521",
    trades: [
      { time: "09:32", side: "Buy", shares: 100, price: "LKR 140.00" },
      { time: "10:15", side: "Buy", shares: 150, price: "LKR 141.50" },
      { time: "13:47", side: "Buy", shares: 50, price: "LKR 142.00" },
    ],
  },
  {
    name: "SAMP.N0000", product: "Equities", kind: "Stock Sell", subAccount: "Personal · CDS",
    date: "Apr 7, 2026", value: "LKR 30,500", positive: true, status: "Confirmed",
    createdDate: "Apr 7, 2026 · 11:42", reflectedDate: "Apr 7, 2026",
    bankName: "HNB", bankAccount: "0452201209",
    trades: [
      { time: "10:04", side: "Sell", shares: 200, price: "LKR 76.00" },
      { time: "11:42", side: "Sell", shares: 200, price: "LKR 76.50" },
    ],
  },
];

const subToKinds: Record<string, string[]> = {
  Investments: ["Investment"],
  Redemptions: ["Redemption"],
  "Pay In": ["Pay In"],
  "Pay Out": ["Pay Out"],
  Divs: ["Dividend"],
  Stocks: ["Stock Buy", "Stock Sell"],
  Maturities: ["Maturity"],
};

function StateIcon({ status }: { status: Status }) {
  if (status === "Pending") {
    return (
      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4 text-warning" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "Confirmed") {
    return (
      <div className="w-8 h-8 rounded-full bg-success/10 border-2 border-success flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
      <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles =
    status === "Pending"
      ? "bg-warning/20 text-warning"
      : status === "Completed"
        ? "bg-success/20 text-success"
        : "bg-success/10 text-success ring-1 ring-success/60";
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide", styles)}>
      {status}
    </span>
  );
}

function Transactions() {
  const [product, setProduct] = useState<Product>("All");
  const [sub, setSub] = useState<string | null>(null);
  const [subAccount, setSubAccount] = useState<string | null>(null);
  const [subAccountOpen, setSubAccountOpen] = useState(false);
  const [fund, setFund] = useState<string | null>(null);
  const [fundOpen, setFundOpen] = useState(false);
  const [openTx, setOpenTx] = useState<Tx | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [activePreset, setActivePreset] = useState<string | null>("All time");

  // Reset sub-filters when product changes
  const changeProduct = (p: Product) => {
    setProduct(p);
    setSub(null);
    setSubAccount(null);
    setFund(null);
  };

  const subAccountOptions = Array.from(
    new Set(transactions.filter((t) => t.product === "Unit Trusts").map((t) => t.subAccount)),
  );
  const fundOptions = Array.from(
    new Set(
      transactions
        .filter((t) => t.product === "Unit Trusts" && t.fund)
        .map((t) => t.fund as string),
    ),
  );

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
      if (product === "Unit Trusts" && subAccount && tx.subAccount !== subAccount) return false;
      if (product === "Unit Trusts" && fund && tx.fund !== fund) return false;
      if (!sub) return true;
      if (sub === "Pending") return tx.status === "Pending";
      if (sub === "Confirmed") return tx.status === "Confirmed";
      if (sub === "Completed") return tx.status === "Completed";
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
            onClick={() => changeProduct(f)}
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
          <CalendarDays className="w-4 h-4" />
          {rangeLabel}
        </button>
        {range?.from && (
          <button
            type="button"
            onClick={() => { setRange(undefined); setActivePreset("All time"); }}
            aria-label="Clear date range"
            className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sub filters (per product) */}
      {product !== "All" && subFiltersByProduct[product].length > 0 && (
        <div className="flex gap-2 px-4 mt-2 overflow-x-auto pb-1">
          {product === "Unit Trusts" && (
            <button
              type="button"
              onClick={() => setSubAccountOpen(true)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition",
                subAccount
                  ? "bg-pill text-pill-foreground"
                  : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
              )}
            >
              {subAccount ?? "Sub Account"}
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          )}
          {product === "Unit Trusts" && (
            <button
              type="button"
              onClick={() => setFundOpen(true)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition",
                fund
                  ? "bg-pill text-pill-foreground"
                  : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
              )}
            >
              {fund ?? "Fund"}
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          )}
          {subFiltersByProduct[product].map((f) => {
            const active = sub === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setSub(active ? null : f)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition",
                  active
                    ? "bg-pill text-pill-foreground"
                    : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}

      {/* Sub Account picker drawer */}
      <Drawer open={subAccountOpen} onOpenChange={setSubAccountOpen}>
        <DrawerContent className="bg-[var(--surface-1)] border-none rounded-t-[28px] px-5 pb-6">
          <div className="flex items-center justify-between pt-2 pb-3">
            <DrawerTitle className="text-lg font-semibold">Sub Account</DrawerTitle>
            <button
              type="button"
              onClick={() => setSubAccountOpen(false)}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl bg-white/[0.04] divide-y divide-white/[0.06] mb-2">
            <button
              type="button"
              onClick={() => { setSubAccount(null); setSubAccountOpen(false); }}
              className="w-full text-left p-4 text-sm font-medium text-foreground"
            >
              All sub accounts
            </button>
            {subAccountOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSubAccount(s); setSubAccountOpen(false); }}
                className="w-full text-left p-4 text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>{s}</span>
                {subAccount === s && <Check className="w-4 h-4 text-pill" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Fund picker drawer */}
      <Drawer open={fundOpen} onOpenChange={setFundOpen}>
        <DrawerContent className="bg-[var(--surface-1)] border-none rounded-t-[28px] px-5 pb-6">
          <div className="flex items-center justify-between pt-2 pb-3">
            <DrawerTitle className="text-lg font-semibold">Fund</DrawerTitle>
            <button
              type="button"
              onClick={() => setFundOpen(false)}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl bg-white/[0.04] divide-y divide-white/[0.06] mb-2">
            <button
              type="button"
              onClick={() => { setFund(null); setFundOpen(false); }}
              className="w-full text-left p-4 text-sm font-medium text-foreground"
            >
              All funds
            </button>
            {fundOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => { setFund(f); setFundOpen(false); }}
                className="w-full text-left p-4 text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>{f}</span>
                {fund === f && <Check className="w-4 h-4 text-pill" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Wise-style Date Range Picker Drawer */}
      <Drawer open={dateOpen} onOpenChange={setDateOpen}>
        <DrawerContent className="bg-[var(--surface-1)] border-none rounded-t-[28px] px-5 pb-6 max-h-[92vh]">
          <div className="flex items-center justify-between pt-2 pb-3">
            <DrawerTitle className="text-lg font-semibold">Filter by date</DrawerTitle>
            <button
              type="button"
              onClick={() => setDateOpen(false)}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
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
                      ? "bg-pill text-pill-foreground"
                      : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Calendar */}
          <div
            className={cn(
              "w-full mb-4 [&_[data-slot=calendar]]:bg-transparent",
              "[&_[data-range-start=true]]:!bg-pill [&_[data-range-start=true]]:!text-pill-foreground",
              "[&_[data-range-end=true]]:!bg-pill [&_[data-range-end=true]]:!text-pill-foreground",
              "[&_[data-selected-single=true]]:!bg-pill [&_[data-selected-single=true]]:!text-pill-foreground",
              "[&_[data-range-middle=true]]:!bg-pill/20 [&_[data-range-middle=true]]:!text-foreground",
              "[&_.rdp-today_button]:!bg-transparent [&_.rdp-today_button]:ring-1 [&_.rdp-today_button]:ring-pill [&_.rdp-today_button]:rounded-full [&_.rdp-today_button]:text-foreground",
              "[&_[data-range-start=true]_button]:!ring-0 [&_[data-range-end=true]_button]:!ring-0 [&_[data-selected-single=true]_button]:!ring-0",
            )}
          >
            <Calendar
              mode="range"
              selected={draftRange}
              onSelect={(r) => {
                setDraftRange(r);
                setActivePreset(null);
              }}
              numberOfMonths={1}
              defaultMonth={draftRange?.from ?? new Date()}
              className="pointer-events-auto w-full bg-transparent p-0 [--cell-size:3rem]"
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full gap-3",
                month_caption: "flex h-9 w-full items-center justify-center",
                nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
                weekdays: "flex w-full",
                weekday: "text-muted-foreground flex-1 select-none text-[0.8rem] font-normal",
                week: "mt-1 flex w-full",
                day: "group/day relative flex-1 aspect-square select-none p-0 text-center",
                today: "!bg-transparent rounded-full ring-1 ring-pill text-foreground data-[selected=true]:ring-0",
              }}
            />
          </div>

          <button
            type="button"
            onClick={applyDraft}
            className="w-full py-3 rounded-full text-sm font-semibold bg-pill text-pill-foreground"
          >
            Apply
          </button>
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
            <StateIcon status={tx.status} />
            <div className="flex-1 min-w-0">
              {tx.kind === "Pay In" || tx.kind === "Pay Out" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{tx.kind}</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground/70 mt-0.5">{tx.date}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                    {tx.trades && tx.trades.length > 1 && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-pill/20 text-pill">
                        {tx.trades.length} transactions
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {tx.product === "Equities" || tx.product === "Treasuries"
                      ? product === "All"
                        ? tx.product
                        : null
                      : product === "All"
                        ? `${tx.product} · ${tx.subAccount}`
                        : tx.subAccount}
                  </p>
                  <p className="text-[12px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                    {tx.kind === "Fund Flip" && <span>fund flip ·</span>}
                    {tx.product === "Treasuries" && <span>{tx.kind} ·</span>}
                    <span>{tx.date}</span>
                  </p>
                </>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${
                tx.positive ? "text-emerald-300" : "text-foreground"
              }`}>
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
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DrawerHeader className="text-left p-0 pb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {openTx && <StateIcon status={openTx.status} />}
              <DrawerTitle className="text-xl font-semibold">{openTx?.name}</DrawerTitle>
              {openTx && <StatusPill status={openTx.status} />}
            </div>
            <DrawerDescription>
              {openTx?.product}
              {openTx && openTx.product !== "Equities" && openTx.product !== "Treasuries"
                ? ` · ${openTx.subAccount}`
                : ""}
              {" · "}
              <span>{openTx?.positive ? "+" : "−"} {openTx?.value}</span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="rounded-2xl bg-white/[0.04] divide-y divide-white/[0.06] mb-4">
            {openTx?.kind === "Fund Flip" ? (
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">Fund flip</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{openTx?.fromFund}</span>
                  <Repeat className="w-4 h-4 text-success shrink-0" />
                  <span className="truncate">{openTx?.toFund}</span>
                </div>
              </div>
            ) : openTx?.fund && (
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
            {openTx?.product === "Treasuries" && (
              <>
                {openTx.faceValue && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Face value</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.faceValue}</p>
                  </div>
                )}
                {openTx.purchasePrice && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Purchase price</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.purchasePrice}</p>
                  </div>
                )}
                {openTx.discount && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Discount at issue</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.discount}</p>
                  </div>
                )}
                {openTx.yieldRate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Yield</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.yieldRate}</p>
                  </div>
                )}
                {openTx.couponRate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Coupon rate</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {openTx.couponRate}
                      {openTx.couponFrequency ? ` · ${openTx.couponFrequency}` : ""}
                    </p>
                  </div>
                )}
                {typeof openTx.couponsPaid === "number" && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Coupons paid so far</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {openTx.couponsPaid} paid
                      {openTx.couponsPaidValue ? ` · ${openTx.couponsPaidValue}` : ""}
                    </p>
                  </div>
                )}
                {typeof openTx.couponsRemaining === "number" && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Coupons left till maturity</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.couponsRemaining} remaining</p>
                  </div>
                )}
                {openTx.nextCouponDate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Next coupon date</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.nextCouponDate}</p>
                  </div>
                )}
                {openTx.repoRate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Repo rate</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {openTx.repoRate}
                      {openTx.repoTenor ? ` · ${openTx.repoTenor}` : ""}
                    </p>
                  </div>
                )}
                {openTx.collateral && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Collateral</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.collateral}</p>
                  </div>
                )}
                {openTx.interestEarned && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Interest earned</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.interestEarned}</p>
                  </div>
                )}
                {openTx.issueDate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Issue date</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.issueDate}</p>
                  </div>
                )}
                {openTx.maturityDate && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Maturity date</p>
                    <p className="text-xs text-muted-foreground truncate">{openTx.maturityDate}</p>
                  </div>
                )}
              </>
            )}
            {openTx?.product !== "Treasuries" && (
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">Created date</p>
                <p className="text-xs text-muted-foreground truncate">{openTx?.createdDate ?? openTx?.date}</p>
              </div>
            )}
            {openTx?.kind === "Fund Flip" && (
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">Redeem from fund by</p>
                <p className="text-xs text-muted-foreground truncate">{openTx?.redeemByDate ?? "—"}</p>
              </div>
            )}
            {openTx?.product !== "Treasuries" && (
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">Reflected on the portal by</p>
                <p className="text-xs text-muted-foreground truncate">{openTx?.reflectedDate ?? openTx?.date}</p>
              </div>
            )}
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground">Transfer From</p>
              <p className="text-xs text-muted-foreground truncate">
                {openTx?.positive
                  ? `${openTx?.bankName} · ${openTx?.bankAccount}`
                  : `${calBank.name} · ${calBank.account}`}
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground">Transfer To</p>
              <p className="text-xs text-muted-foreground truncate">
                {openTx?.positive
                  ? `${calBank.name} · ${calBank.account}`
                  : `${openTx?.bankName} · ${openTx?.bankAccount}`}
              </p>
            </div>
          </div>

          {openTx?.trades && openTx.trades.length > 0 && (
            <div className="rounded-2xl bg-white/[0.04] mb-4 overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Trades on {openTx.date}</p>
                <span className="text-[11px] text-muted-foreground">{openTx.trades.length} total</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {openTx.trades.map((t, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {t.side} · {t.shares.toLocaleString()} shares
                      </p>
                      <p className="text-[12px] text-muted-foreground/80 mt-0.5">{t.time}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground shrink-0">{t.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {openTx?.product === "Treasuries" && openTx?.reinvestable && (
            <Link
              to="/invest"
              className="rounded-2xl bg-white/[0.04] flex items-center gap-3 p-4 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
                <Repeat className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {openTx.kind === "Repo Maturity" ? "Roll over this repo" : "Reinvest this payout"}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                  {openTx.kind === "Repo Maturity"
                    ? `Place ${openTx.value} into a new repo`
                    : `Put ${openTx.value} into a new bill, bond or repo`}
                </p>
              </div>
            </Link>
          )}

          <Link
            to="/help/contact"
            search={
              openTx
                ? {
                    category:
                      openTx.product === "Unit Trusts"
                        ? "unit-trusts"
                        : openTx.product === "Equities"
                          ? "equities"
                          : openTx.product === "Treasuries"
                            ? "treasuries"
                            : undefined,
                    txId: `${openTx.name}-${openTx.date}`.replace(/\s+/g, "-").toLowerCase(),
                    txName: openTx.name,
                    txKind: openTx.kind,
                    txDate: openTx.date,
                    txValue: openTx.value,
                    txStatus: openTx.status === "Completed" ? "Confirmed" : openTx.status,
                    txSubAccount: openTx.subAccount,
                  }
                : {}
            }
            className="rounded-2xl bg-white/[0.04] flex items-center gap-3 p-4"
          >
            <div className="w-10 h-10 rounded-xl bg-pill/90 flex items-center justify-center text-pill-foreground">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Got an issue with this transaction?</p>
              
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
}
