"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/use-auth-store";

type Props = {
  role: "admin" | "doctor";
};

export function DashboardHeader({
  role,
}: Props) {
  const pathname = usePathname();
  const sessionUser = useAuthStore((state) => state.user);

  const displayName = sessionUser?.name || (sessionUser?.email
    ? sessionUser.email.split("@")[0]
    : (role === "admin" ? "Dr. Anderson" : "Dr. Sarah Jenkins"));

  const displayRole = role === "admin" ? "System Admin" : "Clinic Owner";
  
  const getFullAvatarUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  };

  const avatarUrl = getFullAvatarUrl(sessionUser?.avatarUrl) || (role === "admin"
    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
    : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100");

  const searchPlaceholder = role === "admin"
    ? "Search users, documents..."
    : "Search documents, articles, or AI logs...";

  const adminBreadcrumb =
    pathname === "/admin/analytics"
      ? ["Admin Panel", "System Analytics"]
      : pathname === "/admin/documents"
        ? ["Admin Panel", "AI & Knowledge", "Knowledge Base Docs"]
        : pathname === "/admin/settings"
          ? ["Admin Panel", "System Settings"]
          : pathname === "/admin/profile"
            ? ["Admin Panel", "Profile Settings"]
            : ["Admin Panel", "Dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button className="rounded-lg border border-slate-200 p-2 lg:hidden">
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          {role === "admin" ? (
            <div className="hidden items-center gap-2 text-sm lg:flex">
              {adminBreadcrumb.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <span className={index === adminBreadcrumb.length - 1 ? "font-medium text-slate-900" : "text-slate-400"}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative hidden w-full max-w-sm lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={searchPlaceholder}
                className="h-11 rounded-xl border-slate-200 pl-10"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {role === "admin" && (
            <div className="relative hidden w-72 lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={searchPlaceholder}
                className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10"
              />
            </div>
          )}

          {role === "doctor" && (
            <button className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-700" />
            </button>
          )}

          {role === "admin" && (
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50/70 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100 shadow-sm shrink-0">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {displayName}
                </p>

                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                  {displayRole}
                </p>
              </div>

              <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
