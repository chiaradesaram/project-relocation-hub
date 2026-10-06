import { useEffect, useState } from "react";
import { ChevronLeft, X, Target } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ModernSelect } from "@/components/ModernSelect";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { GOAL_TOPICS, ICONS, tileStyle, type Goal, type GoalTopic } from "@/lib/goals";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";

const TARGET_MAX = 5_000_000;

const sheetClass =
  "max-h-[90vh] overflow-y-auto rounded-t-[28px] border-0 bg-[color-mix(in_oklch,var(--card)_80%,transparent)] px-5 pb-9 pt-3 backdrop-blur-2xl";


export default function GoalCreator({
  open,
  onOpenChange,
  fundNames,
  defaultFund,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fundNames: string[];
  defaultFund?: string;
  onCreate: (g: Goal) => void;
}) {
  const [step, setStep] = useState<"topic" | "details" | "done">("topic");
  const [topic, setTopic] = useState<GoalTopic | null>(null);
  const [emoji, setEmoji] = useState("");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [fund, setFund] = useState<string | undefined>(defaultFund);
  const [hasTarget, setHasTarget] = useState(false);
  const [target, setTarget] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setStep("topic");
      setTopic(null);
      setName("");
      setFund(defaultFund);
      setHasTarget(false);
      setTarget(0);
      setDate(undefined);
    }
  }, [open, defaultFund]);

  const pickTopic = (t: GoalTopic) => {
    setTopic(t);
    setEmoji(t.icons[0]!);
    setName(t.key === "other" ? "" : t.label);
    setStep("details");
  };

  const targetNum = target;
  const canSave = !!topic && name.trim() && fund && (!hasTarget || targetNum > 0);

  const save = () => {
    if (!canSave || !topic || !fund) return;
    onCreate({
      id: `goal-${Date.now()}`,
      fundName: fund,
      name: name.trim(),
      topic: topic.key,
      icon: emoji,
      target: hasTarget ? targetNum : undefined,
      targetDate: hasTarget && date ? date : undefined,
      saved: 0,
      createdAt: new Date().toISOString(),
    });
    setStep("done");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={sheetClass}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-foreground/20" />
        {step === "done" ? (
          <div className="flex flex-col items-center px-1 pb-4 pt-4 text-center">
            <div className="relative">
              <span className="flex h-20 w-20 items-center justify-center rounded-full animate-in zoom-in-50 duration-300" style={tileStyle(topic!.hue)}>
                {(() => { const I = ICONS[emoji]!; return <I className="h-9 w-9" strokeWidth={2.2} />; })()}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success">
                <Check className="h-4 w-4 text-success-foreground" strokeWidth={3} />
              </span>
            </div>
            <SheetTitle className="mt-4 font-display text-[20px] font-semibold text-foreground">{name} is ready</SheetTitle>
            <SheetDescription className="mt-1 text-[13px] text-foreground/85">
              Nothing's in it yet — make your first investment to get it growing.
            </SheetDescription>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/invest", search: { product: "unit-trust", method: "instant", fund: fund, sub: name.trim() } });
              }}
              className="mt-6 h-12 w-full rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
            >
              Invest now
            </Button>
            <button onClick={() => onOpenChange(false)} className="mt-3 text-[13px] font-semibold text-pill">
              Maybe later
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              {step === "details" ? (
                <button
                  onClick={() => setStep("topic")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/[0.08]"
                  aria-label="Back"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/[0.08]"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {step === "topic" && (
              <>
                <SheetTitle className="mt-2 font-display text-[22px] font-semibold text-foreground">
                  What are you saving for?
                </SheetTitle>
                <SheetDescription className="mt-1 text-[13px] text-foreground/80">
                  Pick a topic — each goal is its own sub account.
                </SheetDescription>
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {GOAL_TOPICS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => pickTopic(t)}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-foreground/[0.06] px-2 py-4 transition-transform hover:bg-foreground/[0.09] active:scale-95"
                    >
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={tileStyle(t.hue)}
                      >
                        {(() => { const I = ICONS[t.icons[0]!]!; return <I className="h-5 w-5" strokeWidth={2.2} />; })()}
                      </span>
                      <span className="text-[12px] font-semibold text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "details" && topic && (
              <>
                <div className="mt-1 flex flex-col items-center">
                  <span
                    className="flex h-20 w-20 items-center justify-center rounded-full animate-in zoom-in-50 duration-300"
                    style={tileStyle(topic.hue)}
                  >
                    {(() => { const I = ICONS[emoji]!; return <I className="h-9 w-9" strokeWidth={2.2} />; })()}
                  </span>
                  <div className="mt-3 flex gap-1.5">
                    {topic.icons.map((e) => {
                      const I = ICONS[e]!;
                      return (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                            emoji === e ? "bg-pill/25 text-pill scale-110" : "bg-foreground/[0.06] text-foreground"
                          }`}
                        >
                          <I className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <SheetTitle className="sr-only">Goal details</SheetTitle>

                <div className="mt-5 space-y-2.5">
                  <label className="block rounded-2xl bg-foreground/[0.06] px-4 py-2.5">
                    <span className="text-[11px] font-medium text-pill">Goal name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Japan 2027"
                      className="block w-full bg-transparent text-[15px] font-semibold text-foreground outline-none placeholder:text-foreground/40"
                    />
                  </label>

                  <div className="rounded-2xl bg-foreground/[0.06] px-4 py-2.5">
                    <span className="text-[11px] font-medium text-pill">Invest in</span>
                    <ModernSelect
                      value={fund}
                      onChange={(e) => setFund(e.target.value)}
                      placeholder="Choose a fund"
                      className="mt-1 rounded-xl border-0 bg-background/40 text-[14px] font-semibold"
                    >
                      <option value="">Choose a fund</option>
                      {fundNames.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </ModernSelect>
                  </div>

                  {!hasTarget ? (
                    <button
                      onClick={() => setHasTarget(true)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-foreground/[0.06] px-4 py-3 text-left transition-colors hover:bg-foreground/[0.09] active:bg-foreground/[0.12]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pill/15">
                        <Target className="h-5 w-5 text-pill" />
                      </span>
                      <span>
                        <p className="text-[14px] font-semibold text-foreground">Set a target</p>
                        <p className="text-[12px] text-foreground/75">Optional — track your progress</p>
                      </span>
                    </button>
                  ) : (
                    <div className="rounded-2xl bg-foreground/[0.06] px-4 py-3">
                      <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                        <Target className="h-4 w-4 text-pill" />
                        Your target
                        <button
                          onClick={() => { setHasTarget(false); setTarget(""); setDate(""); }}
                          className="ml-auto text-[12px] font-semibold text-pill"
                        >
                          Remove
                        </button>
                      </p>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <label className="rounded-xl bg-background/40 px-3 py-2">
                          <span className="text-[11px] font-medium text-pill">Target (LKR)</span>
                          <input
                            inputMode="numeric"
                            value={target ? Number(target.replace(/[^0-9]/g, "")).toLocaleString("en-LK") : ""}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="500,000"
                            className="block w-full bg-transparent text-[14px] font-semibold text-foreground outline-none placeholder:text-foreground/40"
                          />
                        </label>
                        <label className="rounded-xl bg-background/40 px-3 py-2">
                          <span className="text-[11px] font-medium text-pill">By when</span>
                          <input
                            type="month"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="block w-full bg-transparent text-[14px] font-semibold text-foreground outline-none [color-scheme:dark]"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  disabled={!canSave}
                  onClick={save}
                  className="mt-5 h-12 w-full rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
                >
                  Create goal
                </Button>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
