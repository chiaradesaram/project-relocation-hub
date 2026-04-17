import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

interface HelpFAQProps {
  title?: string;
  items: FAQItem[];
}

const HelpFAQ = ({ title = "Help & FAQs", items }: HelpFAQProps) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <HelpCircle className="w-3 h-3 text-muted-foreground" />
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">
          {title}
        </p>
      </div>
      <div className="glass-card overflow-hidden divide-y divide-border/40">
        {items.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full text-left px-3 py-2.5 flex flex-col gap-1 transition-colors hover:bg-secondary/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-foreground">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isOpen && (
                <p className="text-[10px] text-muted-foreground leading-relaxed pr-5">
                  {item.a}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HelpFAQ;
