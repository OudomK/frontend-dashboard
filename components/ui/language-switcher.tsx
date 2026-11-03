"use client";

import { useTranslation } from "@/lib/hooks/use-translation";
import { useLangStore } from "@/lib/store/use-lang-store";
import { Button } from "@/components/ui/button";

const FlagEN = () => (
  <img src="/flags/us.svg" alt="English Flag" width={24} height={16} className="rounded-[2px] object-cover shadow-sm w-6 h-4" />
);
const FlagKM = () => (
  <img src="/flags/kh.svg" alt="Khmer Flag" width={24} height={16} className="rounded-[2px] object-cover shadow-sm w-6 h-4 border border-slate-200" />
);

export function LanguageSwitcher({ light }: { light?: boolean } = {}) {
  const { language } = useTranslation();
  const setLanguage = useLangStore((state) => state.setLanguage);

  const btnClass = light
    ? "h-9 px-3 gap-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-full transition-all shadow-sm"
    : "h-9 px-3 gap-2 border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700 hover:text-white text-slate-200 rounded-full transition-all";

  return (
    <Button
      variant="ghost"
      className={btnClass}
      onClick={() => setLanguage(language === "en" ? "km" : "en")}
    >
      {language === "km" ? <FlagKM /> : <FlagEN />}
      <span className="text-sm font-medium uppercase">{language}</span>
    </Button>
  );
}
