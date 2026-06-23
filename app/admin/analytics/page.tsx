"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  PhoneForwarded,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

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
};

type TopicStat = {
  label: string;
  value: number;
  color: string;
};

const topicColors = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"];

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

function AnalyticsMetricCard({ title, value, note, icon: Icon, iconTone, noteTone }: Metric) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{title}</p>
          <p className="mt-7 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className={`mt-3 text-sm ${noteTone}`}>{note}</p>
    </section>
  );
}

function TriggerBadge({ value }: { value: string }) {
  if (value === "critical") {
    return <Badge className="rounded-md bg-red-600 px-2.5 text-xs font-bold uppercase text-white">Critical</Badge>;
  }

  if (value === "urgent") {
    return <Badge className="rounded-md bg-orange-500 px-2.5 text-xs font-bold uppercase text-white">Urgent</Badge>;
  }

  if (value === "warning") {
    return <Badge className="rounded-md bg-amber-500 px-2.5 text-xs font-bold uppercase text-slate-950">Warning</Badge>;
  }

  return <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold uppercase text-slate-700">None</Badge>;
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [emergencyStats, setEmergencyStats] = useState<EmergencyStats | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [growth, setGrowth] = useState<UserGrowthItem[]>([]);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [flags, setFlags] = useState<EmergencyFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
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
      const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
      const records = [
        ...((documentsRes.data || []) as CategorizedRecord[]),
        ...((contentsRes.data || []) as CategorizedRecord[]),
        ...((faqsRes.data || []) as CategorizedRecord[]),
      ];
      const counts = new Map<string, number>();

      records.forEach((record) => {
        const name = record.category_id ? categoryMap.get(record.category_id) ?? "Uncategorized" : "Uncategorized";
        counts.set(name, (counts.get(name) || 0) + 1);
      });

      const total = records.length;
      const mappedTopics = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count], index) => ({
          label,
          value: pct(count, total),
          color: topicColors[index] ?? "bg-slate-500",
        }));

      setTopics(mappedTopics);
    } catch (error: unknown) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAnalytics);
  }, []);

  const metrics = useMemo<Metric[]>(() => [
    {
      title: "Total AI Queries",
      value: (chatStats?.total_user_messages ?? 0).toLocaleString(),
      note: `${(chatStats?.total_chat_sessions ?? 0).toLocaleString()} chat sessions`,
      icon: MessageSquare,
      iconTone: "bg-blue-50 text-blue-600",
      noteTone: "text-emerald-600",
    },
    {
      title: "Avg. Messages / Session",
      value: `${chatStats?.average_messages_per_session ?? 0}`,
      note: `${(chatStats?.total_chat_messages ?? 0).toLocaleString()} total messages`,
      icon: Target,
      iconTone: "bg-blue-50 text-blue-600",
      noteTone: "text-slate-500",
    },
    {
      title: "AI Response Ratio",
      value: `${aiUsage?.ai_response_ratio ?? 0}x`,
      note: `${(aiUsage?.total_ai_messages ?? 0).toLocaleString()} AI responses`,
      icon: Users,
      iconTone: "bg-emerald-50 text-emerald-600",
      noteTone: "text-emerald-600",
    },
    {
      title: "Emergency Flags",
      value: (emergencyStats?.total_emergency_flags ?? 0).toLocaleString(),
      note: `${emergencyStats?.critical_cases ?? 0} critical cases`,
      icon: PhoneForwarded,
      iconTone: "bg-red-50 text-red-500",
      noteTone: "text-red-500",
    },
  ], [aiUsage, chatStats, emergencyStats]);

  const accessMethods = useMemo(() => {
    const ai = chatStats?.total_user_messages ?? 0;
    const docs = documentStats?.total_documents ?? 0;
    const alerts = emergencyStats?.total_emergency_flags ?? 0;
    const total = ai + docs + alerts;

    return [
      { label: "AI Chatbot", value: pct(ai, total), color: "bg-blue-600" },
      { label: "Knowledge Docs", value: pct(docs, total), color: "bg-emerald-500" },
      { label: "Emergency Flags", value: pct(alerts, total), color: "bg-amber-500" },
    ];
  }, [chatStats, documentStats, emergencyStats]);

  const chartGrowth = growth.length > 0 ? growth.slice(-10) : [{ date: "No data", total_users: 0 }];
  const maxGrowth = Math.max(...chartGrowth.map((item) => item.total_users), 1);

  const exportReport = () => {
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
    link.download = "analytics_report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Analytics report exported.");
  };

  return (
    <DashboardLayout
      role="admin"
      title="System Analytics"
      subtitle="Deep dive into system usage, user engagement, and AI performance."
      actions={
        <>
          <Button variant="outline" className="h-10 rounded-md px-4">
            <CalendarDays />
            Live Data
          </Button>

          <Button onClick={exportReport} className="h-10 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700">
            <Download />
            Export Report
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-20 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading analytics...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <AnalyticsMetricCard key={metric.title} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_356px]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">User Growth Over Time</h2>
              </div>

              <div className="px-4 py-6 lg:px-6">
                <div className="flex h-[270px] items-end gap-3 border-b border-slate-100">
                  {chartGrowth.map((item) => {
                    const height = Math.max(8, Math.round((item.total_users / maxGrowth) * 230));
                    return (
                      <div key={item.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div className="w-full rounded-t-md bg-blue-600 transition-all" style={{ height }} title={`${item.total_users} users`} />
                        <span className="text-[11px] font-semibold text-slate-400">{item.date === "No data" ? "No data" : formatDate(item.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">Top Health Topics</h2>
              </div>

              <div className="space-y-5 px-4 py-6 lg:px-6 lg:py-7">
                {topics.length === 0 ? (
                  <p className="py-10 text-center text-sm font-semibold text-slate-400">No topic data yet</p>
                ) : (
                  topics.map((topic) => (
                    <div key={topic.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-950">{topic.label}</span>
                        <span className="text-slate-950">{topic.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${topic.color}`} style={{ width: `${topic.value}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[356px_minmax(0,2fr)]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">System Activity Mix</h2>
              </div>

              <div className="flex min-h-[340px] flex-col justify-center px-4 py-6 lg:px-6">
                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-blue-100">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold tracking-tight text-slate-950">{(overview?.total_chat_sessions ?? 0).toLocaleString()}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessions</p>
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

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
                <h2 className="font-bold text-slate-950">Recent Escalated Queries</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400">
                      <th className="px-5 py-3">Query Summary</th>
                      <th className="px-5 py-3">Session</th>
                      <th className="px-5 py-3">Emergency Trigger</th>
                      <th className="px-5 py-3">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flags.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-14 text-center text-sm font-semibold text-slate-400">
                          No escalated queries yet
                        </td>
                      </tr>
                    ) : (
                      flags.map((flag) => (
                        <tr key={flag.id} className="border-b border-slate-100 last:border-0">
                          <td className="max-w-[340px] px-5 py-4 font-medium text-slate-950">
                            {flag.message_content || flag.detected_text || "Emergency term detected"}
                          </td>
                          <td className="px-5 py-4 text-slate-950">
                            #{flag.session_id ?? "N/A"}
                          </td>
                          <td className="px-5 py-4">
                            <TriggerBadge value={flag.severity_level || "none"} />
                          </td>
                          <td className="max-w-[280px] px-5 py-4 text-slate-400">
                            {flag.advice_text || flag.rule_name || "Review required"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <FileText className="mb-4 h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold text-slate-400">Knowledge Base</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{documentStats?.active_documents ?? 0} active docs</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <MessageSquare className="mb-4 h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-400">Message Split</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{chatStats?.total_user_messages ?? 0} user / {chatStats?.total_ai_messages ?? 0} AI</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
              <AlertTriangle className="mb-4 h-5 w-5 text-red-500" />
              <p className="text-sm font-semibold text-slate-400">Severity Mix</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{emergencyStats?.urgent_cases ?? 0} urgent / {emergencyStats?.critical_cases ?? 0} critical</p>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
