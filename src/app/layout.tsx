"use client";
import React, { useEffect } from "react";
import "@/styles/globals.css";
import "@/styles/skeleton.css";
import "@/styles/map.css";
import "@/styles/responsive/responsive.css";
import Header from "@/components/layout/Header/Header";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SurveyProvider } from "@/context/SurveyProvider";
import { useLanguage } from "@/context/LanguageContext"; 
import { usePathname, useRouter } from "next/navigation";
import LoginPage from "./login/page";

const inter = Inter({
  subsets: ["cyrillic"],
  weight: ["400", "700"],
  display: "swap",  
  variable: "--font-inter",
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <body className="min-h-screen slate-100 font-inter">
        <SurveyProvider>
          <AuthProvider>
            <div className="root-layout-wrapper">
              <AuthContent>{children}</AuthContent>
            </div>
          </AuthProvider>
        </SurveyProvider>
      </body>
    </html>
  );
}

function AuthContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage(); 
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && pathname === "/results/login") {
      router.push("/Home/summary/ratings");
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  if (!isAuthenticated && pathname === "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginPage />
      </div>
    );
  }

  const isRemarksPath = pathname.startsWith("/results/remarks/");

  if (isRemarksPath) {
    return (
      <div className="w-full">
        <div className="flex min-h-[calc(100vh-48px)] mt-0">
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] mx-auto layout">
      <Header />
      <div className="flex min-h-[calc(100vh-48px)] mt-16">
        <main className="flex-1 max-w-[1250px] mx-auto">{children}</main>
      </div>
    </div>
  );
}