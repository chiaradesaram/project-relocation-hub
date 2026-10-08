import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, Sparkles, ChevronRight, X, Search } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { FundArtwork } from "@/components/FundArtwork";
import { FundQuizModal, YieldCalculator } from "@/components/RatesTools";
import { fundsData } from "@/data/rateFunds";

export const Route = createFileRoute("/rates/")({
  head: () => ({ meta: [
    { title: "Fund Rates & Factsheets | CAL Digital" },
    { name: "description", content: "Explore CAL fixed income, equity and balanced funds, compare yields and view fund factsheets." },
    { property: "og:title", content: "Fund Rates & Factsheets | CAL Digital" },
    { property: "og:description", content: "Explore CAL funds, yields and investment breakdowns." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: RatesDirectory,
});
const categories = ["All", "Fixed income", "Equity", "Balanced"] as const;
function RatesDirectory() {
  const [category, setCategory] = useState<typeof categories[number]>("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const visible = fundsData.filter(f => (category === "All" || f.category === category) && f.name.toLowerCase().includes(query.toLowerCase()));
  return <MobileLayout>
    <PageHeader title="Rates" showBack helpTopic="rates" rightElement={<Button size="icon" variant="ghost" aria-label="Search funds" onClick={() => setSearchOpen(!searchOpen)} className="h-8 w-8 rounded-full"><Search className="h-4 w-4" /></Button>} />
    <div className="px-4 pt-3 pb-5">
      {searchOpen && <input aria-label="Search funds" autoFocus placeholder="Search funds" value={query} onChange={e => setQuery(e.target.value)} className="mb-4 w-full rounded-xl bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-pill/50" />}
      <div role="group" aria-label="Fund category" className="mb-5 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {categories.map(c => <Button key={c} variant="ghost" aria-pressed={category === c} onClick={() => setCategory(c)} className={`h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold ${category === c ? "bg-pill/20 text-pill hover:bg-pill/25" : "bg-card text-foreground/90 hover:bg-secondary"}`}>{c}</Button>)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map(f => <Button key={f.slug} asChild variant="ghost" className="h-auto min-h-[180px] items-stretch justify-start whitespace-normal rounded-2xl bg-card p-4 text-left hover:bg-secondary/70 active:scale-[0.98] motion-reduce:transform-none">
          <Link to="/rates/$fundId" params={{ fundId: f.slug }} aria-label={`${f.name} factsheet`} className="flex flex-col">
            <FundArtwork index={f.icon} />
            <h2 className="mt-3 min-h-10 text-[14px] font-semibold leading-5 text-foreground">{f.name}</h2>
            <div className="mt-3 flex items-center justify-between"><span className="text-[20px] font-semibold tabular-nums text-success">{f.yield30d}</span><ChevronRight className="h-4 w-4 text-foreground/60" /></div>
            <span className="mt-0.5 text-[12px] font-normal text-foreground/80">30-day yield</span>
          </Link>
        </Button>)}
      </div>
      {!visible.length && <p className="py-12 text-center text-sm text-foreground/80">No funds found</p>}
      <p className="mt-4 text-[12px] leading-5 text-foreground/75">Sample rates · 14 Apr 2026. Not live market data.</p>
      <div className="mt-5 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setCalculatorOpen(true)} className="h-10 rounded-full bg-card text-[12px]"><Calculator className="h-4 w-4 text-pill" />Yield calculator</Button>
        <Button variant="ghost" onClick={() => setQuizOpen(true)} className="h-10 rounded-full bg-card text-[12px]"><Sparkles className="h-4 w-4 text-pill" />Fund matcher</Button>
      </div>
    </div>
    <Sheet open={calculatorOpen} onOpenChange={setCalculatorOpen}><SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-0 bg-background pb-8"><div className="flex items-center justify-between"><SheetTitle>Yield calculator</SheetTitle><Button size="icon" variant="ghost" aria-label="Close calculator" onClick={() => setCalculatorOpen(false)}><X className="h-4 w-4" /></Button></div><YieldCalculator /></SheetContent></Sheet>
    <FundQuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
  </MobileLayout>;
}