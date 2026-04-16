import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/unit-trusts")({
  component: UnitTrustPortfolio,
});

const accounts = [
  {
    name: "Individual Account",
    balance: "LKR 1,213,749",
    totalEarnings: "LKR 143,749",
    earnings7d: "LKR 16,992",
    earnings30d: "LKR 61,900",
    return7d: "+1.4%",
    return30d: "+5.1%",
    goals: [
      {
        name: "Retirement",
        funds: [
          { name: "CAL Growth Fund", units: "12,450", nav: "28.54", value: "LKR 355,319", earnings7d: "LKR 7,462", earnings30d: "LKR 20,608", return7d: "+2.1%", return30d: "+5.8%", positive7d: true, positive30d: true },
          { name: "CAL Income Fund", units: "8,200", nav: "22.10", value: "LKR 181,220", earnings7d: "LKR 725", earnings30d: "LKR 3,443", return7d: "+0.4%", return30d: "+1.9%", positive7d: true, positive30d: true },
        ],
      },
      {
        name: "Emergency Fund",
        funds: [
          { name: "CAL Money Market Fund", units: "45,000", nav: "15.05", value: "LKR 677,210", earnings7d: "LKR 1,354", earnings30d: "LKR 5,418", return7d: "+0.2%", return30d: "+0.8%", positive7d: true, positive30d: true },
        ],
      },
    ],
  },
  {
    name: "Joint Account",
    balance: "LKR 556,200",
    totalEarnings: "LKR 76,200",
    earnings7d: "-LKR 556",
    earnings30d: "LKR 20,023",
    return7d: "-0.1%",
    return30d: "+3.6%",
    goals: [
      {
        name: "General",
        funds: [
          { name: "CAL Balanced Fund", units: "15,800", nav: "35.20", value: "LKR 556,160", earnings7d: "-LKR 1,668", earnings30d: "LKR 17,797", return7d: "-0.3%", return30d: "+3.2%", positive7d: false, positive30d: true },
        ],
      },
    ],
  },
];

const recentTransactions = [
  { fund: "CAL Growth Fund", type: "Creation", amount: "LKR 100,000", units: "+3,504", date: "Apr 10", positive: true },
  { fund: "CAL Income Fund", type: "Redemption", amount: "LKR 50,000", units: "-2,262", date: "Apr 5", positive: false },
  { fund: "CAL Balanced Fund", type: "Creation", amount: "LKR 200,000", units: "+5,682", date: "Mar 28", positive: true },
  { fund: "CAL Growth Fund", type: "Dividend", amount: "LKR 12,500", units: "+438", date: "Mar 15", positive: true },
];

