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
        <h2 className="px-1 mb-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
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
    <div className={cn("px-4 py-3", className)}>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label className="text-[12px] font-medium text-muted-foreground leading-none">
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-muted-foreground/80 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-[11px] text-destructive leading-snug">{error}</p>
      )}
    </div>
  );
}

export default FormField;
