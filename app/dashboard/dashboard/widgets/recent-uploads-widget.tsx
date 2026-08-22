"use client";

import { useState, useEffect } from "react";
import { FileText, MoreVertical, RotateCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  if (status === "Processing" || status === t("dashboard.statusProcessing")) {
    return (
      <Badge className="gap-1 rounded-md bg-amber-400 px-2.5 text-xs font-bold text-slate-950">
        <RotateCw className="h-3 w-3 animate-spin" />
        {t("dashboard.statusProcessing")}
      </Badge>
    );
  }

  if (status === "Active" || status === t("dashboard.statusActive")) {
    return (
      <Badge className="rounded-md bg-emerald-600 px-2.5 text-xs font-bold text-white uppercase">
        {t("dashboard.statusActive")}
      </Badge>
    );
  }

  if (status === "Failed" || status === t("dashboard.statusFailed")) {
    return (
      <Badge className="rounded-md bg-red-600 px-2.5 text-xs font-bold text-white uppercase">
        {t("dashboard.statusFailed")}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold text-slate-700 uppercase">
      {t("dashboard.statusInactive")}
    </Badge>
  );
}

export function RecentUploadsWidget() {
  const { t } = useTranslation();
  const [uploads, setUploads] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const docsRes = await apiClient.get("/api/documents/");
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
            uploadedBy: doc.uploader?.full_name || "Unknown",
            status: statusName,
            date: formattedDate,
            category: t("doctor.categoryKnowledgeBase")
          };
        });
        setUploads(mappedDocs);
      } catch (error: any) {
        toast.error(formatBackendError(error));
      }
    }
    fetchDocs();
  }, [t]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="font-bold text-slate-950">
          {t("dashboard.recentUploads") || t("doctor.recentUploadsTitle")}
        </h2>
        <Button variant="link" className="h-auto px-0 font-semibold text-blue-600" asChild>
          <Link href="/dashboard/documents">{t("dashboard.manageDocuments") || t("doctor.viewAllBtn")}</Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs font-medium text-slate-400">
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
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-950 truncate max-w-[250px] inline-block">
                        {upload.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
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
      
      {/* Mobile */}
      <div className="space-y-3 p-4 lg:hidden">
        {uploads.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm font-semibold">{t("dashboard.noUploads")}</p>
          </div>
        ) : (
          uploads.map((upload, idx) => (
            <div
              key={upload.id || idx}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-semibold text-slate-900">
                    {upload.name}
                  </h3>
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
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
