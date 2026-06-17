import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Settings, TrendingUp, Receipt, Megaphone, ShieldAlert, Bell, Check } from "lucide-react";

export const Route = createFileRoute("/notifications/")({
  component: NotificationsInbox,
});

type NotifType = "portfolio" | "transactions" | "market" | "promotions" | "security";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  group: "Today" | "Earlier";
  unread: boolean;
}

const ICONS: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  portfolio: { icon: TrendingUp, bg: "bg-primary/10", color: "text-primary" },
  transactions: { icon: Receipt, bg: "bg-muted", color: "text-muted-foreground" },
  market: { icon: Bell, bg: "bg-muted", color: "text-muted-foreground" },
  promotions: { icon: Megaphone, bg: "bg-muted", color: "text-muted-foreground" },
  security: { icon: ShieldAlert, bg: "bg-destructive/10", color: "text-destructive" },
};

const seed: Notif[] = [
  { id: "1", type: "transactions", title: "Investment confirmed", body: "LKR 50,000 invested in CAL Income Fund.", time: "10m ago", group: "Today", unread: true },
  { id: "2", type: "portfolio", title: "Portfolio up 1.2% today", body: "Equities led the move with +2.4%.", time: "2h ago", group: "Today", unread: true },
  { id: "3", type: "market", title: "ASPI crossed 12,800", body: "Index closed at 12,845.32, up 1.2% on the day.", time: "5h ago", group: "Today", unread: false },
  { id: "4", type: "security", title: "New login from Chrome", body: "Colombo, Sri Lanka · If this wasn't you, secure your account.", time: "Yesterday", group: "Earlier", unread: false },
  { id: "5", type: "promotions", title: "New IPO open for subscription", body: "Check out the latest offering on the Invest tab.", time: "3d ago", group: "Earlier", unread: false },
];

function NotificationsInbox() {
  const [items, setItems] = useState(seed);
  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const groups: Notif["group"][] = ["Today", "Earlier"];

  return (
    <MobileLayout>
      <PageHeader
        title="Notifications"
        showBack
        rightElement={
          <Link
            to="/notifications/settings"
            className="flex items-center justify-center w-9 h-9 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            aria-label="Notification settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        }
      />

      <div className="mx-4 mt-1 mb-3 flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[12px] font-medium text-primary hover:brightness-110"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mx-4 mt-10 rounded-2xl border border-border/40 bg-card backdrop-blur-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-foreground">No notifications yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground">We'll let you know when something happens.</p>
        </div>
      ) : (
        groups.map((group) => {
          const groupItems = items.filter((n) => n.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="mx-4 mt-2">
              <p className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{group}</p>
              <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
                {groupItems.map((n) => {
                  const { icon: Icon, bg, color } = ICONS[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                      className="flex w-full items-start gap-3 p-3.5 text-left transition hover:bg-muted/20"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{n.title}</p>
                          {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10.5px] text-muted-foreground/70 mt-1">{n.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
      <div className="h-6" />
    </MobileLayout>
  );
}