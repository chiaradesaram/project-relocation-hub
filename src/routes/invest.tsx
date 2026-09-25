import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import {
  Zap,
  Building2,
  ArrowLeftRight,
  ChevronRight,
  ChevronDown,
  Upload,
  AlertTriangle,
  Star,
  RefreshCw,
  X,
  Image as ImageIcon,
  Check,
  Wallet,
  CalendarDays,
  ArrowDown,
  PieChart,
  BarChart3,
  CheckCircle2,
  Plus,
  Copy,
  Split,
  CalendarClock,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { EQUITY_SETTLEMENT_KEY } from "./requests.equity-settlement";
import SavedConfirmation from "@/components/SavedConfirmation";
import { Switch } from "@/components/ui/switch";
import ModernSelect from "@/components/ModernSelect";
import { Calendar } from "@/components/ui/calendar";
import { formatAmountDisplay, sanitizeAmountInput } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type InvestMethod =
  | "instant"
  | "bank"
  | "flip"
  | "payin"
  | "utflip"
  | "default"
  | "recurring";

export const Route = createFileRoute("/invest")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { product?: string; method?: InvestMethod; mode?: "setup"; edit?: string } => ({
    product: typeof search.product === "string" ? search.product : undefined,
    method:
      search.method === "instant" ||
      search.method === "bank" ||
      search.method === "flip" ||
      search.method === "payin" ||
      search.method === "utflip" ||
      search.method === "default" ||
      search.method === "recurring"
        ? (search.method as InvestMethod)
        : undefined,
    mode: search.mode === "setup" ? "setup" : undefined,
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Invest — CAL" },
      { name: "description", content: "Invest, transfer funds, and manage recurring investments with CAL." },
      { property: "og:title", content: "Invest — CAL" },
      { property: "og:description", content: "Invest, transfer funds, and manage recurring investments with CAL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Invest,
});

import { isPopularFund } from "@/lib/fundMeta";
import { ViewRatesLink } from "@/components/ViewRates";
import { RadioDot } from "@/components/RadioDot";
import { Button } from "@/components/ui/button";
import {
  type RecurringInvestmentPlan,
  readRecurringInvestments,
  writeRecurringInvestments,
} from "@/lib/recurringInvestment";
import bankTransferInfo from "@/assets/bank-transfer-info.png";
import commercialLogo from "@/assets/banks/commercial.png";
import deutscheLogo from "@/assets/banks/deutsche.png";
import sampathLogo from "@/assets/banks/sampath.png";
import hnbLogo from "@/assets/banks/hnb.png";
import bocLogo from "@/assets/banks/boc.png";

const bankLogos: Record<string, string> = {
  "Commercial Bank": commercialLogo,
  "Deutsche Bank": deutscheLogo,
  "Sampath Bank": sampathLogo,
  HNB: hnbLogo,
  BOC: bocLogo,
};

const bankLogoFor = (opt: string) =>
  Object.entries(bankLogos).find(([name]) => opt.startsWith(name))?.[1];



const funds = [
  "CAL Growth Fund",
  "CAL Income Fund",
  "CAL Balanced Fund",
  "CAL Money Market Fund",
];
const accounts = ["Main Account", "Joint Account", "Minor Account"];

// Sub accounts with available balances, used by Fund Flip (transfer from / to)
const fundSubAccounts: Record<string, { name: string; value: string }[]> = {
  "CAL Growth Fund": [
    { name: "Chiara's wealth account", value: "LKR 150,000.00" },
    { name: "Retirement", value: "LKR 92,500.00" },
    { name: "General", value: "LKR 41,200.00" },
  ],
  "CAL Income Fund": [
    { name: "Personal account", value: "LKR 84,300.00" },
    { name: "Emergency", value: "LKR 36,700.00" },
  ],
  "CAL Balanced Fund": [
    { name: "Personal account", value: "LKR 61,800.00" },
    { name: "New car", value: "LKR 24,950.00" },
  ],
  "CAL Money Market Fund": [
    { name: "Personal account", value: "LKR 32,100.00" },
    { name: "Short term", value: "LKR 18,450.00" },
  ],
};
const subAccountsOf = (fund: string) => fundSubAccounts[fund] ?? [];
const balanceOf = (fund: string, sub: string) =>
  subAccountsOf(fund).find((s) => s.name === sub)?.value ?? "LKR 0.00";
const banks = [
  "Commercial Bank · 8001 2345 21",
  "Deutsche Bank · 9004 5561 12",
  "Sampath Bank · 1100 5688 32",
  "HNB · 0452 2012 09",
  "BOC · 7700 8934 81",
];
const calBankAccounts = [
  { label: "CAL Securities Account", note: "Deutsche Bank · Auto-verified" },
  { label: "CAL · Commercial Bank", note: "8001 2345 678" },
  { label: "CAL · HNB", note: "7700 1234 567 · Closing soon" },
];

export const DIRECT_INVEST_LIMIT = 149950;
export const DIRECT_INVEST_MAX_TRANSFERS = 3;

// Splits a direct invest amount into transfers of at most DIRECT_INVEST_LIMIT.
// Returns a single-part array when the amount fits in one transfer.
export function directInvestSplits(amountNum: number): number[] {
  if (amountNum <= 0) return [];
  const repeats = Math.min(
    DIRECT_INVEST_MAX_TRANSFERS,
    Math.ceil(amountNum / DIRECT_INVEST_LIMIT),
  );
  return Array.from({ length: repeats }, (_, i) =>
    i < repeats - 1
      ? DIRECT_INVEST_LIMIT
      : amountNum - DIRECT_INVEST_LIMIT * (repeats - 1),
  );
}

export const SETTLEMENT_FUND_KEY = "equitySettlementFund";
export const SETTLEMENT_ACCOUNT_KEY = "equitySettlementAccount";

function Invest() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const isEquities = search.product === "equities";
  const [equitySettlementEnabled, setEquitySettlementEnabled] = useState(false);
  const [settlementFund, setSettlementFund] = useState("");
  const [settlementAccount, setSettlementAccount] = useState("");
  const [settlementSheet, setSettlementSheet] = useState(false);
  const [settlementSaved, setSettlementSaved] = useState(false);
  const [settlementPicker, setSettlementPicker] = useState<
    null | "fund" | "account"
  >(null);

  useEffect(() => {
    setEquitySettlementEnabled(
      localStorage.getItem(EQUITY_SETTLEMENT_KEY) === "enabled",
    );
    setSettlementFund(localStorage.getItem(SETTLEMENT_FUND_KEY) ?? "");
    setSettlementAccount(localStorage.getItem(SETTLEMENT_ACCOUNT_KEY) ?? "");
  }, []);

  // Method picker landing
  if (!search.method) {
    const methodCards: {
      id: InvestMethod;
      icon: typeof Zap;
      label: string;
      desc: string;
    }[] = isEquities
      ? [
          {
            id: "payin",
            icon: Wallet,
            label: "Pay in",
            desc:
              "Transfer funds to CAL's bank account and make a Pay In request to fund your cash balance.",
          },
          {
            id: "instant",
            icon: Zap,
            label: "Direct Invest",
            desc:
              "Transfer and Create: Invest directly through the CAL app, your bank account is debited automatically (using Justpay).",
          },
          {
            id: "utflip",
            icon: ArrowLeftRight,
            label: "Transfer from Unit Trusts",
            desc: "Move money from a unit trust into your equity account.",
          },
        ]
      : [
      {
        id: "bank",
        icon: Building2,
        label: "Bank Transfer",
        desc:
          "Transfer funds to CAL's bank account and make a Creation Request.",
      },
      {
        id: "instant",
        icon: Zap,
        label: "Direct Invest",
        desc:
          "Transfer and Create: Invest directly through the CAL app, your bank account is debited automatically (using Justpay).",
      },
      {
        id: "flip",
        icon: ArrowLeftRight,
        label: "Fund Flip",
        desc: "Move your investment from one fund to another.",
      },
      {
        id: "recurring",
        icon: CalendarDays,
        label: "Recurring Investment",
        desc: "Set up regular investments to be made automatically.",
      },
      {
        id: "default",
        icon: Star,
        label: "Default Fund",
        desc:
          "Set a default fund, so when you transfer money to CAL, you don't need to make a separate creation request.",
      },
    ];


    return (
      <MobileLayout>
        <PageHeader title="Invest" showBack helpTopic="invest" />
        <div className="px-4 mt-2">
          <p className="text-[13px] text-muted-foreground leading-snug">
            How would you like to invest?
          </p>
        </div>

        <div className="mx-4 mt-4 space-y-2.5">
          {methodCards.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() =>
                navigate({
                  to: "/invest",
                  search: { ...search, method: id },
                })
              }
              className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-4 py-4 text-left transition hover:bg-muted/10"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--pill)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {label}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                  {desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        {isEquities && (
          <>
            <div className="mx-4 mt-2.5">
            <button
              onClick={() => setSettlementSheet(true)}
              className="w-full text-left"
            >
              <div className="rounded-2xl bg-card/60 backdrop-blur-md px-4 py-4 flex items-center gap-3.5 transition hover:bg-muted/10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--pill) 22%, transparent)",
                  }}
                >
                  <RefreshCw
                    className="w-5 h-5"
                    style={{ color: "var(--pill)" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground leading-tight">
                    Equity auto settlements
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                    {equitySettlementEnabled
                      ? settlementFund
                        ? `Settling from ${settlementFund}${
                            settlementAccount ? ` · ${settlementAccount}` : ""
                          }`
                        : "On · choose a unit trust fund to settle from"
                      : "Auto debit from unit trust when cash balance is insufficient."}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--pill) 20%, transparent)",
                    color: "var(--pill)",
                  }}
                >
                  {equitySettlementEnabled ? "On" : "Off"}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </button>
            </div>

            <Sheet
              open={settlementSheet}
              onOpenChange={(o) => {
                setSettlementSheet(o);
                if (o) setSettlementSaved(false);
              }}
            >
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Equity auto settlements</SheetTitle>
                </SheetHeader>
                  {settlementSaved ? (
                    <SavedConfirmation
                      summary={
                        equitySettlementEnabled
                          ? `Settling from ${settlementFund} · ${settlementAccount}`
                          : "Auto settlements turned off"
                      }
                    />
                  ) : (
                  <div className="px-1 pb-6 space-y-3">
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    When your cash balance doesn't cover a stock settlement,
                    we'll auto debit the shortfall from the unit trust fund you
                    choose below.
                  </p>

                  <div className="rounded-2xl bg-card/60 px-4 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground">
                        Auto settlements
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {equitySettlementEnabled ? "Turned on" : "Turned off"}
                      </p>
                    </div>
                    <Switch
                      checked={equitySettlementEnabled}
                      onCheckedChange={(on) => {
                        localStorage.setItem(
                          EQUITY_SETTLEMENT_KEY,
                          on ? "enabled" : "disabled",
                        );
                        setEquitySettlementEnabled(on);
                      }}
                    />
                  </div>

                  {equitySettlementEnabled && (
                    <div className="rounded-2xl bg-card/60 divide-y divide-border/40">
                      <button
                        onClick={() => setSettlementPicker("fund")}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] text-muted-foreground">
                            Settle from fund
                          </p>
                          <p className="text-sm text-foreground mt-0.5 truncate">
                            {settlementFund || "Select a fund"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                      <button
                        onClick={() => setSettlementPicker("account")}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] text-muted-foreground">
                            Sub account
                          </p>
                          <p className="text-sm text-foreground mt-0.5 truncate">
                            {settlementAccount || "Select a sub account"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSettlementSaved(true);
                      window.setTimeout(() => {
                        setSettlementSheet(false);
                        setSettlementSaved(false);
                      }, 1300);
                    }}
                    disabled={
                      equitySettlementEnabled &&
                      (!settlementFund || !settlementAccount)
                    }
                    className="w-full h-12 rounded-full text-sm font-semibold disabled:opacity-40"
                    style={{
                      background: "var(--pill)",
                      color: "var(--background)",
                    }}
                  >
                    Done
                  </button>
                </div>
                  )}
              </SheetContent>
            </Sheet>

            <Sheet
              open={settlementPicker !== null}
              onOpenChange={(o) => !o && setSettlementPicker(null)}
            >
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>
                    {settlementPicker === "account"
                      ? "Select sub account"
                      : "Select fund"}
                  </SheetTitle>
                </SheetHeader>
                {settlementPicker === "fund" && (
                  <div className="px-5 pt-3 flex justify-end">
                    <ViewRatesLink />
                  </div>
                )}
                <div className="pb-6 space-y-1.5">
                  {(settlementPicker === "account" ? accounts : funds).map(
                    (option) => {
                      const selected =
                        settlementPicker === "account"
                          ? settlementAccount === option
                          : settlementFund === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            if (settlementPicker === "account") {
                              setSettlementAccount(option);
                              localStorage.setItem(
                                SETTLEMENT_ACCOUNT_KEY,
                                option,
                              );
                            } else {
                              setSettlementFund(option);
                              localStorage.setItem(SETTLEMENT_FUND_KEY, option);
                            }
                            setSettlementPicker(null);
                          }}
                          className="w-full rounded-2xl bg-card/60 px-4 py-3.5 flex items-center gap-3 text-left"
                        >
                          <span className="flex-1 text-sm text-foreground truncate">
                            {option}
                          </span>
                          {settlementPicker === "fund" &&
                            isPopularFund(option) && (
                              <span className="shrink-0 rounded-full bg-pill/15 px-1.5 py-px text-[10px] font-medium text-pill">
                                Popular
                              </span>
                            )}
                          <RadioDot selected={selected} />
                        </button>
                      );
                    },
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </MobileLayout>
    );
  }

  if (search.method === "default") return <DefaultFundForm />;
  if (search.method === "recurring" && search.mode !== "setup") {
    return <RecurringInvestments />;
  }
  if (isEquities) return <EquitiesForm method={search.method} />;
  if (search.method === "payin" || search.method === "utflip")
    return <EquitiesForm method={search.method} />;
  return <MethodForm method={search.method} />;
}

