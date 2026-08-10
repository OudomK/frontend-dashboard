"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeartPulse, Settings, Stethoscope, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";

import { unifiedMenu, MenuItem } from "./sidebar-config";
import { SidebarAccordion } from "./sidebar-accordion";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";
import { useTranslation, TranslationKey } from "@/lib/hooks/use-translation";

export const navKeyMap: Record<string, TranslationKey> = {
  "Dashboard": "nav.dashboard",
  
  // adminMenu
  "System Audit Logs": "nav.auditLogs",
  "System Analytics": "nav.analytics",
  "Knowledge Base Docs": "nav.documents",
  "Emergency Rules": "nav.emergencyRules",
  "Push Notifications": "nav.notifications",
  "AI Chat Logs": "nav.chatLogs",
  "Health Articles": "nav.articles",
  "Categories": "nav.categories",
  "FAQ Management": "nav.faqs",
  "User Management": "nav.users",
  "Role Management": "nav.roles",
  "Permission Management": "nav.permissions",
  "About Us": "nav.about",
  "System Settings": "nav.settings",
  "Static Pages": "nav.staticPages",
  "Banners Management": "nav.banners",

  // doctorMenu & adminMenu additions
  "Appointments": "nav.appointments",
  "Knowledge Base": "nav.documents",
  "Review AI Answers": "nav.chatLogs",
  "Articles & Posts": "nav.articles",
  "Manage FAQs": "nav.faqs",
  
  // Group Translations
  "Overview": "nav.overview",
  "Operations & Clinic": "nav.operationsClinic",
  "Content Management": "nav.contentManagement",
  "Access Control": "nav.accessControl",
  "System Configuration": "nav.systemConfiguration",
  "Medical Content": "nav.medicalContent",
  "Alerts & Monitoring": "nav.alertsMonitoring",
  "Brain AI": "nav.brainAi",
  
  // existing keys just in case
  "Analytics": "nav.analytics",
  "Users": "nav.users",
  "Doctors": "nav.doctors",
  "Documents": "nav.documents",
  "FAQs": "nav.faqs",
  "Articles": "nav.articles",
  "Chat Logs": "nav.chatLogs",
  "Audit Logs": "nav.auditLogs",
  "Settings": "nav.settings",
  "Profile": "nav.profile",
  "My Profile": "nav.myProfile",
};


type Props = {
  role?: string;
  isMobile?: boolean;
};

export function Sidebar({ role = "admin", isMobile = false }: Props) {
  const pathname = usePathname();
  const { user: sessionUser, logout } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const { t, language } = useTranslation();
  
  const doctorName = sessionUser?.email
    ? (typeof window !== "undefined" ? localStorage.getItem("women_health_user_name") : null) || sessionUser.email.split("@")[0]
    : "Dr. Sarah Jenkins";

  const permissions = sessionUser?.permissions || [];
  const isRootAdmin = sessionUser?.roleId === 3;

  const baseMenu = unifiedMenu;

  const groups = baseMenu.map((group) => {
    const filteredItems = group.items?.filter((item) => {
      if (isRootAdmin) return true; // Root admin sees all
      if (!item.permission) return true; // Items without specific permission requirement
      return permissions.includes(item.permission);
    }) || [];

    return {
      ...group,
      items: filteredItems,
    };
  }).filter((group) => group.items.length > 0);

  const LogoIcon = Stethoscope;

  // The premium dark background for the sidebar
  const sidebarBg = "bg-white/80 backdrop-blur-xl border-r border-slate-200/50";
  
  return (
    <>
      <aside className={`${isMobile ? 'flex w-full min-h-[calc(100vh-120px)]' : (isCollapsed ? 'hidden w-[84px] lg:flex sticky top-0 h-screen' : 'hidden w-[280px] lg:flex sticky top-0 h-screen')} ${sidebarBg} flex-col z-20 transition-all duration-300 ease-in-out`}>
      {/* Logo Area */}
      <div className={`px-6 py-8 flex justify-center ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(14,165,233,0.15)] ring-1 ring-slate-100 ${isCollapsed ? 'h-10 w-10' : 'h-11 w-11'}`}>
            <img src="/asset/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-300">
              <h1 className="text-[20px] font-black tracking-tight text-slate-900 leading-tight truncate font-poppins">
                WomenHealth AI
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 font-poppins text-[#0ea5e9]`}>
                Dashboard
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-2 pl-3 pr-0 scrollbar-hide flex flex-col justify-between">
        <div className="space-y-6">
          {groups.map((group) => {
            if (group.items?.length === 0) return null;
            
            const groupNavKey = navKeyMap[group.label];
            const labelToDisplay = groupNavKey ? (t(groupNavKey) || group.label) : group.label;

            if (group.icon) {
              return <SidebarAccordion key={group.label} group={group} isCollapsed={isCollapsed} />;
            }

            return (
            <div key={group.label} className="mb-4">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 font-poppins truncate transition-opacity duration-300">
                  {labelToDisplay}
                </p>
              )}

              <div className="space-y-1">
                {group.items?.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  const navKey = navKeyMap[item.label];
                  const itemLabelToDisplay = navKey ? (t(navKey) || item.label) : item.label;

                  return (
                      <Link
                        key={item.label}
                        href={item.href || "#"}
                        className={`
                          relative group flex items-center gap-3 py-2.5 transition-all duration-300
                          ${isCollapsed ? 'pl-2.5 mr-2 justify-center' : 'pl-3 mr-3'}
                          ${
                            isActive
                              ? "bg-slate-900 text-white rounded-[16px] shadow-sm"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-[16px]"
                          }
                        `}
                      >
                      
                      <div className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300
                        ${isActive 
                          ? "bg-white/10 text-white"
                          : "bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-slate-600 group-hover:border-slate-300 group-hover:shadow"
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {!isCollapsed && (
                        <span className={`text-[14px] truncate font-kantumruy-pro ${isActive ? "font-bold" : "font-medium"}`}>{itemLabelToDisplay}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>


      </div>
    </aside>
    </>
  );
}
