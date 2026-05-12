import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import { Fingerprint, KeyRound, Smartphone, Eye, Download, Trash2, ChevronRight, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/settings/privacy")({
  component: PrivacySecurity,
});

function PrivacySecurity() {
  const [biometrics, setBiometrics] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const toggleRow = (
    Icon: any,
    label: string,
    description: string,
    checked: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <div className="flex items-center gap-3 p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  const linkRow = (Icon: any, label: string, description: string, to = "/settings/privacy", danger = false) => (
    <Link to={to} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${danger ? "bg-destructive/15" : "bg-primary/15"}`}>
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-primary"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold leading-tight ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );

  return (
    <MobileLayout>
      <PageHeader title="Privacy & security" showBack />

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SIGN IN</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {toggleRow(Fingerprint, "Biometric unlock", "Use Face ID or fingerprint to sign in", biometrics, setBiometrics)}
          {linkRow(KeyRound, "Change passcode", "Last changed 3 months ago")}
          {linkRow(Smartphone, "Trusted devices", "2 devices currently signed in")}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">PRIVACY</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {toggleRow(Eye, "Hide balances", "Mask amounts on the home screen", hideBalances, setHideBalances)}
          {toggleRow(ShieldAlert, "Share usage data", "Help us improve with anonymised analytics", analytics, setAnalytics)}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">YOUR DATA</p>
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {linkRow(Download, "Download your data", "Get a copy of your account data")}
          {linkRow(Trash2, "Close account", "Permanently close your CAL Online account", "/settings/privacy", true)}
        </div>
      </div>

      <div className="h-6" />
    </MobileLayout>
  );
}
