import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Link } from "@tanstack/react-router";
import { FileText, ScrollText, ShieldCheck, BookOpen, Scale, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings/legal")({
  component: LegalDocuments,
});

const documents = [
  { icon: ScrollText, label: "Terms & conditions", description: "The rules for using CAL Online", to: "/settings/legal" },
  { icon: ShieldCheck, label: "Privacy policy", description: "How we collect and use your data", to: "/settings/legal" },
  { icon: FileText, label: "Cookie policy", description: "How cookies are used in our services", to: "/settings/legal" },
  { icon: Scale, label: "Risk disclosure", description: "Important information about investment risk", to: "/settings/legal" },
  { icon: BookOpen, label: "Regulatory information", description: "Licensing and regulator disclosures", to: "/settings/legal" },
];

function LegalDocuments() {
  return (
    <MobileLayout>
      <PageHeader title="Legal documents" showBack />
      <p className="mx-4 mt-1 text-[12px] text-muted-foreground">
        The agreements and disclosures that govern your use of CAL Online.
      </p>
      <div className="mx-4 mt-4">
        <div className="rounded-2xl border border-border/40 bg-card backdrop-blur-md overflow-hidden divide-y divide-border/20">
          {documents.map(({ icon: Icon, label, description, to }) => (
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
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
        <p className="px-1 pt-3 text-[11px] text-muted-foreground/80">
          App version 2.4.1 · © {new Date().getFullYear()} Capital Alliance
        </p>
      </div>
      <div className="h-6" />
    </MobileLayout>
  );
}
