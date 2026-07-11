"use client";

import { useTranslation } from "@/lib/hooks/use-translation";
import { useLangStore } from "@/lib/store/use-lang-store";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FlagEN = () => (
  <img src="/flags/us.svg" alt="English Flag" width={24} height={16} className="rounded-[2px] object-cover shadow-sm w-6 h-4" />
);
const FlagKM = () => (
  <img src="/flags/kh.svg" alt="Khmer Flag" width={24} height={16} className="rounded-[2px] object-cover shadow-sm w-6 h-4 border border-slate-200" />
);

export function LanguageSwitcher({ light }: { light?: boolean } = {}) {
  const { t, language } = useTranslation();
  const setLanguage = useLangStore((state) => state.setLanguage);

  const btnClass = light 
    ? "h-9 px-3 gap-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-full transition-all shadow-sm"
    : "h-9 px-3 gap-2 border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700 hover:text-white text-slate-200 rounded-full transition-all";
  
  const menuClass = light
    ? "w-36 bg-white border-slate-200 text-slate-800 shadow-lg"
    : "w-36 bg-[#0F172A] border-slate-700 text-slate-200";

  const itemClass = (lang: string) => light
    ? `cursor-pointer flex items-center gap-3 py-2.5 focus:bg-slate-100 ${language === lang ? "bg-slate-50 font-medium text-slate-900" : "text-slate-600"}`
    : `cursor-pointer flex items-center gap-3 py-2.5 focus:bg-slate-800 focus:text-white ${language === lang ? "bg-slate-800/80 font-medium text-white" : ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={btnClass}>
          {language === "km" ? <FlagKM /> : <FlagEN />}
          <span className="text-sm font-medium uppercase">{language}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuClass}>
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={itemClass("en")}
        >
          <FlagEN />
          {t("header.english") || "English"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("km")}
          className={itemClass("km")}
        >
          <FlagKM />
          {t("header.khmer") || "ភាសាខ្មែរ"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
