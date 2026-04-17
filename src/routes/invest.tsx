import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import HelpFAQ, { type FAQItem } from "@/components/HelpFAQ";
import { Zap, Building2, ArrowLeftRight, ChevronDown, Upload, Info, Plus, Edit2, Trash2, ExternalLink, Repeat, Lightbulb } from "lucide-react";

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
];

const existingRecurring = [
  { fund: "CAL Growth Fund", amount: "25,000", frequency: "Monthly", nextDate: "May 1, 2026", account: "Main Account" },
  { fund: "CAL Income Fund", amount: "10,000", frequency: "Weekly", nextDate: "Apr 21, 2026", account: "Joint Account" },
];

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

  return (
    <MobileLayout>
      <PageHeader title="Invest" showBack />

      {/* Method Selector */}
      <div className="mx-4 mt-2">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {methods.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                method === id
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
        <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">{methodInfo[method]}</p>
      </div>

      {/* Investment Type Toggle — instant only */}
      {method === "instant" && (
        <div className="mx-4 mt-3">
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 22%, transparent)" }}>
            {(["new", "recurring"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInvestType(type)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                  investType === type
                    ? "bg-primary/40 text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {type === "new" ? "New Investment" : "Recurring Investments"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Plans List */}
      {method === "instant" && investType === "recurring" && (
        <div className="mx-4 mt-3">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">EXISTING PLANS</p>
          {existingRecurring.map((plan, i) => (
            <div key={i} className="glass-card p-3 mb-2 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{plan.fund}</p>
                <p className="text-[10px] text-muted-foreground">LKR {plan.amount} · {plan.frequency} · Next: {plan.nextDate}</p>
              </div>
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
          ))}
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-4 mb-2">NEW RECURRING PLAN</p>
        </div>
      )}

      {/* Amount Input */}
      <div className="mx-4 mt-3 glass-card p-3">
        <label className="text-[10px] font-semibold text-muted-foreground tracking-wider">Amount</label>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">LKR</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Recurring options */}
      {method === "instant" && investType === "new" && (
        <div className="mx-4 mt-3 glass-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground flex items-center gap-2">
              <Repeat className={`w-3.5 h-3.5 transition-colors ${isRecurring ? "text-success" : "text-muted-foreground"}`} />
              Set Recurring investments
            </span>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-9 h-5 rounded-full transition-all flex items-center ${isRecurring ? "bg-success" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${isRecurring ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          {isRecurring && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Frequency</label>
                <select value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)} className="w-full bg-card rounded-lg p-2 text-[11px] text-foreground outline-none">
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Start Date</label>
                <input type="date" className="w-full bg-card rounded-lg p-2 text-[11px] text-foreground outline-none" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recurring setup for recurring tab */}
      {method === "instant" && investType === "recurring" && (
        <div className="mx-4 mt-3 glass-card p-3 space-y-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Frequency</label>
            <select value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)} className="w-full bg-secondary rounded-lg p-2.5 text-[11px] text-foreground outline-none">
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Start Date</label>
            <input type="date" className="w-full bg-secondary rounded-lg p-2.5 text-[11px] text-foreground outline-none" />
          </div>
        </div>
      )}

      {/* Fund & Account */}
      <div className="mx-4 mt-3 glass-card p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">FUND & ACCOUNT</p>
        <div>
          <label className="text-[10px] text-muted-foreground">Fund</label>
          <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
            <option value="">Select fund</option>
            {funds.map((f) => <option key={f}>{f}</option>)}
          </select>
          {selectedFund && (
            <button
              type="button"
              onClick={() => navigate({ to: "/rates" })}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium"
              style={{ color: "var(--portfolio-blue)" }}
            >
              View fund rates
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Sub Account</label>
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="mx-4 mt-3 glass-card p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">TRANSFER DETAILS</p>
        <div>
          <label className="text-[10px] text-muted-foreground flex items-center gap-1">
            {method === "flip" ? "Transfer from" : "Pay from"}
            {method !== "flip" && (
              <button type="button" onClick={() => setShowJustpayInfo(!showJustpayInfo)} aria-label="About Pay from">
                <Info className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </label>
          {showJustpayInfo && method !== "flip" && (
            <p className="mt-1 text-[10px] text-muted-foreground bg-secondary/60 rounded-lg p-2">
              Accounts need to be verified using Justpay.
            </p>
          )}
          <select
            value={selectedBank}
            onChange={(e) => {
              if (e.target.value === "__add_bank") {
                navigate({ to: "/bank-accounts" });
              } else {
                setSelectedBank(e.target.value);
              }
            }}
            className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none"
          >
            <option value="">{method === "flip" ? "Select fund" : "Select bank"}</option>
            {method === "flip"
              ? funds.map((f) => <option key={f}>{f}</option>)
              : (
                <>
                  {banks.map((b) => <option key={b}>{b}</option>)}
                  <option value="__add_bank">+ Add Bank Account</option>
                </>
              )
            }
          </select>
        </div>

        {/* Deutsche Bank tip is only for Bank Transfer (Pay To), not Direct Invest */}

        {/* Bank transfer: Pay To account dropdown */}
        {method === "bank" && (
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground">Pay to (CAL Account)</label>
              <button onClick={() => setShowBankDetails(!showBankDetails)} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                <ExternalLink className="w-3 h-3" />
                Bank details
              </button>
            </div>
            <select value={selectedPayTo} onChange={(e) => setSelectedPayTo(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
              <option value="">Select CAL bank account</option>
              {calBankAccounts.map((a) => {
                const isDeutsche = a.bank.includes("Deutsche");
                return (
                  <option key={a.accNo} value={`${a.bank} — ${a.accNo}`}>
                    {a.bank} — {a.accNo}{isDeutsche ? "  ✦ Recommended" : ""}
                  </option>
                );
              })}
            </select>

            {/* Deutsche prompt — show when Pay To isn't Deutsche */}
            {!selectedPayTo.includes("Deutsche") && (
              <div className="mt-2 p-3 rounded-xl border" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 12%, transparent)", borderColor: "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)" }}>
                <button
                  type="button"
                  onClick={() => setShowDeutscheDetails(!showDeutscheDetails)}
                  className="w-full flex items-start gap-2 text-left"
                >
                  <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--portfolio-blue)" }} />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--portfolio-blue)" }}>Pay to Deutsche Bank — skip proof of payment</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Transfers to Deutsche Bank are auto-verified, no upload needed.</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 mt-0.5 shrink-0 transition-transform ${showDeutscheDetails ? "rotate-180" : ""}`} style={{ color: "var(--portfolio-blue)" }} />
                </button>
                {showDeutscheDetails && (
                  <div className="mt-2 ml-6 p-2 rounded-lg bg-card/60 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">Bank: <span className="text-foreground font-medium">Deutsche Bank</span></p>
                    <p className="text-[10px] text-muted-foreground">A/C: <span className="text-foreground font-medium">{calBankAccounts[0].accNo}</span></p>
                    <p className="text-[10px] text-muted-foreground">Branch: <span className="text-foreground font-medium">{calBankAccounts[0].branch}</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bank account details panel */}
      {method === "bank" && showBankDetails && (
        <div className="mx-4 mt-2 glass-card p-3">
          {calBankAccounts.map((a) => (
            <div key={a.accNo} className="flex items-center gap-3 py-2">
              <Building2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">{a.bank}</p>
                <p className="text-[10px] text-muted-foreground">A/C: {a.accNo} · {a.branch}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {method === "flip" && (
        <div className="mx-4 mt-3 glass-card p-3">
          <label className="text-[10px] text-muted-foreground">Transfer to</label>
          <select className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
            <option>Select CAL account</option>
            {funds.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
      )}

      {method === "bank" && !selectedPayTo.includes("Deutsche") && (
        <div className="mx-4 mt-3 glass-card p-3">
          <label className="text-[10px] text-muted-foreground">Proof of payment</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Tap to upload</span>
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
            <span className="text-[11px] text-muted-foreground">
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
              },
            });
          }}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {method === "flip" ? "Flip Funds" : investType === "recurring" ? "Create Recurring Plan" : "Send Request"}
        </button>
      </div>
    </MobileLayout>
  );
}
