import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Link } from "@tanstack/react-router";
import { Bell, ShieldCheck, FileText, ChevronRight, Globe, Palette } from "lucide-react";

export const Route = createFileRoute("/settings/")({
  component: Settings,
});

const sections = [
  {
    title: "ACCOUNT",
    items: [
      { icon: Bell, label: "Notifications", description: "Push, email, SMS and what to hear about", to: "/notifications/settings" },
      { icon: ShieldCheck, label: "Privacy & security", description: "Passcode, biometrics, data and devices", to: "/settings/privacy" },
      { icon: FileText, label: "Legal documents", description: "Terms, privacy policy and disclosures", to: "/settings/legal" },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme and display", to: "/settings" },
      { icon: Globe, label: "Language & region", description: "English (Sri Lanka) · LKR", to: "/settings" },
    ],
  },
];

function Settings() {
  return (
    <MobileLayout>
      <PageHeader title="Settings" showBack />
      {sections.map((section) => (
        <div key={section.title} className="mx-4 mt-4">
          <p className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{section.title}</p>
          <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
            {section.items.map(({ icon: Icon, label, description, to }) => (
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
      ))}
      <div className="h-6" />
    </MobileLayout>
  );
}
