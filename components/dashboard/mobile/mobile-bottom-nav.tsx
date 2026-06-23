"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  BookOpen,
  Settings,
  FileWarning,
  User,
  Menu,
} from "lucide-react";

type Props = {
  role: "admin" | "doctor";
};

export function MobileBottomNav({ role }: Props) {
  const pathname = usePathname();

  const adminItems = [
    {
      label: "Home",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: ShieldAlert,
    },
    {
      label: "Docs",
      href: "/admin/documents",
      icon: BookOpen,
    },
    {
      label: "Menu",
      href: "/admin/menu",
      icon: Menu,
    },
  ];

  const doctorItems = [
    {
      label: "Home",
      href: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Knowledge",
      href: "/doctor/documents",
      icon: BookOpen,
    },
    {
      label: "Reviews",
      href: "/doctor/reviews",
      icon: FileWarning,
    },
    {
      label: "Menu",
      href: "/doctor/menu",
      icon: Menu,
    },
  ];

  const items =
    role === "admin"
      ? adminItems
      : doctorItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center py-3"
            >
              <Icon
                className={`h-5 w-5 ${
                  active
                    ? "text-blue-600"
                    : "text-slate-400"
                }`}
              />

              <span
                className={`mt-1 text-xs ${
                  active
                    ? "font-semibold text-blue-600"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}