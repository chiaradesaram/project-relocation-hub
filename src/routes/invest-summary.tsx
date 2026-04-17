import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Info, CheckCircle2, Lightbulb } from "lucide-react";

type SummarySearch = {
  method?: "instant" | "bank" | "flip";
  amount?: string;
  fund?: string;
  account?: string;
  bank?: string;
};

export const Route = createFileRoute("/invest-summary")({
  validateSearch: (search: Record<string, unknown>): SummarySearch => ({
    method: (search.method as SummarySearch["method"]) ?? "instant",
    amount: (search.amount as string) ?? "0",
    fund: (search.fund as string) ?? "",
    account: (search.account as string) ?? "",
    bank: (search.bank as string) ?? "",
  }),
  component: InvestSummary,
});

function InvestSummary() {
  const navigate = useNavigate();
  const { method, amount, fund, account, bank } = Route.useSearch();
  const [showJustpayInfo, setShowJustpayInfo] = useState(false);
  const [openInfo, setOpenInfo] = useState<"creation" | "reflected" | null>(null);

  const isInstant = method === "instant";
  const amountNum = parseFloat(amount || "0") || 0;
  const serviceCharge = isInstant ? 50 : 0;
  const total = amountNum + serviceCharge;
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const today = new Date();
  const txDate = fmtDate(today);
  const creationDate = fmtDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000));
  const reflectedDate = fmtDate(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000));

  return (
    <MobileLayout>
      <PageHeader title="Review & Confirm" showBack />

      {/* Total */}
      <div className="mx-4 mt-2 glass-card p-4 text-center">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">TOTAL</p>
        <p className="mt-1 text-2xl font-bold text-foreground">LKR {total.toLocaleString()}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {isInstant ? "Direct Invest" : "Bank Transfer"}
        </p>
      </div>

      {/* Investment Details */}
      <div className="mx-4 mt-3 glass-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">INVESTMENT DETAILS</p>
        <div className="space-y-2">
          <Row label="Investment amount" value={`LKR ${amountNum.toLocaleString()}`} />
          {isInstant && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                Justpay service charge
                <button type="button" onClick={() => setShowJustpayInfo(!showJustpayInfo)} aria-label="About Justpay charge">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </button>
              </span>
              <span className="text-[11px] font-medium text-foreground">LKR {serviceCharge.toLocaleString()}</span>
            </div>
          )}
          {isInstant && showJustpayInfo && (
            <div
              className="flex items-start gap-2 p-2.5 rounded-lg border"
              style={{
                background: "color-mix(in oklch, var(--portfolio-blue) 12%, transparent)",
                borderColor: "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
              }}
            >
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--portfolio-blue)" }} />
              <p className="text-[10px] text-muted-foreground">
                Justpay is the payment provider that powers Direct Invest. To remove this charge, link a{" "}
                <span className="text-foreground font-medium">Seylan Bank</span> account.
              </p>
            </div>
          )}
          <Row label="Transaction date" value={txDate} />
          {!isInstant && (
            <>
              <RowWithInfo
                label="Creation date"
                value={creationDate}
                open={openInfo === "creation"}
                onToggle={() => setOpenInfo(openInfo === "creation" ? null : "creation")}
                infoText="The date your investment becomes active."
              />
              <RowWithInfo
                label="Reflected on Portal — by"
                value={reflectedDate}
                open={openInfo === "reflected"}
                onToggle={() => setOpenInfo(openInfo === "reflected" ? null : "reflected")}
                infoText="Your investment will appear in your CAL Online portfolio and mobile app by this date, once all processing is complete."
              />
            </>
          )}
        </div>
      </div>

      {/* Fund Info */}
      <div className="mx-4 mt-3 glass-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">FUND INFO</p>
        <div className="space-y-2">
          <Row label="Fund name" value={fund || "—"} />
          <Row label="Sub account" value={account || "—"} />
          <Row label={isInstant ? "Pay from" : "Pay to"} value={bank || "—"} />
        </div>
      </div>

      {/* Confirm */}
      <div className="mx-4 mt-4 mb-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirm & Invest
        </button>
      </div>
    </MobileLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function RowWithInfo({
  label,
  value,
  open,
  onToggle,
  infoText,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  infoText: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          {label}
          <button type="button" onClick={onToggle} aria-label={`About ${label}`}>
            <Info className="w-3 h-3 text-muted-foreground" />
          </button>
        </span>
        <span className="text-[11px] font-medium text-foreground text-right">{value}</span>
      </div>
      {open && (
        <p className="mt-1 text-[10px] text-muted-foreground/80 leading-relaxed">{infoText}</p>
      )}
    </div>
  );
}
