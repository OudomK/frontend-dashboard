import { create } from "zustand";

export type Language = "en" | "km";

const LANG_KEY = "women_health_dashboard_lang";

// Read the saved language at store-creation time so the very first client
// render already uses it - this removes the brief flash where a saved "en"
// showed as the default "km" until the initialize() effect ran a tick later.
// On the server `window` is undefined, so this falls back to "km".
function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "km") return stored;
  }
  return "km";
}

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
  initialize: () => void;
}

export const useLangStore = create<LangState>((set) => ({
  language: getInitialLanguage(), // Saved choice if any, else Khmer
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },
  initialize: () => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem(LANG_KEY) as Language;
      if (storedLang && (storedLang === "en" || storedLang === "km")) {
        document.documentElement.lang = storedLang;
        set({ language: storedLang });
      }
    }
  },
}));
