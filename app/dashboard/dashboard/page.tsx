"use client";

import { useAuthStore } from "@/lib/store/use-auth-store";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { SystemOverviewWidget } from "./widgets/system-overview-widget";
import { RecentUploadsWidget } from "./widgets/recent-uploads-widget";
import { EmergencyAlertsWidget } from "./widgets/emergency-alerts-widget";
import { ChatUsageWidget } from "./widgets/chat-usage-widget";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";
import { useTranslation } from "@/lib/hooks/use-translation";
import { AlertCircle } from "lucide-react";

export default function UnifiedDashboardPage() {
  const { roleId, user } = useAuthStore();
  const { t } = useTranslation();
  const permissions = user?.permissions || [];

  return (
    <DashboardLayout
      role={roleId === 3 ? "admin" : "doctor"} // Kept for legacy prop types if any, but feature authorization is purely permission-driven below
      title={t("dashboard.overview") || "Dashboard"}
      subtitle={t("dashboard.subtitle")}
      actions={<QuickActionsWidget />}
    >
      <div className="space-y-8">
        
        {/* Top-Level Metrics (Total Users, AI Queries, Docs, Flags) */}
        {/* The SystemOverviewWidget internally conditionally renders its sub-metrics based on granular permissions */}
        {permissions.includes("view_dashboard") && <SystemOverviewWidget />}

        {/* Dynamic Grid for Secondary Widgets */}
        <div className="grid gap-6 xl:grid-cols-2">
          
          {permissions.includes("view_chat_logs") && (
            <div className="h-full">
              <ChatUsageWidget />
            </div>
          )}

          {permissions.includes("view_documents") && (
            <div className="h-full">
              <RecentUploadsWidget />
            </div>
          )}

          {permissions.includes("view_emergency") && (
            <div className="h-full">
              <EmergencyAlertsWidget />
            </div>
          )}

        </div>

        {/* Empty State Fallback if they have view_dashboard but zero other permissions */}
        {!permissions.includes("view_users") && 
         !permissions.includes("view_chat_logs") && 
         !permissions.includes("view_documents") && 
         !permissions.includes("view_emergency") && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center flex flex-col items-center justify-center">
             <AlertCircle className="h-10 w-10 text-slate-400 mb-4" />
             <h3 className="text-lg font-bold text-slate-700">Welcome to your Dashboard</h3>
             <p className="text-slate-500 mt-2 max-w-md">
               Your role currently does not have access to dashboard widgets. 
               Please use the sidebar to navigate to your authorized features.
             </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
