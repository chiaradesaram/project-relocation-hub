import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Bell, ShieldCheck, FileText, ChevronRight, Globe, Palette, ArrowLeftRight, Wallet } from "lucide-react";
import { EQUITY_SETTLEMENT_KEY } from "./requests.equity-settlement";
import { EQUITY_FUNDING_KEY } from "./requests.equity-funding";

export const Route = createFileRoute("/settings/")({
  component: Settings,
});

const accountItems = [
  { icon: Bell, label: "Notifications", description: "Push, email, SMS and what to hear about", to: "/notifications/settings" },
  { icon: ShieldCheck, label: "Privacy & security", description: "Passcode, biometrics, data and devices", to: "/settings/privacy" },
  { icon: FileText, label: "Legal documents", description: "Terms, privacy policy and disclosures", to: "/settings/legal" },
];

const preferencesItems = [
  { icon: Palette, label: "Appearance", description: "Theme and display", to: "/settings" },
  { icon: Globe, label: "Language & region", description: "English (Sri Lanka) · LKR", to: "/settings" },
];

function Settings() {
  const [settlementState, setSettlementState] = useState<string | null>(null);
  const [fundingState, setFundingState] = useState<string | null>(null);
  useEffect(() => {
    setSettlementState(localStorage.getItem(EQUITY_SETTLEMENT_KEY));
    setFundingState(localStorage.getItem(EQUITY_FUNDING_KEY));
  }, []);

  const makeToggle = (key: string, setter: (v: string) => void) => (on: boolean) => {
    const value = on ? "enabled" : "disabled";
    localStorage.setItem(key, value);
    setter(value);
  };

  const equityItems = [
    {
      icon: ArrowLeftRight,
      label: "Equity settlement",
      description:
        settlementState === null
          ? "Auto-settle equity trades from unit trust"
          : settlementState === "enabled"
            ? "Active · auto-settle from unit trust"
            : "Paused · auto-settle from unit trust",
      to: "/requests/equity-settlement",
      signedUp: settlementState !== null,
      on: settlementState === "enabled",
      onToggle: makeToggle(EQUITY_SETTLEMENT_KEY, setSettlementState),
    },
    {
      icon: Wallet,
      label: "Funding equity account",
      description:
        fundingState === null
          ? "Fund your equity cash balance from unit trust"
          : fundingState === "enabled"
            ? "Active · fund equity cash from unit trust"
            : "Paused · fund equity cash from unit trust",
      to: "/requests/equity-funding",
      signedUp: fundingState !== null,
      on: fundingState === "enabled",
      onToggle: makeToggle(EQUITY_FUNDING_KEY, setFundingState),
    },
  ];

  return (
    <MobileLayout>
      <PageHeader title="Settings" showBack />

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">ACCOUNT</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {accountItems.map(({ icon: Icon, label, description, to }) => (
            <Link key={label} to={to} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">EQUITY SETTINGS</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {equityItems.map(({ icon: Icon, label, description, to, signedUp, on, onToggle }) => (
            <Link key={label} to={to} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
              </div>
              {signedUp ? (
                <span onClick={(e) => e.preventDefault()}>
                  <Switch checked={on} onCheckedChange={onToggle} />
                </span>
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">PREFERENCES</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {preferencesItems.map(({ icon: Icon, label, description, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
      <div className="h-6" />
    </MobileLayout>
  );
}
