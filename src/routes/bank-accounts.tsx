import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Building2, Plus, ChevronRight, CreditCard } from "lucide-react";

export const Route = createFileRoute("/bank-accounts")({
  component: BankAccounts,
});

const bankAccounts = [
  { bank: "Commercial Bank", accNo: "****4521", type: "Savings", primary: true },
  { bank: "Sampath Bank", accNo: "****8832", type: "Current", primary: false },
  { bank: "HNB", accNo: "****1209", type: "Savings", primary: false },
];

function BankAccounts() {
  return (
    <MobileLayout>
      <PageHeader title="Bank Accounts" showBack />

      <p className="px-4 mt-2 text-[12px] text-muted-foreground">
        Manage your linked bank accounts for investments and redemptions.
      </p>

      <div className="px-4 mt-3 space-y-2">
        {bankAccounts.map((acc) => (
          <div key={acc.accNo} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">{acc.bank}</p>
                {acc.primary && (
                  <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Primary</span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground">{acc.type} · {acc.accNo}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4 mb-6">
        <button className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>
    </MobileLayout>
  );
}
