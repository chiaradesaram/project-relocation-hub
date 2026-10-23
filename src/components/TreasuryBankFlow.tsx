import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronRight, Clock, Copy, Paperclip, X } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import ModernSelect from "@/components/ModernSelect";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import { bankAccountLabel } from "@/lib/bankAccountLabel";
import {
  TREASURY_MIN_INVESTMENT,
  TRANSFER_WINDOW_MINUTES,
  couponSchedule,
  faceValue,
  treasurySecurities,
  type TreasurySecurity,
} from "@/lib/treasury";

const CAL_ACCOUNT = {
  name: "CAL Securities (Pvt) Ltd",
  bank: "Deutsche Bank",
  branch: "Colombo",
  number: "0078 4521 0036",
};

const USER_BANKS = [
  "Commercial Bank · 8001 2345 21",
  "Sampath Bank · 1100 5688 32",
  "HNB · 0452 2012 09",
  "BOC · 7700 8934 81",
];

const STEPS = ["Pick", "Amount", "Transfer", "Proof"];
const lkr = (n: number) => `LKR ${n.toLocaleString("en-US")}`;
const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function TreasuryBankFlow({ kind }: { kind: "bills" | "bonds" }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [security, setSecurity] = useState<TreasurySecurity | null>(null);
  const [amount, setAmount] = useState("");
  const [calculated, setCalculated] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [proof, setProof] = useState<File | null>(null);
  const [fromBank, setFromBank] = useState("");
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => treasurySecurities.filter((s) => s.kind === kind), [kind]);
  const amountNum = Number(amount) || 0;
  const belowMin = amountNum > 0 && amountNum < TREASURY_MIN_INVESTMENT;
  const coupons =
    security?.couponRate !== undefined && calculated !== null
      ? couponSchedule(calculated, security.couponRate, security.maturityDate, security.days)
      : [];
  const couponTotal = coupons.reduce((t, c) => t + c.amount, 0);
  const title = kind === "bills" ? "Treasury Bills" : "Treasury Bonds";

  useEffect(() => {
    if (!deadline) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [deadline]);

  const remaining = deadline ? Math.max(0, deadline - now) : 0;
  const expired = deadline !== null && remaining === 0;
  const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  const back = () => (step === 0 ? window.history.back() : setStep(step - 1));

  const goTransfer = () => {
    setDeadline(Date.now() + TRANSFER_WINDOW_MINUTES * 60000);
    setNow(Date.now());
    setStep(2);
  };

  const copy = () => {
    navigator.clipboard?.writeText(CAL_ACCOUNT.number.replace(/\s/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MobileLayout hideNav>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={back}
            aria-label="Back"
            className="flex size-8 items-center justify-center rounded-full bg-muted/50 text-foreground"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-semibold text-foreground">{title}</h1>
          <div className="size-8" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-pill" : "bg-muted/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-32">
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold text-foreground">Pick a {kind === "bills" ? "bill" : "bond"}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Sample securities currently on offer.</p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-card/60">
              <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 text-[11px] text-muted-foreground">
                <span className="flex-1">Period · Maturity</span>
                {kind === "bonds" && <span className="w-14 text-right">Coupon</span>}
                <span className="w-14 text-right">Rate</span>
                <span className="w-3.5" />
              </div>
              <div className="divide-y divide-border/30">
                {list.map((s) => (
                  <button
                    key={s.isin}
                    onClick={() => {
                      setSecurity(s);
                      setCalculated(null);
                      setStep(1);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition active:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground tabular-nums">
                        {s.days}d <span className="font-normal text-muted-foreground">· {fmtDate(s.maturityDate)}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">{s.isin}</p>
                    </div>
                    {s.couponRate !== undefined && (
                      <span className="w-14 text-right text-[13px] font-medium text-foreground tabular-nums">
                        {s.couponRate.toFixed(2)}%
                      </span>
                    )}
                    <span className="w-14 text-right text-[14px] font-bold text-rates-mint tabular-nums">
                      {s.rate.toFixed(2)}%
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && security && (
          <>
            <div className="rounded-2xl bg-card/60 px-4 py-2 divide-y divide-border/30">
              <Row label="ISIN" value={security.isin} />
              <Row label="Rate" value={`${security.rate.toFixed(2)}%`} />
              {security.couponRate !== undefined && (
                <Row label="Coupon rate" value={`${security.couponRate.toFixed(2)}% · twice a year`} />
              )}
              <Row label="Maturity period" value={`${security.days} days`} />
              <Row label="Maturity date" value={fmtDate(security.maturityDate)} />
            </div>

            <p className="mt-6 text-center text-[12px] text-muted-foreground">Investment amount</p>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <span className="text-lg font-semibold text-muted-foreground">LKR</span>
              <input
                inputMode="decimal"
                placeholder="0"
                value={formatAmountDisplay(amount)}
                onChange={(e) => {
                  setAmount(sanitizeAmountInput(e.target.value));
                  setCalculated(null);
                }}
                className="w-48 bg-transparent text-center text-3xl font-bold text-foreground outline-none tabular-nums placeholder:text-muted-foreground/50"
              />
            </div>
            <p className={`mt-1 text-center text-[12px] ${belowMin ? "text-destructive" : "text-muted-foreground"}`}>
              Minimum {lkr(TREASURY_MIN_INVESTMENT)}
            </p>

            {calculated !== null && (
              <div className="mt-5 rounded-2xl bg-card/60 px-4 py-4 text-center">
                <p className="text-[12px] text-muted-foreground">Face value at maturity</p>
                <p className="mt-1 text-2xl font-bold text-rates-mint tabular-nums">{lkr(calculated)}</p>
                {coupons.length === 0 && (
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    You earn {lkr(calculated - amountNum)} on {fmtDate(security.maturityDate)}
                  </p>
                )}
              </div>
            )}

            {calculated !== null && coupons.length > 0 && (
              <div className="mt-3 rounded-2xl bg-card/60 px-4 py-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] font-semibold text-muted-foreground">Coupon payments</p>
                  <p className="text-[12px] text-muted-foreground tabular-nums">
                    {coupons.length} × {lkr(coupons[0].amount)}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-background/40 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">Every 6 months</p>
                    <p className="text-[14px] font-semibold text-foreground tabular-nums">{lkr(coupons[0].amount)}</p>
                  </div>
                  <div className="rounded-xl bg-background/40 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">Total coupons</p>
                    <p className="text-[14px] font-semibold text-rates-mint tabular-nums">{lkr(couponTotal)}</p>
                  </div>
                </div>
                <ol className="mt-3 max-h-52 overflow-y-auto pr-1">
                  {coupons.map((c, i) => (
                    <li key={i} className="relative flex items-center gap-3 py-1.5">
                      {i < coupons.length - 1 && (
                        <span aria-hidden className="absolute left-[3.5px] top-1/2 h-full w-px bg-border/60" />
                      )}
                      <span
                        aria-hidden
                        className={`relative z-10 size-2 shrink-0 rounded-full ${i === coupons.length - 1 ? "bg-rates-mint" : "bg-pill"}`}
                      />
                      <span className="flex-1 text-[12px] text-muted-foreground tabular-nums">
                        {c.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        {i === coupons.length - 1 && " · plus face value"}
                      </span>
                      <span className="text-[12px] font-medium text-foreground tabular-nums">
                        {lkr(i === coupons.length - 1 ? c.amount + calculated : c.amount)}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 border-t border-border/30 pt-2 text-[12px] text-muted-foreground">
                  You receive {lkr(couponTotal + calculated)} in total over the life of the bond.
                </p>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col items-center pt-2 text-center">
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="size-3.5" /> Time left to transfer
              </div>
              <p className={`mt-1 text-4xl font-bold tabular-nums ${expired ? "text-destructive" : "text-foreground"}`}>
                {mm}:{ss}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {expired
                  ? "Time's up — go back and recalculate to start again."
                  : <>Transfer <span className="font-semibold text-foreground">{lkr(amountNum)}</span> to CAL's account below.</>}
              </p>
            </div>
            <div className="mt-5 rounded-2xl bg-card/60 px-4 py-2 divide-y divide-border/30">
              <Row label="Account name" value={CAL_ACCOUNT.name} />
              <Row label="Bank" value={CAL_ACCOUNT.bank} />
              <Row label="Branch" value={CAL_ACCOUNT.branch} />
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[13px] text-muted-foreground">Account number</span>
                <button onClick={copy} className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tabular-nums">
                  {CAL_ACCOUNT.number}
                  {copied ? <Check className="size-3.5 text-rates-mint" /> : <Copy className="size-3.5 text-pill" />}
                </button>
              </div>
              <Row label="Amount" value={lkr(amountNum)} />
            </div>
          </>
        )}

        {step === 3 && security && (
          <>
            <h2 className="text-xl font-bold text-foreground">Confirm your transfer</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Attach your receipt and tell us where it came from.</p>

            <p className="mt-5 mb-1.5 text-[12px] text-muted-foreground">Transferred from</p>
            <ModernSelect value={fromBank} onChange={(e) => setFromBank(e.target.value)} placeholder="Select your bank account">
              {USER_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </ModernSelect>

            <p className="mt-4 mb-1.5 text-[12px] text-muted-foreground">Proof of transfer</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
            {proof ? (
              <div className="flex items-center gap-3 rounded-xl bg-card/70 px-3 py-2.5">
                <Paperclip className="size-4 text-pill" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{proof.name}</span>
                <button onClick={() => setProof(null)} aria-label="Remove file">
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-border/60 bg-card/40 py-5"
              >
                <Paperclip className="size-5 text-pill" />
                <span className="text-[13px] font-medium text-foreground">Attach receipt</span>
                <span className="text-[11px] text-muted-foreground">Image or PDF</span>
              </button>
            )}

            <div className="mt-5 rounded-2xl bg-card/60 px-4 py-2 divide-y divide-border/30">
              <Row label="Security" value={`${security.days} days · ${security.isin}`} />
              <Row label="Investment" value={lkr(amountNum)} />
              <Row label="Face value" value={lkr(calculated ?? 0)} />
            </div>
          </>
        )}
      </div>

      {/* Bottom action */}
      {step > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md bg-background/85 px-4 pb-6 pt-3 backdrop-blur-lg">
          {step === 1 && (
            calculated === null ? (
              <Action
                disabled={amountNum < TREASURY_MIN_INVESTMENT}
                onClick={() => security && setCalculated(faceValue(amountNum, security.rate, security.days, security.couponRate))}
              >
                Calculate face value
              </Action>
            ) : (
              <Action onClick={goTransfer}>Continue to transfer</Action>
            )
          )}
          {step === 2 && (
            <Action disabled={expired} onClick={() => setStep(3)}>I have made my transfer</Action>
          )}
          {step === 3 && (
            <Action disabled={!proof || !fromBank} onClick={() => setDone(true)}>Submit request</Action>
          )}
        </div>
      )}

      <Sheet
        open={done}
        onOpenChange={(o) => {
          setDone(o);
          if (!o) navigate({ to: "/transactions" });
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Request sent</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center px-1 pb-6 pt-6 text-center">
            <div
              className="flex size-16 items-center justify-center rounded-full"
              style={{ background: "color-mix(in oklch, var(--success) 22%, transparent)" }}
            >
              <Check className="size-8" strokeWidth={2.5} style={{ color: "var(--success)" }} />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">Request sent</p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              {lkr(amountNum)} into {security?.days}-day {kind === "bills" ? "bill" : "bond"} from{" "}
              {fromBank ? bankAccountLabel(...(fromBank.split(" · ") as [string, string])) : ""} — we'll email you once it's verified
            </p>
            <Button
              onClick={() => navigate({ to: "/transactions" })}
              className="mt-6 h-auto w-full rounded-full py-4 text-[15px] font-semibold"
              style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
            >
              Track my request
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="truncate text-right text-[13px] font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className="h-auto w-full rounded-full py-4 text-[15px] font-semibold"
      style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
    >
      {children}
    </Button>
  );
}
