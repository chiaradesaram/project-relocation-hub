import { ModernSelect } from "@/components/ModernSelect";
import { useState, useMemo } from "react";
import { Info, Sparkles, X, ArrowRight, ArrowLeft } from "lucide-react";
import { fundsData, type Risk, type Fund } from "@/data/rateFunds";
const riskStyle = (r: Risk) => {
  if (r === "Low") return { bg: "color-mix(in oklch, var(--portfolio-green) 22%, transparent)", color: "oklch(0.88 0.15 150)" };
  if (r === "Medium") return { bg: "color-mix(in oklch, var(--portfolio-blue) 22%, transparent)", color: "oklch(0.9 0.12 230)" };
  return { bg: "color-mix(in oklch, oklch(0.7 0.2 25) 22%, transparent)", color: "oklch(0.88 0.18 30)" };
};

const RiskPill = ({ risk }: { risk: Risk }) => {
  const s = riskStyle(risk);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
      {risk} risk
    </span>
  );
};

const CompositionBar = ({ comp }: { comp: Fund["composition"] }) => (
  <div className="space-y-1.5">
    <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary">
      {comp.map((c) => (
        <div key={c.label} style={{ width: `${c.pct}%`, background: c.color }} />
      ))}
    </div>
    <div className="flex flex-wrap gap-x-2.5 gap-y-1">
      {comp.map((c) => (
        <div key={c.label} className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-sm" style={{ background: c.color }} />
          <span className="text-[12px] text-muted-foreground">{c.label} {c.pct}%</span>
        </div>
      ))}
    </div>
  </div>
);

