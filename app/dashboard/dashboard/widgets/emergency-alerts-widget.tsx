"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, FileQuestion } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/use-translation";

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
      return `${field}: ${d.msg}`;
    }).join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error.response?.data?.message || error.message || "An error occurred";
}

export function EmergencyAlertsWidget() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const flagsRes = await apiClient.get("/api/v1/emergency-flags/");
        const mappedAlerts = flagsRes.data.slice(0, 4).map((flag: any) => {
          const formattedTime = flag.flagged_at
            ? new Date(flag.flagged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : "N/A";
          const formattedDate = flag.flagged_at
            ? new Date(flag.flagged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "N/A";

          return {
            title: flag.rule_name || t("doctor.emergencyFlagTitle"),
            body: flag.message_content || flag.detected_text,
            session: `#${flag.session_id}`,
            time: `${formattedDate} ${formattedTime}`,
            severity: flag.severity_level || "critical",
          };
        });
        setAlerts(mappedAlerts);
      } catch (error: any) {
        toast.error(formatBackendError(error));
      }
    }
    fetchAlerts();
  }, [t]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <h2 className="font-bold text-slate-950">
          {t("dashboard.recentEmergencyAlerts") || t("doctor.actionNeededTitle")}
        </h2>
        <Link href="/dashboard/emergency-rules">
          <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
            {t("dashboard.viewAll")}
          </Button>
        </Link>
      </div>

      <div className="px-4 py-4 lg:px-6 lg:py-6 flex-1 flex flex-col">
        <p className="mb-7 text-sm leading-5 text-slate-400">
          {t("dashboard.alertSubtitle")}
        </p>

        <div className="divide-y divide-slate-100 flex-1">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-semibold">{t("dashboard.noAlerts") || t("doctor.noPendingActions")}</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const warning = alert.severity === "warning";
              const Icon = warning ? FileQuestion : AlertTriangle;

              return (
                <article key={`${alert.session}-${index}`} className="flex gap-4 py-4 first:pt-0">
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    warning ? "bg-amber-100 text-amber-600" : "bg-red-50 text-red-500"
                  }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-5 text-slate-950 truncate">
                      {alert.title}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-slate-400 break-words line-clamp-2">
                      {alert.body}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>{t("dashboard.sessionId")} {alert.session}</span>
                      <span className="shrink-0">{alert.time}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
