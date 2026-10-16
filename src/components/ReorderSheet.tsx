import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ReorderItem = { id: string; label: string; hint?: string; on: boolean };

type ReorderSheetProps = {
  title: string;
  subtitle?: string;
  items: ReorderItem[];
  onToggle: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onClose: () => void;
};

export function ReorderSheet({ title, subtitle, items, onToggle, onMove, onClose }: ReorderSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card px-7 pb-10 pt-5">
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-foreground/20" />
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-secondary" onClick={onClose} aria-label="Close" autoFocus>
            <X />
          </Button>
        </div>
        {subtitle && <p className="mb-4 text-xs text-foreground/75">{subtitle}</p>}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-3 rounded-xl bg-secondary/60 px-3.5 py-3 transition ${item.on ? "" : "opacity-55"}`}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={item.on}
                aria-label={`${item.on ? "Hide" : "Show"} ${item.label}`}
                className={`flex size-6 shrink-0 items-center justify-center rounded-full transition ${item.on ? "bg-pill text-pill-foreground" : "border border-foreground/30 text-transparent"}`}
              >
                <Check className="size-3.5" />
              </button>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                {item.hint && <span className="block text-xs font-normal text-foreground/65">{item.hint}</span>}
              </span>
              <span className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onMove(item.id, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${item.label} up`}
                  className="flex size-6 items-center justify-center rounded-md bg-secondary text-foreground/80 transition hover:bg-secondary/70 disabled:opacity-30"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(item.id, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${item.label} down`}
                  className="flex size-6 items-center justify-center rounded-md bg-secondary text-foreground/80 transition hover:bg-secondary/70 disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>
        <Button className="mt-5 h-12 w-full rounded-full text-sm font-semibold" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
