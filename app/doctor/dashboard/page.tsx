"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Grid2X2,
  HeartPulse,
  ListChecks,
  MoreVertical,
  PenLine,
  RotateCw,
  UploadCloud,
  Loader2,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { toast } from "sonner";

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

function StatusBadge({ status }: { status: string }) {
  if (status === "Processing") {
    return (
      <Badge className="gap-1 rounded-md bg-amber-400 px-2.5 text-xs font-bold text-slate-950">
        <RotateCw className="h-3 w-3 animate-spin" />
        Processing
      </Badge>
    );
  }

  if (status === "Active") {
    return (
      <Badge className="rounded-md bg-emerald-600 px-2.5 text-xs font-bold text-white">
        Active
      </Badge>
    );
  }

  return (
    <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold text-slate-700">
      Deactivated
    </Badge>
  );
}

function DoctorMetricCard({
  title,
  value,
  note,
  tone = "positive",
  icon: Icon,
}: {
  title: string;
  value: string | number;
  note: string;
  tone?: string;
  icon: any;
}) {
  const isNegative = tone === "negative";
  const isNeutral = tone === "neutral";
  const isWarning = tone === "warning";
  
  const NoteIcon = isNegative ? AlertTriangle : isWarning ? HeartPulse : isNeutral ? ListChecks : FileCheck2;

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
              : isWarning
                ? "bg-amber-50 text-amber-500"
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
          : isWarning
            ? "text-amber-600"
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

export default function DoctorDashboardPage() {
  const [data, setData] = useState<{
    total_documents: number;
    published_articles: number;
    active_emergency_rules: number;
    pending_ai_reviews: number;
  } | null>(null);

  const [uploads, setUploads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [res, docsRes, flagsRes] = await Promise.all([
          apiClient.get("/api/v1/dashboard/doctor"),
          apiClient.get("/api/documents/"),
          apiClient.get("/api/v1/emergency-flags/"),
        ]);
        
        setData(res.data);

        // Map Documents
        const mappedDocs = docsRes.data.slice(0, 4).map((doc: any) => {
          let statusName = "Deactivated";
          if (doc.status === "completed" && doc.is_active) {
            statusName = "Active";
          } else if (doc.status === "processing" || doc.status === "uploaded") {
            statusName = "Processing";
          } else if (doc.status === "failed") {
            statusName = "Failed";
          }

          return {
            name: doc.title || doc.file_name,
            category: "Knowledge Base",
            status: statusName,
            icon: FileText,
            iconTone: "text-blue-600",
          };
        });
        setUploads(mappedDocs);

        // Map Emergency Flags to Tasks
        const mappedFlags = flagsRes.data.slice(0, 3).map((flag: any) => {
          const warning = flag.severity_level === "warning";
          return {
            title: flag.rule_name || "Emergency Flag Detected",
            body: flag.message_content || flag.detected_text,
            icon: warning ? FileQuestion : AlertTriangle,
            tone: warning ? "bg-amber-500 text-slate-950" : "bg-red-600 text-white",
          };
        });
        setTasks(mappedFlags);

      } catch (err: any) {
        toast.error(formatBackendError(err));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const metrics = [
    {
      title: "AI Knowledge Documents",
      value: loading ? "..." : data?.total_documents ?? 0,
      note: "Total uploaded medical documents",
      icon: FileCheck2,
      tone: "positive",
    },
    {
      title: "Published Articles",
      value: loading ? "..." : data?.published_articles ?? 0,
      note: "Active health articles",
      icon: BookMarked,
      tone: "positive",
    },
    {
      title: "Active Emergency Rules",
      value: loading ? "..." : data?.active_emergency_rules ?? 0,
      note: "Configured to protect users",
      icon: HeartPulse,
      tone: "warning",
    },
    {
      title: "Pending AI Reviews",
      value: loading ? "..." : data?.pending_ai_reviews ?? 0,
      note: "Flags requiring attention",
      icon: ListChecks,
      tone: "neutral",
    },
  ];

  return (
    <DashboardLayout
      role="doctor"
      title="Doctor Dashboard"
      subtitle="Manage your clinic's AI knowledge base, content, and emergency protocols."
      actions={
        <>
          <Button variant="secondary" className="h-9 rounded-md bg-slate-100 px-4 text-slate-900" asChild>
            <Link href="/doctor/articles">
              <PenLine className="mr-2 h-4 w-4" />
              Write Article
            </Link>
          </Button>

          <Button className="h-9 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700" asChild>
            <Link href="/doctor/documents">
              <UploadCloud className="mr-2 h-4 w-4" />
              Manage Documents
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DoctorMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_364px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-950">
                Recent Knowledge Uploads
              </h2>
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600" asChild>
                <Link href="/doctor/documents">View All</Link>
              </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-400">
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">AI Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <p className="font-semibold">No uploads found</p>
                      </td>
                    </tr>
                  ) : (
                    uploads.map((upload, idx) => {
                      const Icon = upload.icon;
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-4 w-4 ${upload.iconTone}`} />
                              <span className="font-medium text-slate-950 truncate max-w-[250px] inline-block">
                                {upload.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-slate-700">
                            {upload.category}
                          </td>
                          <td className="px-5 py-5">
                            <StatusBadge status={upload.status} />
                          </td>
                          <td className="px-5 py-5 text-right">
                            <Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${upload.name}`}>
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile */}
            <div className="space-y-3 p-4 lg:hidden">
              {uploads.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm font-semibold">No uploads found</p>
                </div>
              ) : (
                uploads.map((upload, idx) => {
                  const Icon = upload.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`mt-1 h-5 w-5 shrink-0 ${upload.iconTone}`}
                        />
  
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-semibold text-slate-900">
                            {upload.name}
                          </h3>
  
                          <p className="mt-1 text-xs text-slate-500">
                            {upload.category}
                          </p>
  
                          <div className="mt-3">
                            <StatusBadge status={upload.status} />
                          </div>
                        </div>
  
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm h-fit">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-950">
                Action Needed
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm font-semibold">No pending actions</p>
                </div>
              ) : (
                tasks.map((task, idx) => {
                  const Icon = task.icon;
  
                  return (
                    <article key={idx} className="flex gap-4 px-5 py-4">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${task.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
  
                      <div className="min-w-0">
                        <h3 className="font-semibold leading-5 text-slate-950 truncate">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-slate-400 line-clamp-2">
                          {task.body}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-center">
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600" asChild>
                <Link href="/doctor/reviews">View Pending Reviews</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

