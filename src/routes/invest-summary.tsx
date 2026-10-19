import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  CalendarDays,
  Check,
  Copy,
  FilePlus2,
  Info,
  Lightbulb,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bankAccountLabel } from "@/lib/bankAccountLabel";
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
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const [accountCopied, setAccountCopied] = useState(false);
  const [creationInfoOpen, setCreationInfoOpen] = useState(false);

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
  const unitCreation = (() => {
    const secondMonday = (y: number) => {
      const firstDay = new Date(y, 9, 1).getDay();
      return 1 + ((8 - firstDay) % 7) + 7;
    };
    const now = new Date();
    let y = now.getFullYear();
    if (now > new Date(y, 9, secondMonday(y), 23, 59)) y += 1;
    return new Date(y, 9, secondMonday(y));
  })();
  const ordinal = (day: number) =>
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  const fmtTimeline = (d: Date) =>
    `${d.getDate()}${ordinal(d.getDate())} ${d.toLocaleDateString("en-GB", { month: "long" })}, ${d.toLocaleDateString("en-GB", { weekday: "short" })}`;
  const unitCreationDate = fmtTimeline(unitCreation);

  const methodLabel = isRecurring ? "Recurring Investment" : isInstant ? "Justpay (Direct Invest)" : "Bank Transfer";
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

  const trackRequest = () => {
    setSubmittedOpen(false);
    window.setTimeout(() => navigate({ to: "/transactions" }), 320);
  };

  const makeAnotherInvestment = () => {
    setSubmittedOpen(false);
    window.setTimeout(
      () =>
        navigate({
          to: "/invest",
          search: {
            product: "unit-trust",
            method: isRecurring ? "recurring" : isInstant ? "instant" : "bank",
          },
        }),
      320,
    );
  };


  // Quick check (bank transfer): derive the paying-from bank from the search param
  const [fromBankName, fromBankAcctNo] = (fromBank || "").split("·").map((p) => p.trim());

  // CAL's receiving account — the copy button copies this number
  const CAL_ACCOUNT_NUMBER = "0078 4521 0036";

  const copyCalAccount = () => {
    navigator.clipboard?.writeText(CAL_ACCOUNT_NUMBER).catch(() => {});
    setAccountCopied(true);
    window.setTimeout(() => setAccountCopied(false), 1500);
  };

  const quickChecks = [
    {
      title: "Money sent to CAL's Deutsche Bank account",
      copy: true,
    },
    {
      title: "It's a bank account, not a wallet",
    },
  ];

  // Investment timeline — bank transfer
  const timeline: {
    label: string;
    value: string;
    hint?: string;
    info?: boolean;
    tone: string;
    icon: ReactNode;
  }[] = [
    {
      label: "Request date",
      value: fmtTimeline(today),
      tone: "bg-rates-mint text-background",
      icon: <FilePlus2 className="size-[13px]" strokeWidth={2.25} />,
    },
    {
      label: "Creation date",
      value: unitCreationDate,
      info: true,
      tone: "bg-pill text-pill-foreground",
      icon: <CalendarDays className="size-[13px]" strokeWidth={2.25} />,
    },
  ];

  return (
    <MobileLayout>
      <PageHeader title="Review & Confirm" showBack />

      {/* Total + investment details — one card */}
      <div
        className="mx-4 mt-2 rounded-2xl px-4 pt-4 pb-3"
        style={{ background: "var(--sheet-field)" }}
      >
        <div className="text-center">
          <p className="text-[13px] font-medium text-muted-foreground">Total to invest</p>
          <p className="mt-1.5 text-[28px] leading-none font-bold tracking-tight text-foreground tabular-nums">
            LKR {total.toLocaleString()}
          </p>
          {method !== "bank" && (
            <p className="mt-2 text-[12px] font-medium text-muted-foreground">{methodLabel}</p>
          )}
        </div>
        <div className="mt-4 mb-3 h-px w-full bg-border/60" />
        <div className="space-y-2.5">
          {fund && <Row label="Fund" value={fund} />}
          {account && <Row label="Sub account" value={account} />}
          {method === "bank" && (fromBankName || fromBankAcctNo) && (
            <Row
              label="Transferred from"
              value={bankAccountLabel(fromBankName ?? "", fromBankAcctNo ?? "")}
            />
          )}
          {method !== "bank" && (
            <Row label="Investment amount" value={`LKR ${amountNum.toLocaleString()}`} />
          )}
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
                Justpay is the payment provider that powers this investment method. To remove this charge, link a{" "}
                <span className="text-foreground font-medium">Seylan Bank</span> account.
              </p>
            </div>
          )}
          {method !== "bank" && <Row label="Transaction date" value={txDate} />}
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
        <section
          className="mx-4 mt-4 rounded-2xl px-4 py-4 backdrop-blur-sm"
          style={{
            background: "color-mix(in oklch, var(--card) 94%, transparent)",
          }}
        >
          <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground">
            Quick check before you submit
          </h2>

          <ul className="mt-1 divide-y divide-border/40">
            {quickChecks.map((item, i) => (
              <li
                key={item.title}
                className="flex animate-fade-in items-center gap-2.5 py-2"
                style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
              >
                <Check
                  aria-hidden="true"
                  className="size-[13px] shrink-0 text-rates-mint"
                  strokeWidth={2.75}
                />
                <p className="text-[12px] min-w-0 flex-1 text-foreground">{item.title}</p>
                {item.copy && (
                  <button
                    type="button"
                    aria-label="Copy CAL bank account number"
                    onClick={copyCalAccount}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-sheet-field"
                  >
                    {accountCopied ? (
                      <Check className="size-[15px] text-success" />
                    ) : (
                      <Copy className="size-[15px] text-pill-bright" />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>

        </section>
      )}

      {/* Investment timeline */}
      {method === "bank" && (
        <section
          className="mx-4 mt-4 rounded-2xl px-4 py-4 backdrop-blur-sm"
          style={{ background: "color-mix(in oklch, var(--card) 94%, transparent)" }}
        >
          <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground">
            Investment timeline
          </h2>

          <ol className="mt-3">
            {timeline.map((step, i) => (
              <li
                key={step.label}
                className="relative flex animate-fade-in gap-3 pb-4 last:pb-0"
                style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
              >
                {i < timeline.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3 top-7 w-px bg-border/70"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    step.tone,
                  )}
                >
                  {step.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-muted-foreground">{step.label}</span>
                    <span className="flex items-center gap-1.5">
                      {step.info && (
                        <button
                          type="button"
                          onClick={() => setCreationInfoOpen(true)}
                          aria-label="About the creation date"
                          className="flex size-[16px] shrink-0 items-center justify-center rounded-full transition active:scale-90"
                          style={{ background: "var(--pill)" }}
                        >
                          <span
                            className="text-[10px] font-bold leading-none"
                            style={{ color: "var(--pill-foreground)" }}
                          >
                            i
                          </span>
                        </button>
                      )}
                      <span className="text-[13px] font-semibold whitespace-nowrap text-foreground tabular-nums">
                        {step.value}
                      </span>
                    </span>
                  </div>
                  {step.hint && (
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{step.hint}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
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

      {/* Creation date — what the info icon explains */}
      <Sheet open={creationInfoOpen} onOpenChange={setCreationInfoOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Creation date" onClose={() => setCreationInfoOpen(false)} />
          <p className="text-[13px] leading-snug text-foreground">
            This is the date your investment will be valued. Your units are created at this
            date&rsquo;s price.
          </p>
          <div className="mt-4 rounded-2xl bg-background/40 px-4 py-1">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] text-foreground">Creation date</span>
              <span className="text-[13px] font-semibold text-foreground tabular-nums">
                {unitCreationDate}
              </span>
            </div>
          </div>
          <div className="pt-5 pb-6">
            <Button
              onClick={() => setCreationInfoOpen(false)}
              className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
              style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
            >
              Got it
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Request sent — same confirmation sheet as redemptions */}
      <Sheet open={submittedOpen} onOpenChange={(o) => (o ? setSubmittedOpen(true) : trackRequest())}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetTitle className="sr-only">Request sent</SheetTitle>
          <div className="px-1 pb-4 pt-6 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "color-mix(in oklch, var(--success) 22%, transparent)" }}
            >
              <Check className="w-8 h-8" strokeWidth={2.5} style={{ color: "var(--success)" }} />
            </div>
            <p className="text-base font-semibold text-foreground mt-4">
              {isRecurring ? "Plan created" : "Request sent"}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
              {isRecurring
                ? `LKR ${amountNum.toLocaleString()} will be invested in ${fund} every month`
                : `LKR ${total.toLocaleString()} into ${fund || "your fund"} — we'll email you once it's matched`}
            </p>
          </div>
          <div className="pt-2 pb-6 space-y-2.5">
            <Button
              onClick={trackRequest}
              className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
              style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
            >
              Track my request
            </Button>
            <Button
              variant="ghost"
              onClick={makeAnotherInvestment}
              className="w-full h-auto py-2 rounded-full text-[13px] font-semibold text-pill-bright"
            >
              Make another investment
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function SheetHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <SheetHeader className="flex-row items-center justify-between space-y-0 pb-3">
      <SheetTitle>{title}</SheetTitle>
      <button onClick={onClose} className="rounded-full bg-secondary p-1" aria-label="Close">
        <X className="h-4 w-4" />
      </button>
    </SheetHeader>
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

