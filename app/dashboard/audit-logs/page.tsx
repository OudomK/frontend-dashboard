"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity,
  Calendar,
  Download,
  Filter,
  Search,
  Shield,
  ShieldAlert,
  User,
  Clock,
  FileText,
  Settings,
  Trash2,
  Key,
  LogIn,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Mock Audit Logs Data ──────────────────────────────────────────────────

type AuditActionType = "LOGIN" | "DELETE" | "UPDATE" | "CREATE" | "SECURITY";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  type: AuditActionType;
  resource: string;
  ipAddress: string;
  status: "Success" | "Failed";
  details?: string;
}



// ─── Helper Functions ──────────────────────────────────────────────────────

const getTypeIcon = (type: AuditActionType) => {
  switch (type) {
    case "LOGIN": return <LogIn className="h-4 w-4 text-blue-500" />;
    case "DELETE": return <Trash2 className="h-4 w-4 text-red-500" />;
    case "UPDATE": return <Settings className="h-4 w-4 text-amber-500" />;
    case "CREATE": return <FileText className="h-4 w-4 text-emerald-500" />;
    case "SECURITY": return <ShieldAlert className="h-4 w-4 text-purple-500" />;
    default: return <Activity className="h-4 w-4 text-slate-500" />;
  }
};

const getTypeColor = (type: AuditActionType) => {
  switch (type) {
    case "LOGIN": return "bg-blue-50 text-blue-700 border-blue-200";
    case "DELETE": return "bg-red-50 text-red-700 border-red-200";
    case "UPDATE": return "bg-amber-50 text-amber-700 border-amber-200";
    case "CREATE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SECURITY": return "bg-purple-50 text-purple-700 border-purple-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get('/api/v1/admin/logs');
        setAuditLogs(response.data || []);
      } catch (error) {
        toast.error(t("audit.errorLoadLogs"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportCSV = () => {
    const headers = ["ID", "Timestamp", "User", "Role", "Action", "Type", "Resource", "IP Address", "Status", "Details"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.user,
      log.role,
      log.action,
      log.type,
      log.resource,
      log.ipAddress,
      log.status,
      log.details || ""
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    toast.success("Exported as CSV successfully!");
  };

  const exportExcel = () => {
    const headers = ["ID", "Timestamp", "User", "Role", "Action", "Type", "Resource", "IP Address", "Status", "Details"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.user,
      log.role,
      log.action,
      log.type,
      log.resource,
      log.ipAddress,
      log.status,
      log.details || ""
    ]);
    // Build an HTML table that Excel can open natively
    const tableHtml = [
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel'>",
      "<head><meta charset='utf-8'></head><body>",
      "<table><tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>",
      ...rows.map(row => "<tr>" + row.map(v => `<td>${String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("") + "</tr>"),
      "</table></body></html>"
    ].join("");
    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    toast.success("Exported as Excel successfully!");
  };

  // Filter Logic
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return auditLogs.filter((log) => {
      const matchesSearch =
        (log.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.resource || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "All" || log.type === selectedType;
      const matchesStatus = selectedStatus === "All" || log.status === selectedStatus;

      // Date filter
      let matchesDate = true;
      if (log.timestamp && datePreset !== "all") {
        const logDate = new Date(log.timestamp);
        if (datePreset === "today") {
          matchesDate = logDate >= startOfDay;
        } else if (datePreset === "week") {
          matchesDate = logDate >= startOfWeek;
        } else if (datePreset === "month") {
          matchesDate = logDate >= startOfMonth;
        } else if (datePreset === "custom") {
          if (customFrom) matchesDate = logDate >= new Date(customFrom);
          if (customTo) matchesDate = matchesDate && logDate <= new Date(customTo + "T23:59:59");
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [searchQuery, selectedType, selectedStatus, datePreset, customFrom, customTo, auditLogs]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus, datePreset, customFrom, customTo]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startRange = filteredLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endRange = Math.min(currentPage * itemsPerPage, filteredLogs.length);

  return (
    <DashboardLayout
      role="admin"
      title={t("audit.title")}
      subtitle={t("audit.subtitle")}
      actions={
        <div className="relative" ref={exportMenuRef}>
          <Button
            variant="outline"
            className="h-10 rounded-lg border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 gap-1.5"
            onClick={() => setShowExportMenu(prev => !prev)}
          >
            <Download className="h-4 w-4 text-slate-500" />
            {t("audit.exportLogs")}
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
          </Button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Export {filteredLogs.length} records</p>
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Export as CSV</p>
                  <p className="text-xs text-slate-400">Comma-separated values</p>
                </div>
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
              >
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Export as Excel</p>
                  <p className="text-xs text-slate-400">Microsoft Excel (.xls)</p>
                </div>
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6 pb-20 lg:pb-0">
        
        {/* ── Analytics Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("audit.totalEvents")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">1,284</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("audit.securityAlerts")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">3</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("audit.activeAdmins")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">4</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("audit.failedLogins")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">12</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Key className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3">
          {/* Row 1: Search + Type + Status */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("audit.searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full md:flex md:items-center md:w-auto">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[90px] font-bold text-slate-700">
                    <SelectValue placeholder={t("audit.allTypes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">{t("audit.allTypes")}</SelectItem>
                    <SelectItem value="LOGIN">{t("audit.typeLogins")}</SelectItem>
                    <SelectItem value="UPDATE">{t("audit.typeUpdates")}</SelectItem>
                    <SelectItem value="CREATE">{t("audit.typeCreations")}</SelectItem>
                    <SelectItem value="DELETE">{t("audit.typeDeletions")}</SelectItem>
                    <SelectItem value="SECURITY">{t("audit.typeSecurity")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[100px] font-bold text-slate-700">
                    <SelectValue placeholder={t("audit.allStatuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">{t("audit.allStatuses")}</SelectItem>
                    <SelectItem value="Success">{t("audit.statusSuccess")}</SelectItem>
                    <SelectItem value="Failed">{t("audit.statusFailed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 2: Date Filter Presets */}
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</span>
              </div>
              
              {/* Preset Pills */}
              <div className="flex flex-wrap gap-2 flex-1">
                {([
                  { key: "all", label: "All Time" },
                  { key: "today", label: "Today" },
                  { key: "week", label: "This Week" },
                  { key: "month", label: "This Month" },
                  { key: "custom", label: "Custom Range" },
                ] as const).map(preset => (
                  <button
                    key={preset.key}
                    onClick={() => {
                      setDatePreset(preset.key);
                      if (preset.key !== "custom") {
                        setCustomFrom("");
                        setCustomTo("");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      datePreset === preset.key
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {preset.key === "today" && "📅 "}
                    {preset.key === "week" && "📆 "}
                    {preset.key === "month" && "🗓️ "}
                    {preset.key === "custom" && "✏️ "}
                    {preset.label}
                  </button>
                ))}

                {/* Active filter badge */}
                {datePreset !== "all" && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                    {filteredLogs.length} results
                    <button
                      onClick={() => { setDatePreset("all"); setCustomFrom(""); setCustomTo(""); }}
                      className="ml-1 hover:text-blue-800 font-black text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {datePreset === "custom" && (
              <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-bold text-slate-500 whitespace-nowrap">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-bold text-slate-500 whitespace-nowrap">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                {(customFrom || customTo) && (
                  <button
                    onClick={() => { setCustomFrom(""); setCustomTo(""); }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableEventDate")}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableUser")}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableAction")}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableResource")}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableIpAddress")}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t("audit.tableStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="font-semibold">{t("audit.noLogsFound")}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-600 font-medium">
                          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{log.user}</span>
                          <span className="text-xs text-slate-400 font-medium">{log.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`h-6 text-[10px] uppercase font-bold tracking-wider ${getTypeColor(log.type)}`}>
                              {getTypeIcon(log.type)}
                              <span className="ml-1.5">{log.type}</span>
                            </Badge>
                            <span className="font-semibold text-slate-700">{log.action}</span>
                          </div>
                          {log.details && (
                            <span className="text-xs text-slate-500 font-medium leading-relaxed">
                              {log.details}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-1 rounded-md text-xs">
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            log.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-600 border-0"
                              : "bg-red-500/10 text-red-600 border-0"
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredLogs.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white select-none">
              <span className="text-sm text-slate-500 font-medium">
                {t("pagination.showing" as any)} {startRange} {t("pagination.to" as any)} {endRange} {t("pagination.of" as any)} {filteredLogs.length} {t("pagination.results" as any)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
                >
                  {t("pagination.previous" as any)}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
                >
                  {t("pagination.next" as any)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
