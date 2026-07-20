"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Settings, Stethoscope, LogOut } from "lucide-react";

import { adminMenu, adminSettingsItem, doctorMenu } from "./sidebar-config";
import { useAuthStore } from "@/lib/store/use-auth-store";
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
  "Roles & Permissions": "nav.roles",
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
  const { t } = useTranslation();
  
  const doctorName = sessionUser?.email
    ? (typeof window !== "undefined" ? localStorage.getItem("women_health_user_name") : null) || sessionUser.email.split("@")[0]
    : "Dr. Sarah Jenkins";

  const permissions = sessionUser?.permissions || [];
  const isRootAdmin = sessionUser?.roleId === 3;

  // Filter adminMenu based on permissions
  const filteredMenu = adminMenu.filter((item: any) => {
    if (isRootAdmin) return true; // Root admin sees all
    if (!item.permission) return true; // Items without specific permission requirement
    return permissions.includes(item.permission);
  });

  const adminGroups = [
    {
      label: "Overview",
      items: filteredMenu.filter((item) => ["Dashboard", "Appointments", "System Audit Logs", "System Analytics"].includes(item.label)),
    },
    {
      label: "AI & Knowledge",
      items: filteredMenu.filter((item) => ["Knowledge Base Docs", "Emergency Rules", "Push Notifications", "AI Chat Logs"].includes(item.label)),
    },
    {
      label: "Content Management",
      items: filteredMenu.filter((item) => ["Health Articles", "Categories", "FAQ Management", "User Management", "Roles & Permissions", "About Us", "System Settings", "Static Pages", "Banners Management"].includes(item.label)),
    },
  ];

  const groups = adminGroups;
  const LogoIcon = Stethoscope;

  // The premium dark background for the sidebar
  const sidebarBg = "bg-white/80 backdrop-blur-xl border-r border-slate-200/50";
  
  return (
    <aside className={`${isMobile ? 'flex w-full min-h-[calc(100vh-120px)]' : 'hidden w-[280px] lg:flex sticky top-0 h-screen'} ${sidebarBg} flex-col z-20 transition-all`}>
      {/* Logo Area */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(14,165,233,0.15)] ring-1 ring-slate-100`}>
            <img src="/asset/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-[20px] font-black tracking-tight text-slate-900 leading-tight truncate font-poppins">
              WomenHealth AI
            </h1>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 font-poppins text-[#0ea5e9]`}>
              Dashboard
            </span>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-2 pl-3 pr-0 scrollbar-hide flex flex-col justify-between">
        <div className="space-y-6">
          {groups.map((group) => {
            if (group.items.length === 0) return null;
            return (
            <div key={group.label}>
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 font-poppins">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  const navKey = navKeyMap[item.label];
                  const labelToDisplay = navKey ? (t(navKey) || item.label) : item.label;

                  return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`
                          relative group flex items-center gap-3 py-2.5 pl-3 transition-all duration-300
                          ${
                            isActive
                              ? "bg-slate-900 text-white rounded-l-[24px]"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl mr-3"
                          }
                        `}
                      >
                        {isActive && (
                          <>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#0ea5e9] rounded-r-full" />
                            {/* Top curve */}
                            <div className="absolute -top-[20px] right-0 h-[20px] w-[20px] pointer-events-none" style={{ background: "radial-gradient(circle at top left, transparent 20px, #0f172a 21px)" }} />
                            {/* Bottom curve */}
                            <div className="absolute -bottom-[20px] right-0 h-[20px] w-[20px] pointer-events-none" style={{ background: "radial-gradient(circle at bottom left, transparent 20px, #0f172a 21px)" }} />
                          </>
                        )}
                      
                      <div className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300
                        ${isActive 
                          ? "bg-white/10 text-white"
                          : "bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-slate-600 group-hover:border-slate-300 group-hover:shadow"
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[14px] truncate font-kantumruy-pro ${isActive ? "font-bold" : "font-medium"}`}>{t(navKeyMap[item.label] || "nav.dashboard")}</span>
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
              {(!adminSettingsItem.permission || isRootAdmin || permissions.includes(adminSettingsItem.permission)) && (
              <Link
                href={adminSettingsItem.href}
                className={`
                  relative group flex items-center gap-3 py-3 pl-3 transition-all duration-300
                  ${
                    pathname === adminSettingsItem.href
                      ? "bg-slate-900 text-white rounded-l-[24px]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl mr-3"
                  }
                `}
              >
                {pathname === adminSettingsItem.href && (
                  <>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#0ea5e9] rounded-r-full" />
                    <div className="absolute -top-[20px] right-0 h-[20px] w-[20px] pointer-events-none" style={{ background: "radial-gradient(circle at top left, transparent 20px, #0f172a 21px)" }} />
                    <div className="absolute -bottom-[20px] right-0 h-[20px] w-[20px] pointer-events-none" style={{ background: "radial-gradient(circle at bottom left, transparent 20px, #0f172a 21px)" }} />
                  </>
                )}
                <div className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300
                  ${pathname === adminSettingsItem.href 
                    ? "bg-white/10 text-white" 
                    : "bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-slate-600 group-hover:border-slate-300 group-hover:shadow"}
                `}>
                  <Settings className="h-5 w-5" />
                </div>
                <span className={`text-[14px] truncate font-kantumruy-pro ${pathname === adminSettingsItem.href ? "font-bold" : "font-medium"}`}>{t(navKeyMap[adminSettingsItem.label] || "nav.settings")}</span>
              </Link>
              )}
              
              <button
                onClick={() => logout()}
                className="group flex w-full items-center gap-3 py-3 pl-3 rounded-xl mr-3 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:text-red-500 group-hover:border-red-200 transition-all duration-300">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-[14px] font-medium font-kantumruy-pro">{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-slate-100 pr-3">
              <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50 group cursor-pointer border border-transparent hover:border-slate-100">
                <div className="h-11 w-11 shrink-0 rounded-full bg-slate-100 overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
                  <img
                    src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"}
                    alt={doctorName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 text-[14px] font-poppins">
                    {doctorName}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5 truncate font-poppins">
                    {sessionUser?.roleName || "Doctor"}
                  </p>
                </div>

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
