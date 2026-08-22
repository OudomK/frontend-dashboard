"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useAuthStore } from "@/lib/store/use-auth-store";

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

function MetricCard({
  title,
  value,
  note,
  tone,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  note: string;
  tone: string;
  icon: any;
  href?: string;
}) {
  const isNegative = tone === "negative";
  const isNeutral = tone === "neutral";
  const NoteIcon = isNegative ? TrendingDown : isNeutral ? CheckCircle2 : TrendingUp;

  const content = (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6 h-full ${href ? 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer' : ''}`}>
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

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

export function SystemOverviewWidget() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/v1/dashboard/overview");
      setOverview(res.data);
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

  const metrics = [];

  if (permissions.includes("view_users")) {
    metrics.push({
      title: t("dashboard.totalUsers"),
      value: loading ? "..." : overview?.total_users?.toLocaleString() || "0",
      note: `${t("dashboard.doctors")}: ${overview?.total_doctors || 0} | ${t("dashboard.admins")}: ${overview?.total_admins || 0}`,
      tone: "positive",
      icon: Users,
      href: "/dashboard/users"
    });
  }

  if (permissions.includes("view_chat_logs")) {
    metrics.push({
      title: t("dashboard.aiQueries"),
      value: loading ? "..." : overview?.total_chat_messages?.toLocaleString() || "0",
      note: `${t("dashboard.sessions")}: ${overview?.total_chat_sessions || 0}`,
      tone: "positive",
      icon: MessageCircle,
      href: "/dashboard/chat-logs"
    });
  }

  if (permissions.includes("view_documents")) {
    metrics.push({
      title: t("dashboard.knowledgeBaseDocs"),
      value: loading ? "..." : overview?.total_documents?.toLocaleString() || "0",
      note: t("dashboard.ragSourceFiles"),
      tone: "neutral",
      icon: Database,
      href: "/dashboard/documents"
    });
  }

  if (permissions.includes("view_emergency")) {
    metrics.push({
      title: t("dashboard.emergencyAlerts"),
      value: loading ? "..." : overview?.total_emergency_flags?.toLocaleString() || "0",
      note: t("dashboard.flagsRequiringAudit"),
      tone: (overview?.total_emergency_flags || 0) > 0 ? "negative" : "neutral",
      icon: AlertTriangle,
      href: "/dashboard/emergency-rules"
    });
  }

  if (metrics.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{t("dashboard.overview")}</h2>
        {permissions.includes("manage_system_settings") && (
          <Button onClick={handleExportCSV} className="h-9 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("dashboard.exportReport")}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
}
