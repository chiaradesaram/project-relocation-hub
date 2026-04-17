import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showInfo?: boolean;
  rightElement?: React.ReactNode;
}

const PageHeader = ({ title, showBack, showInfo, rightElement }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0 bg-background/80 backdrop-blur-lg z-30">
      {showBack && (
        <button onClick={() => window.history.back()} className="text-foreground p-0.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <h1 className="text-[13px] font-medium text-foreground flex-1">{title}</h1>
      {showInfo && <Info className="w-4 h-4 text-muted-foreground" />}
      {rightElement}
    </div>
  );
};

export default PageHeader;
