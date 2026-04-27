import { ModernSelect } from "@/components/ModernSelect";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  ChevronDown,
  CheckCircle2,
  Lightbulb,
  Paperclip,
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
  team: string;
  subs: { id: string; label: string; suggestions?: { q: string; a: string }[] }[];
}

const CATEGORIES: Category[] = [
  {
    id: "account-opening",
    label: "Account Opening",
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
          { q: "Is there a daily withdrawal limit?", a: "Instant redemptions are capped at LKR 100,000 per transaction, up to 5 times a day." },
        ],
      },
      { id: "bank-change", label: "Bank details change" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "technical",
    label: "Technical Issues",
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
    team: "Support Team",
    subs: [{ id: "other", label: "Other" }],
  },
];

const formSchema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  subId: z.string().min(1, "Pick a sub-category"),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue (10+ chars)")
    .max(2000, "Keep description under 2000 characters"),
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
  component: ContactForm,
});

function ContactForm() {
  const [categoryId, setCategoryId] = useState<CategoryId | "">("");
  const [subId, setSubId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("CAL-00012345");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId) ?? null,
    [categoryId],
  );
  const sub = useMemo(
    () => category?.subs.find((s) => s.id === subId) ?? null,
    [category, subId],
  );

  const suggestions = sub?.suggestions ?? [];
  const hasSuggestions = suggestions.length > 0;

  const needsAmount =
    categoryId === "deposits-withdrawals" &&
    (subId === "deposit-not-reflected" || subId === "withdrawal-delay");
  const needsDate = needsAmount;
  const needsAccount = categoryId === "deposits-withdrawals" || categoryId === "trading";

  // Reset sub when category changes
  useEffect(() => {
    setSubId("");
    setShowForm(false);
  }, [categoryId]);

  // Reset showForm when sub changes
  useEffect(() => {
    setShowForm(false);
  }, [subId]);

  function submitForm() {
    const result = formSchema.safeParse({
      categoryId,
      subId,
      description,
      amount: needsAmount ? amount : undefined,
      date: needsDate ? date : undefined,
      accountNumber: needsAccount ? accountNumber : undefined,
    });

    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0]?.toString() ?? "form";
        if (!next[k]) next[k] = i.message;
      });
      setErrors(next);
      return;
    }

    setErrors({});
    setRefId(
      `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Math.floor(
        Math.random() * 90 + 10,
      )}`,
    );
    setSubmitted(true);
  }

  // Confirmation screen
  if (submitted && category) {
    return (
      <MobileLayout hideNav>
        <PageHeader title="Request submitted" hideHelp />
        <div className="mx-4 mt-2 pb-6">
          <div className="glass-card p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-semibold text-foreground">We've got your request</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              We've routed it to our{" "}
              <span className="font-medium text-foreground">{category.team}</span>.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Expected response: within 24 hours.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted/30 px-2.5 py-1">
              <span className="text-[12px] text-muted-foreground">Reference</span>
              <span className="text-[11px] font-mono font-medium text-foreground">{refId}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/help"
              className="rounded-xl border border-border/40 bg-card/60 py-2.5 text-center text-[12px] font-medium text-foreground transition-colors hover:bg-muted/30"
            >
              Back to Help
            </Link>
            <Link
              to="/"
              className="rounded-xl bg-primary py-2.5 text-center text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go home
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <PageHeader title="Contact us" showBack hideHelp />

      <div className="mx-4 mt-1 pb-6">
        <h2 className="text-sm font-semibold text-foreground">Tell us what's wrong</h2>
        <p className="mb-4 text-[12px] text-muted-foreground">
          Pick the closest match — we'll route your request to the right team.
        </p>

        <div className="space-y-3">
          {/* Category */}
          <Field label="Category" error={errors.categoryId}>
            <SelectInput
              value={categoryId}
              onChange={(v) => setCategoryId(v as CategoryId | "")}
              placeholder="Select a category"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          {/* Sub-category — only after category */}
          {category && (
            <Field label="Sub-category" error={errors.subId}>
              <SelectInput
                value={subId}
                onChange={setSubId}
                placeholder="Select a sub-category"
              >
                {category.subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}

          {/* Smart suggestions — before form */}
          {sub && hasSuggestions && !showForm && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                <p className="text-[13px] font-semibold text-foreground">
                  This might solve it instantly
                </p>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg bg-card/60 p-2.5">
                    <p className="text-[13px] font-medium text-foreground">{s.q}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      {s.a}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-3 w-full rounded-lg bg-primary py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Still need help — continue
              </button>
            </div>
          )}

          {/* Form fields — shown when sub selected with no suggestions, or after "Still need help" */}
          {sub && (showForm || !hasSuggestions) && (
            <>
              {needsAccount && (
                <Field label="Account number" error={errors.accountNumber}>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={40}
                    className="w-full bg-transparent text-[12px] text-foreground outline-none"
                  />
                </Field>
              )}

              {needsDate && (
                <Field label="Date of request" error={errors.date}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-[12px] text-foreground outline-none"
                  />
                </Field>
              )}

              {needsAmount && (
                <Field label="Amount (LKR)" error={errors.amount}>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="0.00"
                    className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </Field>
              )}

              <Field label="Description" error={errors.description}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="What happened and what would you like us to do?"
                  className="w-full resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/50 bg-card/40 px-3 py-2.5 transition-colors hover:bg-muted/20">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-muted-foreground">
                  {fileName ?? "Attach documents (optional)"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      setErrors((p) => ({ ...p, file: "Max file size 5 MB" }));
                      return;
                    }
                    setErrors((p) => {
                      const { file: _f, ...rest } = p;
                      return rest;
                    });
                    setFileName(file.name);
                  }}
                />
              </label>
              {errors.file && <p className="text-[10px] text-destructive">{errors.file}</p>}

              <button
                type="button"
                onClick={submitForm}
                className="w-full rounded-xl bg-primary py-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Submit request
              </button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
        {label.toUpperCase()}
      </p>
      <div className="rounded-xl border border-border/40 bg-card/60 px-3 py-2.5 backdrop-blur-md">
        {children}
      </div>
      {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center">
      <ModernSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border-0 bg-transparent p-0 text-[12px] shadow-none ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {children}
      </ModernSelect>
    </div>
  );
}
