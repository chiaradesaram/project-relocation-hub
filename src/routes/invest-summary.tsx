import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  const [accountCopied, setAccountCopied] = useState(false);

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
  // The portal shows the creation price one working day later (weekends skipped)
  const nextWorkingDay = (d: Date) => {
    const n = new Date(d);
    do {
      n.setDate(n.getDate() + 1);
    } while (n.getDay() === 0 || n.getDay() === 6);
    return n;
  };
  const unitCreationDate = fmtTimeline(unitCreation);
  const portalDate = fmtTimeline(nextWorkingDay(unitCreation));

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
  const timeline = [
    {
      label: "Request date",
      value: fmtTimeline(today),
      hint: "When you raised this Creation Request",
      tone: "bg-rates-mint text-background",
      icon: <FilePlus2 className="size-[13px]" strokeWidth={2.25} />,
    },
    {
      label: "Creation date",
      value: unitCreationDate,
      hint: "The date your investment will be valued",
      tone: "bg-pill text-pill-foreground",
      icon: <CalendarDays className="size-[13px]" strokeWidth={2.25} />,
    },
    {
      label: "Reflected on the portal",
      value: portalDate,
      hint: "A working day after creation",
      tone: "bg-secondary text-pill-bright",
      icon: <TrendingUp className="size-[13px]" strokeWidth={2.25} />,
    },
  ];

  return (
    <MobileLayout>
      <PageHeader title="Review & Confirm" showBack />

      {/* Total + investment details — one card */}
      <div
        className="mx-4 mt-2 rounded-2xl px-4 pt-4 pb-3"
        style={{ background: "var(--sheet-field-light)" }}
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
              label="Bank transferred from"
              value={[fromBankName, fromBankAcctNo].filter(Boolean).join(" · ")}
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
                Justpay is the payment provider that powers Direct Invest. To remove this charge, link a{" "}
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
                    className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-sheet-field"
                  >
                    {accountCopied ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4 text-pill-bright" />
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
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] text-muted-foreground">{step.label}</span>
                    <span className="text-[13px] font-semibold whitespace-nowrap text-foreground tabular-nums">
                      {step.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{step.hint}</p>
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
          <div className="space-y-2.5 px-7 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={trackRequest}
              className="flex h-12 w-full items-center justify-center rounded-full bg-pill type-label text-pill-foreground hover:bg-pill/90"
            >
              Track my request
            </Button>
            <Button
              variant="secondary"
              onClick={makeAnotherInvestment}
              className="flex h-12 w-full items-center justify-center rounded-full type-label hover:bg-secondary/80"
            >
              Make another investment
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

