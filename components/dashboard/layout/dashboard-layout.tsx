"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useTranslation } from "@/lib/hooks/use-translation";

import { Sidebar } from "../sidebar/sidebar";
import { DashboardHeader } from "../header/dashboard-header";

import { MobileBottomNav } from "../mobile/mobile-bottom-nav";
import { MobileHeader } from "../mobile/mobile-header";
import { MobilePageWrapper } from "../mobile/mobile-page-wrapper";

type Props = {
  children: ReactNode;
  role: "admin" | "doctor";
  title?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
};

export function DashboardLayout({
  children,
  role,
  title,
  subtitle,
  actions,
}: Props) {
  const router = useRouter();
  const { initialize, isAuthenticated, isLoading, roleId } = useAuthStore();
  const { language } = useTranslation();
  const isKm = language === "km";

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else {
        // Enforce strict role matching (only block basic users/patients)
        if (roleId === 1) {
          router.replace("/auth/login");
        }
      }
    }
  }, [isLoading, isAuthenticated, roleId, role, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium tracking-wide">Validating session credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 relative">
      {/* Subtle Premium Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]" />
      
      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <Sidebar role={role} />

        {/* Main Content */}
        <div className="flex min-h-screen flex-1 flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <MobileHeader
              title={
                role === "admin"
                  ? "Admin Dashboard"
                  : "Doctor Dashboard"
              }
              role={role}
            />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <DashboardHeader role={role} />
          </div>

          <MobilePageWrapper>
            <main className="flex-1 px-3 py-4 lg:p-8">
              {(title || subtitle || actions) && (
                <div className="mb-4 flex flex-col gap-3 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-1.5">
                    {title && (
                      <h1 className={`text-2xl font-bold text-slate-900 lg:text-[28px] ${isKm ? "font-kantumruy-pro tracking-normal" : "font-heading tracking-tight"}`}>
                        {title}
                      </h1>
                    )}

                    {subtitle && (
                      <p className="text-sm font-medium text-slate-500 lg:text-base">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Desktop actions only */}
                  {actions && (
                    <div className="hidden lg:flex flex-wrap items-center gap-3">
                      {actions}
                    </div>
                  )}
                </div>
              )}

              {children}
            </main>

            <MobileBottomNav role={role} />
          </MobilePageWrapper>
        </div>
      </div>
    </div>
  );
}