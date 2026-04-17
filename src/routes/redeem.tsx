import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Zap, Clock, Repeat, Info, Edit2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/redeem")({
  component: Redeem,
});

type RedeemMethod = "instant" | "normal" | "plan";

const funds = ["CAL Growth Fund", "CAL Income Fund", "CAL Balanced Fund", "CAL Money Market Fund"];
const accounts = ["Main Account", "Joint Account", "Minor Account"];
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
  const overInstantLimit = method === "instant" && numericAmount > INSTANT_DAILY_LIMIT;

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
        <p className="text-[11px] text-muted-foreground">{methodInfo[method]}</p>
      </div>

      {/* Existing Plans */}
      {method === "plan" && (
        <div className="mx-4 mt-3">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">EXISTING PLANS</p>
          {existingPlans.map((p, i) => (
            <div key={i} className="glass-card p-3 mb-2 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{p.fund}</p>
                <p className="text-[10px] text-muted-foreground">{p.account} · {p.frequency} · Next: {p.nextDate}</p>
                <p className="text-[10px] text-muted-foreground">To: {p.bank}</p>
              </div>
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
          ))}
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-4 mb-2">NEW PLAN</p>
        </div>
      )}

      {/* Amount — instant + normal only */}
      {method !== "plan" && (
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
          {overInstantLimit && (
            <p className="mt-2 text-[10px] text-destructive">
              Exceeds the daily instant limit of LKR {INSTANT_DAILY_LIMIT.toLocaleString()}. Use Normal redemption instead.
            </p>
          )}
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
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Sub Account</label>
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Plan schedule */}
      {method === "plan" && (
        <div className="mx-4 mt-3 glass-card p-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">SCHEDULE</p>
          <p className="text-[10px] text-muted-foreground">
            Interest accrued on the selected sub account will be redeemed and sent to your bank on each scheduled date.
          </p>
          <div>
            <label className="text-[10px] text-muted-foreground">Frequency</label>
            <select value={planFrequency} onChange={(e) => setPlanFrequency(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground appearance-none outline-none">
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Start Date</label>
            <input type="date" className="mt-1 w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground outline-none" />
          </div>
        </div>
      )}

      {/* Payment / Pay To */}
      <div className="mx-4 mt-3 glass-card p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">PAYMENT DETAILS</p>
        <div>
          <label className="text-[10px] text-muted-foreground">Pay to (Your Bank Account)</label>
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
            <option value="">Select bank account</option>
            {userBankAccounts.map((a) => (
              <option key={a.accNo} value={`${a.bank} — ${a.accNo}`}>
                {a.bank} — {a.accNo}
              </option>
            ))}
            <option value="__add_bank">+ Add Bank Account</option>
          </select>
        </div>
      </div>

      {/* Terms */}
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

      {/* Submit */}
      <div className="mx-4 mt-3 mb-6">
        <button
          disabled={!acceptedTerms || overInstantLimit}
          onClick={() => navigate({ to: "/transactions" })}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {method === "plan" ? "Create Redemption Plan" : "Send Redemption Request"}
        </button>
      </div>
    </MobileLayout>
  );
}
