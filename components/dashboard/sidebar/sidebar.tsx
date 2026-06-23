"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Settings, Stethoscope, LogOut } from "lucide-react";

import { adminMenu, adminSettingsItem, doctorMenu } from "./sidebar-config";
import { useAuthStore } from "@/lib/store/use-auth-store";

type Props = {
  role: "admin" | "doctor";
  isMobile?: boolean;
};

export function Sidebar({ role, isMobile = false }: Props) {
  const pathname = usePathname();
  const { user: sessionUser, logout } = useAuthStore();
  
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

  const groups = role === "admin"
    ? adminGroups
    : doctorGroups;

  const LogoIcon = role === "admin"
    ? Stethoscope
    : HeartPulse;

  return (
    <aside className={`${isMobile ? 'flex w-full min-h-[calc(100vh-120px)]' : 'hidden w-[280px] lg:flex sticky top-0 h-screen'} bg-slate-950 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20`}>
      {/* Logo Area */}
      <div className="px-6 py-6 lg:py-8 border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-white">
            <img src="/asset/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight truncate">
              {role === "admin" ? "WomenHealth" : "Aura Clinic"}
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
              {role === "admin" ? "Admin Panel" : "Doctor Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-6 pl-4 pr-0 scrollbar-hide">
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        relative group flex items-center gap-3 py-3 pl-4 transition-all duration-200
                        ${
                          isActive
                            ? "bg-slate-50 text-slate-900 rounded-l-[24px]"
                            : "text-slate-400 hover:text-slate-200 rounded-xl mr-4"
                        }
                      `}
                    >
                      {isActive && (
                        <>
                          <div className="absolute right-0 -top-6 w-6 h-6 bg-slate-50 pointer-events-none">
                            <div className="w-full h-full bg-slate-950 rounded-br-[24px]" />
                          </div>
                          <div className="absolute right-0 -bottom-6 w-6 h-6 bg-slate-50 pointer-events-none">
                            <div className="w-full h-full bg-slate-950 rounded-tr-[24px]" />
                          </div>
                        </>
                      )}
                      <div className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors
                        ${isActive ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 group-hover:bg-slate-800/50"}
                      `}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm truncate">{item.label}</span>
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
        <div className="py-4 pl-4 pr-0 border-t border-slate-800/60 bg-slate-950 space-y-1.5">
          <Link
            href={adminSettingsItem.href}
            className={`
              relative group flex items-center gap-3 py-3 pl-4 transition-all duration-200
              ${
                pathname === adminSettingsItem.href
                  ? "bg-slate-50 text-slate-900 rounded-l-[24px]"
                  : "text-slate-400 hover:text-slate-200 rounded-xl mr-4"
              }
            `}
          >
            {pathname === adminSettingsItem.href && (
              <>
                <div className="absolute right-0 -top-6 w-6 h-6 bg-slate-50 pointer-events-none">
                  <div className="w-full h-full bg-slate-950 rounded-br-[24px]" />
                </div>
                <div className="absolute right-0 -bottom-6 w-6 h-6 bg-slate-50 pointer-events-none">
                  <div className="w-full h-full bg-slate-950 rounded-tr-[24px]" />
                </div>
              </>
            )}
            <div className={`
              flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors
              ${pathname === adminSettingsItem.href ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 group-hover:bg-slate-800/50"}
            `}>
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm truncate">{adminSettingsItem.label}</span>
          </Link>
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 py-3 pl-4 rounded-xl mr-4 text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 group-hover:bg-red-500/10 group-hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-800/50">
              <img
                src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"}
                alt={doctorName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-200 text-sm">
                {doctorName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Clinic Owner
              </p>
            </div>

            <Link
              href="/doctor/profile"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>

          <button
            onClick={() => logout()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm font-semibold text-slate-300 shadow-sm transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
