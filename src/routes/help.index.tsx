import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Building2,
  TrendingUp,
  Repeat,
  MessageCircle,
  X,
} from "lucide-react";

type HelpTopic = "invest" | "rates" | "unit-trusts" | "transactions" | "account" | "general";

interface FAQItem {
  q: string;
  a: string;
  topic: Exclude<HelpTopic, "general">;
}

const FAQS: FAQItem[] = [
  { topic: "invest", q: "How long does Direct Invest take?", a: "Funds are debited instantly via Justpay. Your investment reflects on the portal within 1 business day." },
  { topic: "invest", q: "Why is there a LKR 149,950 limit on Direct Invest?", a: "This is the per-transfer limit set by Justpay. You can make multiple transfers in a day." },
  { topic: "invest", q: "How long do bank transfers take?", a: "Typically 1–2 business days after we receive your proof of payment and funds clear." },
  { topic: "invest", q: "Can I cancel a recurring investment?", a: "Yes — manage or delete any recurring plan from the Recurring Investments tab at any time." },
  { topic: "invest", q: "What is Flip?", a: "Flip moves funds instantly between your CAL fund accounts with no fees and no bank involved." },
  { topic: "rates", q: "How often are rates updated?", a: "Unit prices and yields are published daily on every business day after market close." },
  { topic: "rates", q: "What is NAV?", a: "Net Asset Value — the per-unit price of a fund, calculated daily from the underlying assets." },
  { topic: "rates", q: "Are past returns guaranteed?", a: "No. Historical yields are indicative only and do not guarantee future performance." },
  { topic: "unit-trusts", q: "What is a unit trust?", a: "A pooled investment vehicle where your money is combined with others and managed by CAL fund managers." },
  { topic: "unit-trusts", q: "How do I redeem units?", a: "Tap Redeem on any holding. Settlement typically takes 1–3 business days depending on the fund." },
  { topic: "unit-trusts", q: "Are there exit fees?", a: "Most CAL funds have no exit fee. Specific terms are listed on each fund's detail page." },
  { topic: "transactions", q: "Why is my transaction pending?", a: "Bank transfers and certain fund operations take 1–2 business days to settle and reflect as completed." },
  { topic: "transactions", q: "Can I cancel a pending transaction?", a: "Direct Invest and Flip transactions cannot be cancelled once submitted. Contact support if you need help." },
  { topic: "transactions", q: "Where can I download a statement?", a: "Tap any transaction for details, or use Statements from More to download monthly summaries." },
  { topic: "account", q: "How do I update my profile?", a: "Go to Profile from the More menu to update your contact details and preferences." },
  { topic: "account", q: "Is my money safe?", a: "All investments are held in regulated CAL custody accounts and overseen by the SEC of Sri Lanka." },
  { topic: "account", q: "How do I add a bank account?", a: "Go to Bank Accounts from the More menu and tap Add. New accounts are verified within 1 business day." },
];

const POPULAR_SEARCHES = [
  "Download statement",
  "Recurring invest",
  "Bank transfer",
  "Redeem units",
  "NAV",
  "Add bank",
];

const QUICK_LINKS = [
  { icon: FileText, label: "Download a statement", to: "/transactions" as const },
  { icon: Building2, label: "Add a bank account", to: "/bank-accounts" as const },
  { icon: TrendingUp, label: "See fund rates", to: "/rates" as const },
  { icon: Repeat, label: "Set a recurring invest", to: "/invest" as const },
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
  const [focused, setFocused] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;
  const showPopular = focused && !isSearching;

  const results = useMemo(() => {
    if (!isSearching) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(trimmed) || f.a.toLowerCase().includes(trimmed),
    );
  }, [trimmed, isSearching]);

  return (
    <MobileLayout>
      <PageHeader title="Help" showBack hideHelp />

      {/* Hero */}
      <div className="mx-4 mt-1">
        <h2 className="text-lg font-semibold text-foreground">How can we help?</h2>
        <p className="text-[11px] text-muted-foreground">Find answers fast or get in touch.</p>
      </div>

      {/* Quick links */}
      <div className="mx-4 mt-3">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-1.5">
          QUICK LINKS
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-2.5 backdrop-blur-md hover:bg-muted/30 transition-colors"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[11px] font-medium text-foreground leading-tight flex-1">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mx-4 mt-4">
        <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 px-3 py-2.5 backdrop-blur-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search help articles"
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showPopular && (
          <div className="mt-2 rounded-xl border border-border/40 bg-card/60 p-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">
              POPULAR SEARCHES
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setQuery(p)}
                  className="rounded-full border border-border/40 bg-card/40 px-2.5 py-1 text-[11px] text-foreground hover:bg-muted/30 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="mx-4 mt-4">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-1.5">
          {isSearching
            ? `${results.length} RESULT${results.length === 1 ? "" : "S"}`
            : "FREQUENTLY ASKED"}
        </p>
        {results.length === 0 ? (
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-foreground font-medium">No matching answers</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Try a different keyword or contact us below.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-border/40">
            {results.map((item, i) => {
              const key = `${item.topic}-${i}-${item.q}`;
              const isOpen = openKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="w-full text-left px-3 py-3 flex flex-col gap-1.5 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-foreground">{item.q}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed pr-5">
                      {item.a}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact card */}
      <div className="mx-4 mt-4 mb-6">
        <Link
          to="/help/contact"
          className="block glass-card p-4 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-foreground">Still need help?</p>
              <p className="text-[10px] text-muted-foreground">
                Send us a message — we usually reply within 2 business days.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          or email{" "}
          <a href="mailto:support@cal.lk" className="text-primary underline-offset-2 hover:underline">
            support@cal.lk
          </a>
        </p>
      </div>
    </MobileLayout>
  );
}
