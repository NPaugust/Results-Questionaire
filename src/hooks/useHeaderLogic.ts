"use client";

import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { getCurrentUser } from "@/lib/api/login";

export const useHeaderLogic = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [userCourt, setUserCourt] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCourt = async () => {
      try {
        const userData = await getCurrentUser();
        setUserCourt(userData.court || "");
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        setUserCourt("");
      }
    };
    fetchUserCourt();
  }, []);

  useEffect(() => {
    const handleResize = debounce(() => setWindowWidth(window.innerWidth), 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = debounce(() => setIsSticky(window.scrollY > 0), 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return {
    isSticky,
    isSidebarOpen,
    windowWidth,
    userCourt,
    toggleSidebar,
  };
};