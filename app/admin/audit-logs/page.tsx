"use client";

import { useState, useMemo, useEffect } from "react";
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
  LogIn
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get('/api/v1/admin/logs');
        setAuditLogs(response.data || []);
      } catch (error) {
        toast.error("Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        (log.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.resource || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "All" || log.type === selectedType;
      const matchesStatus = selectedStatus === "All" || log.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus, auditLogs]);

  return (
    <DashboardLayout
      role="admin"
      title="System Audit Logs"
      subtitle="Monitor and track all administrative actions and security events across the platform."
      actions={
        <Button
          variant="outline"
          className="h-10 rounded-lg border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <Download className="mr-2 h-4 w-4 text-slate-500" />
          Export Logs
        </Button>
      }
    >
      <div className="space-y-6 pb-20 lg:pb-0">
        
        {/* ── Analytics Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">Total Events (24h)</p>
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
                <p className="text-sm font-semibold text-slate-400">Security Alerts</p>
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
                <p className="text-sm font-semibold text-slate-400">Active Admins</p>
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
                <p className="text-sm font-semibold text-slate-400">Failed Logins</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">12</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Key className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm select-none">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, users, or resources..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:flex md:items-center md:w-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[90px] font-bold text-slate-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="LOGIN">Logins</SelectItem>
                  <SelectItem value="UPDATE">Updates</SelectItem>
                  <SelectItem value="CREATE">Creations</SelectItem>
                  <SelectItem value="DELETE">Deletions</SelectItem>
                  <SelectItem value="SECURITY">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[100px] font-bold text-slate-700">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Event Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">User / Actor</th>
                  <th className="px-6 py-4 whitespace-nowrap">Action</th>
                  <th className="px-6 py-4 whitespace-nowrap">Resource</th>
                  <th className="px-6 py-4 whitespace-nowrap">IP Address</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="font-semibold">No audit logs found matching criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
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
        </div>
      </div>
    </DashboardLayout>
  );
}
