import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FormSection — small uppercase header that groups related fields.
 * Mirrors the "FUND & ACCOUNT" / "TRANSFER DETAILS" labels in the mockup.
 */
export function FormSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-4 mt-6", className)}>
      {title && (
        <h2 className="px-1 mb-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground/70">
          {title}
        </h2>
      )}
      <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 divide-y divide-border/40 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

/**
 * FormField — a single field row with a bold white title and the input below.
 * Use as a child of FormSection so it picks up the divider.
 */
export function FormField({
  label,
  hint,
  error,
  action,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 pt-3 pb-3.5", className)}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground/70 leading-none">
          {label}
        </label>
        {action}
      </div>
      <div className="rounded-xl bg-background/40 border border-border/30 px-3 py-2.5 text-[15px] leading-tight transition-colors focus-within:border-primary/50 focus-within:bg-background/60">
        {children}
      </div>
      {hint && !error && (
        <p className="mt-2 text-[12px] text-muted-foreground/70 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="mt-2 text-[12px] text-destructive leading-snug">{error}</p>
      )}
    </div>
  );
}

export default FormField;
