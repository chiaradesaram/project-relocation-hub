import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  TrendingUp,
  Repeat,
  MessageCircle,
  Shield,
  Wallet,
  Zap,
  X,
  ArrowLeft,
} from "lucide-react";

type HelpTopic = "invest" | "rates" | "unit-trusts" | "transactions" | "account" | "general";
type FAQTopic = Exclude<HelpTopic, "general">;

interface FAQItem {
  q: string;
  a: string;
  topic: FAQTopic;
  featured?: boolean;
}

const FAQS: FAQItem[] = [
  { topic: "invest", q: "How long does Direct Invest take?", a: "Funds are debited instantly via Justpay. Your investment reflects on the portal within 1 business day.", featured: true },
  { topic: "invest", q: "Why is there a LKR 149,950 limit on Direct Invest?", a: "This is the per-transfer limit set by Justpay. You can make multiple transfers in a day." },
  { topic: "invest", q: "How long do bank transfers take?", a: "Typically 1–2 business days after we receive your proof of payment and funds clear." },
  { topic: "invest", q: "Can I cancel a recurring investment?", a: "Yes — manage or delete any recurring plan from the Recurring Investments tab at any time." },
  { topic: "invest", q: "What is Flip?", a: "Flip moves funds instantly between your CAL fund accounts with no fees and no bank involved." },
  { topic: "rates", q: "How often are rates updated?", a: "Unit prices and yields are published daily on every business day after market close." },
  { topic: "rates", q: "What is NAV?", a: "Net Asset Value — the per-unit price of a fund, calculated daily from the underlying assets.", featured: true },
  { topic: "rates", q: "Are past returns guaranteed?", a: "No. Historical yields are indicative only and do not guarantee future performance." },
  { topic: "unit-trusts", q: "What is a unit trust?", a: "A pooled investment vehicle where your money is combined with others and managed by CAL fund managers." },
  { topic: "unit-trusts", q: "How do I redeem units?", a: "Tap Redeem on any holding. Settlement typically takes 1–3 business days depending on the fund.", featured: true },
  { topic: "unit-trusts", q: "Are there exit fees?", a: "Most CAL funds have no exit fee. Specific terms are listed on each fund's detail page." },
  { topic: "transactions", q: "Why is my transaction pending?", a: "Bank transfers and certain fund operations take 1–2 business days to settle and reflect as completed.", featured: true },
  { topic: "transactions", q: "Can I cancel a pending transaction?", a: "Direct Invest and Flip transactions cannot be cancelled once submitted. Contact support if you need help." },
  { topic: "transactions", q: "Where can I download a statement?", a: "Tap any transaction for details, or use Statements from More to download monthly summaries." },
  { topic: "account", q: "How do I update my profile?", a: "Go to Profile from the More menu to update your contact details and preferences." },
  { topic: "account", q: "Is my money safe?", a: "All investments are held in regulated CAL custody accounts and overseen by the SEC of Sri Lanka." },
  { topic: "account", q: "How do I add a bank account?", a: "Go to Bank Accounts from the More menu and tap Add. New accounts are verified within 1 business day.", featured: true },
];

const QUICK_LINKS: { label: string; to: string }[] = [
  { label: "Add a bank account", to: "/bank-accounts" },
  { label: "See fund rates", to: "/rates" },
  { label: "Set a recurring investment", to: "/invest" },
  { label: "Download a statement", to: "/transactions" },
];

const TOPIC_SECTIONS: {
  id: FAQTopic;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    id: "invest",
    label: "Investing",
    description: "Direct Invest, recurring plans and Flip.",
    icon: TrendingUp,
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "Pending transfers, statements and history.",
    icon: Repeat,
  },
  {
    id: "unit-trusts",
    label: "Unit Trusts",
    description: "Holdings, redemptions and fees.",
    icon: Wallet,
  },
  {
    id: "rates",
    label: "Rates & NAV",
    description: "Daily yields and unit prices.",
    icon: FileText,
  },
  {
    id: "account",
    label: "Account & Security",
    description: "Profile, bank accounts and safety.",
    icon: Shield,
  },
];


export const Route = createFileRoute("/help/")({
  validateSearch: (search: Record<string, unknown>): { topic?: HelpTopic; q?: string } => ({
    topic: (search.topic as HelpTopic) || undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Help & FAQs — CAL Invest" },
      { name: "description", content: "Search FAQs, get quick answers, and contact CAL support." },
    ],
  }),
  component: HelpIndexPage,
});

