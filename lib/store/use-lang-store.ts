import { create } from "zustand";

export type Language = "en" | "km";

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
  initialize: () => void;
}

export const useLangStore = create<LangState>((set) => ({
  language: "en", // Default to English
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("women_health_dashboard_lang", lang);
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },
  initialize: () => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("women_health_dashboard_lang") as Language;
      if (storedLang && (storedLang === "en" || storedLang === "km")) {
        document.documentElement.lang = storedLang;
        set({ language: storedLang });
      }
    }
  },
}));
