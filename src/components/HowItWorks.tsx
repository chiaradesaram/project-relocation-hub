import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { ArrowRight, ArrowLeftRight, Building2, CalendarDays, Check, CheckCircle2, Copy, FilePlus2, HelpCircle, Landmark, Link2, PieChart, Wallet, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import transferGif from "@/assets/bank-transfer-info.gif";
import transferStill from "@/assets/bank-transfer-info.png";
import sentGif from "@/assets/request-submitted.gif";
import sentStill from "@/assets/request-submitted.png";

type StoryStep = { title: string; text: string; icon: typeof Zap; action?: string; bank?: boolean };
type Story = { title: string; steps: StoryStep[] };
const step = (title: string, text: string, icon: typeof Zap): StoryStep => ({ title, text, icon });

function storyFor(path: string, method: string, product: string): Story {
  const equity = product === "equities";
  const treasury = product === "treasuries";
  if (path === "/redeem") {
    if (!method) return { title: equity ? "Money back to your bank" : "Your money, your next move", steps: [
      step("Choose your way", equity ? "Pay out from your equity cash balance." : "Choose a normal redemption, instant redemption or a monthly redemption plan.", Wallet),
      step("Make it yours", "Choose an amount and the bank account you want to receive it in.", Building2),
      step("One last look", "Review your details and confirm your request. Follow it in Transactions.", CheckCircle2),
    ] };
    const title = method === "instant" ? "Instant Redemption" : method === "normal" ? "Normal Redemption" : method === "plan" ? "Redemption Plan" : "Pay Out";
    return { title, steps: [
      step("Choose where it comes from", method === "payout" ? "Your payout comes from your available equity cash balance." : "Pick the fund and sub account you want to redeem from. Money already being redeemed is taken out of your available balance.", PieChart),
      step(method === "plan" ? "Set your rhythm" : "Pick your amount", method === "instant" ? "Redeem up to half your available balance, capped at LKR 100,000 — whichever is lower." : method === "plan" ? "Choose your monthly payout amount and a start date." : "Enter an amount within your available balance.", method === "plan" ? CalendarDays : Wallet),
      step("Choose its next stop", "Select your bank account, review the details and confirm your request.", Building2),
      step("You're all set", method === "normal" ? "Requests before 9 AM are processed the same working day. After 9 AM, the next working day. Follow your request in Transactions." : method === "instant" ? "Instant redemption is available anytime, including weekends and holidays. Follow your request in Transactions." : "Find your request in Transactions after you confirm.", CheckCircle2),
    ] };
  }
  if (!method) return { title: treasury ? "A little guide to treasuries" : equity ? "Top up your equity account" : "Make your next money move", steps: [
    step("Choose your way", treasury ? "Start with Treasury Bills or Treasury Bonds, then choose Bank Transfer or Justpay (Direct Invest)." : equity ? "Choose Pay in, Justpay (Direct Invest) or Transfer from Unit Trusts." : "Choose Bank Transfer, Justpay (Direct Invest), Fund Flip, Recurring Investment or Default Fund.", treasury ? Landmark : PieChart),
    step("Make it yours", treasury ? "Pick a security and calculate its estimated face value. Bonds also show expected coupon payments." : "Choose where your money goes and how much you want to invest.", Wallet),
    step("Ready when you are", "Each method has its own short guide. Open How it works on the next screen for the details.", CheckCircle2),
  ] };
  const justpay: StoryStep[] = [
    step("Link your bank", "Choose your bank account and activate Justpay to link it, if you haven't already.", Link2),
    step("Make your request", "Enter your details, review and confirm your request from this page. If Justpay isn't active yet, you'll be asked to activate it.", FilePlus2),
    step("Bank to portfolio", equity ? "Your money is debited directly from your bank account and added to your CAL equity account. No separate bank transfer." : "Your money is debited directly from your bank account and added to your CAL portfolio. No separate bank transfer.", Zap),
  ];
  if (treasury) return { title: method === "instant" ? "Treasuries with Justpay" : "Treasuries by bank transfer", steps: [
    step("Find your security", "Pick a bill or bond using its ISIN, maturity date and rate. Bonds also show their coupon rate. The listed securities are samples, not live offers.", Landmark),
    step("See what comes back", method === "instant" ? "Enter LKR 40,000–74,940 and calculate your estimated face value. For bonds, see the expected coupon payments too." : "Enter at least LKR 500,000 and calculate your estimated face value. For bonds, see the expected coupon payments too.", Wallet),
    ...(method === "instant" ? justpay : [
      step("Make your transfer", "The next screen shows CAL's bank details. You have 30 minutes to make your transfer.", Building2),
      step("Send the finishing touches", "Attach your transfer proof, select the bank account you transferred from, and submit your request.", FilePlus2),
    ]),
  ] };
  if (method === "instant") return { title: "Justpay (Direct Invest)", steps: justpay };
  if (method === "bank") return { title: "Invest by bank transfer", steps: [
    { title: "Transfer to CAL", text: "Use CAL's Deutsche Bank account below to make your transfer.", icon: Landmark, bank: true, action: "I have made my transfer" },
    { title: "Raise a request", text: "Return here to make a Creation Request. Choose your fund, sub account and the bank you transferred from. You'll be emailed once your transfer is matched with this request.", icon: FilePlus2, action: "Raise a request" },
  ] };
  if (method === "flip" || method === "utflip") return { title: method === "flip" ? "A fresh home for your investment" : "Unit Trusts to equities", steps: [
    step("Choose where it comes from", "Tap Transfer from to choose your fund and sub account.", PieChart),
    step("Choose its next home", method === "flip" ? "Tap Transfer to and choose a different fund or sub account." : "Your money will move into your equity account. Check the transfer authorisation before reviewing.", ArrowLeftRight),
    step("Make your move", "Enter an amount within your source balance, review your details and confirm your request.", CheckCircle2),
  ] };
  if (method === "payin") return { title: "Pay in to your equity account", steps: [
    step("Transfer to CAL", "Make your bank transfer to CAL's bank account.", Building2),
    step("Tell us about it", "Enter your amount, select the bank you transferred from and the CAL account you sent to, then attach your receipt.", FilePlus2),
    step("Ready for review", "Review and confirm your Pay in request to fund your equity cash balance. Follow it in Transactions.", CheckCircle2),
  ] };
  if (method === "default") return { title: "Give your money a default home", steps: [
    step("Pick your favourite", "Choose the fund and sub account you want to use as your default.", PieChart),
    step("Save your choice", "Check your selection and save your default fund.", CheckCircle2),
    step("One less thing to do", "When you transfer money to CAL, your default fund means you don't need a separate Creation Request.", Building2),
  ] };
  return { title: "A little, regularly", steps: [
    step("Choose your destination", "Pick a fund and sub account for your recurring investment.", PieChart),
    step("Set your rhythm", "Choose an amount, bank account and start date for your monthly plan. Activate Justpay if your account isn't linked yet.", CalendarDays),
    step("Make it a plan", "Review and create your plan. You can come back to edit, pause or resume it.", CheckCircle2),
  ] };
}

export default function HowItWorks() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  if (location.pathname !== "/invest" && location.pathname !== "/redeem") return null;
  const search = location.search as Record<string, unknown>;
  const story = storyFor(location.pathname, String(search.method ?? ""), String(search.product ?? ""));
  const current = story.steps[index];
  if (!current) return null;
  const last = index === story.steps.length - 1;
  const Icon = current.icon;
  const close = () => setOpen(false);
  return (
    <div className="mx-4 mt-2 mb-1">
      <Button variant="link" onClick={() => { setIndex(0); setCopied(false); setOpen(true); }} className="h-8 px-0 text-[13px] text-pill hover:no-underline">
        <HelpCircle /> How it works
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" aria-describedby="money-story-description" onKeyDown={(event) => {
          if (event.key === "ArrowRight") setIndex((value) => Math.min(story.steps.length - 1, value + 1));
          if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
        }} className="bank-help-sheet mx-auto w-full max-w-[480px] max-h-[90dvh] overflow-y-auto rounded-t-3xl border-0 p-0 text-foreground backdrop-blur-2xl">
          <div className="bank-help-header relative">
            <picture className="block w-full">
              <source media="(prefers-reduced-motion: reduce)" srcSet={last && !current.bank ? sentStill : transferStill} />
              <img src={last && !current.bank ? sentGif : transferGif} alt="" className="block aspect-[768/300] w-full object-cover" />
            </picture>
            <Button variant="secondary" size="icon" aria-label="Close How it works" onClick={close} className="absolute right-4 top-4 rounded-full"><X /></Button>
          </div>
          <div className="px-7 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-1.5" aria-label="Story steps">
              {story.steps.map((item, i) => <button key={item.title} type="button" aria-label={`Go to step ${i + 1}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)} className="flex-1 py-1.5"><span className={`block h-1 rounded-full transition-colors motion-reduce:transition-none ${i <= index ? "bg-pill" : "bg-muted/50"}`} /></button>)}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="type-label text-pill-bright">How it works</span>
              <span className="type-caption text-foreground">{index + 1} of {story.steps.length}</span>
            </div>
            <SheetTitle className="mt-1 text-base leading-snug">{story.title}</SheetTitle>
            <SheetDescription id="money-story-description" className="sr-only">Step-by-step overview of {story.title}</SheetDescription>
            <section key={index} aria-live="polite" className="mt-4 min-h-44 motion-safe:animate-fade-in">
              <div className="flex items-start gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${index % 2 === 0 ? "bg-pill text-pill-foreground" : "bg-rates-mint text-background"}`}><Icon className="size-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <p className="type-caption text-pill-bright">Step {index + 1}</p>
                  <h3 className="mt-1 text-[15px] font-semibold leading-snug">{current.title}</h3>
                  <p className="mt-2 type-body-sm text-foreground">{current.text}</p>
                  {current.bank && <Button variant="secondary" aria-label="Copy CAL bank account number" onClick={async () => {
                    try { await navigator.clipboard.writeText("007845210036"); setCopied(true); } catch { setCopied(false); }
                  }} className="mt-3 h-auto w-full justify-between whitespace-normal rounded-lg bg-sheet-field px-3 py-3 text-left text-foreground hover:bg-sheet-field">
                    <span><span className="block type-caption">CAL Online (Pvt) Ltd · Deutsche Bank</span><span className="mt-1 block type-label">0078 4521 0036</span></span>
                    {copied ? <Check className="text-rates-mint" /> : <Copy className="text-pill-bright" />}
                  </Button>}
                </div>
              </div>
            </section>
            <Button onClick={() => last ? close() : setIndex(index + 1)} className="mt-5 h-12 w-full rounded-full bg-pill text-pill-foreground hover:bg-pill/90">{current.action ?? (last ? "Got it" : "Next")}{!last && <ArrowRight />}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}