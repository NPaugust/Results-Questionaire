"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import courtData from "../../../../../public/courtIds.json"; 

interface HeaderNavProps {
  windowWidth: number;
  userCourt: string | null;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ windowWidth, userCourt }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const { language, getTranslation } = useLanguage();

  const getCourtSlug = (courtName: string): string => {
    const court = courtData.courts.find((item) => item.court === courtName);
    return court ? court.slug : "court-id";
  };

  if (windowWidth <= 1024) return null;

  return (
    <div className="flex items-center gap-3">
      {user?.role === "Председатель 3 инстанции" ? (
        <div className="flex space-x-3 p-2 rounded-xl">
          <Link
            href="/Home/summary/ratings"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname === "/Home/summary/ratings" ||
                pathname === "/Home/summary/feedbacks"
                ? "text-gray-600 bg-blue-50 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavOne", language)}
          </Link>
          <Link
            href="/Home/supreme-court/ratings"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname === "/Home/supreme-court/ratings" ||
                pathname === "/Home/supreme-court/feedbacks"
                ? "text-blue-600 bg-blue-100 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavTwo", language)}
          </Link>
          <Link
            href="/Home/second-instance"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname.startsWith("/Home/second-instance") ||
                pathname === "/results/Home/second-instance"
                ? "text-blue-600 bg-blue-100 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavThree", language)}
          </Link>
          <Link
            href="/Home/first-instance/ratings"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname.startsWith("/Home/first-instance") ||
                pathname === "/results/Home/first-instance"
                ? "text-blue-600 bg-blue-100 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavFour", language)}
          </Link>
        </div>
      ) : user?.role === "Председатель 2 инстанции" ? (
        <div className="flex space-x-3 p-2 rounded-xl">
          <Link
            href="/Home/summary2/ratings"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname === "/Home/summary2/ratings"
                ? "text-blue-600 bg-blue-100 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavOne", language)}
          </Link>
          <Link
            href="/Home/first_instance/ratings"
            className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
              flex items-center gap-2 ${pathname.startsWith("/Home/first_instance")
                ? "text-blue-600 bg-blue-100 shadow-inner"
                : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
              }`}
          >
            {getTranslation("HeaderNavRegionalRatings", language)}
          </Link>
          {userCourt && (
            <Link
              href={`/Home/${getCourtSlug(userCourt)}/ratings2`}
              className={`HeaderNav relative px-4 py-2 rounded-md font-semibold transition-all duration-300 
      flex items-center gap-2 ${pathname.includes(`/Home/${getCourtSlug(userCourt)}/ratings2`) ||
                  pathname.includes(`/Home/${getCourtSlug(userCourt)}/feedbacks`)
                  ? "text-blue-600 bg-blue-100 shadow-inner"
                  : "text-gray-700 hover:text-blue-900 hover:bg-blue-50"
                }`}
            >
              {userCourt}
            </Link>
          )}
        </div>
      ) : (
        null
      )}
    </div>
  );

};

export default HeaderNav;