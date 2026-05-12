import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Bell, TrendingUp, Receipt, Megaphone, ShieldAlert, Mail, Smartphone, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/notifications/settings")({
  component: NotificationPreferences,
});

type Pref = { id: string; label: string; description: string; icon: React.ComponentType<{ className?: string }>; enabled: boolean };

const initialCategories: Pref[] = [
  { id: "portfolio", label: "Portfolio updates", description: "Daily summary of your portfolio performance", icon: TrendingUp, enabled: true },
  { id: "transactions", label: "Transactions", description: "Confirmations for invest, redeem and dividends", icon: Receipt, enabled: true },
  { id: "market", label: "Market alerts", description: "Major moves on ASPI, S&P SL20 and your watchlist", icon: Bell, enabled: false },
  { id: "promotions", label: "Promotions & news", description: "New funds, IPOs and CAL product offers", icon: Megaphone, enabled: false },
  { id: "security", label: "Security alerts", description: "Login attempts and account changes (recommended)", icon: ShieldAlert, enabled: true },
];

const initialChannels: Pref[] = [
  { id: "push", label: "Push notifications", description: "On this device", icon: Smartphone, enabled: true },
  { id: "email", label: "Email", description: "john.doe@email.com", icon: Mail, enabled: true },
  { id: "sms", label: "SMS", description: "+94 77 123 4567", icon: MessageSquare, enabled: false },
];

function NotificationPreferences() {
  const [categories, setCategories] = useState(initialCategories);
  const [channels, setChannels] = useState(initialChannels);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Pref[]>>,
  ) => (id: string, value: boolean) => {
    setter((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: value } : p)));
  };

  const Section = ({ title, items, onToggle }: { title: string; items: Pref[]; onToggle: (id: string, v: boolean) => void }) => (
    <div className="mx-4 mt-4">
      <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
              </div>
              <Switch checked={item.enabled} onCheckedChange={(v) => onToggle(item.id, v)} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <MobileLayout>
      <PageHeader title="Notifications" showBack />
      <p className="mx-4 mt-1 text-[12px] text-muted-foreground">
        Choose what you want to hear about and how we reach you.
      </p>
      <Section title="What to notify me about" items={categories} onToggle={toggle(setCategories)} />
      <Section title="How to reach me" items={channels} onToggle={toggle(setChannels)} />
      <div className="h-6" />
    </MobileLayout>
  );
}