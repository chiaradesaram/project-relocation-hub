import { useState, type ReactNode } from "react";
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
    <div
      data-validation-field={field}
      aria-invalid={error ? true : undefined}
      title={error}
      className={error ? "rounded-lg ring-1 ring-inset ring-pill/70 bg-pill/5 transition-colors" : "transition-colors"}
    >
      {children}
    </div>
  );
}

export function ValidationSummary(_props: { issues: FormIssue[] }) {
  return null;
}