function UnitTrustPortfolio() {
  const navigate = useNavigate();

  const totalBalance = "LKR 1,769,949";
  const totalEarnings = "LKR 219,949";
  const earnings7d = "LKR 16,436";
  const earnings30d = "LKR 81,923";
  const return7d = "+1.2%";
  const return30d = "+4.5%";
  const lastCreation = "Apr 10, 2026";
  const lastRedemption = "Apr 5, 2026";

  return (
    <MobileLayout>
      <PageHeader title="Unit Trusts" showBack />

      {/* Summary Card */}
      <div className="mx-4 mt-2 gradient-portfolio rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[9px] text-muted-foreground">Total Balance</p>
            <p className="text-sm font-bold text-foreground">{totalBalance}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Total Earnings</p>
            <p className="text-sm font-bold text-success">{totalEarnings}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Return</p>
            <p className="text-sm font-bold text-success">{return30d}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <p className="text-[9px] text-muted-foreground">7-Day Earnings</p>
            <p className="text-xs font-bold text-foreground">{earnings7d}</p>
            <p className="text-[9px] text-success">{return7d}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <p className="text-[9px] text-muted-foreground">30-Day Earnings</p>
            <p className="text-xs font-bold text-foreground">{earnings30d}</p>
            <p className="text-[9px] text-success">{return30d}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 text-center">
          <div>
            <p className="text-[9px] text-muted-foreground">Last Creation</p>
            <p className="text-[10px] font-medium text-foreground">{lastCreation}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Last Redemption</p>
            <p className="text-[10px] font-medium text-foreground">{lastRedemption}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => navigate({ to: "/invest", search: { product: "unit-trust" } })} className="flex-1 gradient-primary text-primary-foreground py-2 rounded-xl text-xs font-semibold">
            Invest
          </button>
          <button onClick={() => navigate({ to: "/invest", search: { product: "unit-trust", action: "redeem" } })} className="flex-1 bg-secondary text-foreground py-2 rounded-xl text-xs font-semibold">
            Redeem
          </button>
        </div>
      </div>

      {/* Accounts & Fund Holdings */}
      {accounts.map((account) => (
        <div key={account.name} className="mx-4 mt-4">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">{account.name.toUpperCase()}</p>
          <div className="glass-card p-3">
            <div className="grid grid-cols-2 gap-2 text-center mb-2">
              <div>
                <p className="text-[9px] text-muted-foreground">Balance</p>
                <p className="text-xs font-bold text-foreground">{account.balance}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground">Total Earnings</p>
                <p className="text-xs font-bold text-success">{account.totalEarnings}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center mb-3">
              <div>
                <p className="text-[9px] text-muted-foreground">7-Day</p>
                <p className="text-[10px] font-medium text-foreground">{account.earnings7d}</p>
                <p className={`text-[9px] ${account.return7d.startsWith("+") ? "text-success" : "text-destructive"}`}>{account.return7d}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground">30-Day</p>
                <p className="text-[10px] font-medium text-foreground">{account.earnings30d}</p>
                <p className="text-[9px] text-success">{account.return30d}</p>
              </div>
            </div>

            {/* Goals Accordion */}
            <Accordion type="multiple" defaultValue={account.goals.map((g) => g.name)} className="space-y-1.5">
              {account.goals.map((goal) => (
                <AccordionItem key={goal.name} value={goal.name} className="border-0">
                  <AccordionTrigger className="text-xs font-medium text-foreground py-1.5 hover:no-underline">{goal.name}</AccordionTrigger>
                  <AccordionContent className="pb-0">
                    {goal.funds.map((fund) => (
                      <div key={fund.name} className="bg-secondary/50 rounded-xl p-3 mb-1.5">
                        <div className="flex justify-between items-center">
                          <p className="text-[11px] font-semibold text-foreground">{fund.name}</p>
                          <p className="text-xs font-bold text-foreground">{fund.value}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                          <div>
                            <p className="text-[8px] text-muted-foreground">Units</p>
                            <p className="text-[10px] font-medium text-foreground">{fund.units}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-muted-foreground">NAV</p>
                            <p className="text-[10px] font-medium text-foreground">{fund.nav}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-muted-foreground">7-Day</p>
                            <p className="text-[10px] font-medium text-foreground">{fund.earnings7d}</p>
                            <p className={`text-[8px] ${fund.positive7d ? "text-success" : "text-destructive"}`}>{fund.return7d}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-muted-foreground">30-Day</p>
                            <p className="text-[10px] font-medium text-foreground">{fund.earnings30d}</p>
                            <p className={`text-[8px] ${fund.positive30d ? "text-success" : "text-destructive"}`}>{fund.return30d}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      ))}

      {/* Transactions */}
      <div className="mx-4 mt-4 mb-4">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">RECENT TRANSACTIONS</p>
        <div className="space-y-2">
          {recentTransactions.map((tx, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.positive ? "bg-success/20" : "bg-destructive/20"}`}>
                {tx.positive ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{tx.fund}</p>
                <p className="text-[10px] text-muted-foreground">{tx.type} · {tx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">{tx.amount}</p>
                <p className={`text-[10px] ${tx.positive ? "text-success" : "text-destructive"}`}>{tx.units} units</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
