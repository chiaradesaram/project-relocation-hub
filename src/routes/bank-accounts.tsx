import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Building2, Plus, Trash2, Info } from "lucide-react";
import { ModernSelect } from "@/components/ModernSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/bank-accounts")({
  component: BankAccounts,
});

const funds = ["CAL Growth Fund", "CAL Income Fund", "CAL Balanced Fund", "CAL Money Market Fund"];
const subAccounts = ["Main Account", "Joint Account", "Minor Account"];

type BankAccount = {
  bank: string;
  branch: string;
  accNo: string;
  product: string;
  defaultFund: string;
  defaultSubAccount: string;
};

const initialBankAccounts: BankAccount[] = [
  { bank: "Commercial Bank", branch: "Colombo 03", accNo: "8001234521", product: "Unit Trusts", defaultFund: funds[0], defaultSubAccount: subAccounts[0] },
  { bank: "Sampath Bank", branch: "Nugegoda", accNo: "1100568832", product: "Equities", defaultFund: funds[1], defaultSubAccount: subAccounts[0] },
  { bank: "HNB", branch: "Kandy", accNo: "0452201209", product: "Treasuries", defaultFund: funds[0], defaultSubAccount: subAccounts[1] },
];

const productPillClass: Record<string, string> = {
  "Unit Trusts": "bg-primary/25 text-primary ring-1 ring-primary/30",
  Equities:
    "bg-[oklch(0.72_0.14_200)]/25 text-[oklch(0.85_0.14_200)] ring-1 ring-[oklch(0.72_0.14_200)]/40",
  Treasuries:
    "bg-[oklch(0.7_0.2_350)]/25 text-[oklch(0.85_0.18_350)] ring-1 ring-[oklch(0.7_0.2_350)]/40",
};

function BankAccounts() {
  const [accounts, setAccounts] = useState(initialBankAccounts);

  const removeAccount = (accNo: string) =>
    setAccounts((prev) => prev.filter((a) => a.accNo !== accNo));

  const updateAccount = (accNo: string, patch: Partial<BankAccount>) =>
    setAccounts((prev) => prev.map((a) => (a.accNo === accNo ? { ...a, ...patch } : a)));

  return (
    <MobileLayout>
      <PageHeader title="Bank Accounts" showBack />

      <p className="px-4 mt-2 text-[12px] text-muted-foreground">
        Manage your linked bank accounts for investments and redemptions.
      </p>

      {/* Fallback allocation explainer */}
      <div className="mx-4 mt-3 flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 14%, oklch(0.18 0.02 280))" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, var(--portfolio-blue) 35%, transparent)" }}>
          <Info className="w-3.5 h-3.5" style={{ color: "oklch(0.95 0.05 230)" }} />
        </div>
        <p className="text-[12px] text-white/85 leading-snug pt-0.5">
          Each account has a <span className="text-white font-medium">default fund &amp; sub account</span>. If a transfer arrives without a matching in-app request, funds are allocated here. Manual reconciliation may add 1–2 business days.
        </p>
      </div>

      <div className="px-4 mt-3 space-y-2">
        {accounts.map((acc) => (
          <div key={acc.accNo} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{acc.bank}</p>
                  <p className="text-[11px] text-muted-foreground/80 truncate">{acc.branch} branch</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 font-mono tracking-wide">{acc.accNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${productPillClass[acc.product] ?? "bg-muted/30 text-muted-foreground"}`}>
                  {acc.product}
                </span>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-1.5 rounded-md text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${acc.bank} account`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this bank account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {acc.bank} ({acc.accNo}) will no longer be available for {acc.product.toLowerCase()} investments or redemptions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeAccount(acc.accNo)}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Per-account fallback defaults */}
            {acc.product === "Unit Trusts" && (
              <div className="mt-3 pt-3 border-t border-border/40">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground/70 mb-2">
                  Default allocation
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Fund</label>
                    <ModernSelect
                      value={acc.defaultFund}
                      onChange={(e) => updateAccount(acc.accNo, { defaultFund: e.target.value })}
                    >
                      {funds.map((f) => <option key={f}>{f}</option>)}
                    </ModernSelect>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Sub account</label>
                    <ModernSelect
                      value={acc.defaultSubAccount}
                      onChange={(e) => updateAccount(acc.accNo, { defaultSubAccount: e.target.value })}
                    >
                      {subAccounts.map((s) => <option key={s}>{s}</option>)}
                    </ModernSelect>
                  </div>
                </div>
              </div>
            )}
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
