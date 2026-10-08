import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Landmark, Banknote, ChartNoAxesCombined, FileText, ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { FundArtwork } from "@/components/FundArtwork";
import { FundPerformance } from "@/components/FundPerformance";
import { fundsData } from "@/data/rateFunds";

export const Route = createFileRoute("/rates/$fundId")({
  loader: ({ params }) => { const fund = fundsData.find(f => f.slug === params.fundId); if (!fund) throw notFound(); return fund; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Fund not found"} Factsheet | CAL Digital` },
    { name: "description", content: loaderData?.description ?? "Explore CAL investment funds." },
    { property: "og:title", content: `${loaderData?.name ?? "Fund not found"} | CAL Digital` },
    { property: "og:description", content: loaderData?.description ?? "Explore CAL investment funds." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  notFoundComponent: () => <MobileLayout><div className="p-6"><h1 className="text-xl font-semibold">Fund not found</h1><Link to="/rates" className="mt-4 block text-pill">Back to Rates</Link></div></MobileLayout>,
  component: FundFactsheet,
});

function FundFactsheet() {
  const fund = Route.useLoaderData();
  return <MobileLayout>
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur-xl"><Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-card"><Link to="/rates" aria-label="Back to Rates"><ArrowLeft className="h-4 w-4" /></Link></Button><span className="text-[14px] font-semibold">Fund factsheet</span></header>
    <div className="space-y-5 px-4 pt-4 pb-6">
      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h1 className="text-[25px] font-semibold leading-8">{fund.name}</h1><p className="mt-2 text-[13px] text-foreground/85">{fund.category} · LKR</p></div><FundArtwork index={fund.icon} large /></div>
      <p className="text-[12px] text-pill">Sample factsheet · 14 Apr 2026</p>
      <section className="rounded-2xl bg-card p-4"><p className="text-[14px] leading-6 text-foreground/95">{fund.description}</p></section>
      <FundPerformance fund={fund} />
      <section className="overflow-hidden rounded-2xl bg-card p-4"><h2 className="text-[15px] font-semibold">Where the fund invests</h2><div className="mt-4 flex h-2 overflow-hidden rounded-full" aria-label="Asset allocation">{fund.composition.map(c => <span key={c.label} style={{ width: `${c.pct}%`, backgroundColor: c.color }} />)}</div><div className="mt-3 divide-y divide-foreground/[0.06]">{fund.composition.map(c => {
        const Icon = c.label === "Equities" ? ChartNoAxesCombined : c.label === "Cash" ? Banknote : Landmark;
        return <div key={c.label} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06]"><Icon className="h-4 w-4" style={{ color: c.color }} /></span><span className="flex-1 text-[14px]">{c.label}</span><span className="text-[14px] font-medium tabular-nums">{c.pct}%</span></div>;
      })}</div></section>
      <section className="rounded-2xl bg-card p-4"><div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-pill" /><h2 className="text-[15px] font-semibold">Top holdings</h2></div><p className="mt-3 text-[13px] leading-5 text-foreground/85">Individual holdings have not been supplied for this fund.</p></section>
      <section className="overflow-hidden rounded-2xl bg-card px-4"><h2 className="pt-4 pb-2 text-[15px] font-semibold">About your investment</h2><div className="divide-y divide-foreground/[0.06]">
        {[{ label: "Risk level", value: `${fund.risk} risk` }, { label: "Fund size", value: fund.fundSize }, { label: "Unit price", value: `LKR ${fund.unitPrice}` }, { label: "30-day yield", value: fund.yield30d }, { label: "Management fee", value: "Not supplied" }].map(r => <div key={r.label} className="flex items-center justify-between gap-3 py-3.5 text-[13px]"><span className="text-foreground/90">{r.label}</span><span className="text-right font-semibold">{r.value}</span></div>)}
        <div className="flex items-center gap-3 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/[0.06]"><FileText className="h-4 w-4" /></span><div><p className="text-[13px] font-medium">Official documents</p><p className="mt-0.5 text-[12px] text-foreground/75">Factsheet and key information not supplied</p></div></div>
        <div className="flex items-center gap-3 py-4"><ShieldCheck className="h-5 w-5 text-pill" /><span className="text-[13px] font-medium">CAL Asset Management</span></div>
      </div></section>
      <Button asChild className="h-12 w-full rounded-full bg-primary text-[14px] font-semibold text-primary-foreground"><Link to="/invest" search={{ product: "unit-trust", method: "instant", fund: fund.name }}><ArrowUpRight className="h-4 w-4" />Invest in this fund</Link></Button>
    </div>
  </MobileLayout>;
}