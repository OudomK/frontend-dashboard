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
  "About Us": "nav.about",
  "System Settings": "nav.settings",

  // doctorMenu
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

  const doctorGroups = [
    {
      label: "Overview",
      items: doctorMenu.slice(0, 1),
    },
    {
      label: "AI & Knowledge",
      items: doctorMenu.slice(1, 4),
    },
    {
      label: "Content Management",
      items: doctorMenu.slice(4),
    },
  ];

  const adminGroups = [
    {
      label: "Overview",
      items: adminMenu.slice(0, 2),
    },
    {
      label: "AI & Knowledge",
      items: adminMenu.slice(2, 4),
    },
    {
      label: "Content Management",
      items: adminMenu.slice(4),
    },
  ];

  const groups = role === "admin" ? adminGroups : doctorGroups;
  const LogoIcon = role === "admin" ? Stethoscope : HeartPulse;

  // The premium dark background for the sidebar
  const sidebarBg = "bg-[#090E1A]";
  
  return (
    <aside className={`${isMobile ? 'flex w-full min-h-[calc(100vh-120px)]' : 'hidden w-[280px] lg:flex sticky top-0 h-screen'} ${sidebarBg} flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 transition-all`}>
      {/* Logo Area */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/20`}>
            <img src="/asset/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-[20px] font-extrabold tracking-tight text-white leading-tight truncate">
              {role === "admin" ? "WomenHealth" : "Aura Clinic"}
            </h1>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${role === "admin" ? "text-blue-400" : "text-emerald-400"}`}>
              {role === "admin" ? "Admin Panel" : "Doctor Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-2 pl-4 pr-0 scrollbar-hide">
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500/80">
                {group.label}
              </p>

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        relative group flex items-center gap-3 py-3 pl-4 transition-all duration-300
                        ${
                          isActive
                            ? "bg-slate-50 text-slate-900 rounded-l-[24px]"
                            : "text-slate-400 hover:text-slate-200 rounded-xl mr-4 hover:bg-white/5"
                        }
                      `}
                    >
                      {isActive && (
                        <>
                          <div className="absolute right-0 -top-6 w-6 h-6 bg-slate-50 pointer-events-none">
                            <div className={`w-full h-full ${sidebarBg} rounded-br-[24px]`} />
                          </div>
                          <div className="absolute right-0 -bottom-6 w-6 h-6 bg-slate-50 pointer-events-none">
                            <div className={`w-full h-full ${sidebarBg} rounded-tr-[24px]`} />
                          </div>
                        </>
                      )}
                      
                      <div className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300
                        ${isActive 
                          ? role === "admin"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.5)]" 
                            : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                          : "text-slate-400 group-hover:text-white"
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[14px] truncate ${isActive ? "font-bold" : "font-medium"}`}>{t(navKeyMap[item.label] || "nav.dashboard")}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area */}
      {role === "admin" ? (
        <div className="py-4 pl-4 pr-0 mt-2 space-y-1.5 border-t border-white/5">
          <Link
            href={adminSettingsItem.href}
            className={`
              relative group flex items-center gap-3 py-3 pl-4 transition-all duration-300
              ${
                pathname === adminSettingsItem.href
                  ? "bg-slate-50 text-slate-900 rounded-l-[24px]"
                  : "text-slate-400 hover:text-slate-200 rounded-xl mr-4 hover:bg-white/5"
              }
            `}
          >
            {pathname === adminSettingsItem.href && (
              <>
                <div className="absolute right-0 -top-6 w-6 h-6 bg-slate-50 pointer-events-none">
                  <div className={`w-full h-full ${sidebarBg} rounded-br-[24px]`} />
                </div>
                <div className="absolute right-0 -bottom-6 w-6 h-6 bg-slate-50 pointer-events-none">
                  <div className={`w-full h-full ${sidebarBg} rounded-tr-[24px]`} />
                </div>
              </>
            )}
            <div className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300
              ${pathname === adminSettingsItem.href 
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.5)]" 
                : "text-slate-400 group-hover:text-white"}
            `}>
              <Settings className="h-5 w-5" />
            </div>
            <span className={`text-[14px] truncate ${pathname === adminSettingsItem.href ? "font-bold" : "font-medium"}`}>{t(navKeyMap[adminSettingsItem.label] || "nav.settings")}</span>
          </Link>
          
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 py-3 pl-4 rounded-xl mr-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-slate-400 group-hover:text-red-400 transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="text-[14px] font-medium">{t("nav.logout")}</span>
          </button>
        </div>
      ) : (
        <div className="p-5 mt-2 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
          <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/5 group cursor-pointer border border-transparent hover:border-white/10">
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-800 overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
              <img
                src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"}
                alt={doctorName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white text-[14px]">
                {doctorName}
              </p>
              <p className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase mt-0.5 truncate">
                Clinic Owner
              </p>
            </div>

            <Link
              href="/doctor/profile"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>

          <button
            onClick={() => logout()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] font-bold tracking-wide text-slate-300 shadow-sm transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