function RecurringInvestments() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<RecurringInvestmentPlan[]>([]);
  const [manageId, setManageId] = useState<string | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedSummary, setSavedSummary] = useState("Your recurring investment is active");
  const [loaded, setLoaded] = useState(false);

  const managed = plans.find((p) => p.id === manageId) ?? null;

  useEffect(() => {
    setPlans(readRecurringInvestments());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("recurringInvestmentSaved") !== "true") return;
    localStorage.removeItem("recurringInvestmentSaved");
    setSavedOpen(true);
  }, []);

  const fmtPlanDate = (p: RecurringInvestmentPlan) =>
    new Date(`${p.startDate}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const updateActive = (active: boolean) => {
    if (!managed) return;
    const next = plans.map((p) => (p.id === managed.id ? { ...p, active } : p));
    writeRecurringInvestments(next);
    setPlans(next);
    setManageId(null);
    setSavedSummary(
      active ? "Your recurring investment is active" : "Your recurring investment is paused",
    );
    window.setTimeout(() => setSavedOpen(true), 180);
  };

  const removePlan = () => {
    if (!managed) return;
    const next = plans.filter((p) => p.id !== managed.id);
    writeRecurringInvestments(next);
    setPlans(next);
    setManageId(null);
  };

  const startSetup = () =>
    navigate({
      to: "/invest",
      search: { product: "unit-trust", method: "recurring", mode: "setup" },
    });

  const startEdit = () => {
    if (!managed) return;
    const editId = managed.id;
    setManageId(null);
    navigate({
      to: "/invest",
      search: { product: "unit-trust", method: "recurring", mode: "setup", edit: editId },
    });
  };

  return (
    <MobileLayout>
      <PageHeader title="Recurring Investments" showBack helpTopic="invest" />
      {!loaded ? null : plans.length === 0 ? (
        <div className="px-6 pt-20 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklch, var(--pill) 18%, transparent)" }}
          >
            <CalendarClock className="h-7 w-7 text-pill" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">No recurring investments yet</h2>
          <p className="mx-auto mt-2 max-w-[290px] text-[13px] leading-relaxed text-muted-foreground">
            Set an amount and date, and we’ll invest it automatically each month.
          </p>
          <Button
            type="button"
            onClick={startSetup}
            className="mt-7 h-12 rounded-full bg-pill px-6 text-[14px] font-semibold text-pill-foreground hover:bg-pill/90"
          >
            <Plus className="h-4 w-4" />
            Add recurring investment
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <p className="px-1 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            {plans.length > 1 ? "Your plans" : "Your plan"}
          </p>
          {plans.map((plan) => {
            const formattedDate = fmtPlanDate(plan);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setManageId(plan.id)}
                className="mt-2 w-full rounded-2xl bg-card/60 px-4 py-3.5 text-left backdrop-blur-md transition hover:bg-muted/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "color-mix(in oklch, var(--pill) 20%, transparent)" }}
                  >
                    <CalendarClock className="h-5 w-5 text-pill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-tight text-foreground">
                      LKR {Number(plan.amount).toLocaleString()}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {plan.fund} · {plan.account}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      plan.active ? "bg-pill/15 text-pill" : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {plan.active ? "Active" : "Paused"}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-border/20 pt-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--pill)" }} />
                  <p className="truncate text-[12px] text-muted-foreground">
                    {plan.frequency} · Next investment{" "}
                    <span className="font-medium text-foreground">{formattedDate}</span>
                  </p>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={startSetup}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-card/60 px-4 py-3.5 text-left backdrop-blur-md transition hover:bg-muted/10"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: "color-mix(in oklch, var(--pill) 20%, transparent)" }}
            >
              <Plus className="h-5 w-5 text-pill" />
            </div>
            <span className="text-[15px] font-semibold text-pill">Add another plan</span>
          </button>
        </div>
      )}

      <Sheet
        open={manageId !== null}
        onOpenChange={(open) => {
          if (!open) setManageId(null);
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/30 bg-card px-5 pb-8">
          <SheetHeader className="pb-0">
            <SheetTitle className="text-base text-foreground">Manage recurring investment</SheetTitle>
          </SheetHeader>
          {managed && (
            <div className="mt-5">
              <div className="rounded-2xl bg-background/40 px-4 py-1">
                <ManageRow label="Amount" value={`LKR ${Number(managed.amount).toLocaleString()}`} />
                <ManageRow label="Fund" value={managed.fund} />
                <ManageRow label="Sub-account" value={managed.account} />
                <ManageRow label="From" value={managed.bank} />
                <ManageRow label="Frequency" value={managed.frequency} />
                <ManageRow label="Next investment" value={fmtPlanDate(managed)} last />
              </div>
              <Button
                type="button"
                onClick={() => updateActive(!managed.active)}
                className="mt-4 h-12 w-full rounded-full bg-pill text-pill-foreground hover:bg-pill/90"
              >
                {managed.active ? <PauseCircle /> : <PlayCircle />}
                {managed.active ? "Pause investment" : "Resume investment"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={startEdit}
                className="mt-2 h-12 w-full rounded-full"
              >
                Edit details
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={removePlan}
                className="mt-2 h-11 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
                Remove recurring investment
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/30 bg-card px-5 pb-2">
          <SavedConfirmation summary={savedSummary} />
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function ManageRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${last ? "" : "border-b border-border/20"}`}>
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="max-w-[62%] text-right text-[12px] font-medium text-foreground">{value}</span>
    </div>
  );
}

