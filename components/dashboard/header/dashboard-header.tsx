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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/hooks/use-translation";

type Props = {
  role: "admin" | "doctor";
};

export function DashboardHeader({
  role,
}: Props) {
  const pathname = usePathname();
  const sessionUser = useAuthStore((state) => state.user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useTranslation();

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

  const searchPlaceholder = t("header.search");

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

  // Matches the premium dark sidebar background
  const headerBg = "bg-[#090E1A]";

  return (
    <header className={`sticky top-0 z-30 border-b border-white/5 ${headerBg}`}>
      <div className="flex min-h-[88px] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button className="rounded-lg border border-white/10 p-2 lg:hidden hover:bg-white/5 transition-colors">
            <Menu className="h-5 w-5 text-slate-300" />
          </button>

          {role === "admin" ? (
            <div className="hidden items-center gap-2 text-sm lg:flex">
              {adminBreadcrumb.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                  <span className={index === adminBreadcrumb.length - 1 ? "font-bold text-white tracking-wide" : "font-medium text-slate-400"}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative hidden w-full max-w-md lg:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={searchPlaceholder}
                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {role === "admin" && (
            <div className="relative hidden w-72 lg:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={searchPlaceholder}
                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all shadow-sm"
              />
            </div>
          )}

          {role === "doctor" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-xl border border-white/10 p-2.5 transition-colors hover:bg-white/5 relative group outline-none">
                  <Bell className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#090E1A]"></span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 shadow-xl rounded-xl mt-2">
                <div className="flex justify-between items-center py-3 px-4">
                  <DropdownMenuLabel className="font-bold text-slate-900 text-base tracking-tight p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                <div className="flex flex-col max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <p className="text-sm font-semibold text-slate-900">All caught up!</p>
                      <p className="text-xs text-slate-500 mt-1">You have no new notifications.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                        }}
                        className={`flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0 focus:bg-slate-50 transition-colors ${notification.is_read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${notification.is_read ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
                          <p className="text-[13px] font-bold text-slate-900 tracking-wide">{notification.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 ml-4 font-medium leading-relaxed">{notification.body}</p>
                        <p className="text-[10px] text-slate-400 ml-4 mt-1.5 font-semibold uppercase tracking-wider">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <div className="p-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          markAllAsRead();
                        }}
                        className="w-full text-center text-[13px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg py-2 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {role === "admin" && (
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 transition-all cursor-pointer bg-white/5 shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden border border-white/10 shadow-sm shrink-0 ring-2 ring-blue-500/30">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-[14px] font-bold text-white leading-tight">
                  {displayName}
                </p>

                <p className="text-[10px] font-bold text-blue-400 mt-0.5 uppercase tracking-[0.1em]">
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
