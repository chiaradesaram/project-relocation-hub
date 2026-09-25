import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Info, CheckCircle2, Lightbulb } from "lucide-react";
import { directInvestSplits } from "./invest";
import {
  RECURRING_INVESTMENT_SAVED_KEY,
  type RecurringInvestmentPlan,
  newRecurringInvestmentId,
  readRecurringInvestments,
  writeRecurringInvestments,
} from "@/lib/recurringInvestment";
import { Button } from "@/components/ui/button";

type SummarySearch = {
  method?: "instant" | "bank" | "flip" | "recurring";
  amount?: string;
  fund?: string;
  account?: string;
  bank?: string;
  fromBank?: string;
  repeats?: string;
  startDate?: string;
   frequency?: string;
   edit?: string;
};

export const Route = createFileRoute("/invest-summary")({
  validateSearch: (search: Record<string, unknown>): SummarySearch => ({
    method: (search.method as SummarySearch["method"]) ?? "instant",
    amount: (search.amount as string) ?? "0",
    fund: (search.fund as string) ?? "",
    account: (search.account as string) ?? "",
    bank: (search.bank as string) ?? "",
    fromBank: (search.fromBank as string) ?? "",
    repeats: (search.repeats as string) ?? "1",
    startDate: (search.startDate as string) ?? "",
    frequency: (search.frequency as string) ?? "Monthly",
    edit: (search.edit as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Review Investment — CAL" },
      { name: "description", content: "Review and confirm your CAL investment." },
      { property: "og:title", content: "Review Investment — CAL" },
      { property: "og:description", content: "Review and confirm your CAL investment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvestSummary,
});

function InvestSummary() {
  const navigate = useNavigate();
  const { method, amount, fund, account, bank, fromBank, repeats, startDate, frequency, edit } = Route.useSearch();
  const [showJustpayInfo, setShowJustpayInfo] = useState(false);

  const isInstant = method === "instant";
  const isRecurring = method === "recurring";
  const amountNum = parseFloat(amount || "0") || 0;
  const repeatsNum = Math.min(3, Math.max(1, parseInt(repeats || "1", 10) || 1));
  const splits = isInstant && repeatsNum > 1 ? directInvestSplits(amountNum) : [];
  const serviceCharge = isInstant || isRecurring ? 50 * repeatsNum : 0;
  const total = amountNum + serviceCharge;
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const today = new Date();
  const txDate = fmtDate(today);

  const methodLabel = isRecurring ? "Recurring Investment" : isInstant ? "Direct Invest" : "Bank Transfer";
  const recurringDate = startDate
    ? new Date(`${startDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const confirmInvestment = () => {
    if (isRecurring) {
      const plans = readRecurringInvestments();
      const next: Omit<RecurringInvestmentPlan, "id"> = {
        amount: amount ?? "0",
        fund: fund ?? "",
        account: account ?? "",
        bank: bank ?? "",
        startDate: startDate ?? "",
        frequency: frequency ?? "Monthly",
        active: true,
      };
      const idx = edit ? plans.findIndex((p) => p.id === edit) : -1;
      if (idx >= 0) plans[idx] = { ...plans[idx]!, ...next };
      else plans.push({ ...next, id: newRecurringInvestmentId() });
      writeRecurringInvestments(plans);
      localStorage.setItem(RECURRING_INVESTMENT_SAVED_KEY, "true");
      navigate({
        to: "/invest",
        search: { product: "unit-trust", method: "recurring" },
      });
      return;
    }
    navigate({ to: "/" });
  };

  // Quick check (bank transfer): derive the paying-from bank from the search param
  const [fromBankName, fromBankAcctNo] = (fromBank || "").split("·").map((p) => p.trim());
  const fromBankLast4 = fromBankAcctNo?.split(" ").pop() ?? "";

  return (
    <MobileLayout>
      <PageHeader title="Review & Confirm" showBack />

      {/* Total */}
      <div className="mx-4 mt-2 glass-card p-4 text-center">
        <p className="text-[12px] font-semibold text-muted-foreground tracking-wider">TOTAL</p>
        <p className="mt-1 text-2xl font-bold text-foreground">LKR {total.toLocaleString()}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {methodLabel}
        </p>
      </div>

      {/* Investment Details */}
      <div className="mx-4 mt-3 glass-card p-3">
        <p className="text-[12px] font-semibold text-muted-foreground tracking-wider mb-2">INVESTMENT DETAILS</p>
        <div className="space-y-2">
          <Row label="Investment amount" value={`LKR ${amountNum.toLocaleString()}`} />
          {splits.length > 1 && (
            <>
              <Row label="Split into" value={`${splits.length} transfers`} />
              {splits.map((part, i) => (
                <Row
                  key={i}
                  label={`Transfer ${i + 1}`}
                  value={`LKR ${part.toLocaleString()}`}
                />
              ))}
            </>
          )}
          {isInstant && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                Justpay service charge{splits.length > 1 ? ` × ${splits.length}` : ""}
                <button type="button" onClick={() => setShowJustpayInfo(!showJustpayInfo)} aria-label="About Justpay charge">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </button>
              </span>
              <span className="text-[12px] font-medium text-foreground">LKR {serviceCharge.toLocaleString()}</span>
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
              <p className="text-[12px] text-muted-foreground">
                Justpay is the payment provider that powers Direct Invest. To remove this charge, link a{" "}
                <span className="text-foreground font-medium">Seylan Bank</span> account.
              </p>
            </div>
          )}
          <Row label="Transaction date" value={txDate} />
          {method === "bank" && (
            <Row label="Unit creation date" value="2nd Monday of October" />
          )}
          {isRecurring && (
            <>
              <Row label="Start date" value={recurringDate} />
              <Row label="Frequency" value={frequency || "Monthly"} />
            </>
          )}
        </div>
      </div>

      {/* Quick check before you submit — bank transfer */}
      {method === "bank" && (
        <div
          className="mx-4 mt-4 rounded-2xl px-4 py-4"
          style={{
            background: "color-mix(in oklch, var(--card) 94%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in oklch, var(--pill) 18%, transparent)",
              }}
            >
              <Info className="w-4 h-4 text-pill" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Quick check before you submit
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              "Funds have been transferred to Deutsche Bank",
              `Funds were transferred from ${fromBankName} account ending ${fromBankLast4}`,
              "You have not used a wallet account",
            ].map((label) => (
              <li key={label} className="flex items-start gap-2.5">
                <span
                  className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--pill)" }}
                />
                <span className="text-[13px] leading-snug text-foreground">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] font-medium text-pill">
            All done? You're ready to submit.
          </p>
        </div>
      )}

      {/* Confirm */}
      <div className="mx-4 mt-4 mb-6">
        <Button
          onClick={confirmInvestment}
          className="w-full py-4 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition"
          style={{
            background: "var(--pill)",
            color: "var(--pill-foreground)",
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isRecurring ? "Confirm recurring investment" : "Confirm & Invest"}
        </Button>
      </div>
    </MobileLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

