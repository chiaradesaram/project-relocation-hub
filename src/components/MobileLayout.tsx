import { Children, Fragment, ReactNode } from "react";
import BottomNav from "./BottomNav";
import HowItWorks from "./HowItWorks";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const MobileLayout = ({ children, hideNav }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div data-mobile-layout-scroll className="flex-1 overflow-y-auto pb-20">
        {Children.toArray(children).map((child, index) => (
          <Fragment key={index}>
            {child}
            {index === 0 && <HowItWorks />}
          </Fragment>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
};

export default MobileLayout;
