"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import logo from "../../../../../public/logo.webp";
import { useAuth } from "@/context/AuthContext";

interface HeaderLogoProps {
  windowWidth: number;
  toggleSidebar: () => void;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ windowWidth, toggleSidebar }) => {
  const { user } = useAuth();
  const logoLink = () =>
    user?.role === "Председатель 2 инстанции"
      ? "/Home/first_instance/ratings"
      : "/Home/summary/ratings";

  return (
    <div className="flex items-center gap-3">
      {windowWidth < 1024 && (
        <>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </>
      )}
      <Link href={logoLink()} className="flex items-center">
        <Image
          src={logo}
          alt="Логотип"
          width={40}
          height={40}
          className="rounded-full shadow-sm Logo_1024"
        />
      </Link>
      {user?.role === "Председатель 1 инстанции" && (
        <span className="font-bold text-xl text-gray-800">
          {user.court}
        </span>
      )}
    </div>
  );
};

export default HeaderLogo;
