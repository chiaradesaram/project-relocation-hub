import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Paperclip,
  UserCog,
  TrendingUp,
  Wallet,
  Wrench,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

type CategoryId =
  | "account-opening"
  | "trading"
  | "deposits-withdrawals"
  | "technical"
  | "complaints"
  | "other";

interface Category {
  id: CategoryId;
  label: string;
  icon: typeof UserCog;
  team: string;
  subs: { id: string; label: string; suggestions?: { q: string; a: string }[] }[];
}

const CATEGORIES: Category[] = [
  {
    id: "account-opening",
    label: "Account Opening",
    icon: UserCog,
    team: "Onboarding Team",
    subs: [
      {
        id: "kyc-pending",
        label: "KYC pending",
        suggestions: [
          { q: "How long does KYC take?", a: "Most KYCs complete within 1 business day after document upload." },
          { q: "What documents are required?", a: "NIC/Passport, proof of address, and a recent bank statement." },
        ],
      },
      { id: "doc-rejected", label: "Document rejected" },
      { id: "status", label: "Status update" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "trading",
    label: "Trading Issues",
    icon: TrendingUp,
    team: "Trading Desk",
    subs: [
      {
        id: "order-failed",
        label: "Order failed",
        suggestions: [
          { q: "Why did my order fail?", a: "Common reasons: insufficient balance, market closed, or limit price out of range." },
          { q: "Will I be charged for a failed order?", a: "No. Failed orders are not charged and any reserved funds are released within minutes." },
        ],
      },
      { id: "wrong-price", label: "Wrong price or units" },
      { id: "cancellation", label: "Cancellation request" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "deposits-withdrawals",
    label: "Deposits & Withdrawals",
    icon: Wallet,
    team: "Payments Team",
    subs: [
      {
        id: "deposit-not-reflected",
        label: "Deposit not reflected",
        suggestions: [
          { q: "How long do bank transfers take?", a: "1–2 business days after we receive your proof of payment and funds clear." },
          { q: "What proof is accepted?", a: "A clear screenshot or PDF of the receipt showing reference, amount and date." },
        ],
      },
      {
        id: "withdrawal-delay",
        label: "Withdrawal delay",
        suggestions: [
          { q: "How long do redemptions take?", a: "Instant redemptions credit within minutes; normal redemptions take 1–3 business days." },
        ],
      },
      { id: "bank-change", label: "Bank details change" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "technical",
    label: "Technical Issues",
    icon: Wrench,
    team: "Tech Support",
    subs: [
      { id: "app-crashing", label: "App crashing" },
      { id: "login", label: "Login problem" },
      { id: "notifications", label: "Notification issue" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: AlertTriangle,
    team: "Compliance Team",
    subs: [
      { id: "service", label: "Service complaint" },
      { id: "staff", label: "Staff complaint" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "other",
    label: "Other",
    icon: HelpCircle,
    team: "Support Team",
    subs: [{ id: "other", label: "Other" }],
  },
];

const formSchema = z.object({
  subject: z.string().trim().min(3, "Add a short subject").max(120, "Keep subject under 120 characters"),
  description: z.string().trim().min(10, "Please describe the issue (10+ chars)").max(2000, "Keep description under 2000 characters"),
  amount: z.string().trim().max(20).optional(),
  date: z.string().trim().max(20).optional(),
  accountNumber: z.string().trim().max(40).optional(),
});

export const Route = createFileRoute("/help/contact")({
  head: () => ({
    meta: [
      { title: "Contact Support — CAL Invest" },
      { name: "description", content: "Get in touch with the CAL support team." },
    ],
  }),
  component: ContactFlow,
});

type Step = 1 | 2 | 3 | 4 | 5;

function ContactFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("CAL-00012345");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refId, setRefId] = useState("");

  const category = useMemo(() => CATEGORIES.find((c) => c.id === categoryId) ?? null, [categoryId]);
  const sub = useMemo(() => category?.subs.find((s) => s.id === subId) ?? null, [category, subId]);

  const needsAmount = categoryId === "deposits-withdrawals" && (subId === "deposit-not-reflected" || subId === "withdrawal-delay");
  const needsDate = needsAmount;
  const needsAccount = categoryId === "deposits-withdrawals" || categoryId === "trading";

  useEffect(() => {
    const scrollEl = document.querySelector("[data-mobile-layout-scroll]") as HTMLElement | null;
    scrollEl?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  function goBack() {
    if (step === 1) {
      window.history.back();
      return;
    }
    setStep((step - 1) as Step);
  }

  function selectCategory(id: CategoryId) {
    setCategoryId(id);
    setSubId(null);
    setStep(2);
  }

  function selectSub(id: string) {
    setSubId(id);
    const found = category?.subs.find((s) => s.id === id);
    setStep(found?.suggestions?.length ? 3 : 4);
  }

  function submitForm() {
    const result = formSchema.safeParse({
      subject,
      description,
      amount: needsAmount ? amount : undefined,
      date: needsDate ? date : undefined,
      accountNumber: needsAccount ? accountNumber : undefined,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setRefId(`REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`);
    setStep(5);
  }

  return (
    <MobileLayout hideNav>
      <PageHeader title="Contact us" showBack hideHelp />

      <div className="mx-4 mt-1 mb-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= step ? "bg-primary" : "bg-muted/40"}`} />
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">Step {step} of 5</p>
      </div>

      {step > 1 && step < 5 && (
        <button type="button" onClick={goBack} className="mx-4 mb-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
      )}

      {step === 1 && (
        <div className="mx-4 pb-6">
          <h2 className="text-sm font-semibold text-foreground">What do you need help with?</h2>
          <p className="mb-3 text-[11px] text-muted-foreground">Pick the closest category.</p>
          <div className="glass-card overflow-hidden divide-y divide-border/40">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => selectCategory(id)} className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-[12px] font-medium text-foreground">{label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && category && (
        <div className="mx-4 pb-6">
          <h2 className="text-sm font-semibold text-foreground">{category.label}</h2>
          <p className="mb-3 text-[11px] text-muted-foreground">Choose what's closest.</p>
          <div className="glass-card overflow-hidden divide-y divide-border/40">
            {category.subs.map((item) => (
              <button key={item.id} type="button" onClick={() => selectSub(item.id)} className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30">
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && sub?.suggestions && (
        <div className="mx-4 pb-6">
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">This might solve it instantly</h2>
          </div>
          <p className="mb-3 text-[11px] text-muted-foreground">Quick answers for "{sub.label}".</p>
          <div className="glass-card overflow-hidden divide-y divide-border/40">
            {sub.suggestions.map((item, i) => (
              <div key={i} className="px-3 py-3">
                <p className="text-[12px] font-medium text-foreground">{item.q}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCategoryId(null);
                setSubId(null);
                navigate({ to: "/help" });
              }}
              className="rounded-xl border border-border/40 bg-card/60 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/30"
            >
              That solved it
            </button>
            <button type="button" onClick={() => setStep(4)} className="rounded-xl bg-primary py-2.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Still need help
            </button>
          </div>
        </div>
      )}

      {step === 4 && category && sub && (
        <div className="mx-4 pb-6">
          <h2 className="text-sm font-semibold text-foreground">Tell us more</h2>
          <p className="mb-3 text-[11px] text-muted-foreground">{category.label} · {sub.label}</p>

          <div className="space-y-3">
            <Field label="Subject" error={errors.subject}>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="Short summary" className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none" />
            </Field>

            {needsAccount && (
              <Field label="Account number" error={errors.accountNumber}>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} maxLength={40} className="w-full bg-transparent text-[12px] text-foreground outline-none" />
              </Field>
            )}

            {needsDate && (
              <Field label="Date of request" error={errors.date}>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-[12px] text-foreground outline-none" />
              </Field>
            )}

            {needsAmount && (
              <Field label="Amount (LKR)" error={errors.amount}>
                <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none" />
              </Field>
            )}

            <Field label="Description" error={errors.description}>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={4} placeholder="What happened and what would you like us to do?" className="w-full resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none" />
            </Field>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/50 bg-card/40 px-3 py-2.5 transition-colors hover:bg-muted/20">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 text-[11px] text-muted-foreground">{fileName ?? "Attach a file (optional)"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    setErrors((prev) => ({ ...prev, file: "Max file size 5 MB" }));
                    return;
                  }
                  setErrors((prev) => {
                    const { file: _file, ...rest } = prev;
                    return rest;
                  });
                  setFileName(file.name);
                }}
              />
            </label>
            {errors.file && <p className="text-[10px] text-destructive">{errors.file}</p>}

            <button type="button" onClick={submitForm} className="w-full rounded-xl bg-primary py-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Submit request
            </button>
          </div>
        </div>
      )}

      {step === 5 && category && (
        <div className="mx-4 pb-6">
          <div className="glass-card p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-semibold text-foreground">Request submitted</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              We've routed your request to our <span className="font-medium text-foreground">{category.team}</span>.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Expected response: within 2 business days.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted/30 px-2.5 py-1">
              <span className="text-[10px] text-muted-foreground">Reference</span>
              <span className="text-[11px] font-mono font-medium text-foreground">{refId}</span>
            </div>
          </div>

          <div className="mb-6 mt-4 grid grid-cols-2 gap-2">
            <Link to="/help" className="rounded-xl border border-border/40 bg-card/60 py-2.5 text-center text-[12px] font-medium text-foreground transition-colors hover:bg-muted/30">
              Back to Help
            </Link>
            <Link to="/" className="rounded-xl bg-primary py-2.5 text-center text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Go home
            </Link>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">{label.toUpperCase()}</p>
      <div className="rounded-xl border border-border/40 bg-card/60 px-3 py-2.5 backdrop-blur-md">{children}</div>
      {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
