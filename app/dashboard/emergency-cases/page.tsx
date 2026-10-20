"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  Search,
  Eye,
  Filter,
  Check,
  Clock,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Flag,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useAuthStore } from "@/lib/store/use-auth-store";

export interface EmergencyFlag {
  id: number;
  message_id: number;
  rule_id: number;
  detected_text: string | null;
  flagged_at: string;
  session_id: number | null;
  user_id: number | null;
  message_content: string | null;
  rule_name: string | null;
  severity_level: "critical" | "urgent" | "warning" | string | null;
  advice_text: string | null;
  status: "needs_review" | "approved" | "flagged" | "resolved" | string;
  resolved_by: number | null;
}

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
        return `${field}: ${d.msg}`;
      })
      .join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error.response?.data?.message || error.message || "An unexpected error occurred";
}

const severityConfig: Record<string, { labelKey: string; badgeClass: string; icon: any }> = {
  critical: {
    labelKey: "emergencyCases.severityCritical",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    icon: ShieldAlert,
  },
  urgent: {
    labelKey: "emergencyCases.severityUrgent",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertTriangle,
  },
  warning: {
    labelKey: "emergencyCases.severityWarning",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
};

const statusConfig: Record<string, { labelKey: string; badgeClass: string }> = {
  needs_review: {
    labelKey: "emergencyCases.needsReview",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  flagged: {
    labelKey: "emergencyCases.flagged",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    labelKey: "emergencyCases.approved",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  resolved: {
    labelKey: "emergencyCases.resolved",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function ActiveEmergencyCasesPage() {
  const { t, language } = useTranslation();
  const { user } = useAuthStore();
  const canResolve = Boolean(user?.permissions?.includes("resolve_emergency"));

  const [cases, setCases] = useState<EmergencyFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "needs_review" | "flagged" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // Detail Modal & Action State
  const [selectedCase, setSelectedCase] = useState<EmergencyFlag | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    flagId: number | null;
    targetStatus: "needs_review" | "flagged" | "resolved" | null;
    statusLabel: string;
  }>({
    isOpen: false,
    flagId: null,
    targetStatus: null,
    statusLabel: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<EmergencyFlag[]>("/api/v1/emergency-flags/");
      setCases(res.data || []);
    } catch (err: any) {
      const msg = formatBackendError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Derived counts for metric summary cards
  const counts = useMemo(() => {
    const total = cases.length;
    const needsReview = cases.filter((c) => c.status === "needs_review").length;
    const flagged = cases.filter((c) => c.status === "flagged").length;
    const resolved = cases.filter((c) => c.status === "resolved").length;
    return { total, needsReview, flagged, resolved };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Tab filter
      if (activeTab === "needs_review" && item.status !== "needs_review") return false;
      if (activeTab === "flagged" && item.status !== "flagged") return false;
      if (activeTab === "resolved" && item.status !== "resolved") return false;

      // 2. Severity filter
      if (severityFilter !== "all" && item.severity_level?.toLowerCase() !== severityFilter.toLowerCase()) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRule = item.rule_name?.toLowerCase().includes(query) || false;
        const matchesDetected = item.detected_text?.toLowerCase().includes(query) || false;
        const matchesMessage = item.message_content?.toLowerCase().includes(query) || false;
        const matchesSession = item.session_id ? String(item.session_id).includes(query) : false;
        const matchesId = String(item.id).includes(query);

        if (!matchesRule && !matchesDetected && !matchesMessage && !matchesSession && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [cases, activeTab, severityFilter, searchQuery]);

  // Action: Prompt confirmation for status update
  const promptStatusChange = (
    flagId: number,
    targetStatus: "needs_review" | "flagged" | "resolved",
    statusLabel: string
  ) => {
    setConfirmModal({
      isOpen: true,
      flagId,
      targetStatus,
      statusLabel,
    });
  };

  // Action: Execute status update
  const executeStatusChange = async () => {
    if (!canResolve) {
      toast.error("Unauthorized to update emergency case status");
      return;
    }
    if (!confirmModal.flagId || !confirmModal.targetStatus) return;
    setIsUpdating(true);
    try {
      const res = await apiClient.patch<EmergencyFlag>(
        `/api/v1/emergency-flags/${confirmModal.flagId}/status`,
        { status: confirmModal.targetStatus }
      );

      // Update state with returned flag
      const updatedFlag = res.data;
      setCases((prev) =>
        prev.map((c) => (c.id === confirmModal.flagId ? updatedFlag : c))
      );

      // If viewing in detail dialog, update that too
      if (selectedCase && selectedCase.id === confirmModal.flagId) {
        setSelectedCase(updatedFlag);
      }

      toast.success(
        t("emergencyCases.statusUpdated", {
          id: confirmModal.flagId,
          status: confirmModal.statusLabel,
        })
      );
      setConfirmModal({ isOpen: false, flagId: null, targetStatus: null, statusLabel: "" });
    } catch (err: any) {
      toast.error(formatBackendError(err) || t("emergencyCases.statusUpdateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString(language === "km" ? "km-KH" : "en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString(language === "km" ? "km-KH" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: dateStr, time: "" };
    }
  };

  return (
    <DashboardLayout
      role="doctor"
      title={t("emergencyCases.title")}
      subtitle={t("emergencyCases.description")}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCases}
          disabled={isLoading}
          className="gap-2 rounded-lg border-slate-200 font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          {t("emergencyCases.retry") || "Refresh"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cases */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("emergencyCases.totalCases")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{counts.total}</p>
          </div>

          {/* Needs Review */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                {t("emergencyCases.needsReview")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-rose-900">{counts.needsReview}</p>
          </div>

          {/* Flagged / Escalated */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                {t("emergencyCases.flagged")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Flag className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-900">{counts.flagged}</p>
          </div>

          {/* Resolved */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {t("emergencyCases.resolved")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-900">{counts.resolved}</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val: any) => setActiveTab(val)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-4 md:w-auto bg-slate-100/80 p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm font-medium">
                {t("emergencyCases.tabAll")} ({counts.total})
              </TabsTrigger>
              <TabsTrigger value="needs_review" className="text-xs sm:text-sm font-medium">
                {t("emergencyCases.tabNeedsReview")} ({counts.needsReview})
              </TabsTrigger>
              <TabsTrigger value="flagged" className="text-xs sm:text-sm font-medium">
                {t("emergencyCases.tabFlagged")} ({counts.flagged})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs sm:text-sm font-medium">
                {t("emergencyCases.tabResolved")} ({counts.resolved})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Severity Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t("emergencyCases.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm rounded-lg"
              />
            </div>

            {/* Severity Dropdown */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs sm:text-sm rounded-lg">
                <SelectValue placeholder={t("emergencyCases.filterSeverity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("emergencyCases.allSeverities")}</SelectItem>
                <SelectItem value="critical">{t("emergencyCases.severityCritical")}</SelectItem>
                <SelectItem value="urgent">{t("emergencyCases.severityUrgent")}</SelectItem>
                <SelectItem value="warning">{t("emergencyCases.severityWarning")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <RotateCw className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading emergency incident cases...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/40 p-12 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t("emergencyCases.errorTitle")}</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
            <Button
              onClick={fetchCases}
              variant="outline"
              size="sm"
              className="mt-4 gap-2 border-slate-300 font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              {t("emergencyCases.retry")}
            </Button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t("emergencyCases.emptyTitle")}</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">{t("emergencyCases.emptyDesc")}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableId")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableSeverity")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableRule")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableTrigger")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableSession")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableTime")}</th>
                    <th className="px-5 py-3.5">{t("emergencyCases.tableStatus")}</th>
                    <th className="px-5 py-3.5 text-right">{t("emergencyCases.tableActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((item) => {
                    const sevKey = (item.severity_level || "critical").toLowerCase();
                    const sevInfo = severityConfig[sevKey] || severityConfig.critical;
                    const SevIcon = sevInfo.icon;

                    const statKey = (item.status || "needs_review").toLowerCase();
                    const statInfo = statusConfig[statKey] || statusConfig.needs_review;
                    const { date, time } = formatDate(item.flagged_at);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID */}
                        <td className="px-5 py-4 font-bold text-slate-900">
                          #{item.id}
                        </td>

                        {/* Severity */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${sevInfo.badgeClass}`}
                          >
                            <SevIcon className="h-3 w-3" />
                            {t(sevInfo.labelKey) || item.severity_level}
                          </span>
                        </td>

                        {/* Rule Name */}
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {item.rule_name || `Rule #${item.rule_id}`}
                        </td>

                        {/* Trigger */}
                        <td className="px-5 py-4 max-w-[200px]">
                          <span className="inline-block truncate rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 border border-rose-100 max-w-full">
                            {item.detected_text || item.message_content || "—"}
                          </span>
                        </td>

                        {/* Session */}
                        <td className="px-5 py-4 text-xs font-medium text-slate-600">
                          {item.session_id ? `Session #${item.session_id}` : "—"}
                        </td>

                        {/* Time */}
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{date}</div>
                          <div className="text-[11px] text-slate-400">{time}</div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statInfo.badgeClass}`}
                          >
                            {t(statInfo.labelKey) || item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCase(item)}
                              className="h-8 gap-1 px-2.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {t("emergencyCases.viewDetails")}
                            </Button>

                            {/* Status Quick Actions */}
                            {canResolve && (
                              <>
                                {item.status !== "resolved" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      promptStatusChange(
                                        item.id,
                                        "resolved",
                                        t("emergencyCases.resolved")
                                      )
                                    }
                                    className="h-8 gap-1 px-2 text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    {t("emergencyCases.markResolved")}
                                  </Button>
                                )}

                                {item.status === "needs_review" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      promptStatusChange(
                                        item.id,
                                        "flagged",
                                        t("emergencyCases.flagged")
                                      )
                                    }
                                    className="h-8 gap-1 px-2 text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-50"
                                  >
                                    <Flag className="h-3.5 w-3.5" />
                                    {t("emergencyCases.markFlagged")}
                                  </Button>
                                )}

                                {(item.status === "resolved" || item.status === "flagged") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      promptStatusChange(
                                        item.id,
                                        "needs_review",
                                        t("emergencyCases.needsReview")
                                      )
                                    }
                                    className="h-8 gap-1 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    {t("emergencyCases.markNeedsReview")}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredCases.map((item) => {
                const sevKey = (item.severity_level || "critical").toLowerCase();
                const sevInfo = severityConfig[sevKey] || severityConfig.critical;
                const SevIcon = sevInfo.icon;

                const statKey = (item.status || "needs_review").toLowerCase();
                const statInfo = statusConfig[statKey] || statusConfig.needs_review;
                const { date, time } = formatDate(item.flagged_at);

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">#{item.id}</span>
                          <span className="text-xs text-slate-500">
                            {item.session_id ? `Session #${item.session_id}` : ""}
                          </span>
                        </div>
                        <h4 className="mt-1 font-semibold text-slate-900">
                          {item.rule_name || `Rule #${item.rule_id}`}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold capitalize ${sevInfo.badgeClass}`}
                      >
                        <SevIcon className="h-3 w-3" />
                        {t(sevInfo.labelKey) || item.severity_level}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <span className="font-medium text-slate-500">
                        {t("emergencyCases.tableTrigger")}:{" "}
                      </span>
                      <span className="font-semibold text-rose-700">
                        {item.detected_text || item.message_content || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{date} {time}</span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statInfo.badgeClass}`}
                      >
                        {t(statInfo.labelKey) || item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCase(item)}
                        className="h-8 gap-1 px-3 text-xs font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("emergencyCases.viewDetails")}
                      </Button>

                      {canResolve && (
                        <>
                          {item.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                promptStatusChange(item.id, "resolved", t("emergencyCases.resolved"))
                              }
                              className="h-8 gap-1 px-3 text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {t("emergencyCases.markResolved")}
                            </Button>
                          )}

                          {item.status === "needs_review" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                promptStatusChange(item.id, "flagged", t("emergencyCases.flagged"))
                              }
                              className="h-8 gap-1 px-3 text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              <Flag className="h-3.5 w-3.5" />
                              {t("emergencyCases.markFlagged")}
                            </Button>
                          )}

                          {(item.status === "resolved" || item.status === "flagged") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                promptStatusChange(
                                  item.id,
                                  "needs_review",
                                  t("emergencyCases.needsReview")
                                )
                              }
                              className="h-8 gap-1 px-3 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              {t("emergencyCases.markNeedsReview")}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Incident Details Dialog */}
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedCase && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {t("emergencyCases.detailsTitle")} #{selectedCase.id}
                    </DialogTitle>
                    {(() => {
                      const sevKey = (selectedCase.severity_level || "critical").toLowerCase();
                      const sevInfo = severityConfig[sevKey] || severityConfig.critical;
                      const SevIcon = sevInfo.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${sevInfo.badgeClass}`}
                        >
                          <SevIcon className="h-3 w-3" />
                          {t(sevInfo.labelKey) || selectedCase.severity_level}
                        </span>
                      );
                    })()}
                  </div>
                  <DialogDescription className="text-slate-500">
                    {t("emergencyCases.detailsSubtitle")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                  {/* Metadata Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-slate-50 p-3 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t("emergencyCases.tableRule")}</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {selectedCase.rule_name || `Rule #${selectedCase.rule_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("emergencyCases.tableSession")}</span>
                      <span className="font-semibold text-slate-900 block">
                        #{selectedCase.session_id || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("emergencyCases.tableTime")}</span>
                      <span className="font-semibold text-slate-900 block">
                        {formatDate(selectedCase.flagged_at).date}{" "}
                        {formatDate(selectedCase.flagged_at).time}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("emergencyCases.tableStatus")}</span>
                      <span className="font-semibold capitalize text-slate-900 block">
                        {selectedCase.status}
                      </span>
                    </div>
                  </div>

                  {/* Detected Symptom Keywords */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("emergencyCases.dialogTriggeredKeywords")}
                    </h5>
                    <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 font-medium text-rose-800">
                      {selectedCase.detected_text || "—"}
                    </div>
                  </div>

                  {/* Patient User Message */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("emergencyCases.dialogMessageContent")}
                    </h5>
                    <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {selectedCase.message_content || "—"}
                    </div>
                  </div>

                  {/* Advice Given to Patient */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("emergencyCases.dialogAdviceGiven")}
                    </h5>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {selectedCase.advice_text || "—"}
                    </div>
                  </div>

                  {/* Resolved By Info */}
                  {selectedCase.resolved_by && (
                    <div className="text-xs text-slate-500">
                      <span>{t("emergencyCases.dialogResolvedBy")}: </span>
                      <span className="font-semibold text-slate-800">#{selectedCase.resolved_by}</span>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 w-full sm:w-auto mr-auto">
                    {canResolve && (
                      <>
                        {selectedCase.status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              promptStatusChange(
                                selectedCase.id,
                                "resolved",
                                t("emergencyCases.resolved")
                              )
                            }
                            className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                          >
                            <Check className="h-4 w-4" />
                            {t("emergencyCases.markResolved")}
                          </Button>
                        )}

                        {selectedCase.status === "needs_review" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              promptStatusChange(
                                selectedCase.id,
                                "flagged",
                                t("emergencyCases.flagged")
                              )
                            }
                            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
                          >
                            <Flag className="h-4 w-4" />
                            {t("emergencyCases.markFlagged")}
                          </Button>
                        )}

                        {(selectedCase.status === "resolved" || selectedCase.status === "flagged") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              promptStatusChange(
                                selectedCase.id,
                                "needs_review",
                                t("emergencyCases.needsReview")
                              )
                            }
                            className="gap-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("emergencyCases.markNeedsReview")}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCase(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Clinical Status Changes */}
        <Dialog
          open={confirmModal.isOpen}
          onOpenChange={(open) => !open && setConfirmModal({ isOpen: false, flagId: null, targetStatus: null, statusLabel: "" })}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {t("emergencyCases.confirmTitle")}
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                {t("emergencyCases.confirmDesc", {
                  id: confirmModal.flagId || 0,
                  status: confirmModal.statusLabel,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ isOpen: false, flagId: null, targetStatus: null, statusLabel: "" })}
                disabled={isUpdating}
              >
                {t("emergencyCases.cancelBtn")}
              </Button>
              <Button
                size="sm"
                onClick={executeStatusChange}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                {isUpdating && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
                {isUpdating ? t("emergencyCases.updating") : t("emergencyCases.confirmBtn")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
