"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  PhoneForwarded,
  Printer,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api-client";
import { useTranslation } from "@/lib/hooks/use-translation";

/* ── Types ──────────────────────────────────────────────────────── */

type Overview = {
  total_users: number;
  total_doctors: number;
  total_admins: number;
  total_chat_sessions: number;
  total_chat_messages: number;
  total_documents: number;
  total_emergency_flags: number;
  total_notifications: number;
};

type ChatStats = {
  total_chat_sessions: number;
  total_chat_messages: number;
  total_user_messages: number;
  total_ai_messages: number;
  average_messages_per_session: number;
};

type EmergencyStats = {
  total_emergency_flags: number;
  warning_cases: number;
  urgent_cases: number;
  critical_cases: number;
};

type DocumentStats = {
  total_documents: number;
  total_document_chunks: number;
  active_documents: number;
  inactive_documents: number;
};

type AIUsage = {
  total_ai_messages: number;
  total_user_messages: number;
  ai_response_ratio: number;
};

type UserGrowthItem = {
  date: string;
  total_users: number;
};

type Category = {
  id: number;
  name: string;
};

type CategorizedRecord = {
  category_id?: number | null;
};

type EmergencyFlag = {
  id: number;
  detected_text?: string | null;
  flagged_at: string;
  session_id?: number | null;
  message_content?: string | null;
  rule_name?: string | null;
  severity_level?: string | null;
  advice_text?: string | null;
};

type Metric = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  iconTone: string;
  noteTone: string;
  variant?: "danger";
  href?: string;
};

type TopicStat = {
  label: string;
  value: number;
  color: string;
  isUncategorized?: boolean;
};

type DateRange = "7d" | "30d" | "90d" | "all";

const topicColors = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"];

/* ── Helpers ────────────────────────────────────────────────────── */

function formatBackendError(error: unknown): string {
  const response = error && typeof error === "object" && "response" in error
    ? (error as { response?: { data?: { detail?: unknown; message?: string } } }).response
    : undefined;
  const detail = response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((d) => {
      const item = d as { loc?: string[]; msg?: string };
      const field = item.loc && item.loc.length > 0 ? item.loc[item.loc.length - 1] : "field";
      return `${field}: ${item.msg ?? "Invalid value"}`;
    }).join(", ");
  }

  if (typeof detail === "string") return detail;
  if (response?.data?.message) return response.data.message;
  return error instanceof Error ? error.message : "An error occurred";
}

function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Sub-components ─────────────────────────────────────────────── */

