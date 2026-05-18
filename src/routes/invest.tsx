import { ModernSelect } from "@/components/ModernSelect";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Zap, Building2, ArrowLeftRight, ChevronDown, Upload, Info, Plus, Edit2, Trash2, ExternalLink, Repeat, Lightbulb, CopyPlus, Star } from "lucide-react";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import { FormSection, FormField } from "@/components/FormField";

export const Route = createFileRoute("/invest")({
  component: Invest,
});

type InvestMethod = "instant" | "bank" | "flip";
type InvestType = "new" | "recurring";

const funds = ["CAL Growth Fund", "CAL Income Fund", "CAL Balanced Fund", "CAL Money Market Fund"];
const accounts = ["Main Account", "Joint Account", "Minor Account"];
const banks = ["Deutsche Bank", "Commercial Bank", "Sampath Bank", "HNB", "BOC"];
const calBankAccounts = [
  { bank: "Deutsche Bank", accNo: "0012 3456 789", branch: "Colombo" },
  { bank: "Commercial Bank", accNo: "8001 2345 678", branch: "Colombo 07" },
  { bank: "HNB", accNo: "7700 1234 567", branch: "Colombo 03" },
];

const existingRecurring = [
  { fund: "CAL Growth Fund", amount: "25,000", frequency: "Monthly", nextDate: "May 1, 2026", account: "Main Account" },
  { fund: "CAL Income Fund", amount: "10,000", frequency: "Weekly", nextDate: "Apr 21, 2026", account: "Joint Account" },
];

const DIRECT_INVEST_LIMIT = 150000;