export const YieldCalculator = () => {
  const [selectedFund, setSelectedFund] = useState(fundsData[0].name);
  const [startDate, setStartDate] = useState("2026-03-14");
  const [endDate, setEndDate] = useState("2026-04-14");
  const [startPrice, setStartPrice] = useState("25.00");
  const [endPrice, setEndPrice] = useState("25.80");
  const [showExplanation, setShowExplanation] = useState(false);

  const sp = parseFloat(startPrice) || 0;
  const ep = parseFloat(endPrice) || 0;
  const sd = new Date(startDate);
  const ed = new Date(endDate);
  const days = Math.max(1, Math.round((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24)));
  const periodReturn = sp > 0 ? ((ep - sp) / sp) * 100 : 0;
  const annualizedYield = sp > 0 ? (Math.pow(ep / sp, 365 / days) - 1) * 100 : 0;

  return (
    <div className="mx-4 mt-3 glass-card p-4 space-y-3">
      <div>
        <label className="text-[12px] text-muted-foreground">Fund</label>
        <ModernSelect value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)} className="w-full bg-secondary rounded-xl p-2.5 text-[12px] text-foreground outline-none">
          {fundsData.map((f) => <option key={f.name}>{f.name}</option>)}
        </ModernSelect>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[12px] text-muted-foreground">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[12px] text-foreground outline-none" />
        </div>
        <div>
          <label className="text-[12px] text-muted-foreground">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[12px] text-foreground outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[12px] text-muted-foreground">Start Unit Price</label>
          <input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[12px] text-foreground outline-none" />
        </div>
        <div>
          <label className="text-[12px] text-muted-foreground">End Unit Price</label>
          <input type="number" value={endPrice} onChange={(e) => setEndPrice(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[12px] text-foreground outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[12px] text-muted-foreground">Period ({days}d)</p>
          <p className="text-sm font-bold text-success">{periodReturn.toFixed(2)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[12px] text-muted-foreground">Annualized</p>
          <p className="text-sm font-bold text-success">{annualizedYield.toFixed(2)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[12px] text-muted-foreground">Price Δ</p>
          <p className="text-sm font-bold text-foreground">{(ep - sp).toFixed(2)}</p>
        </div>
      </div>
      <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1.5 text-[12px] text-primary font-medium">
        <Info className="w-3 h-3" />
        {showExplanation ? "Hide" : "How is this calculated?"}
      </button>
      {showExplanation && (
        <div className="bg-secondary/50 rounded-xl p-3 text-[12px] text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Return Calculation</p>
          <p><strong>Period Return</strong> = (End − Start) ÷ Start × 100</p>
          <p>= ({endPrice} − {startPrice}) ÷ {startPrice} × 100 = {periodReturn.toFixed(2)}%</p>
          <p><strong>Annualized Yield</strong> = [(End ÷ Start) ^ (365 ÷ Days)] − 1 × 100</p>
          <p>= ({endPrice} ÷ {startPrice}) ^ (365 ÷ {days}) − 1 = {annualizedYield.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

type QuizAnswers = { goal?: number; horizon?: number; risk?: number; experience?: number };

const quizQuestions: { key: keyof QuizAnswers; question: string; options: { label: string; score: number; hint?: string }[] }[] = [
  {
    key: "goal",
    question: "What's your main investment goal?",
    options: [
      { label: "Preserve my savings", score: 1, hint: "Keep capital safe with steady returns" },
      { label: "Earn regular income", score: 2, hint: "Predictable yield over time" },
      { label: "Grow wealth steadily", score: 3, hint: "Balanced growth and stability" },
      { label: "Maximize long-term growth", score: 4, hint: "Higher returns, accept ups and downs" },
    ],
  },
  {
    key: "horizon",
    question: "How long can you stay invested?",
    options: [
      { label: "Less than 1 year", score: 1 },
      { label: "1 – 3 years", score: 2 },
      { label: "3 – 5 years", score: 3 },
      { label: "5+ years", score: 4 },
    ],
  },
  {
    key: "risk",
    question: "If your investment dropped 15% in a month, you would…",
    options: [
      { label: "Sell everything", score: 1 },
      { label: "Sell some of it", score: 2 },
      { label: "Hold and wait", score: 3 },
      { label: "Buy more at lower prices", score: 4 },
    ],
  },
  {
    key: "experience",
    question: "How experienced are you with investing?",
    options: [
      { label: "Brand new", score: 1 },
      { label: "A little", score: 2 },
      { label: "Comfortable", score: 3 },
      { label: "Very experienced", score: 4 },
    ],
  },
];

export const FundQuizModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const total = quizQuestions.length;
  const isResults = step === total;

  const score = useMemo(() => {
    const vals = Object.values(answers).filter((v): v is number => typeof v === "number");
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [answers]);

  const profile: { label: string; risk: Risk; blurb: string } = useMemo(() => {
    if (score < 1.8) return { label: "Conservative", risk: "Low", blurb: "You prefer safety and predictable returns." };
    if (score < 2.8) return { label: "Cautious", risk: "Low", blurb: "You like stability with a small dose of growth." };
    if (score < 3.4) return { label: "Balanced", risk: "Medium", blurb: "You want growth without big swings." };
    return { label: "Growth-seeking", risk: "High", blurb: "You're comfortable with volatility for higher returns." };
  }, [score]);

  const matches = useMemo(() => {
    const targetRisk = profile.risk;
    return [...fundsData]
      .map((f) => {
        const riskMatch = f.risk === targetRisk ? 100 : (f.risk === "Medium" || targetRisk === "Medium" ? 65 : 35);
        return { fund: f, match: riskMatch };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [profile]);

  const reset = () => { setStep(0); setAnswers({}); };
  const close = () => { reset(); onClose(); };

  if (!open) return null;

  const currentQ = quizQuestions[step];
  const currentAnswer = currentQ ? answers[currentQ.key] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={close}>
      <div
        className="w-full sm:max-w-md bg-card border border-border/40 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--portfolio-purple) 30%, transparent)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.9 0.12 290)" }} />
            </div>
            <p className="text-sm font-semibold text-foreground">Fund matcher</p>
          </div>
          <button onClick={close} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        {!isResults && (
          <div className="px-5">
            <div className="flex gap-1">
              {quizQuestions.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: i <= step ? "var(--portfolio-purple)" : "color-mix(in oklch, var(--muted) 60%, transparent)" }}
                />
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground mt-2">Step {step + 1} of {total}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isResults && currentQ && (
            <div>
              <h2 className="text-[17px] font-bold text-foreground leading-tight">{currentQ.question}</h2>
              <div className="space-y-2 mt-4">
                {currentQ.options.map((opt) => {
                  const selected = currentAnswer === opt.score;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers({ ...answers, [currentQ.key]: opt.score })}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border/40 bg-secondary/40 hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-foreground">{opt.label}</p>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/40"}`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                      {opt.hint && <p className="text-[12px] text-muted-foreground mt-0.5">{opt.hint}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isResults && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl"
                style={{ background: "color-mix(in oklch, var(--portfolio-purple) 16%, oklch(0.24 0.03 280))" }}
              >
                <p className="text-[12px] uppercase tracking-wide text-white/60 font-semibold">Your investor profile</p>
                <p className="text-xl font-bold text-white mt-1">{profile.label}</p>
                <p className="text-[12px] text-white/75 mt-1 leading-snug">{profile.blurb}</p>
                <div className="mt-2"><RiskPill risk={profile.risk} /></div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top matches for you</p>
                <div className="space-y-2">
                  {matches.map(({ fund, match }) => (
                    <div key={fund.name} className="glass-card p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{fund.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <RiskPill risk={fund.risk} />
                            <span className="text-[12px] text-success font-semibold">{fund.yield30d} 30d</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-muted-foreground">Match</p>
                          <p className="text-sm font-bold text-foreground">{match}%</p>
                        </div>
                      </div>
                      <CompositionBar comp={fund.composition} />
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[12px] text-muted-foreground text-center leading-snug">
                This is guidance only, not financial advice. Consider reading each fund's factsheet before investing.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2">
          {!isResults ? (
            <>
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setStep(step + 1)}
                disabled={currentAnswer === undefined}
                className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {step === total - 1 ? "See results" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={reset}
                className="flex-1 h-10 rounded-full bg-secondary text-foreground text-[13px] font-semibold"
              >
                Retake quiz
              </button>
              <button
                onClick={close}
                className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground text-[13px] font-semibold"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

