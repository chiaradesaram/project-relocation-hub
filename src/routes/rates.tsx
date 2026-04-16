import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, ChevronDown, ChevronUp, Download, Calculator, Info } from "lucide-react";

export const Route = createFileRoute("/rates")({
  component: Rates,
});

const fundsData = [
  { name: "CAL Growth Fund", rate: "28.54", yield30d: "12.5%", unitPrice: "28.54", priceAsOf: "Apr 14, 2026", fundSize: "LKR 2.1B", needsSignup: false, description: "Aims for long-term capital appreciation by investing primarily in equities listed on the CSE.", factsheet: "#" },
  { name: "CAL Income Fund", rate: "15.21", yield30d: "6.8%", unitPrice: "15.21", priceAsOf: "Apr 14, 2026", fundSize: "LKR 1.5B", needsSignup: false, description: "Focuses on generating regular income through investments in fixed income securities.", factsheet: "#" },
  { name: "CAL Balanced Fund", rate: "20.15", yield30d: "9.2%", unitPrice: "20.15", priceAsOf: "Apr 14, 2026", fundSize: "LKR 800M", needsSignup: false, description: "A diversified fund that balances equity and fixed income investments.", factsheet: "#" },
  { name: "CAL Money Market Fund", rate: "10.05", yield30d: "3.1%", unitPrice: "10.05", priceAsOf: "Apr 14, 2026", fundSize: "LKR 3.2B", needsSignup: false, description: "Invests in short-term, high-quality money market instruments.", factsheet: "#" },
  { name: "CAL Equity Fund", rate: "32.80", yield30d: "15.2%", unitPrice: "32.80", priceAsOf: "Apr 14, 2026", fundSize: "LKR 950M", needsSignup: true, description: "Invests in a concentrated portfolio of high-conviction equity picks on the CSE.", factsheet: "#" },
  { name: "CAL Fixed Income Fund", rate: "12.34", yield30d: "5.5%", unitPrice: "12.34", priceAsOf: "Apr 14, 2026", fundSize: "LKR 1.8B", needsSignup: true, description: "Targets stable returns from a diversified portfolio of fixed income securities.", factsheet: "#" },
];

const YieldCalculator = () => {
  const [selectedFund, setSelectedFund] = useState(fundsData[0].name);
  const [startDate, setStartDate] = useState("2026-03-14");
  const [endDate, setEndDate] = useState("2026-04-14");
  const [startPrice, setStartPrice] = useState("25.00");
  const [endPrice, setEndPrice] = useState("25.80");
  const [showExplanation, setShowExplanation] = useState(false);

  const sp = parseFloat(startPrice) || 0;
  const ep = parseFloat(endPrice) || 0;
  const sd = new Date(startDate);
  const ed = new Date(endDate);
  const days = Math.max(1, Math.round((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24)));
  const periodReturn = sp > 0 ? ((ep - sp) / sp) * 100 : 0;
  const annualizedYield = sp > 0 ? (Math.pow(ep / sp, 365 / days) - 1) * 100 : 0;

  return (
    <div className="mx-4 mt-3 glass-card p-4 space-y-3">
      <div>
        <label className="text-[10px] text-muted-foreground">Fund</label>
        <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)} className="w-full bg-secondary rounded-xl p-2.5 text-[11px] text-foreground outline-none">
          {fundsData.map((f) => <option key={f.name}>{f.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[11px] text-foreground outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[11px] text-foreground outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Start Unit Price</label>
          <input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[11px] text-foreground outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">End Unit Price</label>
          <input type="number" value={endPrice} onChange={(e) => setEndPrice(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-[11px] text-foreground outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[9px] text-muted-foreground">Period ({days}d)</p>
          <p className="text-sm font-bold text-success">{periodReturn.toFixed(2)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[9px] text-muted-foreground">Annualized</p>
          <p className="text-sm font-bold text-success">{annualizedYield.toFixed(2)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-2">
          <p className="text-[9px] text-muted-foreground">Price Δ</p>
          <p className="text-sm font-bold text-foreground">{(ep - sp).toFixed(2)}</p>
        </div>
      </div>
      <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
        <Info className="w-3 h-3" />
        {showExplanation ? "Hide" : "How is this calculated?"}
      </button>
      {showExplanation && (
        <div className="bg-secondary/50 rounded-xl p-3 text-[11px] text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Return Calculation</p>
          <p><strong>Period Return</strong> = (End − Start) ÷ Start × 100</p>
          <p>= ({endPrice} − {startPrice}) ÷ {startPrice} × 100 = {periodReturn.toFixed(2)}%</p>
          <p><strong>Annualized Yield</strong> = [(End ÷ Start) ^ (365 ÷ Days)] − 1 × 100</p>
          <p>= ({endPrice} ÷ {startPrice}) ^ (365 ÷ {days}) − 1 = {annualizedYield.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

function Rates() {
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rates" | "calculator">("rates");

  return (
    <MobileLayout>
      <PageHeader title="Rates" showBack />

      {/* Tabs */}
      <div className="mx-4 mt-2">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {(["rates", "calculator"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                activeTab === tab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
              }`}
            >
              {tab === "calculator" && <Calculator className="w-3.5 h-3.5" />}
              {tab === "rates" ? "Fund Rates" : "Calculator"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "rates" ? (
        <div className="px-4 mt-3 space-y-2">
          {fundsData.map((fund) => (
            <div key={fund.name} className="glass-card overflow-hidden">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{fund.name}</p>
                  <button onClick={() => setExpandedFund(expandedFund === fund.name ? null : fund.name)} className="p-1">
                    {expandedFund === fund.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Unit Price</p>
                    <p className="text-sm font-bold text-foreground">{fund.unitPrice}</p>
                    <p className="text-[8px] text-muted-foreground">{fund.priceAsOf}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">30d Yield</p>
                    <p className="text-sm font-bold text-success">{fund.yield30d}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Fund Size</p>
                    <p className="text-sm font-bold text-foreground">{fund.fundSize.replace("LKR ", "")}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <a href={fund.factsheet} className="text-[10px] text-primary flex items-center gap-0.5">
                    <Download className="w-3 h-3" /> Factsheet
                  </a>
                  <button className="ml-auto text-[10px] gradient-primary text-primary-foreground px-3 py-1 rounded-lg font-medium">
                    {fund.needsSignup ? "Add Fund" : "Invest"}
                  </button>
                </div>
              </div>

              {expandedFund === fund.name && (
                <div className="px-3 pb-3 border-t border-border/30 pt-2">
                  <p className="text-[11px] text-muted-foreground">{fund.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <YieldCalculator />
      )}
    </MobileLayout>
  );
}
