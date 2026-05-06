import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Building2,
  TrendingUp,
  Repeat,
  MessageCircle,
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

const QUICK_LINKS = [
  { icon: FileText, label: "Download a statement", to: "/transactions" as const },
  { icon: Building2, label: "Add a bank account", to: "/bank-accounts" as const },
  { icon: TrendingUp, label: "See fund rates", to: "/rates" as const },
  { icon: Repeat, label: "Set a recurring invest", to: "/invest" as const },
];

const TOPIC_SECTIONS: { id: FAQTopic; label: string }[] = [
  { id: "invest", label: "Investing" },
  { id: "rates", label: "Rates & NAV" },
  { id: "unit-trusts", label: "Unit Trusts" },
  { id: "transactions", label: "Transactions" },
  { id: "account", label: "Account & Security" },
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
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [activeTopic, setActiveTopic] = useState<FAQTopic | "all">("all");

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(trimmed) || f.a.toLowerCase().includes(trimmed),
    );
  }, [trimmed, isSearching]);

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <MobileLayout>
      {/* Back button */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-30 px-4 pt-3 pb-1">
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-9 h-9 -ml-2 rounded-full text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Hero heading */}
      <div className="px-4 pt-4 pb-6 text-center">
        <h1 className="text-[24px] font-bold text-foreground leading-tight">
          Hi, how can we help<br />you today?
        </h1>
      </div>

      {/* Search bar */}
      <div className="mx-4 mb-6">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or ask a question"
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
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

      {/* Search results */}
      {isSearching ? (
        <div className="mx-4 mb-6">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
          </p>
          {searchResults.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/60 p-5 text-center">
              <p className="text-sm text-foreground font-medium">No matching answers</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Try a different keyword or contact us below.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card/60 overflow-hidden divide-y divide-border/30">
              {searchResults.map((item, i) => {
                const key = `search-${i}`;
                const isOpen = openKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full text-left px-4 py-3.5 flex flex-col gap-1.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                    {isOpen && (
                      <p className="text-[12px] text-muted-foreground leading-relaxed pr-6">{item.a}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Chat with us CTA */}
          <div className="mx-4 mb-5">
            <p className="text-[13px] font-semibold text-muted-foreground mb-2">Continue conversation</p>
            <Link
              to="/help/contact"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-3.5 text-primary-foreground font-semibold text-[15px] hover:brightness-110 transition"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              Chat with us
            </Link>
          </div>

          {/* Quick links */}
          <div className="mx-4 mb-5">
            <div className="rounded-2xl border border-border/40 bg-card/60 overflow-hidden">
              <p className="text-[14px] font-semibold text-foreground px-4 pt-4 pb-2">Quick links</p>
              <div className="divide-y divide-border/30">
                {QUICK_LINKS.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[13px] font-medium text-primary flex-1">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested FAQs by topic */}
          <div className="mx-4 mb-5">
            {/* Topic filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {[{ id: "all" as const, label: "All" }, ...TOPIC_SECTIONS].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTopic(id as FAQTopic | "all")}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    activeTopic === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/60 overflow-hidden">
              <p className="text-[14px] font-semibold text-foreground px-4 pt-4 pb-2">Suggested FAQs</p>
              <div className="divide-y divide-border/30">
                {TOPIC_SECTIONS.filter(({ id }) => activeTopic === "all" || activeTopic === id).map(({ id, label }) => {
                  const isExpanded = expandedTopics.has(id);
                  const topicFaqs = FAQS.filter((f) => f.topic === id);
                  return (
                    <div key={id}>
                      <button
                        type="button"
                        onClick={() => toggleTopic(id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-[13px] font-medium text-foreground">{label}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="bg-muted/10 divide-y divide-border/20">
                          {topicFaqs.map((item, i) => {
                            const key = `${id}-${i}`;
                            const isOpen = openKey === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setOpenKey(isOpen ? null : key)}
                                className="w-full text-left px-5 py-3 flex flex-col gap-1 transition-colors hover:bg-muted/20"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[12px] font-medium text-foreground/90">{item.q}</span>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                  />
                                </div>
                                {isOpen && (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed pr-5 pt-0.5">{item.a}</p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Still need help */}
      <div className="mx-4 mt-2 mb-6">
        <Link
          to="/help/contact"
          className="block rounded-2xl border border-border/40 bg-card/60 p-4 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">Still need help?</p>
              <p className="text-[11px] text-muted-foreground">
                Send us a message — we usually reply within 2 business days.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
        <p className="text-[11px] text-muted-foreground text-center mt-2.5">
          or email{" "}
          <a href="mailto:support@cal.lk" className="text-primary underline-offset-2 hover:underline">
            support@cal.lk
          </a>
        </p>
      </div>
    </MobileLayout>
  );
}
