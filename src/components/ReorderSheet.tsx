import { Check, GripVertical, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";

export type ReorderItem = { id: string; label: string; hint?: string; on: boolean };

type ReorderSheetProps = {
  title: string;
  subtitle?: string;
  items: ReorderItem[];
  onToggle: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onClose: () => void;
};

export function ReorderSheet({ title, subtitle, items, onToggle, onReorder, onClose }: ReorderSheetProps) {
  const [order, setOrder] = useState<string[]>(items.map((i) => i.id));
  const [dragId, setDragId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrder((prev) => {
      const ids = items.map((i) => i.id);
      if (prev.length === ids.length && prev.every((id) => ids.includes(id))) return prev;
      return ids;
    });
  }, [items]);

  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered = order.map((id) => byId.get(id)).filter((i): i is ReorderItem => Boolean(i));

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragId(id);
  };

  const onDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragId || !listRef.current) return;
    const rows = Array.from(listRef.current.children) as HTMLElement[];
    const overIndex = rows.findIndex((row) => {
      const rect = row.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    const from = order.indexOf(dragId);
    const to = overIndex === -1 ? order.length - 1 : overIndex;
    if (to !== from) {
      const next = [...order];
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      setOrder(next);
    }
  };

  const endDrag = () => {
    if (dragId) onReorder(order);
    setDragId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[75dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card px-5 pb-6 pt-4">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-foreground/20" />
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-full bg-secondary" onClick={onClose} aria-label="Close" autoFocus>
            <X className="size-4" />
          </Button>
        </div>
        {subtitle && <p className="mb-3 text-xs text-foreground/75">{subtitle}</p>}
        <div ref={listRef} className="space-y-1.5">
          {ordered.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5 transition ${item.on ? "" : "opacity-55"} ${dragId === item.id ? "ring-1 ring-primary" : ""}`}
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={item.on}
                aria-label={`${item.on ? "Hide" : "Show"} ${item.label}`}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full transition ${item.on ? "bg-pill text-pill-foreground" : "border border-foreground/30 text-transparent"}`}
              >
                <Check className="size-3" />
              </button>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                {item.hint && <span className="block text-[11px] font-normal text-foreground/65">{item.hint}</span>}
              </span>
              <button
                type="button"
                onPointerDown={(e) => startDrag(e, item.id)}
                onPointerMove={onDragMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                aria-label={`Drag to reorder ${item.label}`}
                className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-foreground/55 active:cursor-grabbing active:text-foreground"
              >
                <GripVertical className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <Button className="mt-4 h-10 w-full rounded-full text-sm font-semibold" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