function AnalyticsMetricCard({ title, value, note, icon: Icon, iconTone, noteTone, variant, href }: Metric) {
  const isDanger = variant === "danger";
  const hasCritical = isDanger && parseInt(value) > 0;

  const cardContent = (
    <section
      className={`rounded-lg border p-4 lg:p-6 shadow-sm transition-all ${
        isDanger
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-md hover:border-red-300 cursor-pointer"
          : "border-slate-200 bg-white"
      }`}
      onClick={href ? () => {
        const el = document.getElementById("escalated-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold ${isDanger ? "text-red-400" : "text-slate-400"}`}>{title}</p>
          <p className={`mt-7 text-4xl font-bold tracking-tight ${isDanger ? "text-red-700" : "text-slate-950"}`}>{value}</p>
        </div>

        <div className="relative">
          {hasCritical && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <p className={`mt-3 text-sm ${noteTone}`}>
        {note}
        {isDanger && href && (
          <span className="ml-2 text-red-500 underline underline-offset-2 text-xs font-semibold">→ View Cases</span>
        )}
      </p>
    </section>
  );

  return cardContent;
}

function TriggerBadge({ value }: { value: string }) {
  const { t } = useTranslation();
  if (value === "critical") {
    return <Badge className="rounded-md bg-red-600 px-2.5 text-xs font-bold uppercase text-white">{t("aly.critical")}</Badge>;
  }

  if (value === "urgent") {
    return <Badge className="rounded-md bg-orange-500 px-2.5 text-xs font-bold uppercase text-white">{t("aly.urgent")}</Badge>;
  }

  if (value === "warning") {
    return <Badge className="rounded-md bg-amber-500 px-2.5 text-xs font-bold uppercase text-slate-950">{t("aly.warning")}</Badge>;
  }

  return <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold uppercase text-slate-700">{t("aly.none")}</Badge>;
}

/* ── Main Page ──────────────────────────────────────────────────── */

export default function AdminAnalyticsPage() {
  const { t, language } = useTranslation();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [emergencyStats, setEmergencyStats] = useState<EmergencyStats | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [growth, setGrowth] = useState<UserGrowthItem[]>([]);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [flags, setFlags] = useState<EmergencyFlag[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Feature 1: Live Data toggle ──
  const [isLive, setIsLive] = useState(false);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Feature 3: Date-range selector ──
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const fetchAnalytics = useCallback(async () => {
    if (!loading) {
      // Don't show loading spinner on live refresh, only on initial load
    } else {
      setLoading(true);
    }
    try {
      const [
        overviewRes,
        chatStatsRes,
        emergencyStatsRes,
        documentStatsRes,
        userGrowthRes,
        aiUsageRes,
        flagsRes,
        categoriesRes,
        documentsRes,
        contentsRes,
        faqsRes,
      ] = await Promise.all([
        apiClient.get("/api/v1/dashboard/overview"),
        apiClient.get("/api/v1/dashboard/chat-stats"),
        apiClient.get("/api/v1/dashboard/emergency-stats"),
        apiClient.get("/api/v1/dashboard/document-stats"),
        apiClient.get("/api/v1/dashboard/user-growth"),
        apiClient.get("/api/v1/dashboard/ai-usage"),
        apiClient.get("/api/v1/emergency-flags/"),
        apiClient.get("/api/v1/categories/"),
        apiClient.get("/api/documents/"),
        apiClient.get("/api/v1/contents/management"),
        apiClient.get("/api/v1/faqs/"),
      ]);

      setOverview(overviewRes.data as Overview);
      setChatStats(chatStatsRes.data as ChatStats);
      setEmergencyStats(emergencyStatsRes.data as EmergencyStats);
      setDocumentStats(documentStatsRes.data as DocumentStats);
      setGrowth((userGrowthRes.data?.growth || []) as UserGrowthItem[]);
      setAiUsage(aiUsageRes.data as AIUsage);
      setFlags(((flagsRes.data || []) as EmergencyFlag[]).slice(0, 8));

      const categories = (categoriesRes.data || []) as Category[];
      const categoryMap = new Map(categories.map((category) => [category.id, typeof category.name === 'string' ? category.name : ((category.name as any)?.[language as "en" | "km"] || (category.name as any)?.en || (category.name as any)?.km || "")]));
      const records = [
        ...((documentsRes.data || []) as CategorizedRecord[]),
        ...((contentsRes.data || []) as CategorizedRecord[]),
        ...((faqsRes.data || []) as CategorizedRecord[]),
      ];
      const counts = new Map<string, number>();

      records.forEach((record) => {
        const name = record.category_id ? categoryMap.get(record.category_id) ?? t("aly.uncat") : t("aly.uncat");
        counts.set(name, (counts.get(name) || 0) + 1);
      });

      const total = records.length;
      const mappedTopics = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count], index) => ({
          label,
          value: pct(count, total),
          color: label === t("aly.uncat") ? "bg-amber-400" : (topicColors[index] ?? "bg-slate-500"),
          isUncategorized: label === t("aly.uncat"),
        }));

      setTopics(mappedTopics);
    } catch (error: unknown) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  }, [language, t]);

  useEffect(() => {
    void Promise.resolve().then(fetchAnalytics);
  }, [fetchAnalytics]);

  // ── Feature 1: Live toggle interval management ──
  const toggleLive = useCallback(() => {
    if (isLive) {
      // Turn off
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
      setIsLive(false);
      toast.info(t("aly.autoRefreshOff"));
    } else {
      // Turn on
      setIsLive(true);
      toast.success(t("aly.autoRefreshOn"));
      liveIntervalRef.current = setInterval(() => {
        void fetchAnalytics();
      }, 30_000);
    }
  }, [isLive, fetchAnalytics, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, []);

  // ── Feature 4: Emergency Flags card (distinct) ──
  const metrics = useMemo<Metric[]>(() => [
    {
      title: t("aly.totalAiQueries"),
      value: (chatStats?.total_user_messages ?? 0).toLocaleString(),
      note: `${(chatStats?.total_chat_sessions ?? 0).toLocaleString()} ${t("aly.chatSessions")}`,
      icon: MessageSquare,
      iconTone: "bg-blue-50 text-blue-600",
      noteTone: "text-emerald-600",
    },
    {
      title: t("aly.avgMsgs"),
      value: `${chatStats?.average_messages_per_session ?? 0}`,
      note: `${(chatStats?.total_chat_messages ?? 0).toLocaleString()} ${t("aly.totalMsgs")}`,
      icon: Target,
      iconTone: "bg-blue-50 text-blue-600",
      noteTone: "text-slate-500",
    },
    {
      title: t("aly.aiRespRatio"),
      value: `${aiUsage?.ai_response_ratio ?? 0}x`,
      note: `${(aiUsage?.total_ai_messages ?? 0).toLocaleString()} ${t("aly.aiResponses")}`,
      icon: Users,
      iconTone: "bg-emerald-50 text-emerald-600",
      noteTone: "text-emerald-600",
    },
    {
      title: t("aly.emergFlags"),
      value: (emergencyStats?.total_emergency_flags ?? 0).toLocaleString(),
      note: `${emergencyStats?.critical_cases ?? 0} ${t("aly.criticalCases")}`,
      icon: PhoneForwarded,
      iconTone: "bg-red-100 text-red-600",
      noteTone: "text-red-500",
      variant: "danger" as const,
      href: "#escalated",
    },
  ], [aiUsage, chatStats, emergencyStats, t]);

  const accessMethods = useMemo(() => {
    const ai = chatStats?.total_user_messages ?? 0;
    const docs = documentStats?.total_documents ?? 0;
    const alerts = emergencyStats?.total_emergency_flags ?? 0;
    const total = ai + docs + alerts;

    return [
      { label: t("aly.aiChatbot"), value: pct(ai, total), color: "bg-blue-600" },
      { label: t("aly.knowDocs"), value: pct(docs, total), color: "bg-emerald-500" },
      { label: t("aly.emergFlags"), value: pct(alerts, total), color: "bg-amber-500" },
    ];
  }, [chatStats, documentStats, emergencyStats, t]);

  // ── Feature 3: Date-range filtered chart data ──
  const chartGrowth = useMemo(() => {
    if (growth.length === 0) return [{ date: "No data", total_users: 0 }];

    const now = new Date();
    let daysBack: number;
    switch (dateRange) {
      case "7d": daysBack = 7; break;
      case "30d": daysBack = 30; break;
      case "90d": daysBack = 90; break;
      default: return growth.slice(-30); // 'all' but cap at last 30 bars for readability
    }

    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const filtered = growth.filter(item => new Date(item.date) >= cutoff);
    return filtered.length > 0 ? filtered : [{ date: "No data", total_users: 0 }];
  }, [growth, dateRange]);

  const maxGrowth = Math.max(...chartGrowth.map((item) => item.total_users), 1);

  // ── Feature 2: Export functions ──
  const exportCSV = () => {
    const lines = [
      ["Metric", "Value"],
      ["Total Users", overview?.total_users ?? 0],
      ["Total Doctors", overview?.total_doctors ?? 0],
      ["Total Admins", overview?.total_admins ?? 0],
      ["Chat Sessions", chatStats?.total_chat_sessions ?? 0],
      ["User Messages", chatStats?.total_user_messages ?? 0],
      ["AI Messages", chatStats?.total_ai_messages ?? 0],
      ["Documents", documentStats?.total_documents ?? 0],
      ["Document Chunks", documentStats?.total_document_chunks ?? 0],
      ["Emergency Flags", emergencyStats?.total_emergency_flags ?? 0],
      ["Warning Cases", emergencyStats?.warning_cases ?? 0],
      ["Urgent Cases", emergencyStats?.urgent_cases ?? 0],
      ["Critical Cases", emergencyStats?.critical_cases ?? 0],
    ];
    const csv = `data:text/csv;charset=utf-8,${lines.map((line) => line.join(",")).join("\n")}`;
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `analytics_report_${dateRange}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(t("aly.reportExported"));
  };

  const exportPDF = () => {
    window.print();
    toast.success(t("aly.reportExported"));
  };

  // ── Date range labels ──
  const dateRangeOptions: { key: DateRange; label: string }[] = [
    { key: "7d", label: t("aly.range7d") },
    { key: "30d", label: t("aly.range30d") },
    { key: "90d", label: t("aly.range90d") },
    { key: "all", label: t("aly.rangeAll") },
  ];

  return (
    <DashboardLayout
      role="admin"
      title={t("aly.title")}
      subtitle={t("aly.subtitle")}
      actions={
        <>
          {/* ── Feature 1: Live Data Toggle ── */}
          <Button
            variant={isLive ? "default" : "outline"}
            onClick={toggleLive}
            className={`h-10 rounded-md px-4 transition-all ${
              isLive
                ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                : ""
            }`}
          >
            {isLive ? (
              <>
                <span className="relative flex h-2.5 w-2.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                {t("aly.liveOn")}
              </>
            ) : (
              <>
                <CalendarDays className="mr-1.5 h-4 w-4" />
                {t("aly.liveOff")}
              </>
            )}
          </Button>

          {/* ── Feature 2: Export Dropdown ── */}
          <ExportDropdown onExportCsv={exportCSV} onExportPdf={exportPDF} label={t("aly.exportReport") || "Export"} />
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-20 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("aly.loading")}
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Stat Cards (Feature 4: Emergency card stands out) ── */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <AnalyticsMetricCard key={metric.title} {...metric} />
            ))}
          </div>

          {/* ── Charts Row ── */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_356px]">
            {/* ── Feature 3: User Growth with Date Range Selector ── */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">{t("aly.userGrowth")}</h2>

                {/* Date Range Selector */}
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                  {dateRangeOptions.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setDateRange(key)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                        dateRange === key
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-6 lg:px-6">
                <div className="flex h-[270px] items-end gap-3 border-b border-slate-100">
                  {chartGrowth.map((item, i) => {
                    const height = Math.max(8, Math.round((item.total_users / maxGrowth) * 230));
                    return (
                      <div key={`${item.date}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{item.total_users}</span>
                        <div className="w-full rounded-t-md bg-blue-600 transition-all hover:bg-blue-500" style={{ height }} title={`${item.total_users} ${t("aly.users")}`} />
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{item.date === "No data" ? t("aly.noData") : formatDate(item.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Feature 5: Top Health Topics with Uncategorized Warning ── */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">{t("aly.topTopics")}</h2>
              </div>

              <div className="space-y-5 px-4 py-6 lg:px-6 lg:py-7">
                {topics.length === 0 ? (
                  <p className="py-10 text-center text-sm font-semibold text-slate-400">{t("aly.noTopicData")}</p>
                ) : (
                  topics.map((topic) => (
                    <div key={topic.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${topic.isUncategorized ? "text-amber-700" : "text-slate-950"}`}>{topic.label}</span>
                          {/* Feature 5: Uncategorized warning tooltip */}
                          {topic.isUncategorized && topic.value > 30 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                                    <Info className="h-3 w-3" />
                                    ⚠
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[220px]">
                                  <p>{t("aly.uncatWarning")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <span className={topic.isUncategorized ? "text-amber-700 font-bold" : "text-slate-950"}>{topic.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${topic.color} transition-all`} style={{ width: `${topic.value}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── Bottom Row ── */}
          <div className="grid gap-6 xl:grid-cols-[356px_minmax(0,2fr)]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">{t("aly.sysActMix")}</h2>
              </div>

              <div className="flex min-h-[340px] flex-col justify-center px-4 py-6 lg:px-6">
                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-blue-100">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold tracking-tight text-slate-950">{(overview?.total_chat_sessions ?? 0).toLocaleString()}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("aly.sessions")}</p>
                  </div>
                </div>

                <div className="mt-16 space-y-4">
                  {accessMethods.map((method) => (
                    <div key={method.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded ${method.color}`} />
                        <span className="font-medium text-slate-950">{method.label}</span>
                      </div>
                      <span className="text-slate-950">{method.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Feature 4: Escalated section with id anchor ── */}
            <section id="escalated-section" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">{t("aly.recentEscalated")}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400">
                      <th className="px-5 py-3">{t("aly.querySummary")}</th>
                      <th className="px-5 py-3">{t("aly.session")}</th>
                      <th className="px-5 py-3">{t("aly.emergTrigger")}</th>
                      <th className="px-5 py-3">{t("aly.resolution")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flags.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-14 text-center text-sm font-semibold text-slate-400">
                          {t("aly.noEscalated")}
                        </td>
                      </tr>
                    ) : (
                      flags.map((flag) => (
                        <tr key={flag.id} className="border-b border-slate-100 last:border-0">
                          <td className="max-w-[340px] px-5 py-4 font-medium text-slate-950">
                            {flag.message_content || flag.detected_text || t("aly.emergTerm")}
                          </td>
                          <td className="px-5 py-4 text-slate-950">
                            #{flag.session_id ?? "N/A"}
                          </td>
                          <td className="px-5 py-4">
                            <TriggerBadge value={flag.severity_level || "none"} />
                          </td>
                          <td className="max-w-[280px] px-5 py-4 text-slate-400">
                            {flag.advice_text || flag.rule_name || t("aly.revReq")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* ── Bottom Stats Row ── */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <FileText className="mb-4 h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold text-slate-400">{t("aly.knowBase")}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{documentStats?.active_documents ?? 0} {t("aly.activeDocs")}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <MessageSquare className="mb-4 h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-400">{t("aly.msgSplit")}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{chatStats?.total_user_messages ?? 0} {t("aly.userAiSplit")?.split('/')[0]?.trim()} / {chatStats?.total_ai_messages ?? 0} {t("aly.userAiSplit")?.split('/')[1]?.trim()}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <AlertTriangle className="mb-4 h-5 w-5 text-red-500" />
              <p className="text-sm font-semibold text-slate-400">{t("aly.sevMix")}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{emergencyStats?.urgent_cases ?? 0} {t("aly.urgentCriticalMix")?.split('/')[0]?.trim()} / {emergencyStats?.critical_cases ?? 0} {t("aly.urgentCriticalMix")?.split('/')[1]?.trim()}</p>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
