import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  Split,
  Pin,
} from "lucide-react";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type InvestMethod = "instant" | "bank" | "flip";

export const Route = createFileRoute("/invest")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search.product === "string" ? search.product : undefined,
    method:
      search.method === "instant" ||
      search.method === "bank" ||
      search.method === "flip"
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

  // Method picker landing
  if (!search.method) {
    const methodCards: {
      id: InvestMethod;
      icon: typeof Zap;
      label: string;
      desc: string;
    }[] = [
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

  return <MethodForm method={search.method} />;
}

type PickerKind = null | "fund" | "account" | "payFrom" | "payTo" | "flipTo";

function MethodForm({ method }: { method: InvestMethod }) {
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
