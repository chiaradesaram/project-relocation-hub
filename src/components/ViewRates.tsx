import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FUND_RATES } from "@/lib/fundMeta";

// Blue "View rates" link that opens a bottom sheet with each fund's rate.
// Render it at the top of any fund picker.
export function ViewRatesLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] font-medium"
        style={{ color: "var(--pill)" }}
      >
        View rates
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Fund rates</SheetTitle>
          </SheetHeader>
          <div className="mt-3 space-y-1.5 pb-6">
            {Object.entries(FUND_RATES).map(([name, rate]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3"
              >
                <span className="text-sm text-foreground">{name}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--pill)" }}
                >
                  {rate}
                </span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
