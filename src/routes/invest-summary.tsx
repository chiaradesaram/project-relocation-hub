import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Info, Lightbulb, X } from "lucide-react";
import { directInvestSplits } from "./invest";
import {
  RECURRING_INVESTMENT_SAVED_KEY,
  type RecurringInvestmentPlan,
  newRecurringInvestmentId,
  readRecurringInvestments,
  writeRecurringInvestments,
} from "@/lib/recurringInvestment";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import requestSubmittedAnimation from "@/assets/request-submitted.gif";
import requestSubmittedInfo from "@/assets/request-submitted.png";

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
  const [submittedOpen, setSubmittedOpen] = useState(false);

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
  // Next 2nd Monday of October — when new units will be created for bank transfers
  const unitCreationDate = (() => {
    const secondMonday = (y: number) => {
      const firstDay = new Date(y, 9, 1).getDay();
      return 1 + ((8 - firstDay) % 7) + 7;
    };
    const now = new Date();
    let y = now.getFullYear();
    if (now > new Date(y, 9, secondMonday(y), 23, 59)) y += 1;
    const d = new Date(y, 9, secondMonday(y));
    const day = d.getDate();
    const ord =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";
    return `${day}${ord} October, ${d.toLocaleDateString("en-GB", { weekday: "short" })}`;
  })();

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
    }
    setSubmittedOpen(true);
  };

  const closeSheet = () => {
    setSubmittedOpen(false);
    return () => window.setTimeout(

  // Quick check (bank transfer): derive the paying-from bank from the search param
  const [fromBankName, fromBankAcctNo] = (fromBank || "").split("·").map((p) => p.trim());
  const fromBankLast4 = fromBankAcctNo?.split(" ").pop() ?? "";

  return (
    <MobileLayout>
      <PageHeader title="Review & Confirm" showBack />

      {/* Total + investment details — one card */}
      <div className="mx-4 mt-2 glass-card px-4 pt-4 pb-3">
        <div className="text-center">
          <p className="text-[13px] font-medium text-muted-foreground">Total to invest</p>
          <p className="mt-1.5 text-[28px] leading-none font-bold tracking-tight text-foreground tabular-nums">
            LKR {total.toLocaleString()}
          </p>
          <p className="mt-2 text-[12px] font-medium text-muted-foreground">{methodLabel}</p>
        </div>
        <div className="mt-4 mb-3 h-px w-full bg-border/60" />
        <div className="space-y-2.5">
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
              <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                Justpay service charge{splits.length > 1 ? ` × ${splits.length}` : ""}
                <button type="button" onClick={() => setShowJustpayInfo(!showJustpayInfo)} aria-label="About Justpay charge">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </button>
              </span>
              <span className="text-[13px] font-semibold text-foreground">LKR {serviceCharge.toLocaleString()}</span>
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
            <Row label="Unit creation date" value={unitCreationDate} />
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
          className="w-full py-4 rounded-full text-[15px] font-semibold transition"
          style={{
            background: "var(--pill)",
            color: "var(--pill-foreground)",
          }}
        >
          {isRecurring ? "Confirm recurring investment" : "Confirm & Invest"}
        </Button>
      </div>

      {/* Request submitted — Monzo-style confirmation sheet */}
      <Sheet open={submittedOpen} onOpenChange={setSubmittedOpen}>
        <SheetContent
          side="bottom"
          className="bank-help-sheet mx-auto w-full max-w-[480px] overflow-hidden rounded-t-3xl p-0 pb-0 border-0 backdrop-blur-2xl text-foreground"
        >
          <div className="bank-help-header relative">
            <picture className="block w-full">
              <source media="(prefers-reduced-motion: reduce)" srcSet={requestSubmittedInfo} />
              <img
                src={requestSubmittedAnimation}
                alt="A paper plane taking off with your investment request"
                className="block aspect-[768/345] w-full object-cover"
              />
            </picture>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close" className="absolute right-5 top-5 size-9 rounded-full bg-secondary text-foreground">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="px-7 pt-5 pb-1 text-center">
            <SheetTitle className="font-display text-xl leading-tight font-bold text-foreground">
              Your request has been submitted
            </SheetTitle>
            <p className="mt-2.5 type-body-sm leading-snug text-foreground">
              Once the money is matched, you will receive a{" "}
              <span className="font-semibold text-rates-mint">confirmation email</span>.
            </p>
          </div>
          <div className="px-7 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={finishConfirmation}
              className="flex h-12 w-full items-center justify-center rounded-full bg-pill type-label text-pill-foreground hover:bg-pill/90"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

