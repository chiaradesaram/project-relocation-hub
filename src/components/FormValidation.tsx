import { useState, type ReactNode } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FormIssue } from "@/lib/formValidation";

function focusField(field: string) {
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-validation-field]"))
    .find((element) => element.dataset.validationField === field);
  if (!target) return;
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
  target.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
}

export function useFormValidation(issues: FormIssue[]) {
  const [attempted, setAttempted] = useState(false);
  return {
    issues: attempted ? issues : [],
    error: (field: string) => attempted ? issues.find((issue) => issue.field === field)?.message : undefined,
    validate: () => {
      setAttempted(true);
      if (issues.length === 0) return true;
      window.requestAnimationFrame(() => focusField(issues[0]?.field ?? ""));
      return false;
    },
  };
}

export function ValidationField({ field, error, children }: { field: string; error?: string; children: ReactNode }) {
  return (
    <div data-validation-field={field} className={error ? "rounded-lg bg-destructive/10 ring-1 ring-inset ring-destructive/60" : undefined}>
      {children}
      {error && <p className="flex items-start gap-1.5 px-4 pb-2 pt-1 text-xs font-medium text-destructive"><AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />{error}</p>}
    </div>
  );
}

export function ValidationSummary({ issues }: { issues: FormIssue[] }) {
  if (!issues.length) return null;
  return (
    <div role="alert" className="mb-3 rounded-lg bg-pill/10 px-3 py-2 text-foreground">
      <p className="py-1 text-sm font-semibold">Just a few details to finish</p>
      {issues.map((issue) => (
        <Button key={issue.field} variant="ghost" onClick={() => focusField(issue.field)} className="h-auto min-h-9 w-full justify-between gap-2 whitespace-normal px-0 py-2 text-left text-xs font-normal text-foreground hover:bg-pill/10">
          <span>{issue.message}</span><ChevronRight className="size-3.5 shrink-0 text-pill" />
        </Button>
      ))}
    </div>
  );
}