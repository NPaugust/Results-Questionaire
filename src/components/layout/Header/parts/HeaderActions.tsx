"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Globe, Printer, User } from "lucide-react";
import { LogoutButton } from "@/components/Logout";
import { usePathname } from "next/navigation";

const HeaderActions: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrint = () => {
    const isDiagramsPage =
      pathname.includes("/Home/summary/ratings") ||
      pathname.includes("/feedback") ||
      pathname.includes("/ratings");
    if (isDiagramsPage) {
      document.body.classList.add("printing-charts");
    }
    setTimeout(() => {
      window.print();
      document.body.classList.remove("printing-charts");
    }, 100);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrint}
        className="flex gap-2 items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-blue-100 
        hover:from-gray-200 hover:to-blue-200 transition-all duration-200 cursor-pointer rounded-full"
      >
        <Printer className="w-4 h-4 text-gray-800" />
        <span className="text-gray-800 font-medium text-xs sm:text-sm hidden sm:inline">
          {language === "ru" ? "Печать" : "Басып чыгаруу"}
        </span>
      </button>
      <div
        className="flex gap-2 items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-blue-100 
        hover:from-gray-200 hover:to-blue-200 transition-all duration-200 cursor-pointer rounded-full"
        onClick={toggleLanguage}
      >
        <Globe
          className={`w-4 h-4 text-gray-800 transition-transform duration-300 ${
            language === "ru" ? "rotate-0" : "rotate-180"
          }`}
        />
        <span className="text-gray-800 font-medium text-xs sm:text-sm">
          {language === "ru"
            ? windowWidth < 640
              ? "KG"
              : "Кыргызча"
            : windowWidth < 640
            ? "RU"
            : "Русский"}
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg HeaderUser_Exit">
        <div className="flex items-center gap-2 HeaderUser">
          <User className="w-5 h-5 text-gray-600 CgProfile" />
        </div>
        <div className="h-4 w-px bg-gray-300"></div>
        <LogoutButton />
      </div>
    </div>
  );
};

export default HeaderActions;