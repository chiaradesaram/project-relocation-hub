import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ChevronRight,
  PauseCircle,
  PenLine,
} from "lucide-react";
import { isPopularFund } from "@/lib/fundMeta";
import {
  SETTLEMENT_FUND_KEY,
  SETTLEMENT_ACCOUNT_KEY,
} from "@/routes/invest";

export const Route = createFileRoute("/requests/equity-settlement")({
  component: EquitySettlementRequest,
});

export const EQUITY_SETTLEMENT_KEY = "equitySettlementFromUT";

const funds = [
  "CAL Growth Fund",
  "CAL Income Fund",
  "CAL Balanced Fund",
  "CAL Money Market Fund",
];
const accounts = ["Main Account", "Joint Account", "Minor Account"];

function EquitySettlementRequest() {
  const [state, setState] = useState<string | null>(null);
  const [fund, setFund] = useState("");
  const [account, setAccount] = useState("");
  useEffect(() => {
    setState(localStorage.getItem(EQUITY_SETTLEMENT_KEY));
    setFund(localStorage.getItem(SETTLEMENT_FUND_KEY) ?? "");
    setAccount(localStorage.getItem(SETTLEMENT_ACCOUNT_KEY) ?? "");
  }, []);
  const enabled = state === "enabled";
  const paused = state === "disabled";
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [picker, setPicker] = useState<null | "fund" | "account">(null);

  const canSubmit =
    agreed && signature.trim().length > 1 && !!fund && !!account;

  const submit = () => {
    localStorage.setItem(EQUITY_SETTLEMENT_KEY, "enabled");
    localStorage.setItem(SETTLEMENT_FUND_KEY, fund);
    localStorage.setItem(SETTLEMENT_ACCOUNT_KEY, account);
    setState("enabled");
    setSubmitted(true);
  };

  const toggle = (on: boolean) => {
    localStorage.setItem(EQUITY_SETTLEMENT_KEY, on ? "enabled" : "disabled");
    setState(on ? "enabled" : "disabled");
    if (on) setSubmitted(false);
  };

  const pick = (option: string) => {
    if (picker === "account") {
      setAccount(option);
      localStorage.setItem(SETTLEMENT_ACCOUNT_KEY, option);
    } else {
      setFund(option);
      localStorage.setItem(SETTLEMENT_FUND_KEY, option);
    }
    setPicker(null);
  };

  const pickerCard = (
    <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 divide-y divide-border/40 overflow-hidden">
      <button
        onClick={() => setPicker("fund")}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-foreground">Settle from fund</p>
          <p className="text-sm text-foreground mt-0.5 truncate">
            {fund || "Select a fund"}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-foreground shrink-0" />
      </button>
      <button
        onClick={() => setPicker("account")}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-foreground">Sub account</p>
          <p className="text-sm text-foreground mt-0.5 truncate">
            {account || "Select a sub account"}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-foreground shrink-0" />
      </button>
    </div>
  );

  return (
    <MobileLayout>
      <PageHeader title="Equity Settlement" showBack />

      <div className="px-4 mt-2 mb-6 space-y-3">
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Settle equities from your Unit Trust</p>
            <p className="text-[12px] text-foreground mt-1 leading-snug">
              By enabling this, you agree that your equity trades may be settled automatically using funds from your unit trust account when your cash balance is insufficient.
            </p>
          </div>
        </div>

        {enabled || paused ? (
          <>
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                {enabled ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <PauseCircle className="w-4 h-4 text-foreground shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {enabled
                      ? submitted
                        ? "Request submitted"
                        : "Equity settlement is active"
                      : "Equity settlement is paused"}
                  </p>
                  <p className="text-[12px] text-foreground mt-0.5">
                    {enabled ? "Turned on" : "Turned off"}
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={toggle} />
              </div>
              <p className="text-[12px] text-foreground leading-snug">
                {enabled
                  ? submitted
                    ? "Your request has been received. Once approved, equity trades will be auto-settled from your chosen unit trust fund."
                    : "Equity trades are being auto-settled from your chosen unit trust fund."
                  : "Auto-settlement from your unit trust account is temporarily disabled. Your authorization and fund selection stay in place — turn it back on anytime."}
              </p>
            </div>

            {enabled && pickerCard}
          </>
        ) : (
          <>
            <div className="glass-card p-4 space-y-3">
              <p className="text-[12px] font-medium uppercase tracking-wider text-foreground">What you're agreeing to</p>
              <ul className="space-y-2 text-[12px] text-foreground leading-snug list-disc pl-4">
                <li>Equity purchases will be settled by redeeming units from your unit trust account when your cash balance is insufficient.</li>
                <li>Redemptions follow the unit trust's standard settlement timelines and applicable fees.</li>
                <li>This also allows you to transfer funds from your unit trust to equities.</li>
              </ul>
            </div>

            {pickerCard}

            <label className="glass-card p-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0"
              />
              <span className="text-[12px] text-foreground leading-snug">
                I/We hereby authorize Capital Alliance Securities to auto-settle my equity trades from my unit trust account, and agree to the terms above.
              </span>
            </label>

            <div className="glass-card p-4">
              <p className="text-[12px] font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-primary" /> Signature
              </p>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name to sign"
                className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-foreground/50 outline-none focus:border-primary/50"
              />
            </div>

            <button
              disabled={!canSubmit}
              onClick={submit}
              className="w-full rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground disabled:opacity-40 transition"
            >
              Sign & submit
            </button>
          </>
        )}
      </div>

      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {picker === "account" ? "Select sub account" : "Select fund"}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6 space-y-1.5">
            {(picker === "account" ? accounts : funds).map((option) => {
              const selected =
                picker === "account" ? account === option : fund === option;
              return (
                <button
                  key={option}
                  onClick={() => pick(option)}
                  className="w-full rounded-2xl bg-card/60 px-4 py-3.5 flex items-center gap-3 text-left"
                >
                  <span className="flex-1 text-sm text-foreground truncate">
                    {option}
                  </span>
                  {picker === "fund" && isPopularFund(option) && (
                    <span className="text-[10px] text-foreground shrink-0">
                      Popular
                    </span>
                  )}
                  {selected && (
                    <Check
                      className="w-4 h-4 shrink-0"
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
