import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Play, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PRESENTATION_SCENARIOS, scenarioTransfers, type PresentationScenario } from "@/lib/presentationScenarios";
import { useDetectedTransfers } from "./DetectedTransferProvider";

export default function FlowPresenter() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { reset } = useDetectedTransfers();
  const filtered = PRESENTATION_SCENARIOS.filter((scenario) => `${scenario.group} ${scenario.label}`.toLowerCase().includes(query.toLowerCase()));
  const groups = Array.from(new Set(filtered.map((scenario) => scenario.group)));

  const launch = (scenario: PresentationScenario) => {
    setOpen(false);
    if (scenario.kind === "transfers") {
      reset(scenarioTransfers(scenario.count, scenario.assigned), !scenario.reminder);
      void navigate({ to: "/" });
    } else if (scenario.kind === "invest") {
      void navigate({ to: "/invest", search: { product: scenario.product, method: scenario.method, treasury: scenario.treasury } });
    } else {
      void navigate({ to: "/redeem", search: { product: scenario.product, method: scenario.method } });
    }
  };

  return <>
    <nav aria-label="Presentation controls" className="mx-auto flex max-w-md items-center justify-between border-b border-border/40 bg-background px-4 py-1">
      <span className="text-xs text-muted-foreground">Preview</span>
      <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setOpen(true); }} className="h-8 gap-1.5 px-2 text-xs text-pill-bright hover:bg-pill/10" title="Present a sample flow"><Play className="size-3.5" />Present flows</Button>
    </nav>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="bank-help-sheet mx-auto flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl border-0 p-0 text-foreground backdrop-blur-2xl">
        <div className="shrink-0 px-6 pt-5 pb-4">
          <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-foreground/20" />
          <div className="relative flex min-h-9 items-center justify-center"><SheetTitle className="text-base">Present a flow</SheetTitle><Button variant="ghost" size="icon" aria-label="Close presenter" onClick={() => setOpen(false)} className="absolute right-0 size-8 rounded-full bg-secondary"><X /></Button></div>
          <SheetDescription className="mt-1 text-center text-xs text-foreground">Sample scenarios · no real money is moved</SheetDescription>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-sheet-field px-3"><Search className="size-4 shrink-0 text-pill-bright" /><input aria-label="Find a flow" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a flow" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" /></div>
        </div>
        <div className="min-h-0 overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {groups.map((group) => <section key={group} className="mb-5"><h2 className="mb-2 text-xs font-semibold text-pill-bright">{group}</h2><div className="space-y-1.5">{filtered.filter((scenario) => scenario.group === group).map((scenario) => <Button key={scenario.id} variant="ghost" onClick={() => launch(scenario)} className="h-auto min-h-12 w-full justify-start gap-3 whitespace-normal rounded-lg bg-sheet-field px-3.5 py-3 text-left hover:bg-secondary"><Play className="size-3.5 shrink-0 text-pill-bright" /><span className="min-w-0 flex-1 text-[13px] font-medium">{scenario.label}</span><ChevronRight className="size-3.5 shrink-0" /></Button>)}</div></section>)}
          {filtered.length === 0 && <p className="py-6 text-center text-sm">No matching flows</p>}
        </div>
      </SheetContent>
    </Sheet>
  </>;
}