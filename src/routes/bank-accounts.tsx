import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Building2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/bank-accounts")({
  component: BankAccounts,
});

const initialBankAccounts = [
  { bank: "Commercial Bank", accNo: "8001234521", product: "Unit Trusts", primary: true },
  { bank: "Sampath Bank", accNo: "1100568832", product: "Equities", primary: false },
  { bank: "HNB", accNo: "0452201209", product: "Treasuries", primary: false },
];

const productPillClass: Record<string, string> = {
  "Unit Trusts": "bg-primary/15 text-primary",
  Equities: "bg-[oklch(0.78_0.16_200)]/15 text-[oklch(0.78_0.16_200)]",
  Treasuries: "bg-[oklch(0.85_0.16_85)]/15 text-[oklch(0.85_0.16_85)]",
};

function BankAccounts() {
  const [accounts, setAccounts] = useState(initialBankAccounts);

  const removeAccount = (accNo: string) => {
    setAccounts((prev) => prev.filter((a) => a.accNo !== accNo));
  };

  return (
    <MobileLayout>
      <PageHeader title="Bank Accounts" showBack />

      <p className="px-4 mt-2 text-[12px] text-muted-foreground">
        Manage your linked bank accounts for investments and redemptions.
      </p>

      <div className="px-4 mt-3 space-y-2">
        {accounts.map((acc) => (
          <div key={acc.accNo} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-foreground">{acc.bank}</p>
                  {acc.primary && (
                    <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Primary</span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5 font-mono tracking-wide">{acc.accNo}</p>
                <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${productPillClass[acc.product] ?? "bg-muted/30 text-muted-foreground"}`}>
                  {acc.product}
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-2 -m-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${acc.bank} account`}
                  >
                    <Trash2 className="w-4 h-4" />
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
