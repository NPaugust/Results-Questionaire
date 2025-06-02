"use client";
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Language } from "../types/surveyTypes";
import { LanguageContextType } from "../types/contextTypes";
import ru from "@/locales/ru.json";
import ky from "@/locales/ky.json";

interface ExtendedLanguageContextType extends LanguageContextType {
  getTranslation: (key: keyof typeof ru, lang?: Language) => string;
}

const LanguageContext = createContext<ExtendedLanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language | null;
      return saved === "ky" || saved === "ru" ? saved : "ru";
    }
    return "ru";
  });

  const toggleLanguage = useCallback(() => {
    const newLanguage: Language = language === "ru" ? "ky" : "ru";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  }, [language]);

  const getTranslation = useCallback(
    (key: keyof typeof ru, lang: Language = language) => {
      const translations: Record<Language, typeof ru> = { ru, ky };
      return translations[lang][key] || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, getTranslation }),
    [language, toggleLanguage, getTranslation]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}