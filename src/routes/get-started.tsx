import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Sparkles, Shield, TrendingUp, Zap, ChevronRight, CheckCircle2, PiggyBank, BookOpen, Clock, Target } from "lucide-react";

export const Route = createFileRoute("/get-started")({
  component: GetStarted,
});

type Step = "intro" | "learn" | "quiz" | "result";
type Risk = "low" | "medium" | "high";
type Horizon = "short" | "medium" | "long";

const recommendations: Record<string, { fund: string; tagline: string; why: string; color: string; icon: typeof Shield }> = {
  low: {
    fund: "Fixed Income Fund",
    tagline: "Stable, predictable returns",
    why: "Invests in government securities and high-grade corporate debt. Ideal if you want low volatility and steady growth.",
    color: "oklch(0.65 0.18 155)",
    icon: Shield,
  },
  medium: {
    fund: "Islamic Fund",
    tagline: "Balanced & Sharia-compliant",
    why: "A balanced mix of ethical equities and fixed-income instruments. Good for moderate growth with measured risk.",
    color: "oklch(0.6 0.2 260)",
    icon: PiggyBank,
  },
  high: {
    fund: "High Yield Fund",
    tagline: "Higher growth potential",
    why: "Targets higher-return opportunities across equities and corporate debt. Best if you can tolerate short-term swings.",
    color: "oklch(0.55 0.25 290)",
    icon: TrendingUp,
  },
};

function GetStarted() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [risk, setRisk] = useState<Risk | null>(null);
  const [horizon, setHorizon] = useState<Horizon | null>(null);

  const recommendation = (() => {
    if (!risk || !horizon) return recommendations.medium;
    if (risk === "low" || horizon === "short") return recommendations.low;
    if (risk === "high" && horizon === "long") return recommendations.high;
    return recommendations.medium;
  })();

  return (
    <MobileLayout>
      <PageHeader title="Get Started" showBack />

      {step === "intro" && (
        <div className="px-4 pt-2 pb-6 space-y-3">
          <div className="rounded-2xl border border-primary/30 bg-primary/15 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/30">
                <Sparkles className="h-3.5 w-3.5 text-foreground" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Welcome</p>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-foreground leading-snug">
              Not sure where to start?
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              We'll walk you through the basics of Unit Trusts and recommend a fund that fits how you want to invest.
            </p>
          </div>

          <button
            onClick={() => setStep("learn")}
            className="w-full rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4 flex items-center gap-3 transition hover:bg-muted/15 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <BookOpen className="h-4 w-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">Learn about Unit Trusts</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">A 60-second explainer</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </button>

          <button
            onClick={() => setStep("quiz")}
            className="w-full rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4 flex items-center gap-3 transition hover:bg-muted/15 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Target className="h-4 w-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">Find a fund for me</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Answer 2 quick questions</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </button>
        </div>
      )}

      {step === "learn" && (
        <div className="px-4 pt-2 pb-6 space-y-3">
          <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What is a Unit Trust?</p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground">
              A Unit Trust pools money from many investors and a professional manager invests it across a mix of assets — like government bonds, corporate debt, and equities.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              You get diversification and expert management without picking individual stocks or bonds yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { icon: Zap, title: "Start small", body: "Invest from as little as LKR 1,000 — no large minimums." },
              { icon: Shield, title: "Diversified", body: "Your money is spread across many securities to reduce risk." },
              { icon: Clock, title: "Withdraw anytime", body: "Most funds let you redeem within 1–3 working days." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("quiz")}
            className="w-full mt-2 rounded-2xl bg-primary/90 hover:bg-primary text-primary-foreground py-3 text-[13px] font-semibold transition"
          >
            Find a fund for me
          </button>
        </div>
      )}

      {step === "quiz" && (
        <div className="px-4 pt-2 pb-6 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Question 1 of 2</p>
            <p className="text-[14px] font-medium text-foreground mb-3">How would you feel if your investment dropped 10% in a month?</p>
            <div className="space-y-2">
              {([
                { key: "low", label: "I'd be very uncomfortable", sub: "Prefer stability over growth" },
                { key: "medium", label: "I could handle it", sub: "Balanced approach" },
                { key: "high", label: "Doesn't bother me", sub: "I'm in it for long-term growth" },
              ] as { key: Risk; label: string; sub: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRisk(opt.key)}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    risk === opt.key
                      ? "border-primary/60 bg-primary/15"
                      : "border-border/30 bg-card/40 hover:bg-muted/15"
                  }`}
                >
                  <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Question 2 of 2</p>
            <p className="text-[14px] font-medium text-foreground mb-3">When might you need this money?</p>
            <div className="space-y-2">
              {([
                { key: "short", label: "Within 1 year", sub: "Short-term goal" },
                { key: "medium", label: "1–5 years", sub: "Mid-term goal" },
                { key: "long", label: "5+ years", sub: "Long-term wealth" },
              ] as { key: Horizon; label: string; sub: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setHorizon(opt.key)}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    horizon === opt.key
                      ? "border-primary/60 bg-primary/15"
                      : "border-border/30 bg-card/40 hover:bg-muted/15"
                  }`}
                >
                  <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("result")}
            disabled={!risk || !horizon}
            className="w-full rounded-2xl bg-primary/90 hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground py-3 text-[13px] font-semibold transition"
          >
            See my recommendation
          </button>
        </div>
      )}

      {step === "result" && (
        <div className="px-4 pt-2 pb-6 space-y-3">
          <div
            className="rounded-2xl border p-5 backdrop-blur-md"
            style={{
              borderColor: `${recommendation.color}55`,
              backgroundColor: `${recommendation.color}1f`,
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended for you</p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${recommendation.color}33` }}
              >
                <recommendation.icon className="h-5 w-5" style={{ color: recommendation.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-foreground leading-tight">{recommendation.fund}</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">{recommendation.tagline}</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-foreground/90">{recommendation.why}</p>
          </div>

          <button
            onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })}
            className="w-full rounded-2xl bg-primary/90 hover:bg-primary text-primary-foreground py-3 text-[13px] font-semibold transition"
          >
            Start investing
          </button>

          <button
            onClick={() => {
              setRisk(null);
              setHorizon(null);
              setStep("quiz");
            }}
            className="w-full rounded-2xl border border-border/30 bg-card/40 hover:bg-muted/15 text-foreground py-3 text-[12px] font-medium transition"
          >
            Retake quiz
          </button>

          <Link
            to="/learn"
            className="block w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition pt-2"
          >
            Browse all funds →
          </Link>
        </div>
      )}
    </MobileLayout>
  );
}
