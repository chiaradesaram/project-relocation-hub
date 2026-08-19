import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  Zap,
  Building2,
  ArrowLeftRight,
  ChevronRight,
  Upload,
  AlertTriangle,
  Star,
  X,
  Image as ImageIcon,
  Check,
  Wallet,
  CalendarDays,
  ArrowDown,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ModernSelect from "@/components/ModernSelect";
import { Calendar } from "@/components/ui/calendar";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type InvestMethod = "instant" | "bank" | "flip" | "payin" | "utflip";

export const Route = createFileRoute("/invest")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { product?: string; method?: InvestMethod } => ({
    product: typeof search.product === "string" ? search.product : undefined,
    method:
      search.method === "instant" ||
      search.method === "bank" ||
      search.method === "flip" ||
      search.method === "payin" ||
      search.method === "utflip"
        ? (search.method as InvestMethod)
        : undefined,
  }),
  component: Invest,
});

const funds = [
  "CAL Growth Fund",
  "CAL Income Fund",
  "CAL Balanced Fund",
  "CAL Money Market Fund",
];
const accounts = ["Main Account", "Joint Account", "Minor Account"];
const banks = [
  "Commercial Bank ****2849",
  "Deutsche Bank ****1122",
  "Sampath Bank ****9034",
  "HNB ****4507",
  "BOC ****7781",
];
const calBankAccounts = [
  { label: "CAL Securities Account", note: "Deutsche Bank · Auto-verified" },
  { label: "CAL — Commercial Bank", note: "8001 2345 678" },
  { label: "CAL — HNB", note: "7700 1234 567 · Closing soon" },
];

const DIRECT_INVEST_LIMIT = 149950;

