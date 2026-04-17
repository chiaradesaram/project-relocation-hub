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
    <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0 bg-background/80 backdrop-blur-lg z-30">
      {showBack && (
        <button onClick={() => window.history.back()} className="text-foreground p-0.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <h1 className="text-[13px] font-medium text-foreground flex-1">{title}</h1>
      {showInfo && <Info className="w-4 h-4 text-muted-foreground" />}
      {!hideHelp && (
        <Link
          to="/help"
          search={{ topic }}
          className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
      )}
      {rightElement}
    </div>
  );
};

export default PageHeader;