function HelpIndexPage() {
  const { q, topic } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<FAQTopic | null>(null);

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(trimmed) || f.a.toLowerCase().includes(trimmed),
    );
  }, [trimmed, isSearching]);

  const currentTopic = selectedTopic
    ? TOPIC_SECTIONS.find((t) => t.id === selectedTopic) ?? null
    : null;
  const topicFaqs = selectedTopic ? FAQS.filter((f) => f.topic === selectedTopic) : [];

  const contextTopic: FAQTopic | null =
    topic && topic !== "general" && TOPIC_SECTIONS.some((t) => t.id === topic)
      ? (topic as FAQTopic)
      : null;

  const suggestedFaqs = useMemo(() => {
    if (!contextTopic) return [];
    const inTopic = FAQS.filter((f) => f.topic === contextTopic);
    const featured = inTopic.filter((f) => f.featured);
    const rest = inTopic.filter((f) => !f.featured);
    return [...featured, ...rest].slice(0, 3);
  }, [contextTopic]);

  const otherTopics = contextTopic
    ? TOPIC_SECTIONS.filter((t) => t.id !== contextTopic)
    : TOPIC_SECTIONS;

  return (
    <MobileLayout>
      {/* Top bar */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-30 px-4 pt-3 pb-1">
        <button
          onClick={() => {
            if (selectedTopic) setSelectedTopic(null);
            else window.history.back();
          }}
          className="flex items-center justify-center w-9 h-9 -ml-2 rounded-full text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {currentTopic ? (
        <TopicView
          topic={currentTopic}
          faqs={topicFaqs}
          openKey={openKey}
          setOpenKey={setOpenKey}
        />
      ) : (
        <>
          {/* Hero heading */}
          <div className="px-5 pt-2 pb-5">
            <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">
              Hi, how can we help?
            </h1>
          </div>

          {/* Search bar */}
          <div className="mx-5 mb-6">
            <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/40 px-5 py-3.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles"
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isSearching ? (
            <div className="mx-5 mb-6">
              <p className="text-[12px] font-medium text-muted-foreground mb-2">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
              </p>
              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-border/40 bg-card/40 p-5 text-center">
                  <p className="text-sm text-foreground font-medium">No matching answers</p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Try a different keyword or contact us below.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {searchResults.map((item, i) => {
                    const key = `search-${i}`;
                    const isOpen = openKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        className="w-full text-left py-3.5 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium text-foreground">{item.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                        {isOpen && (
                          <p className="text-[13px] text-muted-foreground leading-relaxed pr-6">{item.a}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {contextTopic ? (
                <div className="mx-5 mb-6">
                  <p className="text-[14px] font-medium text-foreground mb-3">Suggested FAQs</p>
                  <div className="h-px bg-border/40 mb-1" />
                  <div className="divide-y divide-border/30">
                    {suggestedFaqs.map((item, i) => {
                      const key = `suggested-${i}`;
                      const isOpen = openKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setOpenKey(isOpen ? null : key)}
                          className="w-full text-left py-4 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[14px] font-medium text-foreground">{item.q}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                          {isOpen && (
                            <p className="text-[13px] text-muted-foreground leading-relaxed pr-6">{item.a}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mx-5 mb-6">
                  <p className="text-[14px] font-medium text-foreground mb-3">Quick links</p>
                  <div className="h-px bg-border/40 mb-1" />
                  <div className="divide-y divide-border/30">
                    {QUICK_LINKS.map(({ label, to }) => (
                      <Link
                        key={label}
                        to={to}
                        className="w-full flex items-center gap-3.5 py-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-primary fill-primary" />
                        </div>
                        <span className="flex-1 text-[14px] font-medium text-foreground">{label}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics list */}
              <div className="mx-5 mb-6">
                <p className="text-[14px] font-medium text-foreground mb-3">
                  {contextTopic ? "Other Topics" : "Suggested Topics"}
                </p>
                <div className="h-px bg-border/40 mb-1" />
                <div className="divide-y divide-border/30">
                  {otherTopics.map(({ id, label, description, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(id);
                        setOpenKey(null);
                      }}
                      className="w-full flex items-center gap-3.5 py-4 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-foreground">{label}</p>
                        <p className="text-[12px] text-muted-foreground leading-snug">{description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Still need help */}
      <div className="mx-5 mt-2 mb-8">
        <Link
          to="/help/contact"
          className="block rounded-2xl bg-primary p-4 hover:bg-primary/90 transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-primary-foreground">Contact us</p>
              <p className="text-[12px] text-primary-foreground/80">Usually replies in 2 business days.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary-foreground/70" />
          </div>
        </Link>
      </div>
    </MobileLayout>
  );
}

function TopicView({
  topic,
  faqs,
  openKey,
  setOpenKey,
}: {
  topic: { id: FAQTopic; label: string; description: string; icon: typeof FileText };
  faqs: FAQItem[];
  openKey: string | null;
  setOpenKey: (k: string | null) => void;
}) {
  const Icon = topic.icon;
  return (
    <>
      <div className="px-5 pt-2 pb-5">
        <div className="w-11 h-11 rounded-full border border-border/50 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        <h1 className="text-[24px] font-bold text-foreground leading-tight tracking-tight">
          {topic.label}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">{topic.description}</p>
      </div>
      <div className="mx-5 mb-6">
        <div className="h-px bg-border/40 mb-1" />
        <div className="divide-y divide-border/30">
          {faqs.map((item, i) => {
            const key = `${topic.id}-${i}`;
            const isOpen = openKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full text-left py-4 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isOpen && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed pr-6">{item.a}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
