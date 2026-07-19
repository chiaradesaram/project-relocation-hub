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

const DEFAULTS_KEY = "invest_defaults_v1";
type InvestDefaults = {
  funds: string[];
  splits: Record<string, number>;
  account: string | null;
};
const emptyDefaults: InvestDefaults = { funds: [], splits: {}, account: null };

function evenSplit(fs: string[]): Record<string, number> {
  if (fs.length === 0) return {};
  const base = Math.floor(100 / fs.length);
  const rem = 100 - base * fs.length;
  const out: Record<string, number> = {};
  fs.forEach((f, i) => (out[f] = base + (i < rem ? 1 : 0)));
  return out;
}

function MethodForm({ method }: { method: InvestMethod }) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [defaults, setDefaults] = useState<InvestDefaults>(emptyDefaults);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [selectedAccount, setSelectedAccount] = useState("Personal Account");
  const [flipFromFund, setFlipFromFund] = useState("");

  // Load saved defaults once on mount and pre-fill the form.
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(DEFAULTS_KEY)
          : null;
      if (!raw) return;
      const p = JSON.parse(raw) as InvestDefaults;
      const d: InvestDefaults = {
        funds: Array.isArray(p.funds) ? p.funds : [],
        splits: p.splits ?? {},
        account: p.account ?? null,
      };
      setDefaults(d);
      if (d.funds.length && method !== "flip") {
        setSelectedFunds(d.funds);
        setSplits(
          Object.keys(d.splits).length ? d.splits : evenSplit(d.funds),
        );
      }
      if (d.account) setSelectedAccount(d.account);
    } catch {}
  }, [method]);

  const persistDefaults = (d: InvestDefaults) => {
    setDefaults(d);
    try {
      window.localStorage.setItem(DEFAULTS_KEY, JSON.stringify(d));
    } catch {}
  };

  const primaryFund = selectedFunds[0] ?? "";
  const selectedFund = primaryFund; // legacy alias for flip source display
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
  const splitTotal = useMemo(
    () => selectedFunds.reduce((s, f) => s + (splits[f] || 0), 0),
    [selectedFunds, splits],
  );
  const splitValid =
    selectedFunds.length <= 1 || Math.round(splitTotal) === 100;

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
  const payFromValue = isFlip ? flipFromFund : selectedBank;
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
    if (isFlip) return !!flipFromFund && !!selectedFlipTo;
    if (selectedFunds.length === 0 || !selectedAccount) return false;
    if (!splitValid) return false;
    if (isInstant) return !!selectedBank;
    if (isBank)
      return !!selectedBank && !!selectedPayTo && (!needsProof || !!proofName);
    return false;
  })();

  const handleReview = () => {
    navigate({
      to: "/invest-summary",
      search: {
        method,
        amount: amount || "0",
        fund:
          selectedFunds.length > 1
            ? `${selectedFunds.length} funds`
            : selectedFunds[0] ?? flipFromFund,
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
    fund: "Select fund(s)",
    account: "Select sub-account",
    payFrom: isFlip ? "Transfer from" : "Paying from",
    payTo: "Send to",
    flipTo: "Transfer to",
  };

  const handleSingleSelect = (value: string) => {
    if (picker === "account") setSelectedAccount(value);
    if (picker === "payFrom") {
      if (isFlip) setFlipFromFund(value);
      else setSelectedBank(value);
    }
    if (picker === "payTo") setSelectedPayTo(value);
    if (picker === "flipTo") setSelectedFlipTo(value);
    setPicker(null);
  };

  const toggleFund = (f: string) => {
    setSelectedFunds((prev) => {
      const has = prev.includes(f);
      const next = has ? prev.filter((x) => x !== f) : [...prev, f];
      // rebalance splits to even any time the set changes
      setSplits(evenSplit(next));
      return next;
    });
  };

  const setSplitFor = (f: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    setSplits((prev) => ({ ...prev, [f]: clamped }));
  };

  const evenlyDistribute = () => setSplits(evenSplit(selectedFunds));

  const saveAsDefault = () => {
    persistDefaults({
      funds: selectedFunds,
      splits: splits,
      account: selectedAccount,
    });
  };

  const isDefaultMix =
    defaults.funds.length === selectedFunds.length &&
    defaults.funds.every((f) => selectedFunds.includes(f)) &&
    selectedFunds.length > 0;

  const fundRowDisplay =
    selectedFunds.length === 0
      ? ""
      : selectedFunds.length === 1
        ? selectedFunds[0]
        : `${selectedFunds.length} funds · split`;

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
        {!isFlip && (
          <PickerRow
            label="Fund"
            value={fundRowDisplay}
            placeholder="Select a fund"
            onClick={() => setPicker("fund")}
            pill={isDefaultMix ? "Default" : undefined}
          />
        )}
        {!isFlip && (
          <PickerRow
            label="Sub-account"
            value={selectedAccount}
            placeholder="Select sub-account"
            onClick={() => setPicker("account")}
            pill={
              defaults.account && selectedAccount === defaults.account
                ? "Default"
                : undefined
            }
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

      {/* Split breakdown when multiple funds selected */}
      {!isFlip && selectedFunds.length > 1 && amountNum > 0 && (
        <div className="mx-4 mt-3 rounded-2xl bg-card/40 backdrop-blur-md overflow-hidden">
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <Split className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
              Split
            </p>
          </div>
          <div className="px-4 pb-3 pt-1 space-y-1.5">
            {selectedFunds.map((f) => {
              const pct = splits[f] || 0;
              const val = Math.round((amountNum * pct) / 100);
              return (
                <div
                  key={f}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-foreground truncate pr-3">{f}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {pct}% · LKR {val.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
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
          <SheetHeader className="px-5 pb-0 pr-12">
            <SheetTitle className="text-base font-semibold text-foreground text-left">
              {picker ? pickerTitles[picker] : ""}
            </SheetTitle>
            {picker === "fund" && (
              <p className="text-[12px] text-muted-foreground text-left">
                Tap to select. Pick more than one to split the investment.
              </p>
            )}
          </SheetHeader>

          {/* FUND: multi-select + splits + save default */}
          {picker === "fund" && (
            <div className="px-5 mt-4">
              <div className="space-y-2 max-h-[45vh] overflow-y-auto">
                {funds.map((f) => {
                  const checked = selectedFunds.includes(f);
                  const isDefault = defaults.funds.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFund(f)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        checked ? "bg-muted/20" : "bg-background/40 hover:bg-muted/10"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                          checked ? "" : "border-2 border-muted-foreground/40"
                        }`}
                        style={
                          checked
                            ? { background: "var(--pill)" }
                            : undefined
                        }
                      >
                        {checked && (
                          <Check
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--pill-foreground)" }}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className="text-sm text-foreground flex-1 truncate">
                        {f}
                      </span>
                      {isDefault && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                          style={{
                            background:
                              "color-mix(in oklch, var(--pill) 18%, transparent)",
                            color: "var(--pill)",
                          }}
                        >
                          Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedFunds.length > 1 && (
                <div className="mt-4 rounded-2xl bg-background/40 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Split className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[12px] font-semibold text-foreground">
                        Split allocation
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={evenlyDistribute}
                      className="text-[11px] font-semibold"
                      style={{ color: "var(--pill)" }}
                    >
                      Even split
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedFunds.map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <span className="text-[13px] text-foreground flex-1 truncate">
                          {f}
                        </span>
                        <div className="flex items-center gap-1 rounded-lg bg-card/70 px-2 py-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={splits[f] ?? 0}
                            onChange={(e) =>
                              setSplitFor(f, parseFloat(e.target.value) || 0)
                            }
                            className="w-10 bg-transparent text-right text-[13px] font-semibold text-foreground outline-none tabular-nums"
                          />
                          <span className="text-[12px] text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Total
                    </span>
                    <span
                      className="text-[12px] font-semibold tabular-nums"
                      style={{
                        color:
                          Math.round(splitTotal) === 100
                            ? "var(--pill)"
                            : "oklch(0.85 0.15 70)",
                      }}
                    >
                      {Math.round(splitTotal)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveAsDefault}
                  disabled={selectedFunds.length === 0 || !splitValid}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-semibold bg-background/50 text-foreground transition hover:bg-muted/20 disabled:opacity-40"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Save as default
                </button>
                <button
                  type="button"
                  onClick={() => setPicker(null)}
                  disabled={selectedFunds.length === 0 || !splitValid}
                  className="flex-1 rounded-full py-3 text-[13px] font-semibold transition disabled:opacity-40"
                  style={{
                    background: "var(--pill)",
                    color: "var(--pill-foreground)",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ACCOUNT: single-select with default pin */}
          {picker === "account" && (
            <div className="px-5 mt-4 space-y-2">
              {accounts.map((opt) => {
                const isSelected = opt === selectedAccount;
                const isDefault = defaults.account === opt;
                return (
                  <div
                    key={opt}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      isSelected ? "bg-muted/20" : "bg-background/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAccount(opt);
                        setPicker(null);
                      }}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <span className="text-sm text-foreground flex-1 truncate">
                        {opt}
                      </span>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 shrink-0"
                          style={{ color: "var(--pill)" }}
                        />
                      )}
                    </button>
                    {isDefault && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                        style={{
                          background:
                            "color-mix(in oklch, var(--pill) 18%, transparent)",
                          color: "var(--pill)",
                        }}
                      >
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        persistDefaults({
                          ...defaults,
                          account: isDefault ? null : opt,
                        })
                      }
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 hover:bg-muted/20 transition"
                      aria-label={isDefault ? "Unset default" : "Set as default"}
                    >
                      <Pin
                        className="w-3.5 h-3.5"
                        style={{
                          color: isDefault
                            ? "var(--pill)"
                            : "oklch(0.7 0.02 260)",
                        }}
                        fill={isDefault ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other single-select pickers */}
          {picker && picker !== "fund" && picker !== "account" && (
            <div className="px-5 mt-4 space-y-2">
              {pickerOptions[picker].map((opt) => {
                const isSelected =
                  (picker === "payFrom" &&
                    opt === (isFlip ? flipFromFund : selectedBank)) ||
                  (picker === "payTo" && opt === selectedPayTo) ||
                  (picker === "flipTo" && opt === selectedFlipTo);
                return (
                  <button
                    key={opt}
                    onClick={() => handleSingleSelect(opt)}
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
          )}
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
  pill,
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
  pill?: string;
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
      {pill && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
          style={{
            background: "color-mix(in oklch, var(--pill) 18%, transparent)",
            color: "var(--pill)",
          }}
        >
          {pill}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
