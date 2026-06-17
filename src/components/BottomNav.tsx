import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, TrendingUp, ArrowLeftRight, BarChart3, Menu, PieChart, BarChart2, Receipt, X } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" as const },
  { icon: TrendingUp, label: "Invest", path: "/invest" as const },
  { icon: ArrowLeftRight, label: "Transactions", path: "/transactions" as const },
  { icon: BarChart3, label: "Analytics", path: "/analytical" as const },
  { icon: Menu, label: "More", path: "/more" as const },
];

const productOptions = [
  { icon: PieChart, label: "Unit Trusts", param: "unit-trust" },
  { icon: BarChart2, label: "Equities", param: "equities" },
  { icon: Receipt, label: "Treasuries", param: "treasuries" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProductPicker, setShowProductPicker] = useState(false);

  const handleNavClick = (path: string) => {
    if (path === "/invest") {
      setShowProductPicker(true);
    } else {
      navigate({ to: path });
    }
  };

  return (
    <>
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowProductPicker(false)} />
          <div className="relative w-full rounded-t-3xl bg-card p-6 pb-10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">What would you like to invest in?</h3>
              <button onClick={() => setShowProductPicker(false)} className="p-1 rounded-full bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            {productOptions.map(({ icon: Icon, label, param }) => (
              <button
                key={param}
                onClick={() => {
                  setShowProductPicker(false);
                  navigate({ to: "/invest", search: { product: param } });
                }}
                className="w-full flex items-center gap-3 p-4 bg-secondary rounded-xl hover:bg-muted/50 transition mb-2"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="nav-glass border-t border-border/30 flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleNavClick(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[12px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
