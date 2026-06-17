import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Building2, Plus, Trash2 } from "lucide-react";
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

type BankAccount = {
  bank: string;
  branch: string;
  accNo: string;
  product: string;
};

const initialBankAccounts: BankAccount[] = [
  { bank: "Commercial Bank", branch: "Colombo 03", accNo: "8001234521", product: "Unit Trusts" },
  { bank: "Sampath Bank", branch: "Nugegoda", accNo: "1100568832", product: "Equities" },
  { bank: "HNB", branch: "Kandy", accNo: "0452201209", product: "Treasuries" },
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

  return (
    <MobileLayout>
      <PageHeader title="Bank Accounts" showBack />

      <p className="px-4 mt-2 text-[12px] text-muted-foreground">
        Manage your linked bank accounts for investments and redemptions.
      </p>

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
                  <p className="text-[12px] text-muted-foreground/80 truncate">{acc.branch} branch</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 font-mono tracking-wide">{acc.accNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${productPillClass[acc.product] ?? "bg-muted/30 text-muted-foreground"}`}>
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
