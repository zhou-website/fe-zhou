"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale, TranslationKeys } from "@/locales/translations";

type LanguageContextType = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: TranslationKeys;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("ID");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zhou_lang") as Locale | null;
      if (saved === "EN" || saved === "ID") {
        setLanguageState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved === "EN" ? "en" : "id";
        }
      }
    } catch {
      // Ignore storage errors in SSR or restricted environments
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("zhou_lang", lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang === "EN" ? "en" : "id";
      }
    } catch {
      // Ignore storage errors
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
