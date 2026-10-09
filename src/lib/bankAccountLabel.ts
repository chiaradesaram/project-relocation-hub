/** Compact display only; selection values retain the full account details. */
export function bankAccountLabel(bankName: string, accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  return digits ? `${bankName} · ${digits.slice(-3)}` : bankName;
}