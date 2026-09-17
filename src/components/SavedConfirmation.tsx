import { Check } from "lucide-react";

// Monzo-style saved confirmation: translucent green tick + "Saved" + summary.
// Used consistently wherever a settings save is confirmed inside a sheet.
export default function SavedConfirmation({ summary }: { summary: string }) {
  return (
    <div className="px-1 pb-10 pt-6 flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "color-mix(in oklch, var(--success) 22%, transparent)",
        }}
      >
        <Check
          className="w-8 h-8"
          strokeWidth={2.5}
          style={{ color: "var(--success)" }}
        />
      </div>
      <p className="text-base font-semibold text-foreground mt-4">Saved</p>
      <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
        {summary}
      </p>
    </div>
  );
}
