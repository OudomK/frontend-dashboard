"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { adminMenu, adminSettingsItem } from "@/components/dashboard/sidebar/sidebar-config";
import { useAuthStore } from "@/lib/store/use-auth-store";

export default function AdminMenuPage() {
  const { logout, user: sessionUser } = useAuthStore();
  
  const adminName = sessionUser?.email
    ? (typeof window !== "undefined" ? localStorage.getItem("women_health_user_name") : null) || sessionUser.email.split("@")[0]
    : "System Admin";

  const groups = [
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

  return (
    <DashboardLayout
      role="admin"
      title="Menu"
      subtitle="Access all admin features and settings."
    >
      <div className="space-y-6 lg:hidden pb-20">
        
        {/* Admin Profile Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 flex items-center gap-4">
          <img
            src={sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
            alt={adminName}
            className="h-14 w-14 rounded-full object-cover border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">{adminName}</h2>
            <p className="text-sm font-medium text-slate-500">System Administrator</p>
          </div>
          <Link
            href="/admin/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        {groups.map((group) => (
          <div key={group.label} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-700 flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            <Link
              href={adminSettingsItem.href}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <adminSettingsItem.icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-slate-700 flex-1">{adminSettingsItem.label}</span>
            </Link>

            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-4 p-4 hover:bg-red-50 transition-colors active:bg-red-100 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-semibold text-red-600 flex-1">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop empty state - shouldn't be reached normally since it's a mobile feature */}
      <div className="hidden lg:flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-lg font-medium">Please use the sidebar for navigation.</p>
      </div>
    </DashboardLayout>
  );
}
