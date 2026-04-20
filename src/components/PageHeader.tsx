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
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {showBack ? (
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-9 h-9 -ml-2 rounded-full text-foreground hover:bg-muted/40 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 -ml-2" />
        )}
        <div className="flex items-center gap-1">
          {showInfo && <Info className="w-4 h-4 text-muted-foreground" />}
          {!hideHelp && (
            <Link
              to="/help"
              search={{ topic }}
              className="flex items-center justify-center w-9 h-9 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
          )}
          {rightElement}
        </div>
      </div>
      <h1 className="px-4 pb-3 pt-1 text-[26px] font-bold text-foreground tracking-tight leading-tight">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
