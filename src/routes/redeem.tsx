import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  Zap,
  Clock,
  Repeat,
  Wallet,
  ChevronRight,
  X,
  Plus,
  Check,
  Info,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { RadioDot } from "@/components/RadioDot";
import { ViewRatesLink } from "@/components/ViewRates";
import { isPopularFund } from "@/lib/fundMeta";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import commercialLogo from "@/assets/banks/commercial.png";
import sampathLogo from "@/assets/banks/sampath.png";
import hnbLogo from "@/assets/banks/hnb.png";

type RedeemMethod = "instant" | "normal" | "plan" | "payout";

export const Route = createFileRoute("/redeem")({
  validateSearch: (s: Record<string, unknown>): { product?: string; method?: RedeemMethod } => ({
    product: typeof s.product === "string" ? s.product : undefined,
    method:
      s.method === "instant" || s.method === "normal" || s.method === "plan" || s.method === "payout"
        ? s.method
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Redeem — CAL" },
      { name: "description", content: "Redeem your unit trusts or pay out your equity cash balance with CAL." },
      { property: "og:title", content: "Redeem — CAL" },
      { property: "og:description", content: "Redeem your unit trusts or pay out your equity cash balance with CAL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Redeem,
});

const INSTANT_LIMIT = 100000;
const EQUITY_CASH_BALANCE = 250000;

const fundSubAccounts: Record<string, { name: string; value: number; pending?: number }[]> = {
  "CAL Growth Fund": [
    { name: "Chiara's wealth account", value: 170000, pending: 20000 },
    { name: "Retirement", value: 92500 },
    { name: "General", value: 41200 },
  ],
  "CAL Income Fund": [
    { name: "Personal account", value: 84300 },
    { name: "Emergency", value: 36700 },
  ],
  "CAL Balanced Fund": [
    { name: "Personal account", value: 61800 },
    { name: "New car", value: 24950 },
  ],
  "CAL Money Market Fund": [
    { name: "Personal account", value: 32100 },
    { name: "Short term", value: 18450 },
  ],
};
const funds = Object.keys(fundSubAccounts);
const banks = [
  { label: "Commercial Bank · 8001 2345 21", logo: commercialLogo },
  { label: "Sampath Bank · 1100 5688 32", logo: sampathLogo },
  { label: "HNB · 0452 2012 09", logo: hnbLogo },
];

const lkr = (n: number) => `LKR ${n.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const methodMeta: Record<RedeemMethod, { label: string; icon: typeof Zap; desc: string }> = {
  instant: {
    icon: Zap,
    label: "Instant Redemption",
    desc: "Get money in your bank account right away. Up to LKR 100,000 or 50% of your sub account value, whichever is lower.",
  },
  normal: {
    icon: Clock,
    label: "Normal Redemption",
    desc: "Redeem any amount, no limit. Requests before 9 AM are processed the same working day, after 9 AM the next working day.",
  },
  plan: {
    icon: Repeat,
    label: "Redemption Plan",
    desc: "Get a regular payout from a sub account to your bank on a schedule you choose.",
  },
  payout: {
    icon: Wallet,
    label: "Pay Out",
    desc: "Withdraw money from your equity cash balance to your bank account.",
  },
};

function Redeem() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const isEquities = search.product === "equities";

  if (!search.method) {
    const ids: RedeemMethod[] = isEquities ? ["payout"] : ["normal", "instant", "plan"];
    return (
      <MobileLayout>
        <PageHeader title="Redeem" showBack />
        <div className="px-4 mt-2">
          <p className="text-[13px] text-muted-foreground leading-snug">
            How would you like to {isEquities ? "withdraw" : "redeem"}?
          </p>
        </div>
        <div className="mx-4 mt-4 space-y-2.5">
          {ids.map((id) => {
            const { icon: Icon, label, desc } = methodMeta[id];
            return (
              <button
                key={id}
                onClick={() => navigate({ to: "/redeem", search: { ...search, method: id } })}
                className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-4 py-4 text-left transition hover:bg-muted/10"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--pill)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </MobileLayout>
    );
  }

  return <RedeemForm method={search.method} />;
}

function RedeemForm({ method }: { method: RedeemMethod }) {
  const navigate = useNavigate();
  const isPayout = method === "payout";
  const isPlan = method === "plan";
  const isInstant = method === "instant";

  const [fund, setFund] = useState("");
  const [sub, setSub] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [picker, setPicker] = useState<null | "fund" | "sub" | "bank" | "date" | "frequency">(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [balanceInfoOpen, setBalanceInfoOpen] = useState(false);

  const balance = isPayout
    ? EQUITY_CASH_BALANCE
    : fundSubAccounts[fund]?.find((s) => s.name === sub)?.value ?? 0;
  const pendingRedemption = isPayout
    ? 0
    : fundSubAccounts[fund]?.find((s) => s.name === sub)?.pending ?? 0;
  const available = Math.max(0, balance - pendingRedemption);
  const hasSource = isPayout || (!!fund && !!sub);
  const maxAmount = isInstant ? Math.min(INSTANT_LIMIT, available * 0.5) : available;
  const amountNum = Number(amount || 0);
  const overMax = hasSource && amountNum > maxAmount;

  const canReview =
    hasSource && !!bank && amountNum > 0 && !overMax && (!isPlan || !!startDate);

  const amountHint = !hasSource
    ? isPayout
      ? ""
      : "Pick a fund and sub account to see how much you can redeem"
    : isInstant
      ? `Max ${lkr(maxAmount)} · lower of LKR 100,000 or 50% of ${lkr(available)}`
      : isPlan
        ? `Per payout · available ${lkr(available)}`
        : `${lkr(available)} available to redeem`;

  const closePicker = () => setPicker(null);
  const { label: title } = methodMeta[method];

  return (
    <MobileLayout>
      <PageHeader title={title} showBack />

      {/* Amount hero */}
      <div className="px-4 pt-6 pb-6 text-center">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-[18px] font-medium text-muted-foreground">LKR</span>
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountDisplay(amount)}
            onChange={(e) => setAmount(sanitizeAmountInput(e.target.value))}
            placeholder="0"
            className="bg-transparent text-[44px] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none text-center"
            style={{ width: `${Math.max(2, (formatAmountDisplay(amount) || "0").length)}ch` }}
          />
        </div>
        {amountHint && <p className="mt-3 text-[12px] text-muted-foreground">{amountHint}</p>}
        {hasSource && pendingRedemption > 0 && (
          <div className="mt-3 flex justify-center">
            <div
              className="inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3"
              style={{ background: "color-mix(in oklch, var(--pill) 14%, transparent)" }}
            >
              <button
                type="button"
                onClick={() => setBalanceInfoOpen(true)}
                aria-label="Why is my available balance different?"
                className="flex size-[18px] shrink-0 items-center justify-center rounded-full transition active:scale-90"
                style={{ background: "var(--pill)" }}
              >
                <span
                  className="text-[11px] font-bold leading-none"
                  style={{ color: "var(--pill-foreground)" }}
                >
                  i
                </span>
              </button>
              <span className="text-[12px] font-medium" style={{ color: "var(--pill-bright)" }}>
                {lkr(pendingRedemption)} redemption being processed
              </span>
            </div>
          </div>
        )}
        {overMax && (
          <p className="mt-1 text-[12px] text-destructive">
            {isInstant
              ? "That's over your instant limit. Try Normal Redemption for larger amounts."
              : "That's more than your available balance."}
          </p>
        )}
      </div>

      {/* From */}
      <SectionTitle>{isPayout ? "Withdraw from" : "Redeem from"}</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
        {isPayout ? (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-sm text-muted-foreground">Equity cash balance</span>
            <span className="flex-1 text-right text-sm font-semibold text-foreground">
              {lkr(EQUITY_CASH_BALANCE)}
            </span>
          </div>
        ) : (
          <>
            <PickerRow label="Fund" value={fund} placeholder="Select fund" onClick={() => setPicker("fund")} />
            <PickerRow
              label="Sub account"
              value={sub}
              placeholder={fund ? "Select sub account" : "Pick a fund first"}
              onClick={() => fund && setPicker("sub")}
            />
          </>
        )}
      </div>

      {/* Schedule for plan */}
      {isPlan && (
        <>
          <SectionTitle>Schedule</SectionTitle>
          <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
            <PickerRow
              label="Start date"
              value={startDate ? fmtDate(startDate) : ""}
              placeholder="Select date"
              onClick={() => setPicker("date")}
            />
            <PickerRow label="Frequency" value="Monthly" placeholder="" onClick={() => setPicker("frequency")} />
          </div>
        </>
      )}

      {/* Pay to */}
      <SectionTitle>Pay to</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
        <PickerRow label="Bank account" value={bank} placeholder="Select bank" onClick={() => setPicker("bank")} />
      </div>

      {isInstant && (
        <InfoNote>
          Instant redemptions can be made anytime, including weekends and holidays.
        </InfoNote>
      )}
      {method === "normal" && (
        <InfoNote>Requests before 9 AM are processed the same working day. After 9 AM, the next working day.</InfoNote>
      )}

      <div className="mx-4 mt-6 mb-6">
        <Button
          disabled={!canReview}
          onClick={() => setReviewOpen(true)}
          className="w-full py-4 h-auto rounded-full text-[15px] font-semibold disabled:opacity-50"
          style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
        >
          Review
        </Button>
      </div>

      {/* Fund picker */}
      <Sheet open={picker === "fund"} onOpenChange={(o) => !o && closePicker()}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Select fund" onClose={closePicker} extra={<ViewRatesLink />} />
          <div className="space-y-1.5 pb-6">
            {funds.map((f) => (
              <OptionRow
                key={f}
                selected={fund === f}
                onClick={() => {
                  setFund(f);
                  setSub("");
                  setPicker("sub");
                }}
              >
                <span className="flex-1 text-sm text-foreground">{f}</span>
                {isPopularFund(f) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pill/15 text-pill">
                    Popular
                  </span>
                )}
              </OptionRow>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sub account picker */}
      <Sheet open={picker === "sub"} onOpenChange={(o) => !o && closePicker()}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Select sub account" onClose={closePicker} />
          <div className="space-y-1.5 pb-6">
            {(fundSubAccounts[fund] ?? []).map((s) => (
              <OptionRow
                key={s.name}
                selected={sub === s.name}
                onClick={() => {
                  setSub(s.name);
                  closePicker();
                }}
              >
                <span className="flex-1 text-sm text-foreground">{s.name}</span>
                <span className="text-[12px] text-muted-foreground">
                  {lkr(s.value - (s.pending ?? 0))}
                </span>
              </OptionRow>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bank picker */}
      <Sheet open={picker === "bank"} onOpenChange={(o) => !o && closePicker()}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Pay to" onClose={closePicker} />
          <div className="space-y-1.5 pb-6">
            {banks.map((b) => (
              <OptionRow
                key={b.label}
                selected={bank === b.label}
                onClick={() => {
                  setBank(b.label);
                  closePicker();
                }}
              >
                <img src={b.logo} alt="" className="w-8 h-8 rounded-full bg-foreground object-contain p-1" />
                <span className="flex-1 text-sm text-foreground">{b.label}</span>
              </OptionRow>
            ))}
            <button
              onClick={() => navigate({ to: "/bank-accounts" })}
              className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border/60 px-4 py-3 text-left"
            >
              <Plus className="w-4 h-4 text-pill" />
              <span className="text-sm font-medium text-pill">Add bank account</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Date picker */}
      <Sheet open={picker === "date"} onOpenChange={(o) => !o && closePicker()}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Start date" onClose={closePicker} />
          <div className="flex justify-center pb-6">
            <Calendar
              mode="single"
              selected={startDate}
              disabled={{ before: new Date() }}
              onSelect={(d) => {
                setStartDate(d);
                closePicker();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Frequency */}
      <Sheet open={picker === "frequency"} onOpenChange={(o) => !o && closePicker()}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Frequency" onClose={closePicker} />
          <div className="space-y-1.5 pb-6">
            <OptionRow selected onClick={closePicker}>
              <span className="flex-1 text-sm text-foreground">Monthly</span>
            </OptionRow>
            <p className="px-1 pt-1 text-[12px] text-muted-foreground">
              We'll pay out the same amount on this date every month.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Why the available balance differs */}
      <Sheet open={balanceInfoOpen} onOpenChange={setBalanceInfoOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Your available balance" onClose={() => setBalanceInfoOpen(false)} />
          <p className="text-[13px] leading-snug text-foreground">
            Your available balance is adjusted for any redemptions you may have ongoing.
          </p>
          <div className="mt-4 rounded-2xl bg-background/40 px-4 py-1 divide-y divide-border/30">
            {[
              ["Sub account balance", lkr(balance)],
              ["Being redeemed", `- ${lkr(pendingRedemption)}`],
              ["Available to redeem", lkr(available)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[13px] text-foreground">{k}</span>
                <span className="text-[13px] font-semibold text-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-snug text-foreground">
            Once the redemption in progress is processed, your balance and available amount will
            both update.
          </p>
          <div className="pt-5 pb-6">
            <Button
              onClick={() => setBalanceInfoOpen(false)}
              className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
              style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
            >
              Got it
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Review */}
      <Sheet
        open={reviewOpen}
        onOpenChange={(o) => {
          setReviewOpen(o);
          if (!o && sent) navigate({ to: "/transactions" });
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl">
          {sent ? (
            <div className="px-1 pb-10 pt-6 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "color-mix(in oklch, var(--success) 22%, transparent)" }}
              >
                <Check className="w-8 h-8" strokeWidth={2.5} style={{ color: "var(--success)" }} />
              </div>
              <p className="text-base font-semibold text-foreground mt-4">
                {isPlan ? "Plan created" : "Request sent"}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                {isPlan
                  ? `${lkr(amountNum)} will be paid to ${bank.split(" · ")[0]} every month`
                  : `${lkr(amountNum)} is on its way to ${bank.split(" · ")[0]}`}
              </p>
            </div>
          ) : (
            <>
              <SheetHead title="Review" onClose={() => setReviewOpen(false)} />
              <div className="text-center pb-4">
                <p className="text-[12px] text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{lkr(amountNum)}</p>
              </div>
              <div className="rounded-2xl bg-background/40 px-4 py-2 divide-y divide-border/30">
                {isPayout ? (
                  <ReviewRow label="From" value="Equity cash balance" />
                ) : (
                  <>
                    <ReviewRow label="Fund" value={fund} />
                    <ReviewRow label="Sub account" value={sub} />
                  </>
                )}
                <ReviewRow label="Pay to" value={bank} />
                {isPlan ? (
                  <>
                    <ReviewRow label="Start date" value={startDate ? fmtDate(startDate) : ""} />
                    <ReviewRow label="Frequency" value="Monthly" />
                  </>
                ) : (
                  <ReviewRow label="Request date" value={fmtDate(new Date())} />
                )}
              </div>
              <div className="pt-5 pb-6">
                <Button
                  onClick={() => setSent(true)}
                  className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
                  style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
                >
                  {isPlan ? "Create plan" : isPayout ? "Confirm pay out" : "Confirm redemption"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-5 mt-5 mb-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
      {children}
    </h2>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-4 mt-3 flex items-start gap-2 px-1">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pill" />
      <p className="text-[12px] text-muted-foreground leading-snug">{children}</p>
    </div>
  );
}

function PickerRow({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/10 border-b border-border/20 last:border-b-0"
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`flex-1 text-right text-sm font-medium truncate ${
          value ? "text-foreground" : "text-muted-foreground/70"
        }`}
      >
        {value || placeholder}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SheetHead({
  title,
  onClose,
  extra,
}: {
  title: string;
  onClose: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <SheetHeader className="flex-row items-center justify-between space-y-0 pb-3">
      <SheetTitle>{title}</SheetTitle>
      <div className="flex items-center gap-3">
        {extra}
        <button onClick={onClose} className="rounded-full bg-secondary p-1" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </SheetHeader>
  );
}

function OptionRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl bg-background/40 px-4 py-3 text-left transition hover:bg-muted/10"
    >
      {children}
      <RadioDot selected={selected} />
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right truncate">{value}</span>
    </div>
  );
}
