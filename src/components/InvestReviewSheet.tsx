import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Info, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type InvestReviewMethod = "instant" | "bank" | "flip" | "recurring";

export type InvestReviewData = {
  method: InvestReviewMethod;
  amount: number;
  fund: string;
  account?: string;
  /** "Sent to" (bank transfer) or "Transfer to" (fund flip) */
  destinationLabel?: string;
  /** Paying-from bank, shown on bank transfers */
  fromBankLabel?: string;
  /** Justpay split parts — at most 3 */
  splits: number[];
  recurring?: { startDate?: Date | string; frequency: string; edit?: string };
  /** Overrides the fund named in the confirmation line */
  sentTarget?: string;
  /** Bank-transfer extras: quick check + investment timeline */
  showBankExtras?: boolean;
  /** Data side effects, e.g. saving a recurring plan */
  onConfirm?: () => void;
};

const ordinal = (day: number) =>
  day % 10 === 1 && day !== 11
    ? "st"
    : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtTimeline = (d: Date) =>
  `${d.getDate()}${ordinal(d.getDate())} ${d.toLocaleDateString("en-GB", { month: "long" })}, ${d.toLocaleDateString("en-GB", { weekday: "short" })}`;

// Next 2nd Monday of October — when new units are created for bank transfers
const unitCreation = (() => {
  const secondMonday = (y: number) => {
    const firstDay = new Date(y, 9, 1).getDay();
    return 1 + ((8 - firstDay) % 7) + 7;
  };
  const now = new Date();
  let y = now.getFullYear();
  if (now > new Date(y, 9, secondMonday(y), 23, 59)) y += 1;
  return new Date(y, 9, secondMonday(y));
})();

const QUICK_CHECKS = [
  "You have sent to CAL's Deutsche Bank account",
  "You have not transferred from a wallet account",
];

