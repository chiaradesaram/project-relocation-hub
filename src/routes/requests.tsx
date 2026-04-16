import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { useNavigate } from "@tanstack/react-router";
import { Stamp, ClipboardList, Users, ChevronRight, FileText } from "lucide-react";

export const Route = createFileRoute("/requests")({
  component: Requests,
});

const requestTypes = [
  {
    icon: Stamp,
    label: "Balance Confirmation (IRD/Tax)",
    description: "Official balance confirmation letter for tax filing purposes",
    path: "/requests",
  },
  {
    icon: ClipboardList,
    label: "Balance Confirmation (Visa)",
    description: "Balance confirmation for visa or travel documentation",
    path: "/requests",
  },
  {
    icon: Users,
    label: "Nomination Update",
    description: "Update or add nominees to your investment accounts",
    path: "/requests",
  },
  {
    icon: FileText,
    label: "Account Statement",
    description: "Request a detailed account statement for a specific period",
    path: "/requests",
  },
];

function Requests() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <PageHeader title="Requests" showBack />

      <p className="px-4 mt-2 text-[11px] text-muted-foreground">
        Submit service requests and track their status.
      </p>

      <div className="px-4 mt-3 space-y-2 mb-4">
        {requestTypes.map(({ icon: Icon, label, description, path }) => (
          <button
            key={label}
            onClick={() => navigate({ to: path })}
            className="w-full glass-card p-4 flex items-center gap-3 hover:bg-muted/30 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </MobileLayout>
  );
}
