import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for native <select> that uses Radix under the hood,
 * so the open menu matches the app's modern dark style instead of the OS dropdown.
 *
 * Accepts the same children as a native select: <option value="..."> elements.
 * Works with the existing onChange={(e) => ...e.target.value...} pattern.
 */

type Option = { value: string; label: string; pill?: string; action?: string; disabled?: boolean };

interface ModernSelectProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function extractOptions(children: React.ReactNode): {
  options: Option[];
  placeholder?: string;
} {
  const options: Option[] = [];
  let placeholder: string | undefined;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type !== "option") return;
    const props = child.props as {
      value?: string;
      children?: React.ReactNode;
      disabled?: boolean;
      "data-pill"?: string;
      "data-action"?: string;
    };
    const labelNode = props.children ?? "";
    const labelText = typeof labelNode === "string" ? labelNode : "";
    // Empty-string value (e.g. <option value="">Select…</option>) is the placeholder
    if (props.value === "") {
      placeholder = labelText || placeholder;
      return;
    }
    // If no value attribute is provided, fall back to the text label (matches HTML spec)
    const value = props.value ?? labelText;
    if (!value) return;
    options.push({ value, label: labelText, pill: props["data-pill"], action: props["data-action"], disabled: props.disabled });
  });

  return { options, placeholder };
}

export function ModernSelect({
  value,
  onChange,
  className,
  contentClassName,
  placeholder,
  children,
  disabled,
}: ModernSelectProps) {
  const { options, placeholder: derivedPlaceholder } = extractOptions(children);
  const ph = placeholder ?? derivedPlaceholder ?? "Select…";

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange?.({ target: { value: v } })}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-auto w-full rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 text-[13px] font-normal text-foreground shadow-none backdrop-blur-md transition hover:border-primary/40 focus:ring-0 focus-visible:ring-0 data-[placeholder]:text-muted-foreground",
          className,
        )}
      >
        <SelectValue placeholder={ph} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl",
          contentClassName,
        )}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className="rounded-lg text-[13px] py-2 focus:bg-primary/15 focus:text-foreground"
          >
            <span className="flex items-center gap-2">
              {opt.label}
              {opt.pill && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/25 text-primary border border-primary/20">
                  {opt.pill}
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ModernSelect;