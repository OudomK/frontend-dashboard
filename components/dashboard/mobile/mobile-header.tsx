"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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

type Props = {
  title: string;
  role: "admin" | "doctor";
};

export function MobileHeader({
  title,
  role,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close sidebar on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <div className="w-9" /> {/* Spacer to balance the bell icon */}

      <h1 className="text-base font-semibold text-slate-900 line-clamp-1 flex-1 text-center px-4">
        {title}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors relative outline-none">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[320px] bg-white border-slate-200 shadow-xl rounded-xl mt-2 mx-2">
          <div className="flex justify-between items-center py-3 px-4">
            <DropdownMenuLabel className="font-bold text-slate-900 text-base tracking-tight p-0">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <DropdownMenuSeparator className="bg-slate-100" />
          <div className="flex flex-col max-h-[60vh] overflow-y-auto">
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
    </div>
  );
}