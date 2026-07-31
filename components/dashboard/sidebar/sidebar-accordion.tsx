"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { MenuItem } from "./sidebar-config";
import { useTranslation, TranslationKey } from "@/lib/hooks/use-translation";
import { navKeyMap } from "./sidebar";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";

interface SidebarAccordionProps {
  group: MenuItem;
  isCollapsed?: boolean;
}

export function SidebarAccordion({ group, isCollapsed = false }: SidebarAccordionProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Check if any child item is active
  const isAnyChildActive = group.items?.some((item) => pathname === item.href) || false;

  const [isOpen, setIsOpen] = useState(isAnyChildActive);
  const { setCollapsed } = useSidebarStore();

  // Auto open if a child becomes active
  useEffect(() => {
    if (isAnyChildActive) {
      setIsOpen(true);
    }
  }, [isAnyChildActive]);

  const Icon = group.icon;
  const groupNavKey = navKeyMap[group.label];
  const groupLabelToDisplay = groupNavKey ? (t(groupNavKey) || group.label) : group.label;

  return (
    <div className="mb-2">
      <button
        onClick={() => {
          if (isCollapsed) {
            setCollapsed(false);
            setIsOpen(true);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`
          w-full relative group flex items-center py-2.5 transition-all duration-300
          ${isCollapsed ? 'pl-2.5 mr-2 justify-center' : 'pl-3 pr-4 justify-between mr-3'}
          ${
            isAnyChildActive && !isOpen
              ? "bg-slate-900 text-white rounded-[16px]"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-[16px]"
          }
        `}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          {Icon && (
            <div
              className={`
              flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300
              ${
                isAnyChildActive && !isOpen
                  ? "bg-white/10 text-white"
                  : "bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-slate-600 group-hover:border-slate-300 group-hover:shadow"
              }
            `}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          {!isCollapsed && (
            <span className={`text-[14px] truncate font-kantumruy-pro ${isAnyChildActive ? "font-bold" : "font-medium"}`}>
              {groupLabelToDisplay}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen && !isCollapsed ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}
      >
        <div className="relative ml-7 border-l-2 border-slate-200 py-1 pl-4 space-y-1">
          {group.items?.map((item) => {
            const isActive = pathname === item.href;
            const itemNavKey = navKeyMap[item.label];
            const itemLabelToDisplay = itemNavKey ? (t(itemNavKey) || item.label) : item.label;

            // Render sub-items with the connecting branch line
            return (
              <div key={item.label} className="relative">
                {/* Horizontal branch line */}
                <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-slate-200" />
                
                <Link
                  href={item.href || "#"}
                  className={`
                    relative group flex items-center gap-3 py-2 pl-3 transition-all duration-300 text-[13px] rounded-lg mr-3
                    ${
                      isActive
                        ? "bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
                    }
                  `}
                >
                  <span className="font-kantumruy-pro truncate">
                    {itemLabelToDisplay}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