type PickerKind = null | "fund" | "account" | "payFrom" | "payTo" | "flipTo";

function MethodForm({
  method,
}: {
  method: Exclude<InvestMethod, "payin" | "utflip" | "default">;
}) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("Personal Account");
  const [selectedBank, setSelectedBank] = useState(
    method === "bank" ? "Commercial Bank · 8001 2345 21" : "",
  );
  const [selectedPayTo, setSelectedPayTo] = useState(
    method === "bank" ? "CAL Securities Account" : "",
  );
  const [selectedFlipTo, setSelectedFlipTo] = useState("");
  // Fund Flip: source and destination fund + sub account
  const [flipFromFund, setFlipFromFund] = useState(funds[0]!);
  const [flipFromSub, setFlipFromSub] = useState(
    subAccountsOf(funds[0]!)[0]!.name,
  );
  const [flipToFund, setFlipToFund] = useState(funds[1]!);
  const [flipToSub, setFlipToSub] = useState(subAccountsOf(funds[1]!)[0]!.name);
  const [flipPicker, setFlipPicker] = useState<null | "from" | "to">(null);
  const [draftFund, setDraftFund] = useState(funds[0]!);
  const [draftSub, setDraftSub] = useState(subAccountsOf(funds[0]!)[0]!.name);
  const [proofName, setProofName] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerKind>(null);
  const [linkedGoal, setLinkedGoal] = useState<string | null>(null);
  const isRecurringMethod = method === "recurring";
  const [recurring, setRecurring] = useState(isRecurringMethod);
  const [recurringStartDate, setRecurringStartDate] = useState(new Date());
  const recurringFrequency = "Monthly";

  const { edit: editPlanId } = Route.useSearch();

  useEffect(() => {
    if (!isRecurringMethod) return;
    const all = readRecurringInvestments();
    const saved = (editPlanId ? all.find((p) => p.id === editPlanId) : null) ?? all[0] ?? null;
    if (!saved) return;
    setAmount(saved.amount);
    setSelectedFund(saved.fund);
    setSelectedAccount(saved.account);
    setSelectedBank(saved.bank);
    const parsedDate = new Date(`${saved.startDate}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) setRecurringStartDate(parsedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecurringMethod]);

  const title =
    method === "instant"
      ? "Direct Invest"
      : method === "bank"
        ? "Bank transfer"
        : method === "recurring"
          ? "Recurring Investment"
          : "Fund Flip";

  const isBank = method === "bank";
  const isFlip = method === "flip";
  const isInstant = method === "instant" || isRecurringMethod;
  const [bankInfoOpen, setBankInfoOpen] = useState(false); // opens the info bottom sheet
  const [accountCopied, setAccountCopied] = useState(false);


  const amountNum = parseFloat(amount || "0") || 0;

  const handleAmountChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    if (isInstant) {
      const n = parseFloat(sanitized || "0") || 0;
      if (n > DIRECT_INVEST_LIMIT * DIRECT_INVEST_MAX_TRANSFERS) {
        setAmount(String(DIRECT_INVEST_LIMIT * DIRECT_INVEST_MAX_TRANSFERS));
        return;
      }
    }
    setAmount(sanitized);
  };

  const splits = isInstant ? directInvestSplits(amountNum) : [];

  const payFromLabel = isFlip ? "Transfer from" : isBank ? "Paid from" : "Paying from";
  const payFromValue = isFlip ? selectedFund : selectedBank;
  const payFromPlaceholder = isFlip ? "Select a fund" : "Select bank account";

  const sendToLabel = isFlip ? "Transfer to" : isBank ? "Sent to" : "Send to";
  const sendToValue = isFlip ? selectedFlipTo : selectedPayTo;
  const sendToPlaceholder = isFlip
    ? "Select destination fund"
    : "Select CAL account";

  const isDeutsche = selectedPayTo.toLowerCase().includes("deutsche");
  const needsProof = isBank && !isDeutsche;

  // Next 2nd Monday of October — when new units will be created for bank transfers
  const unitCreationDate = (() => {
    const secondMonday = (y: number) => {
      const firstDay = new Date(y, 9, 1).getDay();
      return 1 + ((8 - firstDay) % 7) + 7;
    };
    const now = new Date();
    let y = now.getFullYear();
    if (now > new Date(y, 9, secondMonday(y), 23, 59)) y += 1;
    const d = new Date(y, 9, secondMonday(y));
    const day = d.getDate();
    const ord =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";
    return `${day}${ord} October, ${d.toLocaleDateString("en-GB", { weekday: "short" })}`;
  })();

  // ---- Fund Flip balances ----
  const parseLkr = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
  const fmtLkr = (n: number) =>
    `LKR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const flipFromBalance = parseLkr(balanceOf(flipFromFund, flipFromSub));
  const flipToBalance = parseLkr(balanceOf(flipToFund, flipToSub));
  const projectedFrom = flipFromBalance - amountNum;
  const isOverBalance = isFlip && projectedFrom < 0;
  const isSameAccount =
    isFlip && flipFromFund === flipToFund && flipFromSub === flipToSub;
  const showFlipPreview = isFlip && amountNum > 0;

  const openFlipPicker = (which: "from" | "to") => {
    setDraftFund(which === "from" ? flipFromFund : flipToFund);
    setDraftSub(which === "from" ? flipFromSub : flipToSub);
    setFlipPicker(which);
  };
  const draftSubOptions = subAccountsOf(draftFund);

  const canReview = (() => {
    if (amountNum <= 0) return false;
    if (isFlip) return !isOverBalance && !isSameAccount;
    if (!selectedFund || !selectedAccount) return false;
    if (isInstant) return !!selectedBank;
    if (isBank) return !!selectedBank && !!selectedPayTo && (!needsProof || !!proofName);
    return false;
  })();

  const handleReview = () => {
    navigate({
      to: "/invest-summary",
      search: {
        method,
        amount: amount || "0",
        fund: isFlip ? flipFromFund : selectedFund,
        account: isFlip ? flipFromSub : selectedAccount,
        bank: isFlip
          ? `${flipToFund} · ${flipToSub}`
          : isInstant
            ? selectedBank
            : selectedPayTo,
        fromBank: isBank ? selectedBank : undefined,
        repeats: String(Math.max(1, splits.length)),
        startDate: isRecurringMethod
          ? recurringStartDate.toISOString().slice(0, 10)
          : undefined,
        frequency: isRecurringMethod ? recurringFrequency : undefined,
        edit: isRecurringMethod ? editPlanId : undefined,
      },
    });
  };

  // ---- Picker options ----
  const pickerOptions: Record<Exclude<PickerKind, null>, string[]> = {
    fund: funds,
    account: accounts,
    payFrom: isFlip ? funds : banks,
    payTo: calBankAccounts.map((a) => a.label),
    flipTo: funds,
  };
  const pickerTitles: Record<Exclude<PickerKind, null>, string> = {
    fund: "Select fund",
    account: "Select sub-account",
    payFrom: isFlip ? "Transfer from" : isBank ? "Paid from" : "Paying from",
    payTo: isBank ? "Sent to" : "Send to",
    flipTo: "Transfer to",
  };

  const handlePick = (value: string) => {
    if (picker === "fund") setSelectedFund(value);
    if (picker === "account") setSelectedAccount(value);
    if (picker === "payFrom") {
      if (isFlip) setSelectedFund(value);
      else setSelectedBank(value);
    }
    if (picker === "payTo") setSelectedPayTo(value);
    if (picker === "flipTo") setSelectedFlipTo(value);
    setPicker(null);
  };

  return (
    <MobileLayout>
      <PageHeader title={title} showBack helpTopic="invest" />

      {/* Bank transfer info — Monzo-style link that opens a bottom sheet */}
      {isBank && (
        <div className="mx-4 mt-4">
          <button
            type="button"
            onClick={() => setBankInfoOpen(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--pill)" }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--pill) 20%, transparent)",
              }}
            >
              ?
            </span>
            Learn how it works
          </button>
          <Sheet open={bankInfoOpen} onOpenChange={setBankInfoOpen}>
            <SheetContent side="bottom" className="rounded-t-3xl p-0 pb-0">
              <img
                src={bankTransferInfo}
                alt=""
                loading="lazy"
                width={1024}
                height={768}
                className="w-full h-36 object-cover"
              />
              <div className="px-5 pt-4 pb-8">
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                      style={{
                        background:
                          "color-mix(in oklch, var(--pill) 24%, transparent)",
                        color: "var(--pill)",
                      }}
                    >
                      1
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug pt-0.5">
                        Transfer to CAL's Deutsche Bank account
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard
                            ?.writeText("0078 4521 0036")
                            .catch(() => {});
                          setAccountCopied(true);
                          window.setTimeout(
                            () => setAccountCopied(false),
                            1500
                          );
                        }}
                        className="mt-2 flex items-center gap-2 rounded-xl bg-card/60 px-3 py-2 text-left"
                      >
                        <span className="text-[12px] text-foreground/90 leading-snug">
                          Account name: CAL Online (Pvt) Ltd
                          <br />
                          Account number: 0078 4521 0036
                        </span>
                        {accountCopied ? (
                          <Check
                            className="w-4 h-4 shrink-0"
                            style={{ color: "var(--success)" }}
                          />
                        ) : (
                          <Copy
                            className="w-4 h-4 shrink-0"
                            style={{ color: "var(--pill)" }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                      style={{
                        background:
                          "color-mix(in oklch, var(--pill) 24%, transparent)",
                        color: "var(--pill)",
                      }}
                    >
                      2
                    </div>
                    <p className="text-[13px] text-foreground leading-snug pt-0.5">
                      Come here to raise a request to tell us which fund you
                      want it in.
                    </p>
                  </div>
                  <p className="mt-4 pt-3 border-t border-white/5 text-[12px] text-foreground/90 leading-snug">
                    Requests before 9 will be confirmed on the same working
                    day. After 9, they'll be confirmed the next working day.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}


      {/* Fund Flip — transfer from / transfer to with balances */}
      {isFlip && (
        <div className="mx-4 mt-3 space-y-2">
          <FlipAccountCard
            label="Transfer from"
            fund={flipFromFund}
            sub={flipFromSub}
            balance={
              showFlipPreview
                ? isOverBalance
                  ? `−${fmtLkr(Math.abs(projectedFrom))}`
                  : fmtLkr(projectedFrom)
                : fmtLkr(flipFromBalance)
            }
            tone={isOverBalance ? "danger" : showFlipPreview ? "normal" : "muted"}
            onClick={() => openFlipPicker("from")}
          />

          <div className="pl-5">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <FlipAccountCard
            label="Transfer to"
            fund={flipToFund}
            sub={flipToSub}
            balance={
              showFlipPreview
                ? fmtLkr(flipToBalance + amountNum)
                : fmtLkr(flipToBalance)
            }
            tone={showFlipPreview ? "success" : "muted"}
            onClick={() => openFlipPicker("to")}
          />

          {isSameAccount && (
            <p className="px-1 pt-1 text-[12px] text-destructive">
              Pick a different fund or sub account to transfer to.
            </p>
          )}
        </div>
      )}

      {/* Amount hero */}
      <div className="px-4 pt-6 pb-6 text-center">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-[18px] font-medium text-muted-foreground">
            LKR
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountDisplay(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="bg-transparent text-[44px] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none text-center"
            style={{
              width: `${Math.max(
                2,
                (formatAmountDisplay(amount) || "0").length,
              )}ch`,
            }}
          />
        </div>
        {isInstant && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Max LKR {DIRECT_INVEST_LIMIT.toLocaleString()} per transfer · larger
            amounts split into up to {DIRECT_INVEST_MAX_TRANSFERS}
          </p>
        )}
      </div>

      {/* Details card */}
      {!isFlip && (
        <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
          <PickerRow
            label="Fund"
            value={selectedFund}
            placeholder="Select a fund"
            onClick={() => setPicker("fund")}
          />
          <PickerRow
            label="Sub-account"
            value={selectedAccount}
            placeholder="Select sub-account"
            onClick={() => setPicker("account")}
          />
          <PickerRow
            label={payFromLabel}
            value={payFromValue}
            placeholder={payFromPlaceholder}
            onClick={() => setPicker("payFrom")}
          />
          {isBank && (
            <>
              <PickerRow
                label={sendToLabel}
                value={sendToValue}
                placeholder={sendToPlaceholder}
                onClick={() => setPicker("payTo")}
              />
              <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <span className="text-sm text-muted-foreground shrink-0">
                  Unit creation date
                </span>
                <span className="flex-1 text-right text-sm font-medium text-foreground truncate">
                  {unitCreationDate}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recurring — Direct Invest only */}
      {isInstant && (
        <>
          <div className="mx-4 mt-4">
            <RecurringToggle value={recurring} onChange={setRecurring} />
          </div>
          {recurring && (
            <RecurringOptions
              startDate={recurringStartDate}
              onStartDateChange={setRecurringStartDate}
              frequency={recurringFrequency}
            />
          )}
        </>
      )}

      {/* Proof of payment — Bank transfer, non-Deutsche */}
      {needsProof && (
        <div className="mx-4 mt-6">
          <p className="px-1 mb-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
            Proof of payment
          </p>
          {proofName ? (
            <>
              <div className="rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--portfolio-blue) 28%, transparent)",
                  }}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {proofName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    1.2 MB · Image
                  </p>
                </div>
                <button
                  onClick={() => setProofName(null)}
                  className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-medium text-success">
                  Receipt attached
                </span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setProofName("transfer_receipt.jpg")}
              className="w-full rounded-2xl bg-card/60 backdrop-blur-md py-6 flex flex-col items-center gap-2 transition hover:bg-muted/10"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">
                Tap to upload receipt
              </span>
            </button>
          )}
        </div>
      )}

      {/* Link to a goal — hidden for now */}
      {false && (
        <div className="mx-4 mt-4">
          <button
            type="button"
            onClick={() =>
              setLinkedGoal(linkedGoal ? null : "New car")
            }
            className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 text-left transition hover:bg-muted/10"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--success) 30%, transparent)",
              }}
            >
              <Star className="w-5 h-5 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {linkedGoal ? linkedGoal : "Link to a goal"}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                {linkedGoal
                  ? "Tap to change goal"
                  : "Tag this investment to a savings goal"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      )}

      {/* Split transfers — Direct Invest above the per-transfer limit */}
      {isInstant && splits.length > 1 && <SplitTransfersCard splits={splits} />}

      {/* Review CTA */}
      <div className="mx-4 mt-8 mb-8">
        <button
          disabled={!canReview}
          onClick={handleReview}
          className="w-full py-4 rounded-full text-[15px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--pill)",
            color: "var(--pill-foreground)",
          }}
        >
          Review
        </button>
      </div>

      {/* Picker Sheet */}
      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {picker ? pickerTitles[picker] : ""}
              </SheetTitle>
              <button
                onClick={() => setPicker(null)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          {picker &&
            (picker === "fund" ||
              picker === "flipTo" ||
              (picker === "payFrom" && isFlip)) && (
              <div className="px-5 mt-3 flex justify-end">
                <ViewRatesLink />
              </div>
            )}
          <div className="px-5 mt-4 space-y-2">
            {picker &&
              pickerOptions[picker].map((opt) => {
                const isSelected =
                  (picker === "fund" && opt === selectedFund) ||
                  (picker === "account" && opt === selectedAccount) ||
                  (picker === "payFrom" &&
                    opt === (isFlip ? selectedFund : selectedBank)) ||
                  (picker === "payTo" && opt === selectedPayTo) ||
                  (picker === "flipTo" && opt === selectedFlipTo);
                const isFundPicker =
                  picker === "fund" ||
                  picker === "flipTo" ||
                  (picker === "payFrom" && isFlip);
                const isBankPicker = picker === "payFrom" && !isFlip;
                const logo = isBankPicker ? bankLogoFor(opt) : undefined;
                return (
                  <button
                    key={opt}
                    onClick={() => handlePick(opt)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-muted/20"
                        : "bg-background/40 hover:bg-muted/10"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      {logo && (
                        <img
                          src={logo}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-lg"
                        />
                      )}
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm text-foreground truncate">{opt}</span>
                        {isFundPicker && isPopularFund(opt) && (
                          <span className="shrink-0 rounded-full bg-pill/15 px-1.5 py-px text-[10px] font-medium text-pill">
                            Popular
                          </span>
                        )}
                      </span>
                    </span>
                    {isBankPicker ? (
                      <RadioDot selected={isSelected} />
                    ) : (
                      <RadioDot selected={isSelected} />
                    )}
                  </button>
                );
              })}
            {picker === "payFrom" && !isFlip && (
              <button
                onClick={() => {
                  setPicker(null);
                  navigate({ to: "/bank-accounts" });
                }}
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border/40 bg-background/30 px-4 py-3 text-left transition hover:bg-muted/10"
              >
                <Plus className="w-4 h-4 shrink-0" style={{ color: "var(--pill)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--pill)" }}>
                  Add bank account
                </span>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Fund Flip picker — fund + sub account with balances */}
      <Sheet
        open={flipPicker !== null}
        onOpenChange={(o) => !o && setFlipPicker(null)}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {flipPicker === "to" ? "Transfer to" : "Transfer from"}
              </SheetTitle>
              <button
                onClick={() => setFlipPicker(null)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-5 mt-3 flex justify-end">
            <ViewRatesLink />
          </div>
          <div className="px-5 mt-3 space-y-4 pb-2">
            <div>
              <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                Fund
              </p>
              <ModernSelect
                value={draftFund}
                onChange={(e) => {
                  const f = e.target.value;
                  setDraftFund(f);
                  setDraftSub(subAccountsOf(f)[0]?.name ?? "");
                }}
                placeholder="Select fund"
              >
                {funds.map((f) => (
                  <option key={f} value={f}>
                    {f}
                    {isPopularFund(f) ? " · Popular" : ""}
                  </option>
                ))}
              </ModernSelect>
            </div>
            <div>
              <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                Sub account
              </p>
              <ModernSelect
                value={draftSub}
                onChange={(e) => setDraftSub(e.target.value)}
                placeholder="Select sub account"
              >
                {draftSubOptions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </ModernSelect>
              {draftSub && (
                <p className="mt-2 px-1 text-[12px] text-muted-foreground">
                  Available {balanceOf(draftFund, draftSub)}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!draftFund || !draftSub}
              onClick={() => {
                if (flipPicker === "to") {
                  setFlipToFund(draftFund);
                  setFlipToSub(draftSub);
                } else {
                  setFlipFromFund(draftFund);
                  setFlipFromSub(draftSub);
                }
                setFlipPicker(null);
              }}
              className="w-full py-3.5 rounded-full text-[15px] font-semibold transition disabled:opacity-40"
              style={{
                background: "var(--pill)",
                color: "var(--pill-foreground)",
              }}
            >
              Confirm
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function FlipAccountCard({
  label,
  fund,
  sub,
  balance,
  tone,
  onClick,
}: {
  label: string;
  fund: string;
  sub: string;
  balance: string;
  tone: "muted" | "normal" | "success" | "danger";
  onClick: () => void;
}) {
  const balanceClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "success"
        ? "text-success"
        : tone === "normal"
          ? "text-foreground"
          : "text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 text-left transition hover:bg-muted/10"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "color-mix(in oklch, var(--pill) 25%, transparent)",
        }}
      >
        <PieChart className="w-5 h-5" style={{ color: "var(--pill)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">
          {fund}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>
        <p className={`text-[12px] font-medium mt-0.5 ${balanceClass}`}>
          {balance}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}


function PickerRow({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
}) {
  const hasValue = !!value;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/10 border-b border-border/20 last:border-b-0"
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`flex-1 text-right text-sm font-medium truncate ${
          hasValue ? "text-foreground" : "text-muted-foreground/70"
        }`}
      >
        {hasValue ? value : placeholder}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SplitTransfersCard({ splits }: { splits: number[] }) {
  return (
    <div className="mx-4 mt-2 rounded-2xl bg-card/60 backdrop-blur-md p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "color-mix(in oklch, var(--pill) 18%, transparent)" }}
        >
          <Split className="w-5 h-5" style={{ color: "var(--pill)" }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">
            Split into {splits.length} transfers
          </p>
          <p className="text-[11px] text-muted-foreground">
            Each is debited separately, with its own LKR 50 Justpay charge
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
        {splits.map((part, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Transfer {i + 1}
            </span>
            <span className="text-[12px] font-medium text-foreground tabular-nums">
              LKR {part.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecurringToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "color-mix(in oklch, var(--pill) 25%, transparent)",
        }}
      >
        <CalendarDays className="w-4 h-4" style={{ color: "var(--pill)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground leading-tight">
          Set recurring
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
          Repeat this investment automatically each month
        </p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function DateRow({
  label,
  date,
  onClick,
}: {
  label: string;
  date: Date;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/10 border-b border-border/20 last:border-b-0"
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 text-right text-sm font-medium text-foreground truncate">
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

/**
 * RecurringOptions — shown under the "Set recurring" toggle when it's on.
 * Lets the user pick a start date (calendar sheet) and a frequency
 * (bottom-sheet picker, Monthly default).
 */
function RecurringOptions({
  startDate,
  onStartDateChange,
  frequency,
}: {
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  frequency: string;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const [freqOpen, setFreqOpen] = useState(false);

  return (
    <>
      <div className="mx-4 mt-2 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
        <DateRow
          label="Start date"
          date={startDate}
          onClick={() => setDateOpen(true)}
        />
        <PickerRow
          label="Frequency"
          value={frequency}
          placeholder="Select frequency"
          onClick={() => setFreqOpen(true)}
        />
      </div>

      {/* Start date sheet */}
      <Sheet open={dateOpen} onOpenChange={setDateOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                Start date
              </SheetTitle>
              <button
                onClick={() => setDateOpen(false)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-3 mt-2 flex justify-center">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(d) => {
                if (d) onStartDateChange(d);
                setDateOpen(false);
              }}
              className="p-3 pointer-events-auto"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Frequency sheet */}
      <Sheet open={freqOpen} onOpenChange={setFreqOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                Frequency
              </SheetTitle>
              <button
                onClick={() => setFreqOpen(false)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-5 mt-4 space-y-2">
            {["Monthly"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setFreqOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  frequency === opt
                    ? "bg-muted/20"
                    : "bg-background/40 hover:bg-muted/10"
                }`}
              >
                <span className="text-sm text-foreground">{opt}</span>
                <RadioDot selected={frequency === opt} />
              </button>
            ))}
            <p className="pt-1 text-[12px] text-muted-foreground leading-snug">
              We'll invest the same amount on this date every month.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}


const equityFundSources = [
  { name: "CAL Growth Fund", sub: "Chiara's wealth account", value: "LKR 150,000.00" },
  { name: "CAL Income Fund", sub: "Personal account", value: "LKR 84,300.00" },
  { name: "CAL Money Market Fund", sub: "Personal account", value: "LKR 32,100.00" },
];

const equityFundSubAccounts: Record<string, { name: string; value: string }[]> = {
  "CAL Growth Fund": [
    { name: "Chiara's wealth account", value: "LKR 150,000.00" },
    { name: "Retirement", value: "LKR 92,500.00" },
    { name: "General", value: "LKR 41,200.00" },
  ],
  "CAL Income Fund": [
    { name: "Personal account", value: "LKR 84,300.00" },
    { name: "Emergency", value: "LKR 36,700.00" },
  ],
  "CAL Money Market Fund": [
    { name: "Personal account", value: "LKR 32,100.00" },
    { name: "Short term", value: "LKR 18,450.00" },
  ],
};

function EquitiesForm({ method }: { method: InvestMethod }) {
  const navigate = useNavigate();
  const amountRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [bank, setBank] = useState("Commercial Bank · 8001 2345 21");
  const [payTo, setPayTo] = useState("CAL Securities Account");
  const [proofName, setProofName] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [recurringStartDate, setRecurringStartDate] = useState(new Date());
  const [sourceFund, setSourceFund] = useState(equityFundSources[0]!.name);
  const [sourceSub, setSourceSub] = useState(
    equityFundSubAccounts[equityFundSources[0]!.name]![0]!.name,
  );
  const [authorized, setAuthorized] = useState(false);
  const [draftFund, setDraftFund] = useState(sourceFund);
  const [draftSub, setDraftSub] = useState(sourceSub);
  const [picker, setPicker] = useState<
    null | "bank" | "payTo" | "sourceFund"
  >(null);

  const openFundPicker = () => {
    setDraftFund(sourceFund);
    setDraftSub(sourceSub);
    setPicker("sourceFund");
  };

  const isPayIn = method === "payin";
  const isDirect = method === "instant";
  const isUtFlip = method === "utflip";

  const title = isPayIn
    ? "Pay in"
    : isDirect
      ? "Direct Invest"
      : "Transfer from Unit Trust";

  const amountNum = parseFloat(amount || "0") || 0;

  const source = equityFundSources.find((f) => f.name === sourceFund)!;
  const sourceSubAccounts = equityFundSubAccounts[sourceFund] ?? [];
  const selectedSub =
    sourceSubAccounts.find((s) => s.name === sourceSub) ?? sourceSubAccounts[0];
  const draftSubOptions = equityFundSubAccounts[draftFund] ?? [];

  // Live balance preview for the unit trust -> equity transfer
  const parseLkr = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
  const fmtLkr = (n: number) =>
    `LKR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const sourceBalance = parseLkr(selectedSub?.value ?? source.value);
  const equityBalance = 25000;
  const projectedSourceBalance = sourceBalance - amountNum;
  const isOverBalance = isUtFlip && projectedSourceBalance < 0;

  // Wobble the amount field when the user types over their unit trust balance
  useEffect(() => {
    if (isOverBalance && amountRef.current) {
      const el = amountRef.current;
      el.classList.remove("animate-wobble");
      void el.offsetWidth;
      el.classList.add("animate-wobble");
    }
  }, [amount, isOverBalance]);

  const handleAmountChange = (raw: string) => {
    const sanitized = sanitizeAmountInput(raw);
    if (isDirect) {
      const n = parseFloat(sanitized || "0") || 0;
      if (n > DIRECT_INVEST_LIMIT * DIRECT_INVEST_MAX_TRANSFERS) {
        setAmount(String(DIRECT_INVEST_LIMIT * DIRECT_INVEST_MAX_TRANSFERS));
        return;
      }
    }
    setAmount(sanitized);
  };

  const splits = isDirect ? directInvestSplits(amountNum) : [];

  const transferAmt = isUtFlip ? amountNum : 0;
  const showPreview = isUtFlip && amountNum > 0;

  const canReview = (() => {
    if (amountNum <= 0) return false;
    if (isUtFlip && (isOverBalance || !authorized)) return false;
    if (isPayIn) return !!bank && !!payTo && !!proofName;
    if (isDirect) return !!bank;
    return !!sourceFund;
  })();

  const handleReview = () =>
    navigate({
      to: "/invest-summary",
      search: {
        method: isUtFlip ? "flip" : isDirect ? "instant" : "bank",
        amount: amount || "0",
        fund: isUtFlip ? sourceFund : "Equity Account",
        account: "Equity Account",
        bank: isUtFlip ? "Equity Account" : isPayIn ? payTo : bank,
        repeats: String(Math.max(1, splits.length)),
      },
    });

  const pickerOptions: Record<"bank" | "payTo" | "sourceFund", string[]> = {
    bank: banks,
    payTo: calBankAccounts.map((a) => a.label),
    sourceFund: equityFundSources.map((f) => f.name),
  };
  const pickerTitles: Record<"bank" | "payTo" | "sourceFund", string> = {
    bank: "Transfer from",
    payTo: "Transfer to",
    sourceFund: "Transfer from unit trust",
  };
  const selectedFor = (kind: "bank" | "payTo" | "sourceFund") =>
    kind === "bank" ? bank : kind === "payTo" ? payTo : sourceFund;

  return (
    <MobileLayout>
      <PageHeader title={title} showBack helpTopic="invest" />

      {/* Unit trust -> equity account visual */}
      {isUtFlip && (
        <div className="mx-4 mt-3 space-y-2">
          <button
            type="button"
            onClick={openFundPicker}
            className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 text-left transition hover:bg-muted/10"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
              }}
            >
              <PieChart className="w-5 h-5" style={{ color: "var(--pill)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {source.name}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {selectedSub?.name ?? source.sub}
              </p>
              {showPreview ? (
                <p
                  className={`text-[12px] font-medium mt-0.5 ${
                    isOverBalance ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {isOverBalance
                    ? `−${fmtLkr(Math.abs(projectedSourceBalance))}`
                    : fmtLkr(projectedSourceBalance)}
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  {selectedSub?.value ?? source.value}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>

          <div className="pl-5">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--pill) 25%, transparent)",
              }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: "var(--pill)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Equity Account
              </p>
              {showPreview ? (
                <p className="text-[12px] font-medium text-success mt-0.5">
                  {fmtLkr(equityBalance + transferAmt)}
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {fmtLkr(equityBalance)}
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Amount hero */}
      <div className="px-4 pt-6 pb-6 text-center">
        <div ref={amountRef} className="inline-flex items-baseline gap-2">
          <span className="text-[18px] font-medium text-muted-foreground">
            LKR
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountDisplay(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="bg-transparent text-[44px] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none tabular-nums leading-none text-center"
            style={{
              width: `${Math.max(2, (formatAmountDisplay(amount) || "0").length)}ch`,
            }}
          />
        </div>
        {isUtFlip && isOverBalance ? (
          <p className="mt-3 text-[12px] font-medium text-destructive">
            Your balance is too low. The most you can move is{" "}
            {fmtLkr(sourceBalance)}.
          </p>
        ) : (
          <p className="mt-3 text-[12px] text-muted-foreground">
            {isDirect
              ? `Investment amount · max LKR ${DIRECT_INVEST_LIMIT.toLocaleString()} per transfer · larger amounts split into up to ${DIRECT_INVEST_MAX_TRANSFERS}`
              : isPayIn
                ? "Amount to pay in"
                : "Amount to transfer"}
          </p>
        )}
      </div>

      {/* Details */}
      {!isUtFlip && (
        <div className="mx-4 rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden">
          <DateRow label="Date" date={date} onClick={() => setDateOpen(true)} />
          <PickerRow
            label="Transfer from"
            value={bank}
            placeholder="Select bank account"
            onClick={() => setPicker("bank")}
          />
          {isPayIn && (
            <PickerRow
              label="Transfer to"
              value={payTo}
              placeholder="Select CAL account"
              onClick={() => setPicker("payTo")}
            />
          )}
        </div>
      )}

      {/* Recurring — Direct Invest only */}
      {isDirect && (
        <>
          <div className="mx-4 mt-4">
            <RecurringToggle value={recurring} onChange={setRecurring} />
          </div>
          {recurring && (
            <RecurringOptions
              startDate={recurringStartDate}
              onStartDateChange={setRecurringStartDate}
              frequency="Monthly"
            />
          )}
        </>
      )}

      {/* Attach proof — Pay in */}
      {isPayIn && (
        <div className="mx-4 mt-6">
          <p className="px-1 mb-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
            Attach proof
          </p>
          {proofName ? (
            <>
              <div className="rounded-2xl bg-card/60 backdrop-blur-md px-3 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in oklch, var(--portfolio-blue) 28%, transparent)",
                  }}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {proofName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    1.2 MB · Image
                  </p>
                </div>
                <button
                  onClick={() => setProofName(null)}
                  className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-medium text-success">
                  Receipt attached
                </span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setProofName("transfer_receipt.jpg")}
              className="w-full rounded-2xl bg-card/60 backdrop-blur-md py-6 flex flex-col items-center gap-2 transition hover:bg-muted/10"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">
                Tap to upload receipt
              </span>
            </button>
          )}
        </div>
      )}

      {/* Authorization — Unit Trust to equity only */}
      {isUtFlip && (
        <div className="mx-4 mt-5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0"
            />
            <span className="text-[12px] text-muted-foreground leading-snug">
              I/We hereby authorize Capital Alliance Securities to allow
              auto-settle equity trades from the Unit Trust.
            </span>
          </label>
        </div>
      )}

      {/* Split transfers — Direct Invest above the per-transfer limit */}
      {isDirect && splits.length > 1 && <SplitTransfersCard splits={splits} />}

      {/* Review CTA */}
      <div className="mx-4 mt-8 mb-8">
        <button
          disabled={!canReview}
          onClick={handleReview}
          className="w-full py-4 rounded-full text-[15px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "var(--pill)", color: "var(--pill-foreground)" }}
        >
          Review
        </button>
      </div>

      {/* Date sheet */}
      <Sheet open={dateOpen} onOpenChange={setDateOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                Select date
              </SheetTitle>
              <button
                onClick={() => setDateOpen(false)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-3 mt-2 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d);
                setDateOpen(false);
              }}
              className="p-3 pointer-events-auto"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Picker sheet */}
      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/30 bg-card px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-foreground">
                {picker ? pickerTitles[picker] : ""}
              </SheetTitle>
              <button
                onClick={() => setPicker(null)}
                className="rounded-full p-1 hover:bg-muted/20 transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="px-5 mt-4 space-y-2">
            {picker === "sourceFund" ? (
              <div className="space-y-4 pb-2">
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                    Fund
                  </p>
                  <ModernSelect
                    value={draftFund}
                    onChange={(e) => {
                      const f = e.target.value;
                      setDraftFund(f);
                      setDraftSub(equityFundSubAccounts[f]?.[0]?.name ?? "");
                    }}
                    placeholder="Select fund"
                  >
                    {equityFundSources.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                        {isPopularFund(f.name) ? " · Popular" : ""}
                      </option>
                    ))}
                  </ModernSelect>
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/80">
                    Sub account
                  </p>
                  <ModernSelect
                    value={draftSub}
                    onChange={(e) => setDraftSub(e.target.value)}
                    placeholder="Select sub account"
                  >
                    {draftSubOptions.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </ModernSelect>
                  {draftSub && (
                    <p className="mt-2 px-1 text-[12px] text-muted-foreground">
                      Available{" "}
                      {draftSubOptions.find((s) => s.name === draftSub)?.value}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!draftFund || !draftSub}
                  onClick={() => {
                    setSourceFund(draftFund);
                    setSourceSub(draftSub);
                    setPicker(null);
                  }}
                  className="w-full py-3.5 rounded-full text-[15px] font-semibold transition disabled:opacity-40"
                  style={{
                    background: "var(--pill)",
                    color: "var(--pill-foreground)",
                  }}
                >
                  Confirm
                </button>
              </div>
            ) : (
              picker &&
              pickerOptions[picker].map((opt) => {
                const isSelected = selectedFor(picker) === opt;
                const logo = picker === "bank" ? bankLogoFor(opt) : undefined;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (picker === "bank") setBank(opt);
                      if (picker === "payTo") setPayTo(opt);
                      setPicker(null);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-muted/20"
                        : "bg-background/40 hover:bg-muted/10"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      {logo && (
                        <img
                          src={logo}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-lg"
                        />
                      )}
                      <span className="text-sm text-foreground">{opt}</span>
                    </span>
                    <RadioDot selected={isSelected} />
                  </button>
                );
              })
            )}
            {picker === "bank" && (
              <button
                onClick={() => {
                  setPicker(null);
                  navigate({ to: "/bank-accounts" });
                }}
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border/40 bg-background/30 px-4 py-3 text-left transition hover:bg-muted/10"
              >
                <Plus className="w-4 h-4 shrink-0" style={{ color: "var(--pill)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--pill)" }}>
                  Add bank account
                </span>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}

function DefaultFundForm() {
  // Default fund is enabled by default, but fund/sub-account start empty.
  const [fund, setFund] = useState("");
  const [account, setAccount] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmTimer = useRef<number | null>(null);
  const [picker, setPicker] = useState<"fund" | "account" | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  const steps = [
    "Select your preferred fund and sub account.",
    "Transfer funds to your CAL Deutsche Bank account.",
    "Your transfer is automatically applied to your default fund, no extra steps needed.",
  ];

  const canSave = enabled && !!fund && !!account;

  return (
    <MobileLayout>
      <PageHeader title="Default fund" showBack helpTopic="invest" />

      <div className="mx-4 mt-3 rounded-2xl bg-card/60 backdrop-blur-md px-4 py-4">
        <button
          type="button"
          onClick={() => setInstructionsOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={instructionsOpen}
        >
          <p className="text-sm font-semibold text-foreground">
            Investing just got easier with default funds
          </p>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${instructionsOpen ? "rotate-180" : ""}`}
          />
        </button>
        {instructionsOpen && (
          <>
            <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
              Set a default fund and we'll automatically apply your transfers to
              it, no need to raise a request.
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
              If you raise a request to another fund, that request will override
              your default for that day. We check for requests at 9 AM each day;
              if none exist, your default fund is applied.
            </p>
            <div className="mt-3.5 space-y-2.5">
              {steps.map((s, i) => (
                <div key={s} className="flex items-start gap-2.5">
                  <span
                    className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      background:
                        "color-mix(in oklch, var(--portfolio-blue) 30%, transparent)",
                      color: "var(--pill)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        className={`mx-4 mt-4 space-y-3 transition-opacity ${enabled ? "" : "pointer-events-none opacity-40"}`}
      >
        <div>
          <label className="mb-1.5 block text-[12px] text-muted-foreground">
            Default fund
          </label>
          <button
            type="button"
            onClick={() => enabled && setPicker("fund")}
            className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 text-[13px] text-foreground backdrop-blur-md transition hover:border-primary/40"
          >
            <span className="flex items-center gap-2">
              {fund ? (
                <>
                  {fund}
                  {isPopularFund(fund) && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        background:
                          "color-mix(in oklch, var(--pill) 20%, transparent)",
                        color: "var(--pill)",
                      }}
                    >
                      Popular
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Select a fund</span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] text-muted-foreground">
            Default sub account
          </label>
          <button
            type="button"
            onClick={() => enabled && setPicker("account")}
            className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 text-[13px] text-foreground backdrop-blur-md transition hover:border-primary/40"
          >
            <span>
              {account ? (
                account
              ) : (
                <span className="text-muted-foreground">Select sub account</span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <Sheet open={picker !== null} onOpenChange={(o) => !o && setPicker(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {picker === "fund" ? "Select fund" : "Select sub account"}
            </SheetTitle>
          </SheetHeader>
          {picker === "fund" && (
            <div className="px-5 flex justify-end">
              <ViewRatesLink />
            </div>
          )}
          <div className="mt-3 space-y-1.5 pb-6">
            {(picker === "fund" ? funds : accounts).map((opt) => {
              const isSelected = picker === "fund" ? opt === fund : opt === account;
              return (
                <button
                  key={opt}
                   onClick={() => {
                     if (picker === "fund") setFund(opt);
                     else setAccount(opt);
                     setPicker(null);
                   }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    isSelected ? "bg-muted/20" : "bg-background/40 hover:bg-muted/10"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    {opt}
                    {picker === "fund" && isPopularFund(opt) && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                        style={{
                          background:
                            "color-mix(in oklch, var(--pill) 20%, transparent)",
                          color: "var(--pill)",
                        }}
                      >
                        Popular
                      </span>
                    )}
                  </span>
                  <RadioDot selected={isSelected} />
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {enabled && fund && account && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-2xl bg-card/40 px-4 py-3">
          <Star className="mt-px h-4 w-4 shrink-0" style={{ color: "var(--pill)" }} />
          <p className="text-[12px] leading-snug text-muted-foreground">
            Current default:{" "}
            <span className="font-medium text-foreground">{fund}</span> ·{" "}
            <span className="font-medium text-foreground">{account}</span>
          </p>
        </div>
      )}

      <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl bg-card/60 px-4 py-3.5 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Default fund
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
            {enabled
              ? "Future transfers will be applied automatically."
              : "Default fund is off. Turn it on to apply transfers automatically."}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => {
            setEnabled(v);
          }}
          aria-label="Toggle default fund"
        />
      </div>

      <div className="mx-4 mt-5 mb-8">
        <button
          onClick={() => {
            if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
            setConfirmOpen(true);
            confirmTimer.current = window.setTimeout(() => {
              setConfirmOpen(false);
              confirmTimer.current = null;
            }, 1300);
          }}
          disabled={!canSave}
          className="w-full rounded-xl py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "var(--pill)", color: "#000" }}
        >
          Save default
        </button>
      </div>

      {/* Saved confirmation sheet */}
      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Default fund</SheetTitle>
          </SheetHeader>
          <SavedConfirmation
            summary={
              enabled
                ? `Future transfers will be applied to ${fund} · ${account}`
                : "Default fund turned off"
            }
          />
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
