import { useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import SavedConfirmation from "@/components/SavedConfirmation";
import RadioDot from "@/components/RadioDot";
import { GOAL_TOPICS, type Goal, type GoalTopic } from "@/lib/goals";

const sheetClass =
  "max-h-[90vh] overflow-y-auto rounded-t-[28px] border-0 bg-[color-mix(in_oklch,var(--card)_80%,transparent)] px-5 pb-9 pt-3 backdrop-blur-2xl";

export function tileStyle(hue: number) {
  return { background: `oklch(0.42 0.09 ${hue} / 0.45)` };
}

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
  const [name, setName] = useState("");
  const [fund, setFund] = useState<string | undefined>(defaultFund);
  const [hasTarget, setHasTarget] = useState(false);
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (open) {
      setStep("topic");
      setTopic(null);
      setName("");
      setFund(defaultFund);
      setHasTarget(false);
      setTarget("");
      setDate("");
    }
  }, [open, defaultFund]);

  const pickTopic = (t: GoalTopic) => {
    setTopic(t);
    setEmoji(t.emoji);
    setName(t.key === "other" ? "" : t.label);
    setStep("details");
  };

  const targetNum = Number(target.replace(/[^0-9]/g, ""));
  const canSave = !!topic && name.trim() && fund && (!hasTarget || targetNum > 0);

  const save = () => {
    if (!canSave || !topic || !fund) return;
    onCreate({
      id: `goal-${Date.now()}`,
      fundName: fund,
      name: name.trim(),
      topic: topic.key,
      emoji,
      target: hasTarget ? targetNum : undefined,
      targetDate: hasTarget && date ? date : undefined,
      saved: 0,
      createdAt: new Date().toISOString(),
    });
    setStep("done");
    setTimeout(() => onOpenChange(false), 1300);
  };

  // Emoji alternatives per topic for a bit of fun
  const emojiOptions: Record<string, string[]> = {
    travel: ["✈️", "🏝️", "🗺️", "🎒", "🗼"],
    home: ["🏡", "🛋️", "🔑", "🪴", "🏢"],
    car: ["🚗", "🏍️", "🚙", "🛵", "⛽"],
    wedding: ["💍", "💒", "🥂", "💐", "👰"],
    education: ["🎓", "📚", "🧑‍🎓", "✏️", "🔬"],
    emergency: ["☔", "🛟", "🧰", "🛡️", "🌧️"],
    retirement: ["🌴", "🏖️", "🎣", "☕", "🌅"],
    baby: ["🍼", "🧸", "👶", "🎈", "🍭"],
    tech: ["💻", "📱", "🎧", "🎮", "📷"],
    gift: ["🎁", "🎂", "🎉", "💝", "🎄"],
    health: ["🧘", "🏋️", "🍎", "🚴", "💪"],
    other: ["✨", "⭐", "🚀", "🎯", "🌈"],
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={sheetClass}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-foreground/20" />
        {step === "done" ? (
          <SavedConfirmation summary={`${emoji} ${name} is ready. Start investing towards it anytime.`} />
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
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-[26px]"
                        style={tileStyle(t.hue)}
                      >
                        {t.emoji}
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
                    className="flex h-20 w-20 items-center justify-center rounded-[26px] text-[42px] animate-in zoom-in-50 duration-300"
                    style={tileStyle(topic.hue)}
                  >
                    {emoji}
                  </span>
                  <div className="mt-3 flex gap-1.5">
                    {emojiOptions[topic.key].map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[18px] transition-all ${
                          emoji === e ? "bg-pill/25 scale-110" : "bg-foreground/[0.06]"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
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
                    <div className="mt-1 space-y-0.5">
                      {fundNames.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFund(f)}
                          className="flex w-full items-center justify-between py-2 text-left text-[14px] font-medium text-foreground"
                        >
                          {f}
                          <RadioDot selected={fund === f} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-foreground/[0.06] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">Set a target</p>
                        <p className="text-[12px] text-foreground/75">Optional — track your progress</p>
                      </div>
                      <Switch checked={hasTarget} onCheckedChange={setHasTarget} />
                    </div>
                    {hasTarget && (
                      <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
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
                    )}
                  </div>
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