export function InvestReviewSheet({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  data: InvestReviewData;
}) {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [chargeInfo, setChargeInfo] = useState(false);
  const [creationInfoOpen, setCreationInfoOpen] = useState(false);

  // Fresh review every time the sheet opens
  useEffect(() => {
    if (open) {
      setSent(false);
      setChargeInfo(false);
    }
  }, [open]);

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o && sent) {
      window.setTimeout(() => navigate({ to: "/transactions" }), 320);
    }
  };

  const {
    method,
    amount,
    fund,
    account,
    destinationLabel,
    fromBankLabel,
    splits,
    recurring,
    sentTarget,
    showBankExtras,
    onConfirm,
  } = data;

  const isBank = method === "bank";
  const isFlip = method === "flip";
  const isInstant = method === "instant";
  const isRecurring = method === "recurring";
  const repeats = Math.max(1, splits.length);
  const serviceCharge = isInstant || isRecurring ? 50 * repeats : 0;
  const total = amount + serviceCharge;
  const methodLabel = isRecurring
    ? "Recurring Investment"
    : isInstant
      ? "Justpay (Direct Invest)"
      : isBank
        ? "Bank Transfer"
        : "Fund Flip";

  const recurringDate = recurring?.startDate
    ? fmtDate(
        typeof recurring.startDate === "string"
          ? new Date(`${recurring.startDate}T00:00:00`)
          : recurring.startDate,
      )
    : "";

  const confirm = () => {
    onConfirm?.();
    setSent(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {sent ? (
            <div className="px-1 pb-10 pt-6 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "color-mix(in oklch, var(--success) 22%, transparent)" }}
              >
                <Check className="w-8 h-8" strokeWidth={2.5} style={{ color: "var(--success)" }} />
              </div>
              <p className="text-base font-semibold text-foreground mt-4">
                {isRecurring ? "Plan created" : "Request sent"}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                {isRecurring
                  ? `${`LKR ${amount.toLocaleString()}`} will be invested in ${fund} every month`
                  : `${`LKR ${total.toLocaleString()}`} into ${sentTarget || fund || "your fund"}. You'll be emailed once your transfer is matched with this request.`}
              </p>
            </div>
          ) : (
            <>
              <SheetHead title="Review" onClose={() => handleOpenChange(false)} centered />
              <div className="text-center pb-4">
                <p className="text-[12px] text-muted-foreground">
                  {isBank ? "Total to invest" : methodLabel}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                  LKR {total.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-background/40 px-4 py-2 divide-y divide-border/30">
                {isBank ? (
                  <>
                    {fund && <ReviewRow label="Fund" value={fund} />}
                    {account && <ReviewRow label="Sub account" value={account} />}
                    {fromBankLabel && (
                      <ReviewRow label="Transferred from" value={fromBankLabel} />
                    )}
                    {destinationLabel && <ReviewRow label="Sent to" value={destinationLabel} />}
                  </>
                ) : isFlip ? (
                  <>
                    {fund && <ReviewRow label="Transfer from" value={fund} />}
                    {account && <ReviewRow label="Sub account" value={account} />}
                    {destinationLabel && (
                      <ReviewRow label="Transfer to" value={destinationLabel} />
                    )}
                    <ReviewRow
                      label="Investment amount"
                      value={`LKR ${amount.toLocaleString()}`}
                    />
                    <ReviewRow label="Transaction date" value={fmtDate(new Date())} />
                  </>
                ) : (
                  <>
                    {fund && <ReviewRow label="Fund" value={fund} />}
                    {account && <ReviewRow label="Sub account" value={account} />}
                    <ReviewRow
                      label="Investment amount"
                      value={`LKR ${amount.toLocaleString()}`}
                    />
                    {splits.length > 1 && (
                      <>
                        <ReviewRow label="Split into" value={`${splits.length} transfers`} />
                        {splits.map((part, i) => (
                          <ReviewRow
                            key={i}
                            label={`Transfer ${i + 1}`}
                            value={`LKR ${part.toLocaleString()}`}
                          />
                        ))}
                      </>
                    )}
                    {isInstant && (
                      <>
                        <div className="flex items-start justify-between gap-2 py-2.5">
                          <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                            Justpay service charge
                            {splits.length > 1 ? ` × ${splits.length}` : ""}
                            <button
                              type="button"
                              onClick={() => setChargeInfo(!chargeInfo)}
                              aria-label="About the Justpay charge"
                            >
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </span>
                          <span className="text-[13px] font-semibold text-foreground">
                            LKR {serviceCharge.toLocaleString()}
                          </span>
                        </div>
                        {chargeInfo && (
                          <div
                            className="flex items-start gap-2 m-2 p-2.5 rounded-lg"
                            style={{
                              background:
                                "color-mix(in oklch, var(--portfolio-blue) 12%, transparent)",
                            }}
                          >
                            <Lightbulb
                              className="w-3.5 h-3.5 mt-0.5 shrink-0"
                              style={{ color: "var(--portfolio-blue)" }}
                            />
                            <p className="text-[12px] text-muted-foreground">
                              Justpay is the payment provider that powers this investment method.
                              To remove this charge, link a{" "}
                              <span className="text-foreground font-medium">Seylan Bank</span>{" "}
                              account.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    <ReviewRow label="Transaction date" value={fmtDate(new Date())} />
                    {isRecurring && (
                      <>
                        <ReviewRow label="Start date" value={recurringDate} />
                        <ReviewRow label="Frequency" value={recurring?.frequency || "Monthly"} />
                      </>
                    )}
                  </>
                )}
              </div>

              {isBank && showBankExtras && (
                <>
                  {/* Quick check before you submit */}
                  <section
                    className="mt-4 rounded-2xl px-4 py-4 backdrop-blur-sm"
                    style={{ background: "color-mix(in oklch, var(--card) 94%, transparent)" }}
                  >
                    <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground">
                      Quick check before you submit
                    </h2>
                    <ul className="mt-1 divide-y divide-border/40">
                      {QUICK_CHECKS.map((title, i) => (
                        <li
                          key={title}
                          className="flex items-center gap-2.5 py-2"
                        >
                          <Check
                            aria-hidden="true"
                            className="size-[13px] shrink-0 text-rates-mint"
                            strokeWidth={2.75}
                          />
                          <p className="text-[12px] min-w-0 flex-1 text-foreground">{title}</p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Investment timeline */}
                  <section
                    className="mt-3 rounded-2xl px-4 py-4 backdrop-blur-sm"
                    style={{ background: "color-mix(in oklch, var(--card) 94%, transparent)" }}
                  >
                    <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground">
                      Investment timeline
                    </h2>
                    <ol className="mt-4">
                      {[
                        { label: "Request date", value: fmtTimeline(new Date()), tone: "bg-rates-mint" },
                        {
                          label: "Creation date",
                          value: fmtTimeline(unitCreation),
                          info: true,
                          tone: "bg-pill",
                        },
                      ].map((step, i, all) => (
                        <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                          {i < all.length - 1 && (
                            <span
                              aria-hidden="true"
                              className="absolute -bottom-1 left-[5px] top-4 w-px bg-border/70"
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "relative z-10 mt-1 size-[11px] shrink-0 rounded-full",
                              step.tone,
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-foreground">
                                {step.label}
                              </span>
                              {step.info && (
                                <button
                                  type="button"
                                  onClick={() => setCreationInfoOpen(true)}
                                  aria-label="About the creation date"
                                  className="flex size-[16px] shrink-0 items-center justify-center rounded-full transition active:scale-90"
                                  style={{ background: "var(--pill)" }}
                                >
                                  <span
                                    className="text-[10px] font-bold leading-none"
                                    style={{ color: "var(--pill-foreground)" }}
                                  >
                                    i
                                  </span>
                                </button>
                              )}
                            </div>
                            <p className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">
                              {step.value}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                </>
              )}

              <div className="pt-5 pb-6">
                <Button
                  onClick={confirm}
                  className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
                  style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
                >
                  {isRecurring ? "Create plan" : "Confirm Request"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Creation date — what the info icon explains */}
      <Sheet open={creationInfoOpen} onOpenChange={setCreationInfoOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHead title="Creation date" onClose={() => setCreationInfoOpen(false)} />
          <p className="text-[13px] leading-snug text-foreground">
            This is the date your investment will be valued. Your units are created at this
            date&rsquo;s price.
          </p>
          <div className="mt-4 rounded-2xl bg-background/40 px-4 py-1">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] text-foreground">Creation date</span>
              <span className="text-[13px] font-semibold text-foreground tabular-nums">
                {fmtTimeline(unitCreation)}
              </span>
            </div>
          </div>
          <div className="pt-5 pb-6">
            <Button
              onClick={() => setCreationInfoOpen(false)}
              className="w-full py-4 h-auto rounded-full text-[15px] font-semibold"
              style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
            >
              Got it
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SheetHead({
  title,
  onClose,
  centered,
}: {
  title: string;
  onClose: () => void;
  centered?: boolean;
}) {
  return (
    <SheetHeader
      className={`flex-row items-center space-y-0 pb-3 ${
        centered ? "relative justify-center" : "justify-between"
      }`}
    >
      <SheetTitle className={centered ? "text-center" : undefined}>{title}</SheetTitle>
      <button
        onClick={onClose}
        className={`rounded-full bg-secondary p-1 ${centered ? "absolute right-0" : ""}`}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </SheetHeader>
  );
}


function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right truncate">{value}</span>
    </div>
  );
}
