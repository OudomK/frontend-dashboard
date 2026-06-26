"use client";

import { useTranslation } from "@/lib/hooks/use-translation";
import { useLangStore, Language } from "@/lib/store/use-lang-store";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { t, language } = useTranslation();
  const setLanguage = useLangStore((state) => state.setLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 overflow-hidden border border-slate-200">
          <img 
            src={language === "km" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/us.png"} 
            alt={language} 
            className="h-full w-full object-cover" 
          />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={`cursor-pointer flex items-center gap-2 ${language === "en" ? "bg-slate-100 font-medium" : ""}`}
        >
          <img src="https://flagcdn.com/w20/us.png" alt="English" className="w-5 h-auto rounded-[2px]" />
          {t("header.english")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("km")}
          className={`cursor-pointer flex items-center gap-2 ${language === "km" ? "bg-slate-100 font-medium" : ""}`}
        >
          <img src="https://flagcdn.com/w20/kh.png" alt="Khmer" className="w-5 h-auto rounded-[2px]" />
          {t("header.khmer")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
