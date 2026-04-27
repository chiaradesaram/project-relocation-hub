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

type Option = { value: string; label: React.ReactNode; disabled?: boolean };

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
    };
    const labelNode = props.children ?? "";
    const labelText = typeof labelNode === "string" ? labelNode : "";
    // Treat option with no explicit value or empty value as the placeholder
    if (props.value === undefined || props.value === "") {
      placeholder = typeof label === "string" ? label : undefined;
      placeholder = labelText || placeholder;
      return;
    }
    options.push({ value: props.value, label: labelNode, disabled: props.disabled });
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
          "h-auto w-full rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 text-[11px] font-normal text-foreground shadow-none backdrop-blur-md transition hover:border-primary/40 focus:ring-0 focus-visible:ring-0 data-[placeholder]:text-muted-foreground",
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
            className="rounded-lg text-[12px] focus:bg-primary/15 focus:text-foreground"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ModernSelect;