"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );
}