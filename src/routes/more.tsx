import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2, Gamepad2, TrendingUp,
  HelpCircle, Settings, LogOut, ChevronRight,
  MessageSquare, FileText, Receipt, ClipboardList,
  PieChart, BarChart2
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: More,
});

const sections = [
  {
    title: "PRODUCTS & SERVICES",
    items: [
      { icon: PieChart, label: "Unit Trusts", path: "/unit-trusts" },
      { icon: BarChart2, label: "Equities", path: "/invest?product=equities" },
      { icon: Receipt, label: "Treasuries", path: "/invest?product=treasuries" },
      { icon: ClipboardList, label: "Requests", path: "/requests", subtitle: "Confirmations, nominations & more" },
    ],
  },
  {
    title: "EXPLORE",
    items: [
      { icon: TrendingUp, label: "Unit Trust Rates", path: "/rates" },
      { icon: Receipt, label: "Treasury Rates", path: "/rates?tab=treasury" },
      { icon: FileText, label: "Market Research", path: "/learn?tab=research" },
      { icon: Gamepad2, label: "VStock Simulator", path: "/vstock" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { icon: Building2, label: "Bank Accounts", path: "/bank-accounts" },
      { icon: Settings, label: "Settings", path: "/settings", subtitle: "Notifications, privacy & legal" },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { icon: HelpCircle, label: "Help & Support", path: "/more" },
      { icon: MessageSquare, label: "Give Feedback", path: "/more" },
    ],
  },
];

function More() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <PageHeader title="More" />

      {/* Profile Card */}
      <div className="mx-4 mt-2 bg-card rounded-2xl p-4">
        <button onClick={() => navigate({ to: "/profile" })} className="w-full flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            JD
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">John Doe</p>
            <p className="text-[12px] text-muted-foreground">john.doe@email.com</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mx-4 mt-4">
          <p className="text-[12px] font-semibold text-muted-foreground tracking-wider mb-2">{section.title}</p>
          <div className="bg-[#141D2B] rounded-2xl overflow-hidden divide-y divide-border/30">
            {section.items.map(({ icon: Icon, label, path, subtitle }: any) => (
              <button
                key={label}
                onClick={() => navigate({ to: path })}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/30 transition"
              >
                <Icon className="w-5 h-5 text-pill" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  {subtitle && <p className="text-[12px] text-muted-foreground">{subtitle}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mx-4 mt-6 mb-6">
        <button className="w-full py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </MobileLayout>
  );
}
