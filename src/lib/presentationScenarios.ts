import { SAMPLE_TRANSFERS, type DetectedTransfer } from "./detectedTransfers";

type TransferScenario = { kind: "transfers"; count: number; assigned?: number; reminder?: boolean };
type InvestScenario = { kind: "invest"; product: "unit-trust" | "equities" | "treasuries"; method: "instant" | "bank" | "flip" | "recurring" | "payin" | "utflip"; treasury?: "bills" | "bonds" };
type RedeemScenario = { kind: "redeem"; product: "unit-trust" | "equities"; method: "normal" | "instant" | "plan" | "payout" };
export type PresentationScenario = { id: string; label: string; group: string } & (TransferScenario | InvestScenario | RedeemScenario);

// Add future demonstrations here; the presenter renders this catalogue automatically.
export const PRESENTATION_SCENARIOS: PresentationScenario[] = [
  { id: "one-transfer", label: "One transfer received", group: "Sampath transfers", kind: "transfers", count: 1 },
  { id: "two-transfers", label: "Two transfers received", group: "Sampath transfers", kind: "transfers", count: 2 },
  { id: "three-transfers", label: "Three transfers received", group: "Sampath transfers", kind: "transfers", count: 3 },
  { id: "reminder", label: "Dismissed sheet · dashboard reminder", group: "Sampath transfers", kind: "transfers", count: 3, reminder: true },
  { id: "partly-assigned", label: "One confirmed · two left to assign", group: "Sampath transfers", kind: "transfers", count: 3, assigned: 1 },
  { id: "all-assigned", label: "All transfers assigned", group: "Sampath transfers", kind: "transfers", count: 3, assigned: 3, reminder: true },
  { id: "ut-justpay", label: "Justpay (Direct Invest)", group: "Unit Trust investments", kind: "invest", product: "unit-trust", method: "instant" },
  { id: "ut-bank", label: "Bank Transfer", group: "Unit Trust investments", kind: "invest", product: "unit-trust", method: "bank" },
  { id: "fund-flip", label: "Fund Flip", group: "Unit Trust investments", kind: "invest", product: "unit-trust", method: "flip" },
  { id: "recurring", label: "Recurring Investment", group: "Unit Trust investments", kind: "invest", product: "unit-trust", method: "recurring" },
  { id: "normal", label: "Normal Redemption", group: "Redemptions", kind: "redeem", product: "unit-trust", method: "normal" },
  { id: "instant", label: "Instant Redemption", group: "Redemptions", kind: "redeem", product: "unit-trust", method: "instant" },
  { id: "plan", label: "Redemption Plan", group: "Redemptions", kind: "redeem", product: "unit-trust", method: "plan" },
  { id: "equity-payin", label: "Equities · Pay in", group: "Equities & treasuries", kind: "invest", product: "equities", method: "payin" },
  { id: "equity-transfer", label: "Equities · Transfer from Unit Trusts", group: "Equities & treasuries", kind: "invest", product: "equities", method: "utflip" },
  { id: "equity-payout", label: "Equities · Pay Out", group: "Equities & treasuries", kind: "redeem", product: "equities", method: "payout" },
  { id: "bill-bank", label: "Treasury Bills · Bank Transfer", group: "Equities & treasuries", kind: "invest", product: "treasuries", method: "bank", treasury: "bills" },
  { id: "bond-justpay", label: "Treasury Bonds · Justpay", group: "Equities & treasuries", kind: "invest", product: "treasuries", method: "instant", treasury: "bonds" },
];

export function scenarioTransfers(count: number, assigned = 0): DetectedTransfer[] {
  return SAMPLE_TRANSFERS.slice(0, count).map((transfer, index) => ({ ...transfer, fund: index < assigned ? "CAL Income Fund" : undefined }));
}