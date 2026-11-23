import { FUND_RATES } from "./fundMeta";

export const TRANSFER_REFLECTION_WORKING_DAYS = 1;
export const TRANSFER_FUNDS = Object.keys(FUND_RATES);

export type DetectedTransfer = {
  id: string;
  amount: number;
  received: string;
  reference: string;
  fund?: string;
};

// Illustrative UI data only. Never treated as bank-confirmed transactions.
export const SAMPLE_TRANSFERS: DetectedTransfer[] = [
  { id: "sample-1", amount: 125000, received: "23 Nov · 9:12 AM", reference: "SMP-08241" },
  { id: "sample-2", amount: 50000, received: "22 Nov · 2:36 PM", reference: "SMP-08196" },
  { id: "sample-3", amount: 25000, received: "22 Nov · 10:08 AM", reference: "SMP-08172" },
];

export function applyTransferFund(transfers: DetectedTransfer[], id: string, fund: string): DetectedTransfer[] {
  if (!TRANSFER_FUNDS.includes(fund)) return transfers;
  return transfers.map((transfer) => transfer.id === id && !transfer.fund ? { ...transfer, fund } : transfer);
}