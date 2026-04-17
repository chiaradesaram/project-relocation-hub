import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { ChevronDown, HelpCircle, Mail, MessageCircle } from "lucide-react";

type HelpTopic = "invest" | "rates" | "unit-trusts" | "transactions" | "general";

interface FAQItem {
  q: string;
  a: string;
}

const faqByTopic: Record<HelpTopic, { title: string; intro: string; items: FAQItem[] }> = {
  invest: {
    title: "Investing Help",
    intro: "Common questions about Direct Invest, Bank Transfer and Flip.",
    items: [
      { q: "How long does Direct Invest take?", a: "Funds are debited instantly via Justpay. Your investment is reflected on the portal within 1 business day." },
      { q: "Why is there a LKR 149,950 limit on Direct Invest?", a: "This is the per-transfer limit set by Justpay. You can make multiple transfers in a day to invest more." },
      { q: "Why is Deutsche Bank recommended for Bank Transfer?", a: "Transfers to Deutsche Bank are auto-verified — no proof of payment needed and processing is faster." },
      { q: "How long do bank transfers take?", a: "Typically 1–2 business days after we receive your proof of payment and the funds clear." },
      { q: "What proof of payment is accepted?", a: "A clear screenshot or PDF of the bank transfer receipt showing reference number, amount and date." },
      { q: "Can I cancel a recurring investment?", a: "Yes — manage or delete any recurring plan from the Recurring Investments tab at any time." },
      { q: "What is Flip?", a: "Flip moves funds instantly between your CAL fund accounts with no fees and no bank involved." },
    ],
  },
  rates: {
    title: "Fund Rates Help",
    intro: "Understanding fund yields, NAV and how rates are published.",
    items: [
      { q: "How often are rates updated?", a: "Unit prices and yields are published daily on every business day after market close." },
      { q: "What is NAV?", a: "Net Asset Value — the per-unit price of a fund, calculated daily from the underlying assets." },
      { q: "Are past returns guaranteed?", a: "No. Historical yields are indicative only and do not guarantee future performance." },
    ],
  },
  "unit-trusts": {
    title: "Unit Trusts Help",
    intro: "How CAL unit trust funds work.",
    items: [
      { q: "What is a unit trust?", a: "A pooled investment vehicle where your money is combined with other investors and managed by CAL fund managers." },
      { q: "How do I redeem units?", a: "Tap Redeem on any holding. Settlement typically takes 1–3 business days depending on the fund." },
      { q: "Are there exit fees?", a: "Most CAL funds have no exit fee. Specific terms are listed on each fund's detail page." },
    ],
  },
  transactions: {
    title: "Transactions Help",
    intro: "About your transaction history and statuses.",
    items: [
      { q: "Why is my transaction pending?", a: "Bank transfers and certain fund operations take 1–2 business days to settle and reflect as completed." },
      { q: "Can I cancel a pending transaction?", a: "Direct Invest and Flip transactions cannot be cancelled once submitted. Contact support if you need help." },
      { q: "Where can I download a statement?", a: "Tap any transaction for details, or use the Statements section in More to download monthly summaries." },
    ],
  },
  general: {
    title: "Help & Support",
    intro: "Browse common questions or reach out to our team.",
    items: [
      { q: "How do I update my profile?", a: "Go to Profile from the More menu to update your contact details and preferences." },
      { q: "Is my money safe?", a: "All investments are held in regulated CAL custody accounts and overseen by the SEC of Sri Lanka." },
      { q: "How do I contact support?", a: "Use the Contact options below — we respond on business days within a few hours." },
    ],
  },
};

export const Route = createFileRoute("/help")({
  validateSearch: (search: Record<string, unknown>): { topic?: HelpTopic } => ({
    topic: (search.topic as HelpTopic) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Help & FAQs — CAL Invest" },
      { name: "description", content: "Frequently asked questions and support resources for CAL Invest." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { topic } = Route.useSearch();
  const active: HelpTopic = topic && topic in faqByTopic ? topic : "general";
  const { title, intro, items } = faqByTopic[active];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <MobileLayout>
      <PageHeader title="Help & FAQs" showBack />

      <div className="mx-4 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">{intro}</p>
      </div>

      <div className="mx-4 mt-3 glass-card overflow-hidden divide-y divide-border/40">
        {items.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
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

      <div className="mx-4 mt-4 mb-6">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">
          STILL NEED HELP?
        </p>
        <div className="glass-card divide-y divide-border/40">
          <a
            href="mailto:support@cal.lk"
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors"
          >
            <Mail className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-foreground">Email support</p>
              <p className="text-[10px] text-muted-foreground">support@cal.lk</p>
            </div>
          </a>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-foreground">Chat with us</p>
              <p className="text-[10px] text-muted-foreground">Available 9am–6pm on business days</p>
            </div>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
