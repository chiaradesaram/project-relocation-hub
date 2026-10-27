import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { ArrowRight, ArrowLeftRight, Building2, CalendarDays, Check, CheckCircle2, Copy, FilePlus2, HelpCircle, Landmark, Link2, PieChart, Wallet, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import transferGif from "@/assets/bank-transfer-info.gif";
import transferStill from "@/assets/bank-transfer-info.png";
import sentGif from "@/assets/request-submitted.gif";
import sentStill from "@/assets/request-submitted.png";

type StoryStep = { title: string; text: string; icon: typeof Zap; action?: string; bank?: boolean; bestFor?: string };
type Story = { title: string; steps: StoryStep[] };
const step = (title: string, text: string, icon: typeof Zap): StoryStep => ({ title, text, icon });
const pick = (title: string, text: string, bestFor: string, icon: typeof Zap): StoryStep => ({ title, text, bestFor, icon });

function storyFor(path: string, method: string, product: string): Story {
  const equity = product === "equities";
  const treasury = product === "treasuries";
  if (path === "/redeem") {
    if (!method) return { title: equity ? "Your withdrawal option" : "Compare ways to redeem", steps: equity ? [
      step("Pay Out", "Move money from your available equity cash balance to your bank. Choose an amount and bank account, then review and confirm your request.", Wallet),
    ] : [
      step("Normal Redemption", "For a withdrawal that can wait until processing. Choose an amount within your available balance. Requests before 9 AM are processed the same working day; later requests, the next working day.", Building2),
      step("Instant Redemption", "For money you need right away, including weekends and holidays. Redeem up to half your available balance, capped at LKR 100,000 — whichever is lower. Ongoing redemptions reduce that balance first.", Zap),
      step("Redemption Plan", "For regular monthly payouts rather than a one-off withdrawal. Choose your fund, sub account, monthly amount, start date and receiving bank account.", CalendarDays),
    ] };
    const title = method === "instant" ? "Instant Redemption" : method === "normal" ? "Normal Redemption" : method === "plan" ? "Redemption Plan" : "Pay Out";
    return { title, steps: [
      step("Choose where it comes from", method === "payout" ? "Your payout comes from your available equity cash balance." : "Pick the fund and sub account you want to redeem from. Money already being redeemed is taken out of your available balance.", PieChart),
      step(method === "plan" ? "Set your rhythm" : "Pick your amount", method === "instant" ? "Redeem up to half your available balance, capped at LKR 100,000 — whichever is lower." : method === "plan" ? "Choose your monthly payout amount and a start date." : "Enter an amount within your available balance.", method === "plan" ? CalendarDays : Wallet),
      step("Choose its next stop", "Select your bank account, review the details and confirm your request.", Building2),
      step("You're all set", method === "normal" ? "Requests before 9 AM are processed the same working day. After 9 AM, the next working day. Follow your request in Transactions." : method === "instant" ? "Instant redemption is available anytime, including weekends and holidays. Follow your request in Transactions." : "Find your request in Transactions after you confirm.", CheckCircle2),
    ] };
  }
  if (!method) return { title: "Compare ways to invest", steps: treasury ? [
    step("Treasury Bills", "For a shorter-term investment with a payout at maturity. Compare the listed maturity dates and rates, then calculate your estimated face value. The listed securities are samples, not live offers.", Landmark),
    step("Treasury Bonds", "For an investment with coupon payments along the way. Compare both the rate and coupon rate, then see your estimated face value and expected coupon payments.", CalendarDays),
    step("Bank Transfer", "For investments of at least LKR 500,000. After calculating your face value, transfer to CAL within 30 minutes, attach proof and select the bank you transferred from.", Building2),
    step("Justpay (Direct Invest)", "For investments from LKR 40,000 to LKR 74,940. Calculate your face value, choose your linked bank account and confirm. Money is debited directly — no separate transfer or proof upload.", Zap),
  ] : equity ? [
    step("Pay in", "For topping up with a bank transfer. Transfer to CAL, enter the amount, choose the sending bank and CAL account, then attach your receipt and confirm the request.", Building2),
    step("Justpay (Direct Invest)", "For topping up directly from your bank. Activate Justpay if needed, choose your bank and submit a request. Money is debited directly into your CAL equity account — no separate bank transfer.", Zap),
    step("Transfer from Unit Trusts", "For using money already invested with CAL. Choose a Unit Trust fund and sub account, then move an amount within its balance into your equity account instead of paying from your bank.", ArrowLeftRight),
  ] : [
    pick("Justpay (Direct Invest)", "Invest directly from your bank. Activate Justpay, choose your bank and submit a request. The money is debited from your account and added to your portfolio, with no separate transfer.", "quick investments", Zap),
    pick("Bank Transfer", "Transfer money to CAL's Deutsche Bank account, then raise a request telling us which fund to invest in. We'll match your transfer to the request.", "paying from your own banking app", Building2),
    pick("Recurring Investment", "Invest every month, automatically. Choose a fund and a bank, and the money is taken from your account and added to your portfolio each month.", "building your portfolio steadily", CalendarDays),
    pick("Fund Flip", "Move money between funds in your portfolio, without withdrawing first.", "changing where your money is invested", ArrowLeftRight),
    pick("Default Fund", "Save your preferred fund and sub account so transfers to CAL don't need a separate Creation Request each time.", "a usual destination for future transfers", PieChart),
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
            <div className="flex gap-1.5" aria-label="Story sections">
              {story.steps.map((item, i) => <button key={item.title} type="button" aria-label={`Go to ${item.title}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)} className="flex-1 py-1.5"><span className={`block h-1 rounded-full transition-colors motion-reduce:transition-none ${i <= index ? "bg-pill" : "bg-muted/50"}`} /></button>)}
            </div>
            <SheetTitle className="mt-3 text-base leading-snug">{story.title}</SheetTitle>
            <SheetDescription id="money-story-description" className="sr-only">Overview of {story.title}</SheetDescription>

            <section key={index} aria-live="polite" className="mt-4 min-h-44 motion-safe:animate-fade-in">
              <div className="flex items-start gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${index % 2 === 0 ? "bg-pill text-pill-foreground" : "bg-rates-mint text-background"}`}><Icon className="size-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-semibold leading-snug">{current.title}</h3>

                  <p className="mt-2 type-body-sm text-foreground">{current.text}</p>
                  {current.bestFor && <p className="mt-3 text-[13px] leading-snug text-foreground"><span className="text-muted-foreground">Best for: </span>{current.bestFor}</p>}
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