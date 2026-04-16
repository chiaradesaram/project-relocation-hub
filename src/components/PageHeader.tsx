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
    <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-background/80 backdrop-blur-lg z-30">
      {showBack && (
        <button onClick={() => window.history.back()} className="text-foreground p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-lg font-bold text-foreground flex-1">{title}</h1>
      {showInfo && <Info className="w-4 h-4 text-muted-foreground" />}
      {rightElement}
    </div>
  );
};

export default PageHeader;
