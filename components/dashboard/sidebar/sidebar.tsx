"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Settings, Stethoscope, LogOut } from "lucide-react";

import { adminMenu, adminSettingsItem, doctorMenu, MenuItem } from "./sidebar-config";
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
};


type Props = {
  role: "admin" | "doctor";
  isMobile?: boolean;
};

export function Sidebar({ role, isMobile = false }: Props) {
  const pathname = usePathname();
  const { user: sessionUser, logout } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const { t } = useTranslation();
  
  const doctorName = sessionUser?.email
    ? (typeof window !== "undefined" ? localStorage.getItem("women_health_user_name") : null) || sessionUser.email.split("@")[0]
    : "Dr. Sarah Jenkins";

  const permissions = sessionUser?.permissions || [];
  const isRootAdmin = sessionUser?.roleId === 3;

  const baseMenu = role === "admin" ? adminMenu : doctorMenu;

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

        {/* Footer Area moved inside scrollable div */}
        <div className="mt-8 mb-4">
          {role === "admin" ? (
            <div className="py-4 pl-1 pr-0 space-y-1.5 border-t border-slate-100">
              <button
                onClick={() => logout()}
                className={`group flex w-full items-center py-3 rounded-[16px] text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300 ${isCollapsed ? 'pl-2.5 mr-2 justify-center gap-0' : 'pl-3 mr-3 gap-3'}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-red-500 group-hover:border-red-200 transition-all duration-300">
                  <LogOut className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                  <span className="text-[14px] font-medium font-kantumruy-pro">{t("nav.logout")}</span>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-slate-100 pr-3">
              <div className={`flex items-center rounded-2xl transition-colors hover:bg-slate-50 group cursor-pointer border border-transparent hover:border-slate-100 ${isCollapsed ? 'p-1 justify-center' : 'p-2 gap-3'}`}>
                <div className={`shrink-0 rounded-full bg-slate-100 overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all ${isCollapsed ? 'h-9 w-9' : 'h-11 w-11'}`}>
                  <img
                    src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"}
                    alt={doctorName}
                    className="h-full w-full object-cover"
                  />
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900 text-[14px] font-poppins">
                      {doctorName}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5 truncate font-poppins">
                      {sessionUser?.roleName || "Doctor"}
                    </p>
                  </div>
                )}


                {(!permissions || permissions.includes("manage_profile")) && (
                  <Link
                    href="/doctor/profile"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => logout()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold tracking-wide text-slate-600 shadow-sm transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-kantumruy-pro">{t("nav.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
