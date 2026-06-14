"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Settings, Stethoscope } from "lucide-react";

import { adminMenu, adminSettingsItem, doctorMenu } from "./sidebar-config";
import { useAuthStore } from "@/lib/store/use-auth-store";

type Props = {
  role: "admin" | "doctor";
};

export function Sidebar({ role }: Props) {
  const pathname = usePathname();
  const sessionUser = useAuthStore((state) => state.user);
  
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
    <aside className="hidden w-[260px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LogoIcon className="h-5 w-5" />
          </div>

          <h1 className="text-lg font-bold leading-tight text-slate-900">
            {role === "admin"
              ? (
                  <>
                    WomenHealth
                    <br />
                    Admin
                  </>
                )
              : "Aura Health Care"}
          </h1>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-7">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all
                        ${
                          isActive
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "font-medium text-slate-700 hover:bg-slate-100"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />

                      <span>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {role === "admin" ? (
        <div className="p-4">
          <Link
            href={adminSettingsItem.href}
            className={`
              flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all
              ${
                pathname === adminSettingsItem.href
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : "font-medium text-slate-700 hover:bg-slate-100"
              }
            `}
          >
            <Settings className="h-5 w-5" />
            <span>{adminSettingsItem.label}</span>
          </Link>
        </div>
      ) : (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100 shadow-sm shrink-0">
              <img
                src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"}
                alt={doctorName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {doctorName}
              </p>

              <p className="text-sm text-slate-500">
                Clinic Owner
              </p>
            </div>

            <Link
              href="/doctor/profile"
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Doctor settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
