"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/hooks/use-translation";

interface ExportDropdownProps {
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  label?: string;
}

export function ExportDropdown({ onExportCsv, onExportExcel, onExportPdf, label }: ExportDropdownProps) {
  const { t } = useTranslation();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-lg border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <Download className="mr-1.5 h-4 w-4 text-slate-500" />
          {label || "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-1.5">
        {onExportCsv && (
          <DropdownMenuItem onClick={onExportCsv} className="cursor-pointer font-semibold text-slate-700 rounded-lg py-2.5 px-3 focus:bg-slate-100 focus:text-slate-900 transition-colors">
            <FileText className="mr-3 h-4 w-4 text-blue-500" />
            CSV
          </DropdownMenuItem>
        )}
        {onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer font-semibold text-slate-700 rounded-lg py-2.5 px-3 focus:bg-slate-100 focus:text-slate-900 transition-colors">
            <FileSpreadsheet className="mr-3 h-4 w-4 text-emerald-500" />
            Excel
          </DropdownMenuItem>
        )}
        {onExportPdf && (
          <DropdownMenuItem onClick={onExportPdf} className="cursor-pointer font-semibold text-slate-700 rounded-lg py-2.5 px-3 focus:bg-slate-100 focus:text-slate-900 transition-colors">
            <FileText className="mr-3 h-4 w-4 text-rose-500" />
            PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
