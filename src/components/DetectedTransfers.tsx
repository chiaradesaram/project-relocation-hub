import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowRight, Check, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDetectedTransfers } from "./DetectedTransferProvider";
import { TRANSFER_FUNDS, TRANSFER_REFLECTION_WORKING_DAYS } from "@/lib/detectedTransfers";
import sampathLogo from "@/assets/banks/sampath.png";

const money = (amount: number) => `LKR ${amount.toLocaleString("en-LK")}`;

export default function DetectedTransfers() {
  const { transfers, prompted, autoOpen, markPrompted, assign } = useDetectedTransfers();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [fund, setFund] = useState("");
  const [confirmedId, setConfirmedId] = useState<string>();
  const pending = transfers.filter((transfer) => !transfer.fund);
  const selected = transfers.find((transfer) => transfer.id === selectedId);
  const confirmed = transfers.find((transfer) => transfer.id === confirmedId);

  useEffect(() => {
    if (!prompted) {
      setSelectedId(undefined);
      setConfirmedId(undefined);
      setFund("");
      markPrompted();
      setOpen(autoOpen && pending.length > 0);
    }
  }, [prompted, autoOpen, pending.length, markPrompted]);

  const showList = () => { setSelectedId(undefined); setConfirmedId(undefined); setFund(""); };
  const reopen = () => { showList(); setOpen(true); };
  const choose = (id: string) => { setSelectedId(id); setConfirmedId(undefined); setFund(""); };

  return <>
    {pending.length > 0 && <Button variant="ghost" onClick={reopen} aria-label={`Choose funds for ${pending.length} received transfers`} className="h-auto min-h-18 w-full justify-start gap-3 whitespace-normal rounded-xl bg-card px-3.5 py-3 text-left hover:bg-secondary/70">
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-rates-mint/15 text-rates-mint"><ArrowDownLeft className="size-4" strokeWidth={2.3} /><span className="absolute right-0 top-0 size-2 rounded-full bg-allocation-treasuries ring-2 ring-card" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{pending.length === 1 ? "Choose your fund" : "Choose your funds"}</span><span className="mt-1 block text-xs font-normal text-foreground/75">{pending.length} {pending.length === 1 ? "transfer" : "transfers"} · {money(pending.reduce((total, transfer) => total + transfer.amount, 0))}</span></span>
      <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-pill-bright"><ChevronRight className="size-4" /></span>
    </Button>}

    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="bank-help-sheet mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 text-foreground backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-foreground/20" />
        <div className="relative flex min-h-9 items-center justify-center">
          {selected && !confirmed && <Button variant="ghost" size="icon" aria-label="Back to transfers" onClick={showList} className="absolute left-0 size-8 rounded-full"><ArrowLeft className="size-4" /></Button>}
          <SheetTitle className="text-center text-base">{confirmed ? "Fund confirmed" : selected ? "Choose a fund" : "Your money has arrived"}</SheetTitle>
          <Button variant="ghost" size="icon" aria-label="Close transfers" onClick={() => setOpen(false)} className="absolute right-0 size-8 rounded-full bg-secondary"><X className="size-4" /></Button>
        </div>
        {confirmed ? <div className="pt-7 text-center" aria-live="polite">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success"><Check className="size-8" /></span>
          <p className="mt-4 text-2xl font-bold tabular-nums">{money(confirmed.amount)}</p>
          <p className="mt-1 text-sm">into {confirmed.fund}</p>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed">You’ll see this reflected on your portal in {TRANSFER_REFLECTION_WORKING_DAYS} working day.</p>
          {pending.length > 0 ? <><p className="mt-6 text-xs">{pending.length} {pending.length === 1 ? "transfer still needs" : "transfers still need"} a fund</p><Button onClick={() => { const next = pending[0]; if (next) choose(next.id); }} className="mt-3 h-12 w-full rounded-full bg-pill text-pill-foreground">Choose next fund<ArrowRight className="size-4" /></Button><Button variant="link" onClick={() => setOpen(false)} className="mt-2 text-foreground">I’ll do the rest later</Button></> : <><p className="mt-6 text-sm font-semibold text-rates-mint">{transfers.length === 1 ? "Your transfer is taken care of" : `All ${transfers.length} transfers are taken care of`}</p><Button onClick={() => setOpen(false)} className="mt-4 h-12 w-full rounded-full bg-pill text-pill-foreground">Done</Button></>}
        </div> : selected ? <>
          <div className="py-6 text-center"><p className="text-2xl font-bold tabular-nums">{money(selected.amount)}</p><p className="mt-1.5 text-sm text-foreground/70">{selected.received} · {selected.reference}</p></div>
          <p className="mb-3 text-sm">Where would you like to invest it?</p>
          <div className="space-y-2">{TRANSFER_FUNDS.map((name) => <Button key={name} variant="ghost" aria-pressed={fund === name} onClick={() => setFund(name)} className={`h-auto min-h-14 w-full justify-start gap-3 whitespace-normal rounded-lg px-3.5 py-3 text-left ${fund === name ? "bg-pill/20 hover:bg-pill/25" : "bg-sheet-field hover:bg-secondary"}`}>
            <span className="flex-1 text-sm">{name}</span><span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${fund === name ? "bg-pill text-pill-foreground" : "border border-foreground/50"}`}>{fund === name && <Check className="size-3.5" />}</span>
          </Button>)}</div>
          <Button disabled={!fund} onClick={() => { if (!fund || selected.fund) return; assign(selected.id, fund); setConfirmedId(selected.id); }} className="mt-6 h-12 w-full rounded-full bg-pill text-pill-foreground disabled:opacity-40">Confirm fund</Button>
        </> : <>
          <div className="mt-5 flex items-center gap-3"><img src={sampathLogo} alt="Sampath Bank" className="size-9 rounded-full bg-foreground object-contain p-1" /><p className="text-sm">{pending.length === 1 ? "We found your transfer" : `We found ${pending.length} transfers`} to CAL’s Sampath Bank. Choose a fund for each one.</p></div>
          <div className="mt-5 space-y-2">{transfers.map((transfer) => <Button key={transfer.id} variant="ghost" disabled={!!transfer.fund} onClick={() => choose(transfer.id)} aria-label={transfer.fund ? `${transfer.reference} confirmed` : `Assign ${transfer.reference}`} className="h-auto min-h-20 w-full justify-start gap-3 whitespace-normal rounded-lg bg-sheet-field px-4 py-3 text-left hover:bg-secondary disabled:opacity-100">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${transfer.fund ? "bg-success/20 text-success" : "bg-pill/20 text-pill-bright"}`}>{transfer.fund ? <Check className="size-4" /> : <ArrowDownLeft className="size-4" />}</span>
            <span className="min-w-0 flex-1"><span className="block text-base font-semibold tabular-nums">{money(transfer.amount)}</span><span className="mt-1 block text-xs font-normal">{transfer.fund ?? transfer.received}</span><span className="mt-0.5 block text-xs font-normal">{transfer.fund ? "Fund confirmed" : transfer.reference}</span></span>
            {!transfer.fund && <ChevronRight className="size-4 shrink-0 text-pill-bright" />}
          </Button>)}</div>
          <Button variant="link" onClick={() => setOpen(false)} className="mt-4 h-10 w-full text-foreground">I’ll choose later</Button>
        </>}
      </SheetContent>
    </Sheet>
  </>;
}