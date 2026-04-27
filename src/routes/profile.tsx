import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Camera, ChevronRight, Trash2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

const profileFields = [
  { label: "Full Name", value: "John Doe" },
  { label: "Email", value: "john.doe@email.com" },
  { label: "Phone", value: "+94 77 123 4567" },
  { label: "NIC", value: "****5678V" },
  { label: "Address", value: "123 Galle Road, Colombo 03" },
  { label: "Date of Birth", value: "15 Mar 1990" },
];

function Profile() {
  return (
    <MobileLayout>
      <PageHeader title="Profile" showBack />

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            JD
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
        <p className="text-sm font-semibold text-foreground mt-2">John Doe</p>
        <p className="text-[12px] text-muted-foreground">Member since Jan 2024</p>
      </div>

      {/* Fields */}
      <div className="mx-4 mt-4 glass-card overflow-hidden divide-y divide-border/30">
        {profileFields.map((field) => (
          <div key={field.label} className="flex items-center justify-between p-3.5">
            <div>
              <p className="text-[12px] text-muted-foreground">{field.label}</p>
              <p className="text-xs font-medium text-foreground">{field.value}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4">
        <button className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold">
          Edit Profile
        </button>
      </div>

      <div className="mx-4 mt-3 mb-6">
        <button className="w-full py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </MobileLayout>
  );
}
