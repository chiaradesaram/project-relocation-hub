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
  CreditCard,
  UserCog,
  FileText,
  Stamp,
  ClipboardList,
  Compass,
  BookOpen,
  TrendingUp,
  Landmark,
  PiggyBank,
  AlertTriangle,
  Clock,
} from "lucide-react";

type CategoryId =
  | "account-opening"
  | "account-profile"
  | "product-info"
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
  /** Skip the product picker even if the parent category requires it. */
  skipProduct?: boolean;
  /** Restrict this sub to a specific product. Hidden when another product is picked. */
  onlyProduct?: string;
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
        id: "open-account",
        label: "How do I open an account?",
        resolveOnly: true,
        suggestions: [
          {
            q: "Where do I register?",
            a: "You can register online at portal.cal.lk using your NIC, mobile number, and email address. You can also sign up through the CAL Online mobile app (available on the Apple App Store and Google Play). If you prefer to apply in person, you can book an appointment through the provided link.",
          },
          {
            q: "What documents do I need?",
            a: "Your NIC, proof of your bank account (e.g. a recent bank statement), and proof of address (only if your correspondence address differs from your NIC address).",
          },
          {
            q: "How long does account opening take?",
            a: "Most applications are reviewed within 4–5 business days. During high volumes and around public holidays, it can take a few extra days.",
          },
        ],
        quickLinks: [
          {
            label: "Start application",
            to: "/get-started",
            description: "Begin your account opening online",
            icon: Compass,
          },
        ],
      },
      {
        id: "track-application",
        label: "Track my application",
        suggestions: [
          {
            q: "How long does account opening take?",
            a: "Most applications are reviewed within 4–5 business days. During high volumes and around public holidays, it can take a few extra days.",
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
      {
        id: "form-difficulty",
        label: "Difficulty filling up the form",
        resolveOnly: true,
      },
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
        resolveOnly: true,
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
    id: "product-info",
    label: "Learn about a product",
    team: "Education Team",
    subs: [
      {
        id: "unit-trusts",
        label: "Unit Trusts",
        resolveOnly: true,
        suggestions: [
          {
            q: "What is a unit trust?",
            a: "A unit trust is a pooled investment where money from many investors is combined and invested in assets like government securities, corporate debt, deposits, and shares. You receive units based on your investment, and returns are shared accordingly.",
          },
          {
            q: "How do I open a Unit Trust account?",
            a: "Register online at portal.cal.lk using your NIC, mobile number, and email address. You can also sign up through the CAL Online mobile app (Apple App Store / Google Play). If you prefer to apply in person, you can book an appointment. You'll need your NIC, proof of your bank account (e.g. a recent bank statement), and proof of address (only if your correspondence address differs from your NIC address).",
          },
          {
            q: "How long does it take to process a new unit trust application?",
            a: "Once you submit your application through the portal with all required documents, processing typically takes 3–5 working days. Times may be slightly longer during high-volume periods. You can track the status of your application directly through the portal.",
          },
          {
            q: "What can I do once my unit trust account is active?",
            a: "View your portfolio and balances, invest in Unit Trust funds, set up recurring investments, create redemption plans, track performance, and request account statements — plus more features to help you manage your investments easily.",
          },
          {
            q: "How do I invest money into a unit trust fund?",
            a: "Bank transfer: Transfer funds to the CAL Unit Trust account (Deutsche Bank AG, Colombo, Capital Alliance Investments Limited, Account No: 0046797000). Use your registered bank account, then log in and submit a creation request. JustPay: Link your bank account and invest directly — no proof upload needed. Up to LKR 150,000 per transaction (repeatable).",
          },
        ],
        quickLinks: [
          {
            label: "Browse unit trust funds",
            to: "/unit-trusts",
            description: "See live NAVs, historical returns and fund factsheets",
            icon: PiggyBank,
          },
          {
            label: "Unit trust guides",
            to: "/learn",
            description: "Beginner explainers and how-to videos",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "equities",
        label: "Equities",
        resolveOnly: true,
        suggestions: [
          {
            q: "What is equity?",
            a: "Equity means ownership in a company. When you own equity (shares/stocks), you have rights like voting on company decisions and receiving a share of the company's profits (dividends).",
          },
          {
            q: "What are the benefits for CAL equities clients?",
            a: "Track your portfolio via the CAL Online app, trade using the Atrad app, access AnalytiCAL (research portal with data on all CSE-listed companies, valuation ratios, and real-time metrics), access to research reports, webinars, and join a WhatsApp group for market updates. Get custom analytics and alerts tailored for you on your portfolio performance.",
          },
          {
            q: "What is the minimum investment amount for an equities account?",
            a: "Self-trading account (internet trading only): minimum LKR 100,000. Account with advisor support on your trades: minimum LKR 5,000,000.",
          },
          {
            q: "How do I transfer funds into my equities account?",
            a: "Bank transfer (no limit): Transfer to the CAL Seylan Bank account (Millennium branch, Capital Alliance Securities Pvt Ltd, Account No: 086400041489001). Use your registered bank account, then go to Pay In on the portal and submit a request. JustPay: Link your bank account in the app and invest directly — no proof upload needed. Up to LKR 150,000 per transaction, repeatable anytime.",
          },
          {
            q: "What are the fees involved with Equity Trading?",
            a: "Brokerage fee: 0.64%. Total transaction cost: 1.12%, including CSE fees (0.084%), CDS fees (0.024%), SEC cess (0.072%), and Share Transaction Levy (0.300%).",
          },
        ],
        quickLinks: [
          {
            label: "Investing in equities",
            to: "/learn",
            description: "Beginner's guide to buying and selling shares",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "treasuries",
        label: "Treasuries",
        resolveOnly: true,
        suggestions: [
          {
            q: "What are Treasury Bills and Bonds?",
            a: "Government-issued debt instruments — T-Bills mature within a year, T-Bonds run longer. Backed by the Government of Sri Lanka, considered the safest LKR investment.",
          },
          {
            q: "Is the interest taxed?",
            a: "Yes, withholding tax applies at source. The yield shown on the app is gross of WHT.",
          },
          {
            q: "Can I sell before maturity?",
            a: "Yes — CAL can buy back your holding at the prevailing market rate. The settlement amount may differ from face value.",
          },
        ],
        quickLinks: [
          {
            label: "View treasury rates",
            to: "/rates",
            description: "Latest T-Bill and T-Bond yields",
            icon: Landmark,
          },
          {
            label: "Treasury guides",
            to: "/learn",
            description: "How treasuries work and who they're for",
            icon: BookOpen,
          },
        ],
      },
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
          {
            q: "How long does it take for funds to reflect on the portal?",
            a: "Your investment becomes active on the creation date and reflects on your portal by the end of the next business day, once the transfer is confirmed.",
          },
        ],
      },
      {
        id: "withdrawal-delay",
        label: "Withdrawal / redemption delay",
      },
      {
        id: "fund-split",
        label: "Fund Flips",
        onlyProduct: "unit-trusts",
      },
      {
        id: "redemption-plan",
        label: "Redemption plan issue",
        skipProduct: true,
        suggestions: [
          { q: "Can I edit a scheduled redemption?", a: "Yes — open the plan from your portfolio and tap Edit. Changes apply from the next cycle." },
        ],
      },
      {
        id: "creation-plan",
        label: "Creation plan issue",
        skipProduct: true,
        resolveOnly: true,
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
  categoryId: z.string().min(1, "Pick a topic"),
  subId: z.string().min(1, "Pick what best describes it"),
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
  const [stepId, setStepId] = useState("");

  const [description, setDescription] = useState("");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

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

  let suggestions = sub?.suggestions ?? [];
  if (sub?.id === "investment-not-reflected" && productId === "unit-trusts") {
    suggestions = [
      {
        q: "How long does it take for my unit trust investment to be processed?",
        a: "Requests before 9:00 AM are processed the same working day and reflect on the portal by the next working day. After 9:00 AM, processing starts the next working day and reflects on the portal by 2 working days. Equity-based funds may take an additional day.",
      },
    ];
  }
  if (sub?.id === "withdrawal-delay") {
    if (productId === "unit-trusts") {
      suggestions = [
        {
          q: "How do I redeem money from my unit trust funds?",
          a: "Log in to the CAL portal or mobile app and submit a redemption request. Requests made before 9:00 AM are processed the same working day; after 9:00 AM, the next working day. Redemptions are processed on weekdays only (excluding Poya, Mercantile, and Bank holidays), and funds are credited to your registered bank account.",
        },
        {
          q: "Instant Redemption",
          a: "You can redeem up to LKR 100,000 instantly at any time via the CAL app, including weekends and holidays. Available for the Investment Grade Fund and Fixed Income Opportunities Fund.",
        },
      ];
    } else if (productId === "equities" || productId === "treasuries") {
      suggestions = [
        {
          q: "How long do payouts take?",
          a: "Equity and treasury payouts settle within the standard market cycle — typically T+3 business days after the trade or maturity date.",
        },
      ];
    } else {
      suggestions = [];
    }
  }
  const quickLinks = sub?.quickLinks ?? [];
  const hasSuggestions = suggestions.length > 0;
  const hasQuickLinks = quickLinks.length > 0;
  const specialForm = sub?.specialForm;
  const resolveOnly = !!sub?.resolveOnly;
  const needsProduct = !!category?.requiresProduct && !sub?.skipProduct;
  const productReady = !needsProduct || !!productId;

  useEffect(() => {
    setSubId("");
    setProductId("");
    setShowForm(false);
    setStepId("");
    setSelectedTxId(null);
  }, [categoryId]);

  useEffect(() => {
    setShowForm(false);
    setStepId("");
    setSelectedTxId(null);
  }, [subId]);

  useEffect(() => {
    setSelectedTxId(null);
  }, [productId]);

  const isTxFlow =
    sub?.id === "investment-not-reflected" ||
    sub?.id === "withdrawal-delay" ||
    sub?.id === "fund-split";

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

        <div className="mt-4 space-y-3">
          <Field label="What's this about?" error={errors.categoryId}>
            <SelectInput
              value={categoryId}
              onChange={(v) => setCategoryId(v as CategoryId | "")}
              placeholder="Choose a topic"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          {category && (
            <Field label="What best describes it?" error={errors.subId}>
              <SelectInput value={subId} onChange={setSubId} placeholder="Pick the closest match">
                {category.subs
                  .filter((s) => !s.onlyProduct || !productId || s.onlyProduct === productId)
                  .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}

          {sub && needsProduct && (
            <Field label="Product" error={errors.product}>
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

          {/* Smart suggestions (hidden in tx flows — they go straight to picker) */}
          {sub && productReady && hasSuggestions && !isTxFlow && (!showForm || resolveOnly) && (
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

          {/* Recent transactions picker for investment / withdrawal issues */}
          {sub && isTxFlow && productReady && (
              <RecentTransactionsPicker
                subId={sub.id}
                productId={productId}
                selectedTxId={selectedTxId}
                onSelect={(id) => {
                  setSelectedTxId(id);
                  setShowForm(true);
                }}
                onNotListed={() => {
                  setSelectedTxId(null);
                  setShowForm(true);
                }}
                notListedSelected={selectedTxId === null && showForm}
              />
            )}

          {sub?.id === "form-difficulty" && (
            <FormDifficultyPicker stepId={stepId} setStepId={setStepId} />
          )}

          {sub?.id === "creation-plan" && (
            <CreationPlanPicker
              stepId={stepId}
              setStepId={setStepId}
              description={description}
              setDescription={setDescription}
              onSubmit={submitForm}
              errors={errors}
            />
          )}

          {/* Continue to ticket */}
          {sub && !resolveOnly && !isTxFlow && !showForm && (hasSuggestions || hasQuickLinks) && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl bg-primary py-2.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Still need help? Continue to ticket
            </button>
          )}

          {/* Form */}
          {sub && !resolveOnly && productReady &&
            (isTxFlow ? showForm : (showForm || (!hasSuggestions && !hasQuickLinks))) && (
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
  const [blocked, setBlocked] = useState(false);
  return (
    <>
      <Field label="Before you go…" error={errors.reason}>
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

      {blocked && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-foreground">
                We can't deactivate your profile right now
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                You've made a transaction within the last 6 years, so we're required to keep your
                profile active. If this was for security reasons, we suggest you change your
                password. If you'd like, you can contact us for further help.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
                >
                  Change password
                </Link>
                <Link
                  to="/help/contact"
                  className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted/30"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setBlocked(true)}
        disabled={confirm !== "DEACTIVATE"}
        className="w-full rounded-xl bg-destructive py-3 text-[13px] font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit deactivation request
      </button>
    </>
  );
}

type RecentTx = {
  id: string;
  name: string;
  product: string;
  kind: string;
  date: string;
  reflectDate: string;
  value: string;
  status?: "Pending" | "Confirmed";
  subAccount?: string;
};

const RECENT_TXS: RecentTx[] = [
  { id: "tx1", name: "CAL Income Fund", product: "unit-trusts", kind: "Investment", date: "Apr 12, 2026", reflectDate: "Apr 15, 2026", value: "LKR 60,000", status: "Pending", subAccount: "Account 1" },
  { id: "tx2", name: "CAL Money Market", product: "unit-trusts", kind: "Investment", date: "Apr 10, 2026", reflectDate: "Apr 11, 2026", value: "LKR 200,000", status: "Confirmed", subAccount: "Account 1" },
  { id: "tx3", name: "Commercial Bank ••3421", product: "equities", kind: "Pay In", date: "Apr 2, 2026", reflectDate: "Apr 5, 2026", value: "LKR 50,000", status: "Pending" },
  { id: "tx4", name: "Sampath Bank ••8807", product: "equities", kind: "Pay In", date: "Mar 28, 2026", reflectDate: "Mar 30, 2026", value: "LKR 120,000", status: "Confirmed" },
  { id: "tx5", name: "Treasury Bond 5Y", product: "treasuries", kind: "Investment", date: "Mar 30, 2026", reflectDate: "Apr 2, 2026", value: "LKR 500,000", status: "Pending" },
  { id: "tx6", name: "Treasury Bill 91D", product: "treasuries", kind: "Maturity", date: "Mar 25, 2026", reflectDate: "Mar 30, 2026", value: "LKR 105,000", status: "Confirmed" },
];

const FORM_STEPS: { id: string; label: string; tips: string[]; intro?: string; footer?: { text: string; link?: { to: string; label: string } } }[] = [
  {
    id: "personal-details",
    label: "Personal details",
    intro: "Follow this guide to fill in your personal details correctly.",
    tips: [
      "Enter your full name exactly as printed on your NIC.",
      "Use a phone number and email you actively check — we'll send OTPs there.",
      "Pick the occupation that best matches your current role; you can update later.",
      "Double-check date of birth — it must match your NIC.",
    ],
  },
  {
    id: "video-kyc",
    label: "Video KYC",
    intro: "Your video recording is not clear. Please re-record your video ensuring:",
    tips: [
      "Your NIC is clearly visible",
      "You clearly read out the generated verification code",
    ],
    footer: {
      text: "If you are having trouble with your camera or recording your video during KYC, you can book an in-person appointment.",
      link: { to: "/get-started", label: "Book an in-person appointment" },
    },
  },
  {
    id: "address-proof",
    label: "Address Proof",
    intro:
      "The address proof must match your correspondence address. If the address proof is under the name of a family member (e.g. spouse, parent, child), please attach a copy of a birth certificate or marriage certificate as proof of relationship. Otherwise, re-upload a valid address proof under your name that:",
    tips: [
      "Is issued within the last 3 months",
      "Clearly shows your name",
      "Includes a visible date",
      "Matches your correspondence address",
    ],
  },
  {
    id: "billing-proof",
    label: "Billing Proof",
    intro: "Please upload a document that:",
    tips: [
      "Is issued within the last 3 months",
      "Clearly shows the bank name and logo",
      "Shows your full name and full account number",
      "Is not password-protected",
    ],
  },
  {
    id: "nic",
    label: "NIC",
    intro: "Your latest NIC record must be uploaded. Please upload one that is:",
    tips: [
      "Original, full-size unedited images",
      "Readable, well-lit, coloured images",
      "Not reflective or blurry",
      "Placed on a solid colour background",
    ],
  },
  {
    id: "selfie",
    label: "Selfie",
    intro: "Please re-upload a professional selfie image.",
    tips: [
      "Look directly at the camera in upright posture",
      "Show entire face, jawline, and forehead",
      "No hats, sunglasses, or high-collared clothing",
      "Good lighting and clear photo",
    ],
  },
];

function FormDifficultyPicker({
  stepId,
  setStepId,
}: {
  stepId: string;
  setStepId: (v: string) => void;
}) {
  const step = FORM_STEPS.find((s) => s.id === stepId) ?? null;
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-3">
      <p className="text-[13px] font-semibold text-foreground">Which step are you stuck on?</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        Pick a step and we'll show tips to help you get through it.
      </p>
      <div className="mt-2">
        <SelectInput value={stepId} onChange={setStepId} placeholder="Select a step">
          {FORM_STEPS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </SelectInput>
      </div>

      {step && (
        <div className="mt-3 rounded-lg bg-muted/30 p-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <p className="text-[12px] font-semibold text-foreground">{step.label} tips</p>
          </div>
          {step.intro && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{step.intro}</p>
          )}
          <ul className="mt-2 space-y-1.5">
            {step.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                <span className="text-[11px] leading-relaxed text-foreground">{t}</span>
              </li>
            ))}
          </ul>
          {step.footer && (
            <div className="mt-2.5 border-t border-border/40 pt-2">
              <p className="text-[11px] leading-relaxed text-muted-foreground">{step.footer.text}</p>
              {step.footer.link && (
                <Link
                  to={step.footer.link.to}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
                >
                  {step.footer.link.label}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreationPlanPicker({
  stepId,
  setStepId,
}: {
  stepId: string;
  setStepId: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-3">
      <p className="text-[13px] font-semibold text-foreground">What would you like to do?</p>
      <div className="mt-2">
        <SelectInput value={stepId} onChange={setStepId} placeholder="Pick an option">
          <option value="cancel">Cancel my creation plan</option>
          <option value="edit">Edit my creation plan</option>
          <option value="not-executed">My plan didn't execute</option>
        </SelectInput>
      </div>

      {stepId === "cancel" && (
        <div className="mt-3 rounded-lg bg-muted/30 p-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <p className="text-[12px] font-semibold text-foreground">You can cancel anytime</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            You can cancel the plan at any time from your portfolio. Plans cannot be edited — to
            change the fund, amount, or date, cancel the current plan and create a new one.
          </p>
          <Link
            to="/unit-trusts"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
          >
            Go to my plans
          </Link>
        </div>
      )}

      {stepId === "edit" && (
        <div className="mt-3 rounded-lg bg-muted/30 p-2.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Creation plans cannot be edited. To change the fund, amount, or date, cancel the current
            plan and create a new one.
          </p>
          <Link
            to="/unit-trusts"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
          >
            Manage my plans
          </Link>
        </div>
      )}

      {stepId === "not-executed" && (
        <div className="mt-3 rounded-lg bg-muted/30 p-2.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Most often it's due to insufficient balance on the cycle date. The plan retries
            automatically the next business day.
          </p>
        </div>
      )}
    </div>
  );
}

function RecentTransactionsPicker({
  subId,
  productId,
  selectedTxId,
  onSelect,
  onNotListed,
  notListedSelected,
}: {
  subId: string;
  productId: string;
  selectedTxId: string | null;
  onSelect: (id: string) => void;
  onNotListed: () => void;
  notListedSelected?: boolean;
}) {
  const txs = RECENT_TXS
    .filter((t) => !productId || t.product === productId)
    .slice(0, 3);
  const selectedTx = txs.find((t) => t.id === selectedTxId) ?? null;
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-3">
      <p className="text-[13px] font-semibold text-foreground">
        Which transaction are you referring to?
      </p>
      <div className="mt-2 space-y-1.5">
        {txs.map((tx) => {
          const active = selectedTxId === tx.id;
          const displayKind =
            subId === "withdrawal-delay"
              ? tx.product === "equities"
                ? "Payout"
                : "Redemption"
              : tx.kind;
          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => onSelect(tx.id)}
              className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-muted/20 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-foreground">{tx.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {displayKind}
                    {tx.subAccount ? ` · ${tx.subAccount}` : ""} · {tx.date}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {tx.status && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        tx.status === "Pending"
                          ? "bg-warning/15 text-warning"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {tx.status}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-foreground">{tx.value}</span>
                </div>
              </div>
            </button>
          );
        })}
        {txs.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            No recent transactions for this product.
          </p>
        )}
        <button
          type="button"
          onClick={onNotListed}
          className={`w-full rounded-lg border p-2.5 text-left text-[12px] font-medium text-foreground transition-colors ${
            notListedSelected
              ? "border-primary/50 bg-primary/10"
              : "border-dashed border-border/50 bg-muted/10 hover:bg-muted/20"
          }`}
        >
          <p>Transaction not listed here?</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Describe the issue and we'll look into it.
          </p>
        </button>
      </div>

      {selectedTx && selectedTx.status === "Pending" && subId === "investment-not-reflected" && (
        <div className="mt-3 rounded-lg bg-muted/30 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your estimated investment timeline
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-medium text-foreground">
                  Creation date — {selectedTx.date}
                </p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  This is the date your investment becomes active.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <p className="text-[11px] leading-relaxed text-foreground">
                Your investment will be reflected on your portal — by the end of{" "}
                <span className="font-medium">{selectedTx.reflectDate}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
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
