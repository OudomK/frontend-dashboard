"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileText,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
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

function AdminMetricCard({
  title,
  value,
  note,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  tone: string;
  icon: any;
}) {
  const isNegative = tone === "negative";
  const isNeutral = tone === "neutral";
  const NoteIcon = isNegative ? TrendingDown : isNeutral ? CheckCircle2 : TrendingUp;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 lg:mt-7 lg:text-4xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg lg:h-10 lg:w-10 ${
            isNegative
              ? "bg-red-50 text-red-500"
              : isNeutral
                ? "bg-slate-50 text-slate-500"
                : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-1 text-sm ${
        isNegative
          ? "text-red-600"
          : isNeutral
            ? "text-slate-400"
            : "text-emerald-600"
      }`}
      >
        <NoteIcon className="h-3.5 w-3.5" />
        <span className="line-clamp-1">
          {note}
        </span>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={
        status === "Active"
          ? "rounded-md bg-emerald-600 px-2.5 text-xs font-bold uppercase text-white"
          : status === "Processing"
            ? "rounded-md bg-amber-500 px-2.5 text-xs font-bold uppercase text-slate-950"
            : status === "Failed"
              ? "rounded-md bg-red-600 px-2.5 text-xs font-bold uppercase text-white"
              : "rounded-md bg-slate-100 px-2.5 text-xs font-bold uppercase text-slate-700"
      }
    >
      {status}
    </Badge>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, docsRes, alertsRes] = await Promise.all([
        apiClient.get("/api/v1/dashboard/overview"),
        apiClient.get("/api/documents/"),
        apiClient.get("/api/v1/emergency-flags/")
      ]);

      setOverview(overviewRes.data);

      const mappedDocs = docsRes.data.slice(0, 4).map((doc: any) => {
        const formattedDate = doc.created_at
          ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "N/A";
        
        let statusName = t("dashboard.statusInactive");
        if (doc.status === "completed" && doc.is_active) {
          statusName = t("dashboard.statusActive");
        } else if (doc.status === "processing" || doc.status === "uploaded") {
          statusName = t("dashboard.statusProcessing");
        } else if (doc.status === "failed") {
          statusName = t("dashboard.statusFailed");
        }

        return {
          id: doc.id,
          name: doc.title || doc.file_name,
          uploadedBy: doc.uploader?.full_name || "Doctor",
          status: statusName,
          date: formattedDate,
        };
      });
      setUploads(mappedDocs);

      const mappedAlerts = alertsRes.data.slice(0, 4).map((flag: any) => {
        const formattedTime = flag.flagged_at
          ? new Date(flag.flagged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "N/A";
        const formattedDate = flag.flagged_at
          ? new Date(flag.flagged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "N/A";

        return {
          title: flag.rule_name || "Emergency Term Detected",
          body: flag.message_content || flag.detected_text,
          session: `#${flag.session_id}`,
          time: `${formattedDate} ${formattedTime}`,
          severity: flag.severity_level || "critical",
        };
      });
      setAlerts(mappedAlerts);

    } catch (error: any) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (!overview) return;
    let csvContent = "data:text/csv;charset=utf-8,Metric,Value\n";
    csvContent += `Total Users,${overview.total_users}\n`;
    csvContent += `Total Doctors,${overview.total_doctors}\n`;
    csvContent += `Total Admins,${overview.total_admins}\n`;
    csvContent += `Total Chat Sessions,${overview.total_chat_sessions}\n`;
    csvContent += `Total Chat Messages,${overview.total_chat_messages}\n`;
    csvContent += `Total Documents,${overview.total_documents}\n`;
    csvContent += `Total Emergency Flags,${overview.total_emergency_flags}\n`;
    csvContent += `Total Notifications,${overview.total_notifications}\n`;

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "system_overview_report.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(t("dashboard.reportExportSuccess"));
  };

  const metrics = useMemo(() => {
    return [
      {
        title: t("dashboard.totalUsers"),
        value: overview?.total_users?.toLocaleString() || "0",
        note: `${t("dashboard.doctors")}: ${overview?.total_doctors || 0} | ${t("dashboard.admins")}: ${overview?.total_admins || 0}`,
        tone: "positive",
        icon: Users,
      },
      {
        title: t("dashboard.aiQueries"),
        value: overview?.total_chat_messages?.toLocaleString() || "0",
        note: `${t("dashboard.sessions")}: ${overview?.total_chat_sessions || 0}`,
        tone: "positive",
        icon: MessageCircle,
      },
      {
        title: t("dashboard.knowledgeBaseDocs"),
        value: overview?.total_documents?.toLocaleString() || "0",
        note: t("dashboard.ragSourceFiles"),
        tone: "neutral",
        icon: Database,
      },
      {
        title: t("dashboard.emergencyAlerts"),
        value: overview?.total_emergency_flags?.toLocaleString() || "0",
        note: t("dashboard.flagsRequiringAudit"),
        tone: (overview?.total_emergency_flags || 0) > 0 ? "negative" : "neutral",
        icon: AlertTriangle,
      },
    ];
  }, [overview, t]);

  return (
    <DashboardLayout
      role="admin"
      title={t("dashboard.overview")}
      subtitle={t("dashboard.subtitle")}
      actions={
        <Button onClick={handleExportCSV} className="h-10 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          {t("dashboard.exportReport")}
        </Button>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <AdminMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_364px] lg:gap-6">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">
                  {t("dashboard.aiChatUsage")}
                </h2>
                <Link href="/admin/analytics">
                  <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                    {t("dashboard.viewFullReport")}
                  </Button>
                </Link>
              </div>

              <div className="px-6 py-6 lg:px-10">
                <div className="relative flex h-[200px] items-end justify-between gap-4 border-b border-slate-100 pb-2">
                  {[
                    { day: "Mon", value: 240, height: "h-[50%]", color: "bg-blue-600" },
                    { day: "Tue", value: 310, height: "h-[65%]", color: "bg-blue-600" },
                    { day: "Wed", value: 280, height: "h-[58%]", color: "bg-blue-600" },
                    { day: "Thu", value: 420, height: "h-[88%]", color: "bg-blue-600" },
                    { day: "Fri", value: 380, height: "h-[80%]", color: "bg-blue-600" },
                    { day: "Sat", value: 190, height: "h-[40%]", color: "bg-blue-500/70" },
                    { day: "Sun", value: 220, height: "h-[45%]", color: "bg-blue-500/70" },
                  ].map((item) => (
                    <div key={item.day} className="group relative flex flex-1 flex-col items-center h-full justify-end select-none">
                      
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-all duration-200 z-10 whitespace-nowrap">
                        {item.value} queries
                      </div>

                      {/* Bar */}
                      <div className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-90 ${item.height} ${item.color}`} />
                      
                      {/* Label below grid line */}
                      <span className="text-[11px] font-bold text-slate-400 mt-2 block shrink-0">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <h2 className="font-bold text-slate-950">
                  {t("dashboard.recentUploads")}
                </h2>
                <Link href="/admin/documents">
                  <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                    {t("dashboard.manageDocuments")}
                  </Button>
                </Link>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 p-4 lg:hidden">
                {uploads.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm font-semibold">{t("dashboard.noUploads")}</p>
                  </div>
                ) : (
                  uploads.map((upload, idx) => (
                    <div
                      key={upload.id || idx}
                      className="rounded-xl border border-slate-200 bg-white p-4 animate-in fade-in duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                          {upload.name}
                        </p>
                      </div>

                      <div className="mt-2 text-xs text-slate-500 font-medium">
                        {t("dashboard.uploadedBy")} <span className="font-semibold text-slate-700">{upload.uploadedBy}</span>
                      </div>

                      <div className="mt-1 text-xs text-slate-400 font-medium">
                        {upload.date}
                      </div>

                      <div className="mt-3">
                        <StatusBadge status={upload.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400">
                      <th className="px-5 py-3">{t("dashboard.docName")}</th>
                      <th className="px-5 py-3">{t("dashboard.uploadedBy")}</th>
                      <th className="px-5 py-3">{t("dashboard.status")}</th>
                      <th className="px-5 py-3">{t("dashboard.dateAdded")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          <p className="font-semibold">{t("dashboard.noUploads")}</p>
                        </td>
                      </tr>
                    ) : (
                      uploads.map((upload, idx) => (
                        <tr key={upload.id || idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3 max-w-[300px]">
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-950 truncate">
                                {upload.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-medium">
                            {upload.uploadedBy}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={upload.status} />
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-medium">
                            {upload.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                {t("dashboard.recentEmergencyAlerts")}
              </h2>
              <Link href="/admin/emergency-rules">
                <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                  {t("dashboard.viewAll")}
                </Button>
              </Link>
            </div>

            <div className="px-4 py-4 lg:px-6 lg:py-6">
              <p className="mb-7 text-sm leading-5 text-slate-400">
                {t("dashboard.alertSubtitle")}
              </p>

              <div className="divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm font-semibold">{t("dashboard.noAlerts")}</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => {
                    const warning = alert.severity === "warning";

                    return (
                      <article key={`${alert.session}-${index}`} className="flex gap-4 py-4 first:pt-0">
                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          warning ? "bg-amber-100 text-amber-600" : "bg-red-50 text-red-500"
                        }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold leading-5 text-slate-950">
                            {alert.title}
                          </h3>
                          <p className="mt-2 text-sm leading-5 text-slate-400 break-words">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
