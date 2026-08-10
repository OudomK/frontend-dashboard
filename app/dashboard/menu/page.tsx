"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { unifiedMenu } from "@/components/dashboard/sidebar/sidebar-config";
import { navKeyMap } from "@/components/dashboard/sidebar/sidebar";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function UnifiedMenuPage() {
  const { logout, user: sessionUser } = useAuthStore();
  const { t } = useTranslation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const userName = sessionUser?.name || sessionUser?.email?.split("@")[0] || "User";
  const permissions = sessionUser?.permissions || [];
  const isRootAdmin = sessionUser?.roleId === 3;

  // Filter unifiedMenu based on permissions just like the sidebar does
  const groups = unifiedMenu.map((group) => {
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

  return (
    <DashboardLayout
      title={t("mnu.title")}
      subtitle={t("mnu.subtitle")}
    >
      <div className="space-y-6 lg:hidden pb-20">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 flex items-center gap-4">
          <img
            src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
            alt={userName}
            className="h-14 w-14 rounded-full object-cover border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">{userName}</h2>
            <p className="text-sm font-medium text-slate-500">{sessionUser?.roleName || "Staff"}</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        {groups.map((group) => (
          <div key={group.label} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {navKeyMap[group.label] ? t(navKeyMap[group.label]) : group.label}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {group.items?.map((item) => {
                const Icon = item.icon;
                if (!item.href) return null; // Skip sub-groups if any
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <span className="font-semibold text-slate-700 flex-1">{t(navKeyMap[item.label] || "nav.dashboard")}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-red-600 active:bg-slate-50 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-bold">{t("mnu.logout")}</span>
        </button>

      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("mnu.logoutConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("mnu.logoutConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = "/auth/login";
              }}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              {t("mnu.logout")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
