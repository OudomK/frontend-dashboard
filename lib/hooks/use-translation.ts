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
export type TranslationKey = keyof Translations | (string & {});

export function useTranslation() {
  const { language, initialize } = useLangStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const t = useCallback(
    (key: TranslationKey, args?: Record<string, string | number>): string => {
      const locale = (translations as Record<string, Record<string, string>>)[language] || translations["en"];
      // Fallback to English if key is missing in Khmer
      let text = locale[key as string] || (translations["en"] as Record<string, string>)[key as string] || (key as string);
      
      if (args && text) {
        Object.keys(args).forEach(argKey => {
          text = text.replace(new RegExp(`{${argKey}}`, 'g'), String(args[argKey]));
        });
      }
      
      return text;
    },
    [language]
  );

  return { t, language };
}

// Trigger hot reload
