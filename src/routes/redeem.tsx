import { ModernSelect } from "@/components/ModernSelect";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Zap, Clock, Repeat, Info, Edit2, Trash2 } from "lucide-react";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import { FormSection, FormField } from "@/components/FormField";

export const Route = createFileRoute("/redeem")({
  component: Redeem,
});

type RedeemMethod = "instant" | "normal" | "plan";

const funds = ["CAL Growth Fund", "CAL Income Fund", "CAL Balanced Fund", "CAL Money Market Fund"];
const accounts = ["Main Account", "Joint Account", "Minor Account"];
const subAccountBalances: Record<string, number> = {
  "Main Account": 845000,
  "Joint Account": 320000,
  "Minor Account": 75000,
};
const userBankAccounts = [
  { bank: "Commercial Bank", accNo: "8001 2345 678" },
  { bank: "HNB", accNo: "0098 7654 321" },
];

const existingPlans = [
  { fund: "CAL Income Fund", account: "Main Account", frequency: "Monthly", nextDate: "May 1, 2026", bank: "Commercial Bank — 8001 2345 678" },
];

const INSTANT_DAILY_LIMIT = 100000;

function Redeem() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<RedeemMethod>("instant");
  const [amount, setAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [planFrequency, setPlanFrequency] = useState("Monthly");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const methods = [
    { id: "instant" as const, icon: Zap, label: "Instant" },
    { id: "normal" as const, icon: Clock, label: "Normal" },
    { id: "plan" as const, icon: Repeat, label: "Redemption Plan" },
  ];

  const methodInfo: Record<RedeemMethod, string> = {
    instant: `Instant redemption credited to your bank account. Daily limit LKR ${INSTANT_DAILY_LIMIT.toLocaleString()} per transaction — up to 5 times per day.`,
    normal: "Standard redemption with no daily limit. Requests submitted after 9:00 AM are processed the next working day.",
    plan: "Schedule recurring interest payouts from a sub account to your bank on a frequency you choose.",
  };

  const numericAmount = Number(amount || 0);
  const subAccountBalance = subAccountBalances[selectedAccount] ?? 0;
  const overInstantLimit = method === "instant" && numericAmount > INSTANT_DAILY_LIMIT;
  const overBalance = method !== "plan" && selectedAccount !== "" && numericAmount > subAccountBalance;

  return (
    <MobileLayout>
      <PageHeader title="Redeem" showBack />

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
        <p className="text-[12px] text-muted-foreground">{methodInfo[method]}</p>
      </div>

      {/* Existing Plans */}
      {method === "plan" && (
        <div className="mx-4 mt-3">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-2">EXISTING PLANS</p>
          {existingPlans.map((p, i) => (
            <div key={i} className="glass-card p-3 mb-2 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{p.fund}</p>
                <p className="text-[12px] text-muted-foreground">{p.account} · {p.frequency} · Next: {p.nextDate}</p>
                <p className="text-[12px] text-muted-foreground">To: {p.bank}</p>
              </div>
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
          ))}
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mt-4 mb-2">NEW PLAN</p>
        </div>
      )}


      {/* Fund & Account */}
      <FormSection title="Fund & Account">
        <div className="form-field-inline divide-y divide-border/40">
          <FormField label="Which fund?">
            <ModernSelect value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)}>
              <option value="">Select your fund</option>
              {funds.map((f) => <option key={f}>{f}</option>)}
            </ModernSelect>
          </FormField>
          <FormField label="Sub Account">
            <ModernSelect value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map((a) => <option key={a}>{a}</option>)}
            </ModernSelect>
          </FormField>
        </div>
      </FormSection>

      {/* Plan schedule */}
      {method === "plan" && (
        <FormSection title="Schedule">
          <div className="px-4 pt-4 text-[12px] text-muted-foreground leading-snug">
            Interest accrued on the selected sub account will be redeemed and sent to your bank on each scheduled date.
          </div>
          <div className="form-field-inline divide-y divide-border/40">
            <FormField label="Frequency">
              <ModernSelect value={planFrequency} onChange={(e) => setPlanFrequency(e.target.value)}>
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </ModernSelect>
            </FormField>
            <FormField label="Start Date">
              <input type="date" />
            </FormField>
          </div>
        </FormSection>
      )}

      {/* Payment / Pay To */}
      <FormSection title="Payment Details">
        <div className="form-field-inline">
          <FormField label="Pay to" hint="Your registered bank account">
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
              <option value="">Select bank account</option>
              {userBankAccounts.map((a) => (
                <option key={a.accNo} value={`${a.bank} — ${a.accNo}`}>
                  {a.bank} — {a.accNo}
                </option>
              ))}
              <option value="__add_bank">+ Add Bank Account</option>
            </ModernSelect>
          </FormField>
        </div>
      </FormSection>

      {/* Amount — instant + normal only, last because limit depends on sub account balance */}
      {method !== "plan" && (
        <section className="mx-4 mt-6">
          <h2 className="px-1 mb-2 text-[15px] font-semibold text-foreground">
            Redemption Amount
          </h2>
          <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 px-4 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-medium text-muted-foreground">LKR</span>
              <input
                type="text"
                inputMode="decimal"
                value={formatAmountDisplay(amount)}
                onChange={(e) => setAmount(sanitizeAmountInput(e.target.value))}
                placeholder="0.00"
                className="flex-1 bg-transparent text-[26px] font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {method === "instant"
                ? `Max LKR ${Math.min(subAccountBalance, INSTANT_DAILY_LIMIT).toLocaleString()} per transaction · Available LKR ${subAccountBalance.toLocaleString()}`
                : `Available balance LKR ${subAccountBalance.toLocaleString()}`}
            </p>
            {overInstantLimit && (
              <p className="mt-1 text-[12px] text-destructive">
                Exceeds the daily instant limit of LKR {INSTANT_DAILY_LIMIT.toLocaleString()}. Use Normal redemption instead.
              </p>
            )}
            {overBalance && (
              <p className="mt-1 text-[12px] text-destructive">
                Exceeds available balance in this sub account.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Terms */}
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

      {/* Submit */}
      <div className="mx-4 mt-3 mb-6">
        <button
          disabled={!acceptedTerms || overInstantLimit || overBalance}
          onClick={() => navigate({ to: "/transactions" })}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {method === "plan" ? "Create Redemption Plan" : "Send Redemption Request"}
        </button>
      </div>
    </MobileLayout>
  );
}
