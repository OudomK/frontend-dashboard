"use client";

import { useCallback, useEffect } from "react";
import { useLangStore } from "../store/use-lang-store";

import en from "../../locales/en.json";
import km from "../../locales/km.json";

const translations = {
  en,
  km,
};

type Translations = typeof en;
export type TranslationKey = keyof Translations;

export function useTranslation() {
  const { language, initialize } = useLangStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const locale = translations[language] || translations["en"];
      // Fallback to English if key is missing in Khmer
      return locale[key] || translations["en"][key] || key;
    },
    [language]
  );

  return { t, language };
}
