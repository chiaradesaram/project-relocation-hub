import { ArrowLeft, HelpCircle, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type HelpTopic = "invest" | "rates" | "unit-trusts" | "transactions" | "general";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showInfo?: boolean;
  helpTopic?: HelpTopic;
  /** Hide the global help icon on this screen (default: false). */
  hideHelp?: boolean;
  rightElement?: React.ReactNode;
}

const PageHeader = ({
  title,
  showBack,
  showInfo,
  helpTopic,
  hideHelp,
  rightElement,
}: PageHeaderProps) => {
  const topic: HelpTopic = helpTopic ?? "general";
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-30">
      <div className="flex items-center px-4 pt-3 pb-3 min-h-[44px]">
        {/* Left */}
        <div className="flex items-center w-[72px] shrink-0">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Center title */}
        <h1 className="flex-1 text-center text-[17px] font-semibold text-foreground tracking-tight leading-tight truncate">
          {title}
        </h1>

        {/* Right */}
        <div className="flex items-center justify-end w-[72px] shrink-0 gap-0.5">
          {showInfo && <Info className="w-4 h-4 text-muted-foreground" />}
          {!hideHelp && (
            <Link
              to="/help"
              search={{ topic }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </Link>
          )}
          {rightElement}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