function Invest() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<InvestMethod>("instant");
  const [investType, setInvestType] = useState<InvestType>("new");
  const [amount, setAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("monthly");
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedPayTo, setSelectedPayTo] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);

  const methods = [
    { id: "instant" as const, icon: Zap, label: "Direct Invest" },
    { id: "bank" as const, icon: Building2, label: "Bank Transfer" },
    { id: "flip" as const, icon: ArrowLeftRight, label: "Flip" },
  ];

  const methodInfo: Record<InvestMethod, string> = {
    instant: "Direct Invest by linking your bank account directly with the app. Max LKR 149,950 per transfer — multiple allowed.",
    bank: "Standard bank transfer. Any amount. Proof required unless paying to Deutsche Bank. 1-2 business days.",
    flip: "Move funds between CAL accounts instantly. No fees.",
  };

  const [showJustpayInfo, setShowJustpayInfo] = useState(false);
  const [showDeutscheDetails, setShowDeutscheDetails] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [showRepeatInfo, setShowRepeatInfo] = useState(false);

  // Fallback default fund + sub account for unmatched bank transfers
  const [defaultFund, setDefaultFund] = useState(funds[0]);
  const [defaultSubAccount, setDefaultSubAccount] = useState(accounts[0]);
  const [showDefaultInfo, setShowDefaultInfo] = useState(false);

  const amountNum = parseFloat(amount || "0") || 0;
  const isDirectInvest = method === "instant";
  const overLimit = isDirectInvest && amountNum > DIRECT_INVEST_LIMIT;
  const atLimit = isDirectInvest && amountNum >= DIRECT_INVEST_LIMIT;

  const handleAmountChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    if (isDirectInvest) {
      const n = parseFloat(sanitized || "0") || 0;
      if (n > DIRECT_INVEST_LIMIT) {
        setAmount(String(DIRECT_INVEST_LIMIT));
        return;
      }
    }
    setAmount(sanitized);
    if (parseFloat(sanitized || "0") < DIRECT_INVEST_LIMIT) setRepeatCount(1);
  };


  return (
    <MobileLayout>
      <PageHeader title="Invest" showBack helpTopic="invest" />

      {/* Method Selector */}
      <div className="mx-4 mt-2">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {methods.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                method === id
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mx-4 mt-3 flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 14%, oklch(0.18 0.02 280))" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 35%, transparent)" }}>
          <Info className="w-3.5 h-3.5" style={{ color: "oklch(0.95 0.05 230)" }} />
        </div>
        <p className="text-[12px] text-white/90 leading-snug pt-1">{methodInfo[method]}</p>
      </div>

      {/* Investment Type Toggle — instant only */}
      {method === "instant" && (
        <div className="mx-4 mt-3">
          <div className="flex gap-1 rounded-xl p-1 backdrop-blur-sm" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 12%, transparent)" }}>
            {(["new", "recurring"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInvestType(type)}
                className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all ${
                  investType === type
                    ? "text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={
                  investType === type
                    ? { background: "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)" }
                    : undefined
                }
              >
                {type === "new" ? "New Investment" : "Recurring Investments"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Plans List */}
      {method === "instant" && investType === "recurring" && (
        <div className="mx-4 mt-4">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-1">Existing plans</p>
          <div className="space-y-2.5">
            {existingRecurring.map((plan, i) => {
              const freq = plan.frequency.toLowerCase();
              const isMonthly = freq === "monthly";
              return (
                <button
                  key={i}
                  type="button"
                  className="group w-full glass-card p-4 text-left transition-all hover:border-primary/30 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[18px] font-semibold text-foreground tracking-tight tabular-nums">
                          LKR {plan.amount}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            isMonthly
                              ? "text-[oklch(0.78_0.14_260)]"
                              : "text-[oklch(0.78_0.14_155)]"
                          }`}
                          style={{
                            background: isMonthly
                              ? "color-mix(in oklch, var(--portfolio-blue) 22%, transparent)"
                              : "color-mix(in oklch, var(--success) 22%, transparent)",
                          }}
                        >
                          {plan.frequency}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground truncate">{plan.fund}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80">Next</p>
                      <p className="text-[13px] font-medium text-foreground mt-0.5">{plan.nextDate.replace(/, \d{4}$/, "")}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{plan.account}</span>
                    <div className="flex items-center gap-1">
                      <span
                        role="button"
                        tabIndex={0}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
                        aria-label="Edit plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mt-6 mb-2 px-1">New recurring plan</p>
        </div>
      )}

      {/* Amount Input */}
      <section className="mx-4 mt-5">
        <h2 className="px-1 mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
          Amount
        </h2>
        <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 px-4 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-medium text-muted-foreground">LKR</span>
            <input
              type="text"
              inputMode="decimal"
              value={formatAmountDisplay(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-[20px] font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none"
            />
          </div>
          {isDirectInvest && (
            <p className="mt-2.5 text-[12px] text-muted-foreground/80">
              Per-transfer limit: LKR {DIRECT_INVEST_LIMIT.toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {/* Direct Invest: repeat multiplier — shown when at the cap */}
      {isDirectInvest && atLimit && investType === "new" && (
        <div className="mx-4 mt-2 glass-card p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 min-w-0">
              <CopyPlus className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Max LKR {DIRECT_INVEST_LIMIT.toLocaleString()} per transaction</span>
              <button
                type="button"
                onClick={() => setShowRepeatInfo(!showRepeatInfo)}
                aria-label="Why is there a limit?"
                className="shrink-0"
              >
                <Info className="w-3 h-3 text-muted-foreground" />
              </button>
            </p>
            <div className="flex gap-1 bg-secondary rounded-lg p-1 shrink-0">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setRepeatCount(n)}
                  className={`w-9 h-7 rounded-md text-[11px] font-semibold transition-all ${
                    repeatCount === n ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                  }`}
                >
                  {n}×
                </button>
              ))}
            </div>
          </div>
          {showRepeatInfo && (
            <p className="mt-2 text-[12px] text-muted-foreground bg-secondary/60 rounded-lg p-2 leading-snug">
              Direct Invest uses a real-time bank rail (Justpay) that caps each transfer at LKR {DIRECT_INVEST_LIMIT.toLocaleString()}. To invest more in one go, the app sends up to 3 back-to-back transfers of the same amount. For larger lump sums, use Bank Transfer instead.
            </p>
          )}
          {repeatCount > 1 && (
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Total investment</span>
              <span className="text-xs font-semibold text-foreground">
                LKR {(DIRECT_INVEST_LIMIT * repeatCount).toLocaleString()}
                <span className="text-[12px] text-muted-foreground font-normal ml-1">({repeatCount} transfers)</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recurring options */}
      {method === "instant" && investType === "new" && (
        <div className="mx-4 mt-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors`}
                style={{
                  background: isRecurring
                    ? "color-mix(in oklch, var(--success) 22%, transparent)"
                    : "color-mix(in oklch, var(--muted-foreground) 14%, transparent)",
                }}
              >
                <Repeat className={`w-4 h-4 ${isRecurring ? "text-success" : "text-muted-foreground"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-foreground leading-tight">Repeat this investment</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">Auto-invest on a schedule</p>
              </div>
            </div>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-11 h-6 rounded-full transition-all flex items-center shrink-0 ${isRecurring ? "bg-success" : "bg-muted"}`}
              aria-label="Toggle recurring"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isRecurring ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </div>
          {isRecurring && (
            <div className="form-field-inline border-t border-border/30 divide-y divide-border/30">
              <FormField label="Frequency">
                <ModernSelect value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)}>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </ModernSelect>
              </FormField>
              <FormField label="Start date">
                <input type="date" />
              </FormField>
            </div>
          )}
        </div>
      )}

      {/* Recurring setup for recurring tab */}
      {method === "instant" && investType === "recurring" && (
        <FormSection title="Schedule">
          <div className="form-field-inline divide-y divide-border/30">
            <FormField label="Frequency">
              <ModernSelect value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)}>
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </ModernSelect>
            </FormField>
            <FormField label="Start date">
              <input type="date" />
            </FormField>
          </div>
        </FormSection>
      )}

      {/* Fund & Account */}
      <FormSection title="Fund & Account">
        <div className="form-field-inline divide-y divide-border/40">
          <FormField
            label="Which fund?"
            action={
              <div className="flex items-center gap-2">
                {method === "bank" && selectedFund && (
                  <button
                    type="button"
                    onClick={() => setDefaultFund(selectedFund)}
                    aria-label={selectedFund === defaultFund ? "Current default fund" : "Set as default fund"}
                    title={selectedFund === defaultFund ? "Default fund" : "Set as default"}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      style={
                        selectedFund === defaultFund
                          ? { color: "oklch(0.85 0.14 85)", fill: "oklch(0.85 0.14 85)" }
                          : undefined
                      }
                    />
                  </button>
                )}
                {selectedFund && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/rates" })}
                    className="inline-flex items-center gap-1 text-[12px] font-medium"
                    style={{ color: "var(--portfolio-blue)" }}
                  >
                    View rates
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            }
          >
            <ModernSelect value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)}>
              <option value="">Select your fund</option>
              {funds.map((f) => (
                <option key={f} value={f}>
                  {f}{f === defaultFund ? "  ★" : ""}
                </option>
              ))}
            </ModernSelect>
          </FormField>
          <FormField
            label="Sub Account"
            action={
              method === "bank" && selectedAccount ? (
                <button
                  type="button"
                  onClick={() => setDefaultSubAccount(selectedAccount)}
                  aria-label={selectedAccount === defaultSubAccount ? "Current default sub account" : "Set as default sub account"}
                  title={selectedAccount === defaultSubAccount ? "Default sub account" : "Set as default"}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Star
                    className="w-3.5 h-3.5"
                    style={
                      selectedAccount === defaultSubAccount
                        ? { color: "oklch(0.85 0.14 85)", fill: "oklch(0.85 0.14 85)" }
                        : undefined
                    }
                  />
                </button>
              ) : undefined
            }
          >
            <ModernSelect value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a} value={a}>
                  {a}{a === defaultSubAccount ? "  ★" : ""}
                </option>
              ))}
            </ModernSelect>
          </FormField>
        </div>

        {/* Subtle default explainer — Bank Transfer only */}
        {method === "bank" && (
          <div className="mt-2 px-1">
            <button
              type="button"
              onClick={() => setShowDefaultInfo(!showDefaultInfo)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <Star className="w-3 h-3" style={{ color: "oklch(0.85 0.14 85)", fill: "oklch(0.85 0.14 85)" }} />
              <span>marks your default · why?</span>
            </button>
            {showDefaultInfo && (
              <p className="mt-1.5 text-[12px] text-muted-foreground leading-snug">
                If a transfer arrives without a matching in-app request, we allocate it to your default fund and sub account. Manual reconciliation may add 1–2 business days. Tap the ★ next to a selected fund or sub account to make it your default.
              </p>
            )}
          </div>
        )}
      </FormSection>

      {/* Transfer Details */}
      <FormSection title="Transfer Details">
        <div className="form-field-inline divide-y divide-border/40">
          <FormField
            label={method === "flip" ? "Transfer from" : "Pay from"}
            hint={
              showJustpayInfo && method !== "flip"
                ? "Accounts need to be verified using Justpay."
                : undefined
            }
            action={
              method !== "flip" ? (
                <button
                  type="button"
                  onClick={() => setShowJustpayInfo(!showJustpayInfo)}
                  aria-label="About Pay from"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Info className="w-4 h-4" />
                </button>
              ) : undefined
            }
          >
            <ModernSelect
              value={selectedBank}
              onChange={(e) => {
                if (e.target.value === "__add_bank") {
                  navigate({ to: "/bank-accounts" });
                } else {
                  setSelectedBank(e.target.value);
                }
              }}
            >
              <option value="">{method === "flip" ? "Select your fund" : "Select your bank account"}</option>
              {method === "flip"
                ? funds.map((f) => <option key={f}>{f}</option>)
                : (
                  <>
                    {banks.map((b) => <option key={b}>{b}</option>)}
                    <option value="__add_bank">+ Add Bank Account</option>
                  </>
                )
              }
            </ModernSelect>
          </FormField>

          {method === "bank" && (
            <FormField
              label="Pay to"
              action={
                <button
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className="text-[12px] text-primary font-medium flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Bank details
                </button>
              }
            >
              <ModernSelect value={selectedPayTo} onChange={(e) => setSelectedPayTo(e.target.value)}>
                <option value="">Select CAL bank account</option>
                {calBankAccounts.map((a) => {
                  const isDeutsche = a.bank.includes("Deutsche");
                  return (
                    <option key={a.accNo} value={`${a.bank} — ${a.accNo}`}>
                      {a.bank} — {a.accNo}{isDeutsche ? "  ✦ Recommended" : ""}
                    </option>
                  );
                })}
              </ModernSelect>
            </FormField>
          )}
        </div>
      </FormSection>

      {/* Bank transfer: HNB closing notice */}
      {method === "bank" && selectedPayTo.startsWith("HNB") && (
        <div className="mx-4 mt-3 flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: "color-mix(in oklch, oklch(0.7 0.18 25) 18%, oklch(0.18 0.02 280))" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, oklch(0.7 0.18 25) 40%, transparent)" }}>
            <Info className="w-3.5 h-3.5" style={{ color: "oklch(0.95 0.06 25)" }} />
          </div>
          <div className="pt-0.5">
            <p className="text-[13px] font-semibold text-white">Account closing soon</p>
            <p className="text-[12px] text-white/80 mt-0.5 leading-snug">
              This HNB account will be removed after May. For your next investment please use the Deutsche Bank account instead.
            </p>
          </div>
        </div>
      )}

      {/* Bank transfer: Deutsche prompt */}
      {method === "bank" && !selectedPayTo.includes("Deutsche") && (
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 14%, oklch(0.18 0.02 280))" }}>
          <button
            type="button"
            onClick={() => setShowDeutscheDetails(!showDeutscheDetails)}
            className="w-full flex items-start gap-3 text-left p-3.5"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 35%, transparent)" }}>
              <Lightbulb className="w-3.5 h-3.5" style={{ color: "oklch(0.95 0.05 230)" }} />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[13px] font-semibold text-white">Skip proof of payment</p>
              <p className="text-[12px] text-white/80 mt-0.5 leading-snug">Pay to Deutsche Bank — transfers are auto-verified, no upload needed.</p>
            </div>
            <ChevronDown className={`w-4 h-4 mt-1 shrink-0 transition-transform text-white/60 ${showDeutscheDetails ? "rotate-180" : ""}`} />
          </button>
          {showDeutscheDetails && (
            <div className="mx-3.5 mb-3.5 ml-[58px] p-2.5 rounded-xl space-y-0.5" style={{ background: "oklch(0.14 0.02 280)" }}>
              <p className="text-[12px] text-white/70">Bank: <span className="text-white font-medium">Deutsche Bank</span></p>
              <p className="text-[12px] text-white/70">A/C: <span className="text-white font-medium">{calBankAccounts[0].accNo}</span></p>
              <p className="text-[12px] text-white/70">Branch: <span className="text-white font-medium">{calBankAccounts[0].branch}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Bank account details panel */}
      {method === "bank" && showBankDetails && (
        <div className="mx-4 mt-2 glass-card p-3">
          {calBankAccounts.map((a) => (
            <div key={a.accNo} className="flex items-center gap-3 py-2">
              <Building2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">{a.bank}</p>
                <p className="text-[12px] text-muted-foreground">A/C: {a.accNo} · {a.branch}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {method === "flip" && (
        <FormSection>
          <div className="form-field-inline">
            <FormField label="Transfer to">
              <ModernSelect>
                <option value="">Select CAL account</option>
                {funds.map((f) => <option key={f}>{f}</option>)}
              </ModernSelect>
            </FormField>
          </div>
        </FormSection>
      )}

      {method === "bank" && !selectedPayTo.includes("Deutsche") && (
        <div className="mx-4 mt-3 glass-card p-3">
          <label className="text-[12px] text-muted-foreground">Proof of payment</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">Tap to upload</span>
          </div>
        </div>
      )}

      {/* Terms & Conditions — direct invest and bank transfer only */}
      {method !== "flip" && (
        <div className="mx-4 mt-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded accent-primary"
            />
            <span className="text-[12px] text-muted-foreground">
              I agree to the <a href="#" className="text-primary underline">Terms & Conditions</a>
            </span>
          </label>
        </div>
      )}

      {/* Submit */}
      <div className="mx-4 mt-3 mb-6">
        <button
          disabled={method !== "flip" && !acceptedTerms}
          onClick={() => {
            if (method === "flip") return;
            navigate({
              to: "/invest-summary",
              search: {
                method,
                amount: amount || "0",
                fund: selectedFund,
                account: selectedAccount,
                bank: method === "instant" ? selectedBank : selectedPayTo,
                ...(isDirectInvest && repeatCount > 1 ? { repeat: repeatCount } : {}),
              },
            });
          }}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {method === "flip"
            ? "Flip Funds"
            : investType === "recurring"
              ? "Create Recurring Plan"
              : isDirectInvest && repeatCount > 1
                ? `Send ${repeatCount} Transfers`
                : "Send Request"}
        </button>
      </div>
    </MobileLayout>
  );
}