function Invest() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const isEquities = search.product === "equities";

  // Method picker landing
  if (!search.method) {
    const methodCards: {
      id: InvestMethod;
      icon: typeof Zap;
      label: string;
      desc: string;
    }[] = isEquities
      ? [
          {
            id: "payin",
            icon: Wallet,
            label: "Pay in",
            desc: "Add cash to your equity account from your bank.",
          },
          {
            id: "instant",
            icon: Zap,
            label: "Direct Invest",
            desc: "Instant bank rail. Max LKR 149,950 per transfer.",
          },
          {
            id: "utflip",
            icon: ArrowLeftRight,
            label: "Transfer from Unit Trusts",
            desc: "Move money from a unit trust into your equity account.",
          },
        ]
      : [
      {
        id: "instant",
        icon: Zap,
        label: "Direct Invest",
        desc: "Instant bank rail. Max LKR 149,950 per transfer.",
      },
      {
        id: "bank",
        icon: Building2,
        label: "Bank Transfer",
        desc:
          "Any amount. 1–2 business days. Upload proof unless paying Deutsche Bank.",
      },
      {
        id: "flip",
        icon: ArrowLeftRight,
        label: "Flip",
        desc: "Move funds between your CAL accounts instantly. No fees.",
      },
    ];

    return (
      <MobileLayout>
        <PageHeader title="Invest" showBack helpTopic="invest" />
        <div className="px-4 mt-2">
          <p className="text-[13px] text-muted-foreground leading-snug">
            How would you like to invest?
          </p>
        </div>
        <div className="mx-4 mt-4 space-y-2.5">
          {methodCards.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() =>
                navigate({
                  to: "/invest",
                  search: { ...search, method: id },
                })
              }
              className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-4 py-4 text-left transition hover:bg-muted/10"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--pill)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {label}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                  {desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (isEquities) return <EquitiesForm method={search.method} />;
  if (search.method === "payin" || search.method === "utflip")
    return <EquitiesForm method={search.method} />;
  return <MethodForm method={search.method} />;
}

type PickerKind = null | "fund" | "account" | "payFrom" | "payTo" | "flipTo";

function MethodForm({
  method,
}: {
  method: Exclude<InvestMethod, "payin" | "utflip">;
}) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("Personal Account");
  const [selectedBank, setSelectedBank] = useState(
    method === "bank" ? "Commercial Bank ****2849" : "",
  );
  const [selectedPayTo, setSelectedPayTo] = useState(
    method === "bank" ? "CAL Securities Account" : "",
  );
  const [selectedFlipTo, setSelectedFlipTo] = useState("");
  const [proofName, setProofName] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerKind>(null);
  const [linkedGoal, setLinkedGoal] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);

  const title =
    method === "instant"
      ? "Direct Invest"
      : method === "bank"
        ? "Bank transfer"
        : "Flip";

  const isBank = method === "bank";
  const isFlip = method === "flip";
  const isInstant = method === "instant";

  const amountNum = parseFloat(amount || "0") || 0;

  const handleAmountChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    if (isInstant) {
      const n = parseFloat(sanitized || "0") || 0;
      if (n > DIRECT_INVEST_LIMIT) {
        setAmount(String(DIRECT_INVEST_LIMIT));
        return;
      }
    }
    setAmount(sanitized);
  };

  const payFromLabel = isFlip ? "Transfer from" : "Paying from";
  const payFromValue = isFlip ? selectedFund : selectedBank;
  const payFromPlaceholder = isFlip ? "Select a fund" : "Select bank account";

  const sendToLabel = isFlip ? "Transfer to" : "Send to";
  const sendToValue = isFlip ? selectedFlipTo : selectedPayTo;
  const sendToPlaceholder = isFlip
    ? "Select destination fund"
    : "Select CAL account";

  const isDeutsche = selectedPayTo.toLowerCase().includes("deutsche");
  const needsProof = isBank && !isDeutsche;

  const canReview = (() => {
    if (amountNum <= 0) return false;
    if (isFlip) return !!selectedFund && !!selectedFlipTo;
    if (!selectedFund || !selectedAccount) return false;
    if (isInstant) return !!selectedBank;
    if (isBank) return !!selectedBank && !!selectedPayTo && (!needsProof || !!proofName);
    return false;
  })();

  const handleReview = () => {
    navigate({
      to: "/invest-summary",
      search: {
        method,
        amount: amount || "0",
        fund: selectedFund,
        account: selectedAccount,
        bank: isFlip ? selectedFlipTo : isInstant ? selectedBank : selectedPayTo,
      },
    });
  };

  // ---- Picker options ----
  const pickerOptions: Record<Exclude<PickerKind, null>, string[]> = {
    fund: funds,
    account: accounts,
    payFrom: isFlip ? funds : banks,
    payTo: calBankAccounts.map((a) => a.label),
    flipTo: funds,
  };
  const pickerTitles: Record<Exclude<PickerKind, null>, string> = {
    fund: "Select fund",
    account: "Select sub-account",
    payFrom: isFlip ? "Transfer from" : "Paying from",
    payTo: "Send to",
    flipTo: "Transfer to",
  };

  const handlePick = (value: string) => {
    if (picker === "fund") setSelectedFund(value);
    if (picker === "account") setSelectedAccount(value);
    if (picker === "payFrom") {
      if (isFlip) setSelectedFund(value);
      else setSelectedBank(value);
    }
    if (picker === "payTo") setSelectedPayTo(value);
    if (picker === "flipTo") setSelectedFlipTo(value);
    setPicker(null);
  };

  return (
    <MobileLayout>
      <PageHeader title={title} showBack helpTopic="invest" />

      {/* Amount hero */}
      <div className="px-4 pt-6 pb-6 text-center">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-[18px] font-medium text-muted-foreground">
            LKR
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountDisplay(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="bg-transparent text-[44px] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none text-center"
            style={{
              width: `${Math.max(
                2,
                (formatAmountDisplay(amount) || "0").length,
              )}ch`,
            }}
          />
        </div>
        {isInstant && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Max LKR {DIRECT_INVEST_LIMIT.toLocaleString()} per transfer
          </p>
        )}
      </div>

      {/* Details card */}
      <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
        <PickerRow
          label="Fund"
          value={selectedFund}
          placeholder="Select a fund"
          onClick={() => setPicker("fund")}
        />
        {!isFlip && (
          <PickerRow
            label="Sub-account"
            value={selectedAccount}
            placeholder="Select sub-account"
            onClick={() => setPicker("account")}
          />
        )}
        <PickerRow
          label={payFromLabel}
          value={payFromValue}
          placeholder={payFromPlaceholder}
          onClick={() => setPicker("payFrom")}
        />
        {(isBank || isFlip) && (
          <PickerRow
            label={sendToLabel}
            value={sendToValue}
            placeholder={sendToPlaceholder}
            onClick={() => setPicker(isFlip ? "flipTo" : "payTo")}
          />
        )}
      </div>

      {/* Recurring — Direct Invest only */}
      {isInstant && (
        <div className="mx-4 mt-4">
          <RecurringToggle value={recurring} onChange={setRecurring} />
        </div>
      )}

      {/* Proof of payment — Bank transfer, non-Deutsche */}
      {needsProof && (
        <div className="mx-4 mt-6">
          <p className="px-1 mb-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
            Proof of payment
          </p>
          {proofName ? (
            <>
              <div className="rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--portfolio-blue) 28%, transparent)",
                  }}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {proofName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    1.2 MB · Image
                  </p>
                </div>
                <button
                  onClick={() => setProofName(null)}
                  className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-medium text-success">
                  Receipt attached
                </span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setProofName("transfer_receipt.jpg")}
              className="w-full rounded-2xl bg-card/60 backdrop-blur-md py-6 flex flex-col items-center gap-2 transition hover:bg-muted/10"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">
                Tap to upload receipt
              </span>
            </button>
          )}
        </div>
      )}

      {/* Link to a goal */}
      <div className="mx-4 mt-4">
        <button
          type="button"
          onClick={() =>
            setLinkedGoal(linkedGoal ? null : "New car")
          }
          className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 text-left transition hover:bg-muted/10"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background:
                "color-mix(in oklch, var(--success) 30%, transparent)",
            }}
          >
            <Star className="w-5 h-5 text-success" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {linkedGoal ? linkedGoal : "Link to a goal"}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              {linkedGoal
                ? "Tap to change goal"
                : "Tag this investment to a savings goal"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Bank transfer warning */}
      {isBank && (
        <div className="mx-4 mt-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden flex">
          <div
            className="w-1 shrink-0"
            style={{ background: "oklch(0.77 0.17 70)" }}
          />
          <div className="flex items-start gap-3 px-3 py-3.5 flex-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, oklch(0.77 0.17 70) 25%, transparent)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4"
                style={{ color: "oklch(0.85 0.15 70)" }}
              />
            </div>
            <div className="pt-0.5">
              <p className="text-[13px] font-semibold text-foreground">
                Transfer funds before submitting
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                Please make sure your funds have been sent to the CAL account
                before raising this request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review CTA */}
      <div className="mx-4 mt-8 mb-8">
        <button
          disabled={!canReview}
          onClick={handleReview}
          className="w-full py-4 rounded-full text-[15px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--pill)",
            color: "var(--pill-foreground)",
          }}
        >
          Review
        </button>
      </div>

      {/* Picker Sheet */}
      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {picker ? pickerTitles[picker] : ""}
              </SheetTitle>
              <button
                onClick={() => setPicker(null)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-5 mt-4 space-y-2">
            {picker &&
              pickerOptions[picker].map((opt) => {
                const isSelected =
                  (picker === "fund" && opt === selectedFund) ||
                  (picker === "account" && opt === selectedAccount) ||
                  (picker === "payFrom" &&
                    opt === (isFlip ? selectedFund : selectedBank)) ||
                  (picker === "payTo" && opt === selectedPayTo) ||
                  (picker === "flipTo" && opt === selectedFlipTo);
                return (
                  <button
                    key={opt}
                    onClick={() => handlePick(opt)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-muted/20"
                        : "bg-background/40 hover:bg-muted/10"
                    }`}
                  >
                    <span className="text-sm text-foreground">{opt}</span>
                    {isSelected && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: "var(--pill)" }}
                      />
                    )}
                  </button>
                );
              })}
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
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
  const hasValue = !!value;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/10 border-b border-border/20 last:border-b-0"
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`flex-1 text-right text-sm font-medium truncate ${
          hasValue ? "text-foreground" : "text-muted-foreground/70"
        }`}
      >
        {hasValue ? value : placeholder}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function RecurringToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "color-mix(in oklch, var(--pill) 25%, transparent)",
        }}
      >
        <CalendarDays className="w-4 h-4" style={{ color: "var(--pill)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground leading-tight">
          Set recurring
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
          Repeat this investment automatically each month
        </p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function DateRow({
  label,
  date,
  onClick,
}: {
  label: string;
  date: Date;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/10 border-b border-border/20 last:border-b-0"
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 text-right text-sm font-medium text-foreground truncate">
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Equities                                                            */
/* ------------------------------------------------------------------ */

const equityFundSources = [
  { name: "CAL Growth Fund", sub: "Chiara's wealth account", value: "LKR 150,000.00" },
  { name: "CAL Income Fund", sub: "Personal account", value: "LKR 84,300.00" },
  { name: "CAL Money Market Fund", sub: "Personal account", value: "LKR 32,100.00" },
];

const equityFundSubAccounts: Record<string, { name: string; value: string }[]> = {
  "CAL Growth Fund": [
    { name: "Chiara's wealth account", value: "LKR 150,000.00" },
    { name: "Retirement", value: "LKR 92,500.00" },
    { name: "General", value: "LKR 41,200.00" },
  ],
  "CAL Income Fund": [
    { name: "Personal account", value: "LKR 84,300.00" },
    { name: "Emergency", value: "LKR 36,700.00" },
  ],
  "CAL Money Market Fund": [
    { name: "Personal account", value: "LKR 32,100.00" },
    { name: "Short term", value: "LKR 18,450.00" },
  ],
};

function EquitiesForm({ method }: { method: InvestMethod }) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [bank, setBank] = useState("Commercial Bank ****2849");
  const [payTo, setPayTo] = useState("CAL Securities Account");
  const [proofName, setProofName] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [sourceFund, setSourceFund] = useState(equityFundSources[0]!.name);
  const [sourceSub, setSourceSub] = useState(
    equityFundSubAccounts[equityFundSources[0]!.name]![0]!.name,
  );
  const [draftFund, setDraftFund] = useState(sourceFund);
  const [draftSub, setDraftSub] = useState(sourceSub);
  const [picker, setPicker] = useState<
    null | "bank" | "payTo" | "sourceFund"
  >(null);

  const openFundPicker = () => {
    setDraftFund(sourceFund);
    setDraftSub(sourceSub);
    setPicker("sourceFund");
  };

  const isPayIn = method === "payin";
  const isDirect = method === "instant";
  const isUtFlip = method === "utflip";

  const title = isPayIn
    ? "Pay in"
    : isDirect
      ? "Direct Invest"
      : "Transfer from Unit Trust";

  const amountNum = parseFloat(amount || "0") || 0;

  const handleAmountChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    if (isDirect) {
      const n = parseFloat(sanitized || "0") || 0;
      if (n > DIRECT_INVEST_LIMIT) {
        setAmount(String(DIRECT_INVEST_LIMIT));
        return;
      }
    }
    setAmount(sanitized);
  };

  const canReview = (() => {
    if (amountNum <= 0) return false;
    if (isPayIn) return !!bank && !!payTo && !!proofName;
    if (isDirect) return !!bank;
    return !!sourceFund;
  })();

  const handleReview = () =>
    navigate({
      to: "/invest-summary",
      search: {
        method: isUtFlip ? "flip" : isDirect ? "instant" : "bank",
        amount: amount || "0",
        fund: isUtFlip ? sourceFund : "Equity Account",
        account: "Equity Account",
        bank: isUtFlip ? "Equity Account" : isPayIn ? payTo : bank,
      },
    });

  const source = equityFundSources.find((f) => f.name === sourceFund)!;
  const sourceSubAccounts = equityFundSubAccounts[sourceFund] ?? [];
  const selectedSub =
    sourceSubAccounts.find((s) => s.name === sourceSub) ?? sourceSubAccounts[0];
  const draftSubOptions = equityFundSubAccounts[draftFund] ?? [];

  // Live balance preview for the unit trust -> equity transfer
  const parseLkr = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
  const fmtLkr = (n: number) =>
    `LKR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const sourceBalance = parseLkr(selectedSub?.value ?? source.value);
  const equityBalance = 25000;
  const transferAmt = Math.min(amountNum, sourceBalance);
  const showPreview = isUtFlip && amountNum > 0;

  const pickerOptions: Record<"bank" | "payTo" | "sourceFund", string[]> = {
    bank: banks,
    payTo: calBankAccounts.map((a) => a.label),
    sourceFund: equityFundSources.map((f) => f.name),
  };
  const pickerTitles: Record<"bank" | "payTo" | "sourceFund", string> = {
    bank: "Transfer from",
    payTo: "Transfer to",
    sourceFund: "Transfer from unit trust",
  };
  const selectedFor = (kind: "bank" | "payTo" | "sourceFund") =>
    kind === "bank" ? bank : kind === "payTo" ? payTo : sourceFund;

  return (
    <MobileLayout>
      <PageHeader title={title} showBack helpTopic="invest" />

      {/* Unit trust -> equity account visual */}
      {isUtFlip && (
        <div className="mx-4 mt-3 space-y-2">
          <button
            type="button"
            onClick={openFundPicker}
            className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 text-left transition hover:bg-muted/10"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
              }}
            >
              <PieChart className="w-5 h-5" style={{ color: "var(--pill)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {source.name}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {selectedSub?.name ?? source.sub}
              </p>
              {showPreview ? (
                <p className="text-[12px] flex items-center gap-1.5">
                  <span className="text-muted-foreground/60 line-through">
                    {selectedSub?.value ?? source.value}
                  </span>
                  <span className="font-medium text-foreground">
                    {fmtLkr(sourceBalance - transferAmt)}
                  </span>
                  <span className="text-muted-foreground">
                    (−{fmtLkr(transferAmt).replace("LKR ", "")})
                  </span>
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  {selectedSub?.value ?? source.value}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>

          <div className="pl-5">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--pill) 25%, transparent)",
              }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: "var(--pill)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Equity Account
              </p>
              {showPreview ? (
                <p className="text-[12px] mt-0.5 flex items-center gap-1.5">
                  <span className="text-muted-foreground/60 line-through">
                    {fmtLkr(equityBalance)}
                  </span>
                  <span className="font-medium text-success">
                    {fmtLkr(equityBalance + transferAmt)}
                  </span>
                  <span className="text-success/80">
                    (+{fmtLkr(transferAmt).replace("LKR ", "")})
                  </span>
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {fmtLkr(equityBalance)}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPicker("bank")}
            className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-4 py-3.5 text-left transition hover:bg-muted/10"
          >
            <span className="text-sm text-muted-foreground shrink-0">
              Bank Account
            </span>
            <span className="flex-1 text-right text-sm font-medium text-foreground truncate">
              {bank}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      )}

      {/* Amount hero */}
      <div className="px-4 pt-6 pb-6 text-center">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-[18px] font-medium text-muted-foreground">
            LKR
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountDisplay(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="bg-transparent text-[44px] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none text-center"
            style={{
              width: `${Math.max(2, (formatAmountDisplay(amount) || "0").length)}ch`,
            }}
          />
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {isDirect
            ? `Investment amount · max LKR ${DIRECT_INVEST_LIMIT.toLocaleString()} per transfer`
            : isPayIn
              ? "Amount to pay in"
              : "Amount to transfer"}
        </p>
      </div>

      {/* Details */}
      {!isUtFlip && (
        <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
          <DateRow label="Date" date={date} onClick={() => setDateOpen(true)} />
          <PickerRow
            label="Transfer from"
            value={bank}
            placeholder="Select bank account"
            onClick={() => setPicker("bank")}
          />
          {isPayIn && (
            <PickerRow
              label="Transfer to"
              value={payTo}
              placeholder="Select CAL account"
              onClick={() => setPicker("payTo")}
            />
          )}
        </div>
      )}

      {/* Recurring — Direct Invest only */}
      {isDirect && (
        <div className="mx-4 mt-4">
          <RecurringToggle value={recurring} onChange={setRecurring} />
        </div>
      )}

      {/* Attach proof — Pay in */}
      {isPayIn && (
        <div className="mx-4 mt-6">
          <p className="px-1 mb-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
            Attach proof
          </p>
          {proofName ? (
            <>
              <div className="rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--portfolio-blue) 28%, transparent)",
                  }}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {proofName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    1.2 MB · Image
                  </p>
                </div>
                <button
                  onClick={() => setProofName(null)}
                  className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-medium text-success">
                  Receipt attached
                </span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setProofName("transfer_receipt.jpg")}
              className="w-full rounded-2xl bg-card/60 backdrop-blur-md py-6 flex flex-col items-center gap-2 transition hover:bg-muted/10"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">
                Tap to upload receipt
              </span>
            </button>
          )}
        </div>
      )}

      {/* Review CTA */}
      <div className="mx-4 mt-8 mb-8">
        <button
          disabled={!canReview}
          onClick={handleReview}
          className="w-full py-4 rounded-full text-[15px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
        >
          Review
        </button>
      </div>

      {/* Date sheet */}
      <Sheet open={dateOpen} onOpenChange={setDateOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                Select date
              </SheetTitle>
              <button
                onClick={() => setDateOpen(false)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-3 mt-2 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d);
                setDateOpen(false);
              }}
              className="p-3 pointer-events-auto"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Picker sheet */}
      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {picker ? pickerTitles[picker] : ""}
              </SheetTitle>
              <button
                onClick={() => setPicker(null)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-5 mt-4 space-y-2">
            {picker === "sourceFund" ? (
              <div className="space-y-4 pb-2">
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                    Fund
                  </p>
                  <ModernSelect
                    value={draftFund}
                    onChange={(e) => {
                      const f = e.target.value;
                      setDraftFund(f);
                      setDraftSub(equityFundSubAccounts[f]?.[0]?.name ?? "");
                    }}
                    placeholder="Select fund"
                  >
                    {equityFundSources.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </ModernSelect>
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                    Sub account
                  </p>
                  <ModernSelect
                    value={draftSub}
                    onChange={(e) => setDraftSub(e.target.value)}
                    placeholder="Select sub account"
                  >
                    {draftSubOptions.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </ModernSelect>
                  {draftSub && (
                    <p className="mt-2 px-1 text-[12px] text-muted-foreground">
                      Available{" "}
                      {draftSubOptions.find((s) => s.name === draftSub)?.value}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!draftFund || !draftSub}
                  onClick={() => {
                    setSourceFund(draftFund);
                    setSourceSub(draftSub);
                    setPicker(null);
                  }}
                  className="w-full py-3.5 rounded-full text-[15px] font-semibold transition disabled:opacity-40"
                  style={{
                    background: "var(--pill)",
                    color: "var(--pill-foreground)",
                  }}
                >
                  Confirm
                </button>
              </div>
            ) : (
              picker &&
              pickerOptions[picker].map((opt) => {
                const isSelected = selectedFor(picker) === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (picker === "bank") setBank(opt);
                      if (picker === "payTo") setPayTo(opt);
                      setPicker(null);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-muted/20"
                        : "bg-background/40 hover:bg-muted/10"
                    }`}
                  >
                    <span className="text-sm text-foreground">{opt}</span>
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: "var(--pill)" }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
