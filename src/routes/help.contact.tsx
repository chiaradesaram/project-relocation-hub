import { ModernSelect } from "@/components/ModernSelect";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  CheckCircle2,
  Lightbulb,
  Paperclip,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  UserCog,
  FileText,
  Stamp,
  ClipboardList,
  Compass,
} from "lucide-react";

type CategoryId =
  | "account-opening"
  | "account-profile"
  | "trading"
  | "investments-withdrawals"
  | "statements-documents"
  | "technical"
  | "feedback"
  | "other";

type SpecialForm = "nic" | "deactivate";
type IconCmp = typeof CreditCard;

interface QuickLink {
  label: string;
  to: string;
  description: string;
  icon: IconCmp;
}

interface Sub {
  id: string;
  label: string;
  suggestions?: { q: string; a: string }[];
  quickLinks?: QuickLink[];
  specialForm?: SpecialForm;
  /** Hide the "Continue to ticket" path; sub is resolved via quick links/FAQ alone. */
  resolveOnly?: boolean;
}

interface Category {
  id: CategoryId;
  label: string;
  team: string;
  /** When true, ask the user which product (UT / Equity / Treasury) the issue relates to. */
  requiresProduct?: boolean;
  subs: Sub[];
}

const CATEGORIES: Category[] = [
  {
    id: "account-opening",
    label: "Account Opening",
    team: "Onboarding Team",
    subs: [
      {
        id: "track-application",
        label: "Track my application",
        suggestions: [
          {
            q: "How long does account opening take?",
            a: "Most applications are reviewed within 1–2 business days. During high volumes and around public holidays, it can take a few extra days.",
          },
          {
            q: "When should I raise a ticket?",
            a: "If your application has been pending for more than 4 working days, raise a ticket and we'll chase it up for you.",
          },
        ],
        quickLinks: [
          {
            label: "Open application tracker",
            to: "/get-started",
            description: "See your current stage and what's pending",
            icon: Compass,
          },
        ],
      },
      { id: "doc-rejected", label: "Document rejected" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "account-profile",
    label: "Account & Profile",
    team: "Account Services",
    subs: [
      {
        id: "update-bank",
        label: "Update bank account",
        suggestions: [
          {
            q: "Can I add or remove a bank account myself?",
            a: "Yes — you can add or remove linked bank accounts directly from the Bank Accounts page. Changes go live after a quick verification.",
          },
        ],
        quickLinks: [
          {
            label: "Manage bank accounts",
            to: "/bank-accounts",
            description: "Add, remove or update your linked bank accounts",
            icon: CreditCard,
          },
        ],
      },
      {
        id: "change-contact",
        label: "Change phone or email",
        suggestions: [
          {
            q: "How do I change my phone or email?",
            a: "Update your contact details from your Profile. We'll send an OTP to confirm the change.",
          },
        ],
        quickLinks: [
          {
            label: "Open profile",
            to: "/profile",
            description: "Edit your phone number, email and personal details",
            icon: UserCog,
          },
        ],
      },
      {
        id: "update-nic",
        label: "Update NIC",
        specialForm: "nic",
        suggestions: [
          {
            q: "What do I need to update my NIC?",
            a: "Front and back images of your new NIC, the new NIC number, issue date, and the name as printed on the card.",
          },
        ],
      },
      {
        id: "deactivate",
        label: "Deactivate account",
        specialForm: "deactivate",
      },
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
    id: "investments-withdrawals",
    label: "Investments & Withdrawals",
    team: "Payments Team",
    requiresProduct: true,
    subs: [
      {
        id: "investment-not-reflected",
        label: "Investment not reflected",
        suggestions: [
          { q: "How long do bank transfers take?", a: "1–2 business days after we receive your proof of payment and funds clear." },
          { q: "What proof is accepted?", a: "A clear screenshot or PDF of the receipt showing reference, amount and date." },
        ],
      },
      {
        id: "withdrawal-delay",
        label: "Withdrawal / redemption delay",
        suggestions: [
          { q: "How long do redemptions take?", a: "Instant redemptions credit within minutes; normal redemptions take 1–3 business days." },
          { q: "Is there a daily withdrawal limit?", a: "Instant redemptions are capped at LKR 100,000 per transaction, up to 5 times a day." },
        ],
      },
      {
        id: "redemption-plan",
        label: "Redemption plan issue",
        suggestions: [
          { q: "Can I edit a scheduled redemption?", a: "Yes — open the plan from your portfolio and tap Edit. Changes apply from the next cycle." },
        ],
      },
      {
        id: "creation-plan",
        label: "Creation plan issue",
        suggestions: [
          { q: "Why didn't my creation plan execute?", a: "Most often it's due to insufficient balance on the cycle date. The plan retries automatically the next business day." },
        ],
      },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "statements-documents",
    label: "Statements & Documents",
    team: "Account Services",
    subs: [
      {
        id: "account-statement",
        label: "Account statement",
        resolveOnly: true,
        quickLinks: [
          {
            label: "Request account statement",
            to: "/requests",
            description: "Get a detailed statement for any period",
            icon: FileText,
          },
        ],
      },
      {
        id: "balance-visa",
        label: "Balance confirmation (Visa)",
        resolveOnly: true,
        quickLinks: [
          {
            label: "Request balance confirmation",
            to: "/requests",
            description: "For visa or travel documentation",
            icon: ClipboardList,
          },
        ],
      },
      {
        id: "balance-ird",
        label: "Balance confirmation (IRD / Tax)",
        resolveOnly: true,
        quickLinks: [
          {
            label: "Request balance confirmation",
            to: "/requests",
            description: "Official letter for tax filing",
            icon: Stamp,
          },
        ],
      },
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
    id: "feedback",
    label: "Feedback & Suggestions",
    team: "Product Team",
    subs: [
      { id: "app-feedback", label: "App feedback" },
      { id: "feature-suggestion", label: "Feature suggestion" },
      { id: "service-feedback", label: "Service feedback" },
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

const PRODUCTS = [
  { id: "unit-trusts", label: "Unit Trusts" },
  { id: "equities", label: "Equities" },
  { id: "treasuries", label: "Treasuries" },
] as const;

const baseSchema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  subId: z.string().min(1, "Pick a sub-category"),
});

const ticketSchema = baseSchema.extend({
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue (10+ chars)")
    .max(2000, "Keep description under 2000 characters"),
  product: z.string().trim().max(40).optional(),
});

const nicSchema = baseSchema.extend({
  nicNumber: z
    .string()
    .trim()
    .min(10, "Enter your new NIC number")
    .max(20, "NIC number too long")
    .regex(/^[0-9A-Za-z]+$/, "Letters and numbers only"),
  nicName: z.string().trim().min(2, "Enter the name on NIC").max(120),
  issueDate: z.string().trim().min(1, "Enter the issue date"),
  description: z.string().trim().max(2000).optional(),
});

const deactivateSchema = baseSchema.extend({
  confirm: z.literal("DEACTIVATE", {
    errorMap: () => ({ message: 'Type "DEACTIVATE" to confirm' }),
  }),
  reason: z.string().trim().min(10, "Tell us why so we can improve").max(2000),
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
  const [productId, setProductId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [description, setDescription] = useState("");
  const [accountNumber, setAccountNumber] = useState("CAL-00012345");

  // NIC form state
  const [nicNumber, setNicNumber] = useState("");
  const [nicName, setNicName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [nicFrontName, setNicFrontName] = useState<string | null>(null);
  const [nicBackName, setNicBackName] = useState<string | null>(null);

  // Deactivate state
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");

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
  const quickLinks = sub?.quickLinks ?? [];
  const hasSuggestions = suggestions.length > 0;
  const hasQuickLinks = quickLinks.length > 0;
  const specialForm = sub?.specialForm;
  const resolveOnly = !!sub?.resolveOnly;
  const needsAccount = categoryId === "trading" || categoryId === "investments-withdrawals";
  const needsProduct = !!category?.requiresProduct;

  useEffect(() => {
    setSubId("");
    setProductId("");
    setShowForm(false);
  }, [categoryId]);

  useEffect(() => {
    setShowForm(false);
  }, [subId]);

  function submitForm() {
    let result;
    if (specialForm === "nic") {
      result = nicSchema.safeParse({
        categoryId,
        subId,
        nicNumber,
        nicName,
        issueDate,
        description,
      });
    } else if (specialForm === "deactivate") {
      result = deactivateSchema.safeParse({
        categoryId,
        subId,
        confirm: deactivateConfirm,
        reason: deactivateReason,
      });
    } else {
      result = ticketSchema.safeParse({
        categoryId,
        subId,
        description,
        product: needsProduct ? productId : undefined,
      });
      if (result.success && needsProduct && !productId) {
        setErrors({ product: "Pick a product" });
        return;
      }
    }

    if (specialForm === "nic" && (!nicFrontName || !nicBackName)) {
      setErrors((p) => ({
        ...p,
        nicFront: nicFrontName ? "" : "Upload front of NIC",
        nicBack: nicBackName ? "" : "Upload back of NIC",
      }));
      return;
    }

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

  const isDeactivate = specialForm === "deactivate";

  return (
    <MobileLayout hideNav>
      <PageHeader title="Contact us" showBack hideHelp />

      <div className="mx-4 mt-1 pb-6">
        <h2 className="text-sm font-semibold text-foreground">Tell us what's wrong</h2>
        <p className="mb-4 text-[12px] text-muted-foreground">
          Pick the closest match — we'll route your request to the right team.
        </p>

        <div className="space-y-3">
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

          {category && (
            <Field label="Sub-category" error={errors.subId}>
              <SelectInput value={subId} onChange={setSubId} placeholder="Select a sub-category">
                {category.subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}

          {sub && needsProduct && (
            <Field label="Which product?" error={errors.product}>
              <SelectInput value={productId} onChange={setProductId} placeholder="Select a product">
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}

          {/* Quick links */}
          {sub && hasQuickLinks && (!showForm || resolveOnly) && (
            <div className="space-y-2">
              {quickLinks.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.to + q.label}
                    to={q.to}
                    className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3 transition-colors hover:bg-primary/15"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{q.label}</p>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        {q.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Smart suggestions */}
          {sub && hasSuggestions && (!showForm || resolveOnly) && (
            <div className="rounded-xl border border-border/40 bg-card/60 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                <p className="text-[13px] font-semibold text-foreground">
                  This might solve it instantly
                </p>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg bg-muted/20 p-2.5">
                    <p className="text-[13px] font-medium text-foreground">{s.q}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      {s.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue to ticket */}
          {sub && !resolveOnly && !showForm && (hasSuggestions || hasQuickLinks) && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl bg-primary py-2.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Still need help — continue to ticket
            </button>
          )}

          {/* Form */}
          {sub && !resolveOnly && (showForm || (!hasSuggestions && !hasQuickLinks)) && (
            <>
              {isDeactivate ? (
                <DeactivateForm
                  confirm={deactivateConfirm}
                  setConfirm={setDeactivateConfirm}
                  reason={deactivateReason}
                  setReason={setDeactivateReason}
                  errors={errors}
                  onSubmit={submitForm}
                />
              ) : specialForm === "nic" ? (
                <>
                  <Field label="Name on NIC" error={errors.nicName}>
                    <input
                      value={nicName}
                      onChange={(e) => setNicName(e.target.value)}
                      maxLength={120}
                      placeholder="As printed on the card"
                      className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </Field>
                  <Field label="New NIC number" error={errors.nicNumber}>
                    <input
                      value={nicNumber}
                      onChange={(e) => setNicNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                      maxLength={20}
                      placeholder="e.g. 200012345678"
                      className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </Field>
                  <Field label="Issue date" error={errors.issueDate}>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-transparent text-[12px] text-foreground outline-none"
                    />
                  </Field>

                  <NicUpload
                    label="NIC front image"
                    fileName={nicFrontName}
                    error={errors.nicFront}
                    onFile={(name) => {
                      setNicFrontName(name);
                      setErrors((p) => ({ ...p, nicFront: "" }));
                    }}
                  />
                  <NicUpload
                    label="NIC back image"
                    fileName={nicBackName}
                    error={errors.nicBack}
                    onFile={(name) => {
                      setNicBackName(name);
                      setErrors((p) => ({ ...p, nicBack: "" }));
                    }}
                  />

                  <Field label="Notes (optional)" error={errors.description}>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder="Anything we should know?"
                      className="w-full resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={submitForm}
                    className="w-full rounded-xl bg-primary py-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Submit NIC update
                  </button>
                </>
              ) : (
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
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

function DeactivateForm({
  confirm,
  setConfirm,
  reason,
  setReason,
  errors,
  onSubmit,
}: {
  confirm: string;
  setConfirm: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-[13px] font-semibold text-foreground">
            This is permanent — please read first
          </p>
        </div>
        <ul className="ml-4 list-disc space-y-1 text-[11px] leading-relaxed text-muted-foreground">
          <li>You'll lose access to your portfolio, statements and order history.</li>
          <li>All open holdings must be redeemed and funds withdrawn before we can deactivate.</li>
          <li>Recurring creation and redemption plans will be cancelled.</li>
          <li>Re-opening an account later requires a fresh KYC.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border/40 bg-card/60 p-3">
        <p className="text-[12px] font-medium text-foreground">Before you go…</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          If something specific is bothering you, we'd love a chance to fix it. Many things —
          notification noise, KYC issues, withdrawal speed — can be resolved in minutes.
        </p>
        <Link
          to="/settings/notifications"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          Manage notifications instead
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <Field label="Why are you leaving?" error={errors.reason}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Help us improve — what made you decide to leave?"
          className="w-full resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
        />
      </Field>

      <Field label='Type "DEACTIVATE" to confirm' error={errors.confirm}>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.toUpperCase())}
          maxLength={20}
          placeholder="DEACTIVATE"
          className="w-full bg-transparent text-[12px] font-mono tracking-wider text-foreground placeholder:text-muted-foreground outline-none"
        />
      </Field>

      <button
        type="button"
        onClick={onSubmit}
        disabled={confirm !== "DEACTIVATE"}
        className="w-full rounded-xl bg-destructive py-3 text-[13px] font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit deactivation request
      </button>
    </>
  );
}

function NicUpload({
  label,
  fileName,
  error,
  onFile,
}: {
  label: string;
  fileName: string | null;
  error?: string;
  onFile: (name: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
        {label.toUpperCase()}
      </p>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/50 bg-card/40 px-3 py-2.5 transition-colors hover:bg-muted/20">
        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="flex-1 text-[12px] text-muted-foreground">
          {fileName ?? "Tap to upload (JPG / PNG, max 5 MB)"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) return;
            onFile(file.name);
          }}
        />
      </label>
      {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
    </div>
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
