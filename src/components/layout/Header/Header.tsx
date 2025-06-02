"use client";

import SidebarOverlay from "./parts/SidebarOverlay";
import { useHeaderLogic } from "@/hooks/useHeaderLogic";
import dynamic from "next/dynamic";

const HeaderNav = dynamic(() => import("./parts/HeaderNav"), { ssr: false });
const HeaderLogo = dynamic(() => import("./parts/HeaderLogo"), { ssr: false });
const HeaderActions = dynamic(() => import("./parts/HeaderActions"), {
  ssr: false,
});

const Header: React.FC = () => {

  const { isSticky, isSidebarOpen, windowWidth, userCourt, toggleSidebar } =
    useHeaderLogic();

  return (
    <>
    <header
  className={`
    fixed top-0 left-0 right-0 z-[100] 
    ${isSticky
      ? "backdrop-blur-lg bg-white/60 border-b border-gray-200 shadow-md"
      : "bg-white shadow-sm"}
    h-[4.5rem] flex items-center transition-all duration-500 
    ${isSidebarOpen ? "backdrop-blur-lg" : ""}
  `}
>
        <div className="w-full max-w-[1250px] mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <HeaderLogo windowWidth={windowWidth} toggleSidebar={toggleSidebar} />
            <HeaderNav windowWidth={windowWidth} userCourt={userCourt} />
          </div>

          <HeaderActions />
        </div>
      </header>


      <SidebarOverlay
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    </>
  );
};

export default Header;