import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { ArrowLeftRight, CheckCircle2, PenLine } from "lucide-react";

export const Route = createFileRoute("/requests/equity-settlement")({
  component: EquitySettlementRequest,
});

export const EQUITY_SETTLEMENT_KEY = "equitySettlementFromUT";

function EquitySettlementRequest() {
  const [state, setState] = useState<string | null>(null);
  useEffect(() => {
    setState(localStorage.getItem(EQUITY_SETTLEMENT_KEY));
  }, []);
  const enabled = state === "enabled";
  const paused = state === "disabled";
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = agreed && signature.trim().length > 1;

  const submit = () => {
    localStorage.setItem(EQUITY_SETTLEMENT_KEY, "enabled");
    setState("enabled");
    setSubmitted(true);
  };

  const disable = () => {
    localStorage.setItem(EQUITY_SETTLEMENT_KEY, "disabled");
    setState("disabled");
    setSubmitted(false);
  };

  const reEnable = () => {
    localStorage.setItem(EQUITY_SETTLEMENT_KEY, "enabled");
    setState("enabled");
  };

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
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
              By enabling this, you agree that your equity trades may be settled automatically using funds from your unit trust account when your cash balance is insufficient.
            </p>
          </div>
        </div>

        {enabled ? (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                {submitted ? "Request submitted" : "Equity settlement is active"}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-snug">
              {submitted
                ? "Your request has been received. Once approved, equity trades will be auto-settled from your unit trust account."
                : "Equity trades are being auto-settled from your unit trust account."}
            </p>
            <p className="text-[12px] text-muted-foreground leading-snug">
              You can pause this anytime from Settings.
            </p>
            <button
              onClick={disable}
              className="w-full rounded-xl border border-border/40 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition"
            >
              Disable temporarily
            </button>
          </div>
        ) : paused ? (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Equity settlement is paused</p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-snug">
              Auto-settlement from your unit trust account is temporarily disabled. Your authorization stays in place and you can turn it back on at any time.
            </p>
            <button
              onClick={reEnable}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition"
            >
              Re-enable equity settlement
            </button>
          </div>
        ) : (
          <>
            <div className="glass-card p-4 space-y-3">
              <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">What you're agreeing to</p>
              <ul className="space-y-2 text-[12px] text-muted-foreground leading-snug list-disc pl-4">
                <li>Equity purchases will be settled by redeeming units from your unit trust account when your cash balance is insufficient.</li>
                <li>Redemptions follow the unit trust's standard settlement timelines and applicable fees.</li>
                <li>You can withdraw this authorization at any time from Settings.</li>
              </ul>
            </div>

            <label className="glass-card p-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0"
              />
              <span className="text-[12px] text-muted-foreground leading-snug">
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
                className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50"
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
    </MobileLayout>
  );
}
