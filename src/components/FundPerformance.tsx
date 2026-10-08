import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Fund } from "@/data/rateFunds";

const periods = ["Week", "Month", "Year", "All time"] as const;
export function FundPerformance({ fund }: { fund: Fund }) {
  const [period, setPeriod] = useState<typeof periods[number]>("Month");
  const [info, setInfo] = useState(false);
  const end = Number(fund.unitPrice);
  const rate = parseFloat(fund.yield30d) * ({ Week: 0.23, Month: 1, Year: 1.8, "All time": 3.2 }[period]);
  const start = end / (1 + rate / 100);
  const points = Array.from({ length: 32 }, (_, i) => ({ point: i, price: +(start + (end - start) * (i / 31 + (fund.category === "Equity" ? 0.1 : 0.025) * Math.sin(i * 1.7) * Math.sin(Math.PI * i / 31))).toFixed(3) }));
  return <section aria-label="Fund performance" className="rounded-2xl bg-card p-4">
    <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Performance</h2><Button size="icon" variant="ghost" aria-label="About performance data" aria-expanded={info} onClick={() => setInfo(!info)} className="h-8 w-8 rounded-full text-pill"><Info className="h-4 w-4" /></Button></div>
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]"><span className="flex items-center font-semibold text-success"><ArrowUp className="mr-0.5 h-3 w-3" />{rate.toFixed(2)}%</span><span className="text-foreground/85">Unit price: LKR {fund.unitPrice}</span></div>
    <p className="mt-1 text-[12px] text-foreground/70">Illustrative {period.toLowerCase()} performance</p>
    {info && <p className="mt-3 text-[12px] leading-5 text-foreground/85">This chart uses sample values, not historical fund prices. Returns shown are not a forecast.</p>}
    <div className="mt-4 h-[180px] w-full" role="img" aria-label={`Sample ${period.toLowerCase()} unit-price chart for ${fund.name}`}>
      <ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="var(--foreground)" strokeOpacity={0.06} vertical={false} /><XAxis dataKey="point" hide /><YAxis domain={["dataMin", "dataMax"]} tickFormatter={v => Number(v).toFixed(1)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={52} /><Tooltip content={({ active, payload }) => active && payload?.length ? <div className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-foreground">LKR {Number(payload[0]?.value ?? 0).toFixed(2)}</div> : null} /><Area type="monotone" dataKey="price" stroke="var(--success)" fill="var(--success)" fillOpacity={0.06} strokeWidth={2} isAnimationActive={false} /></AreaChart></ResponsiveContainer>
    </div>
    <div className="mt-2 flex justify-between text-[12px] text-foreground/75"><span>Period start</span><span>14 Apr 2026</span></div>
    <div role="group" aria-label="Performance period" className="mt-4 grid grid-cols-4 gap-1">{periods.map(p => <Button key={p} variant="ghost" onClick={() => setPeriod(p)} aria-pressed={period === p} className={`h-9 rounded-full px-1 text-[12px] ${period === p ? "bg-pill/20 text-pill hover:bg-pill/25" : "text-foreground/90"}`}>{p}</Button>)}</div>
    <p className="mt-4 text-[12px] leading-5 text-foreground/75">Past performance is not a reliable indicator of future returns. Investments can fall as well as rise.</p>
  </section>;
}