"use client";

import { Bell, Menu } from "lucide-react";

type Props = {
  title: string;
};

export function MobileHeader({
  title,
}: Props) {
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <button className="rounded-lg p-2">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-slate-900">
        {title}
      </h1>

      <button className="rounded-lg p-2">
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );
}