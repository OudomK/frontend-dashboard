"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  Maximize,
  Minimize,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";

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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const sessionUser = useAuthStore((state) => state.user);
  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const permissions = userPermissions || [];
  const { t } = useTranslation();

  const displayName = sessionUser?.name || (sessionUser?.email
    ? sessionUser.email.split("@")[0]
    : (role === "admin" ? "Dr. Anderson" : "Dr. Sarah Jenkins"));

  const displayRole = sessionUser?.roleName || (role === "admin" ? "System Admin" : "Clinic Owner");
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  const getFullAvatarUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  };

  const avatarUrl = getFullAvatarUrl(sessionUser?.avatarUrl) || null;


  const adminBreadcrumb =
    pathname === "/admin/analytics"
      ? [t("chat.adminPanel"), t("nav.analytics")]
      : pathname.startsWith("/admin/banners")
        ? [t("chat.adminPanel"), t("nav.banners")]
      : pathname === "/admin/documents"
        ? [t("chat.adminPanel"), t("menu.groupAiKnowledge"), t("nav.documents")]
      : pathname === "/admin/faqs"
        ? [t("chat.adminPanel"), t("menu.groupAiKnowledge"), t("nav.faqs")]
      : pathname === "/admin/articles"
        ? [t("chat.adminPanel"), t("menu.groupAiKnowledge"), t("nav.articles")]
      : pathname === "/admin/users"
        ? [t("chat.adminPanel"), t("nav.users") || "User Management"]
        : pathname === "/admin/settings"
          ? [t("chat.adminPanel"), t("nav.settings")]
          : pathname === "/admin/profile" || pathname === "/doctor/profile"
            ? [t("chat.adminPanel"), t("nav.profile")]
            : pathname === "/admin/appointments"
              ? [t("chat.adminPanel"), t("nav.appointments")]
              : [t("chat.adminPanel"), t("nav.dashboard")];

  // Matches the premium light sidebar background
  const headerBg = "bg-white";

  return (
    <header className={`sticky top-0 z-30 border-b border-slate-100 ${headerBg}`}>
      <div className="flex min-h-[88px] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button className="rounded-lg border border-slate-200 p-2 lg:hidden hover:bg-slate-50 transition-colors">
            <Menu className="h-5 w-5 text-slate-500" />
          </button>
          
          {/* Desktop sidebar toggle */}
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors mr-1 outline-none"
            title="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>

          {role === "admin" && (
            <div className="hidden items-center gap-2 text-sm lg:flex">
              {adminBreadcrumb.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <span className={index === adminBreadcrumb.length - 1 ? "font-bold text-slate-900 tracking-wide font-poppins" : "font-medium text-slate-500 font-poppins"}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleFullscreen}
            className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors outline-none"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          <LanguageSwitcher />

          {permissions.includes("view_notifications") && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-xl border border-slate-200 p-2.5 transition-colors hover:bg-slate-50 relative group outline-none">
                <Bell className="h-5 w-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
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

          <Link
            href={`/${role}/profile`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-all cursor-pointer bg-white shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0 ring-2 ring-blue-500/30">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {(sessionUser?.name || displayName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-[14px] font-bold text-slate-900 leading-tight font-poppins">
                  {displayName}
                </p>

                <p className="text-[10px] font-bold text-blue-600 mt-0.5 uppercase tracking-[0.1em] font-poppins">
                  {displayRole}
                </p>
              </div>

              <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
            </Link>
        </div>
      </div>
    </header>
  );
}
