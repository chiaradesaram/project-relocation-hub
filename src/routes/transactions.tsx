import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, Clock, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useState } from "react";

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
  createdDate?: string;
  reflectedDate?: string;
};

const transactions: Tx[] = [
  { name: "CAL Income Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Joint · Spouse", date: "Apr 12, 2026", value: "LKR 60,000", positive: true, status: "Pending", createdDate: "Apr 12, 2026 · 09:24", reflectedDate: "Apr 15, 2026" },
  { name: "HNB.N0000", product: "Equities", kind: "Pay Out", subAccount: "Personal · CDS", date: "Apr 2, 2026", value: "LKR 25,000", positive: false, status: "Pending", createdDate: "Apr 2, 2026 · 14:10", reflectedDate: "Apr 5, 2026" },
  { name: "Treasury Bond 5Y", product: "Treasuries", kind: "Investment", subAccount: "Personal · Main", date: "Mar 30, 2026", value: "LKR 500,000", positive: true, status: "Pending", createdDate: "Mar 30, 2026 · 11:02", reflectedDate: "Apr 3, 2026" },
  { name: "CAL Growth Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 13, 2026", value: "LKR 125,000", positive: true, status: "Confirmed" },
  { name: "Treasury Bill 91D", product: "Treasuries", kind: "Maturity", subAccount: "Personal · Main", date: "Apr 12, 2026", value: "LKR 105,000", positive: true, status: "Confirmed" },
  { name: "CAL Equity Fund", product: "Unit Trusts", kind: "Redemption", subAccount: "Personal · Main", date: "Apr 8, 2026", value: "LKR 75,000", positive: false, status: "Confirmed" },
  { name: "JKH.N0000", product: "Equities", kind: "Dividend", subAccount: "Personal · CDS", date: "Apr 5, 2026", value: "LKR 3,200", positive: true, status: "Confirmed" },
  { name: "COMB.N0000", product: "Equities", kind: "Pay In", subAccount: "Personal · CDS", date: "Apr 3, 2026", value: "LKR 50,000", positive: true, status: "Confirmed" },
  { name: "CAL Balanced Fund", product: "Unit Trusts", kind: "Investment", subAccount: "Personal · Main", date: "Apr 1, 2026", value: "LKR 250,000", positive: true, status: "Confirmed" },
  { name: "CAL Money Market", product: "Unit Trusts", kind: "Investment", subAccount: "Corporate · Ops", date: "Mar 28, 2026", value: "LKR 200,000", positive: true, status: "Confirmed" },
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
  if (status === "Pending") return <Clock className="w-4 h-4 text-accent-cyan" />;
  return positive ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-muted-foreground" />;
}

function Transactions() {
  const [product, setProduct] = useState<Product>("All");
  const sub = "All";
  const [openTx, setOpenTx] = useState<Tx | null>(null);

  const filtered = transactions
    .filter((tx) => {
      if (product !== "All" && tx.product !== product) return false;
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
      <PageHeader title="Transactions" showBack />

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

      {/* Transaction List */}
      <div className="px-4 mt-3 space-y-2">
        {filtered.map((tx, i) => (
          <div key={i} className="glass-card p-4 flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                tx.status === "Pending"
                  ? "bg-accent-cyan/15"
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
                <button
                  type="button"
                  onClick={() => setOpenTx(tx)}
                  aria-label={`${tx.status} — view details`}
                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    tx.status === "Pending"
                      ? "bg-accent-cyan/15 text-accent-cyan"
                      : "bg-success/20 text-success"
                  }`}
                >
                  {tx.status === "Pending" ? (
                    <Clock className="w-2.5 h-2.5" />
                  ) : (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{tx.subAccount}</p>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">{tx.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${tx.positive ? "text-emerald-300" : "text-foreground"}`}>
                {tx.positive ? "+" : "−"} {tx.value}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">No transactions found</p>
        )}
      </div>

      <Drawer open={!!openTx} onOpenChange={(o) => !o && setOpenTx(null)}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              {openTx?.status === "Pending" ? (
                <Clock className="w-4 h-4 text-accent-cyan" />
              ) : (
                <Check className="w-4 h-4 text-success" strokeWidth={3} />
              )}
              {openTx?.status} · {openTx?.name}
            </DrawerTitle>
            <DrawerDescription>{openTx?.subAccount}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created Date</span>
              <span className="text-foreground">{openTx?.createdDate ?? openTx?.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reflected on the portal by</span>
              <span className="text-foreground">{openTx?.reflectedDate ?? openTx?.date}</span>
            </div>
            <a
              href="#"
              className="block pt-3 text-pill underline underline-offset-4 text-sm"
            >
              Got an issue with this transaction?
            </a>
          </div>
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
}
