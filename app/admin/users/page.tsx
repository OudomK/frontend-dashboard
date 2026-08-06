"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpDown,
  Download,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useTranslation } from "@/lib/hooks/use-translation";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface UserAccount {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleId: number;
  status: "Active" | "Suspended";
  joinedDate: string;
  lastActive: string;
  phone?: string;
  createdAt?: Date;
}

// ─── Role Badge Styles ────────────────────────────────────────────────────────

const roleStyles: Record<string, string> = {
  USER: "bg-slate-100 text-slate-700 border-slate-200",
  DOCTOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  "DOCTOR MANAGER": "bg-slate-900 text-white border-slate-900",
  MODERATOR: "bg-purple-50 text-purple-700 border-purple-200",
  MANAGER: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", // Fallback for manager
};

// ─── Initial Seed Mock Users removed ──────────────────────

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

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const { t, language } = useTranslation();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [selectedJoined, setSelectedJoined] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<UserAccount | null>(null);

  // Options Menu dropdown state per user
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<string>("1");
  const [formStatus, setFormStatus] = useState<UserAccount["status"]>("Active");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        apiClient.get("/api/v1/admin/rbac/roles"),
        apiClient.get("/api/v1/admin/users")
      ]);
      const rolesData = rolesRes.data;
      setAvailableRoles(rolesData);

      const mapped: UserAccount[] = usersRes.data.map((u: any) => {
        const roleObj = rolesData.find((r: any) => r.id === u.role_id);
        const roleName = roleObj ? roleObj.name : (u.role_id === 3 ? "ADMIN" : u.role_id === 2 ? "DOCTOR" : "USER");

        const statusName: UserAccount["status"] = u.status === "active" ? "Active" : "Suspended";
        const formattedDate = u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "N/A";

        const avatar = u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || "User")}&background=random`;

        return {
          id: u.id,
          name: u.full_name || "Anonymous User",
          email: u.email,
          avatar,
          role: roleName,
          roleId: u.role_id,
          status: statusName,
          joinedDate: formattedDate,
          lastActive: "Online",
          phone: u.phone || "",
          createdAt: u.created_at ? new Date(u.created_at) : undefined,
        };
      });
      setUsers(mapped);
    } catch (error: any) {
      toast.error(formatBackendError(error));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("1");
    setFormStatus("Active");
    setFormPassword("");
    setFormPhone("");
    setShowPassword(false);
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleEditClick = (user: UserAccount) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(String(user.roleId));
    setFormStatus(user.status);
    setFormPhone(user.phone || "");
    setFormPassword("");
    setShowPassword(false);
    setEditMode(true);
    setOpenDialog(true);
    setActiveMenuId(null);
  };

  const handleFormSubmit = async () => {
    if (!formName || !formEmail) {
      toast.error(t("users.fillRequired"));
      return;
    }

    if (!formPhone || formPhone.length < 12) {
      toast.error(language === "km" ? "លេខទូរស័ព្ទត្រូវមានយ៉ាងហោចណាស់ 12 ខ្ទង់" : "Phone number must be at least 12 characters");
      return;
    }

    if (!editMode && !formPassword) {
      toast.error(t("users.passwordRequired"));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!editMode && !passwordRegex.test(formPassword)) {
      toast.error(language === "km" ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 ខ្ទង់, មានអក្សរធំ អក្សរតូច លេខ និងសញ្ញាពិសេស។" : "Password must be at least 8 characters, include upper & lower case, numbers, and symbols.");
      return;
    }

    if (editMode && formPassword && !passwordRegex.test(formPassword)) {
      toast.error(language === "km" ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 ខ្ទង់, មានអក្សរធំ អក្សរតូច លេខ និងសញ្ញាពិសេស។" : "Password must be at least 8 characters, include upper & lower case, numbers, and symbols.");
      return;
    }

    const toastId = toast.loading(editMode ? t("users.savingModifications") : t("users.provisioningAccount"));

    try {
      if (editMode && selectedUser) {
        // Edit existing user (Email, Name, Phone, Status, Password)
        await apiClient.put(`/api/v1/admin/users/${selectedUser.id}`, {
          email: formEmail,
          full_name: formName,
          phone: formPhone || null,
          status: formStatus === "Active" ? "active" : "inactive",
          password: formPassword || undefined,
        });

        // Patch role assignment separately if updated
        const targetRoleId = parseInt(formRole, 10);
        const currentRoleId = selectedUser.roleId;
        if (targetRoleId !== currentRoleId) {
          await apiClient.patch(`/api/v1/admin/users/${selectedUser.id}/assign-role`, {
            role_id: targetRoleId,
          });
        }

        toast.dismiss(toastId);
        toast.success(t("users.userUpdated"));
      } else {
        // Create new user
        const targetRoleId = parseInt(formRole, 10);
        if (targetRoleId === 2) {
          await apiClient.post("/api/v1/admin/create-doctor", {
            email: formEmail,
            full_name: formName,
            password: formPassword,
            phone: formPhone || null,
            role_id: 2,
          });
        } else {
          await apiClient.post("/api/v1/admin/users", {
            email: formEmail,
            full_name: formName,
            password: formPassword,
            phone: formPhone || null,
            role_id: targetRoleId,
          });
        }
        toast.dismiss(toastId);
        toast.success(t("users.userCreated"));
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  };

  // Toggle user suspension
  const handleToggleStatus = async (user: UserAccount) => {
    const isSuspending = user.status === "Active";
    const action = isSuspending ? "deactivate" : "activate";
    
    const toastId = toast.loading(isSuspending ? t("users.suspending") : t("users.activating"));
    try {
      await apiClient.patch(`/api/v1/admin/users/${user.id}/${action}`);
      toast.dismiss(toastId);
      toast.success(t("users.userIsNow"));
      fetchUsers();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
    setActiveMenuId(null);
  };

  // Delete User Warning (Clinical Audit compliance)
  const handleDeleteUser = (user: UserAccount) => {
    setDeleteDialogUser(user);
    setActiveMenuId(null);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role,Status,Joined Date,Last Active\n";
    users.forEach((u) => {
      csvContent += `${u.id},"${u.name}","${u.email}","${u.role}","${u.status}","${u.joinedDate}","${u.lastActive}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "women_health_users_export.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(t("users.exportStarted"));
  };

  const handleExportExcel = () => {
    let content = "<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined Date</th><th>Last Active</th></tr>";
    users.forEach((u) => {
      content += `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.status}</td><td>${u.joinedDate}</td><td>${u.lastActive}</td></tr>`;
    });
    content += "</table>";
    const blob = new Blob([content], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = "women_health_users_export.xls";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(t("users.exportStarted"));
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "All" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

      let matchesJoined = true;
      if (selectedJoined !== "All") {
        if (!u.createdAt) {
          matchesJoined = false;
        } else {
          const now = new Date();
          const joined = new Date(u.createdAt);
          const diffDays = (now.getTime() - joined.getTime()) / (1000 * 3600 * 24);
          if (selectedJoined === "Last 7 days") {
            matchesJoined = diffDays <= 7;
          } else if (selectedJoined === "Last 30 days") {
            matchesJoined = diffDays <= 30;
          }
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesJoined;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedJoined]);

  // Pagination calculations
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus]);

  const startRange = filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endRange = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  const stats = useMemo(() => {
    const total = users.length;
    const activeUsers = users.filter((u) => u.status === "Active").length;
    const doctorsAndStaff = users.filter((u) => u.role === "DOCTOR" || u.role === "ADMIN").length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newThisWeek = users.filter((u) => {
      if (!u.createdAt) return false;
      return u.createdAt >= sevenDaysAgo;
    }).length;

    return {
      total: total.toLocaleString(),
      activeUsers: activeUsers.toLocaleString(),
      doctorsAndStaff: doctorsAndStaff.toLocaleString(),
      newThisWeek: newThisWeek.toLocaleString(),
    };
  }, [users]);

  return (
    <DashboardLayout
      role="admin"
      title={
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {t("users.title")}
            </h1>
            <Badge className="bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-100 uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1.5 hidden sm:flex">
              <ShieldAlert className="w-3 h-3" />
              Admin Area
            </Badge>
          </div>
      }
      subtitle={t("users.subtitle")}
      actions={
        <div className="flex items-center gap-2">
          <ExportDropdown onExportCsv={handleExportCSV} onExportExcel={handleExportExcel} label={t("users.exportCsv") || "Export"} />

          <Button
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            className="h-10 rounded-lg bg-[#12A8EA] px-4 text-sm font-semibold text-white shadow hover:bg-[#0F96DE] transition-all"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t("users.addUser")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20 lg:pb-0">
        
        {/* ── 1. Top Analytics Cards row matching screenshot ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          
          {/* Card 1: Total Users */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("users.totalUsers")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("users.activeUsers")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.activeUsers}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card 3: Doctors & Staff */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("users.doctorsAndStaff")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.doctorsAndStaff}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card 4: New This Week */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">{t("users.newRegistrations")}</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.newThisWeek}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Filter Controls row matching screenshot ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm select-none">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("users.searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:flex md:items-center md:w-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{t("users.roleLabel")}</span>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[130px] font-bold text-slate-700">
                  <SelectValue placeholder={t("users.allRoles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t("users.allRoles")} ({users.length})</SelectItem>
                  {availableRoles.map(r => {
                    const count = users.filter(u => u.role === r.name).length;
                    return (
                      <SelectItem key={r.id} value={r.name}>{r.name} ({count})</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{t("users.statusLabel")}</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[100px] font-bold text-slate-700">
                  <SelectValue placeholder={t("users.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t("users.allStatuses")}</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">JOINED</span>
              <Select value={selectedJoined} onValueChange={setSelectedJoined}>
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[120px] font-bold text-slate-700">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Any time</SelectItem>
                  <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                  <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── 3. Users Board Content Card ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4 font-semibold text-slate-500">{t("users.tableUser")}</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">{t("users.tableRole")}</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">{t("users.tableStatus")}</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">{t("users.tableJoined")}</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">{t("users.tableLastActive")}</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-right">{t("users.tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-sm">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="font-semibold">{t("users.noUsersFound")}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-snug">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5 leading-normal">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={`rounded px-2.5 py-0.5 border text-[10px] font-extrabold select-none tracking-wider ${
                            roleStyles[user.role]
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center font-semibold text-slate-700">
                          <span
                            className={`h-2 w-2 rounded-full inline-block mr-1.5 ${
                              user.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          <span>{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">{user.joinedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">{user.lastActive}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                            title="Edit User"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                            title="More Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Options drop menu mock */}
                          {activeMenuId === user.id && (
                            <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {user.status === "Active" ? "Suspend Account" : "Activate Account"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Delete Account
                              </button>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (PWA App Optimized Layout) */}
          <div className="block lg:hidden divide-y divide-slate-100 bg-white">
            {paginatedUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-semibold">No accounts found</p>
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 leading-snug">{user.name}</span>
                        <Badge
                          className={`rounded px-2 py-0.5 border text-[9px] font-extrabold select-none tracking-wider ${
                            roleStyles[user.role]
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                      <span
                        className={`h-2 w-2 rounded-full inline-block ${
                          user.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <span>{user.status}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">Joined {user.joinedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-lg border bg-white shadow-sm transition-all text-xs font-semibold ${
                          user.status === "Active"
                            ? "border-red-200 text-red-500 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        {user.status === "Active" ? "Suspend" : "Active"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 transition-all shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white select-none">
            <span className="text-sm text-slate-500 font-medium">
              {t("pagination.showing" as any)} {startRange} {t("pagination.to" as any)} {endRange} {t("pagination.of" as any)} {filteredUsers.length} {t("pagination.results" as any)}
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
        </div>

      </div>

      {/* ── Dialog: Create / Edit User Modal ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-slate-900 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {editMode ? t("user.modal.editTitle" as any) : t("user.modal.addTitle" as any)}
            </DialogTitle>
            <DialogDescription className={`text-slate-400 font-medium ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {t("user.modal.desc" as any)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>{t("user.modal.fullName" as any)} *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("user.modal.fullNamePlaceholder" as any)}
                className={`h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${language === "km" ? "font-kantumruy-pro" : ""}`}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>{t("user.modal.email" as any)} *</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder={t("user.modal.emailPlaceholder" as any)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                {editMode ? t("user.modal.passwordEdit" as any) : t("user.modal.passwordAdd" as any)} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editMode ? t("user.modal.passwordPlaceholderEdit" as any) : t("user.modal.passwordPlaceholderAdd" as any)}
                  className={`h-11 w-full rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#12A8EA] focus:ring-2 focus:ring-[#12A8EA]/20 ${language === "km" ? "font-kantumruy-pro" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>{t("user.modal.phone" as any)}</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder={t("user.modal.phonePlaceholder" as any)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>{t("user.modal.role" as any)} *</label>
                <Select value={formRole} onValueChange={(val) => setFormRole(val as any)}>
                  <SelectTrigger className={`!h-11 w-full rounded-xl border border-slate-200 bg-white !px-4 !py-0 text-sm text-slate-800 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(r => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>{t("user.modal.status" as any)} *</label>
                <Select value={formStatus} onValueChange={(val) => setFormStatus(val as any)}>
                  <SelectTrigger className={`!h-11 w-full rounded-xl border border-slate-200 bg-white !px-4 !py-0 text-sm text-slate-800 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2 select-none">
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className={`rounded-lg border-slate-200 hover:bg-slate-50 ${language === "km" ? "font-kantumruy-pro" : ""}`}
            >
              {t("user.modal.cancel" as any)}
            </Button>
            <Button
              onClick={handleFormSubmit}
              className={`bg-[#12A8EA] text-white hover:bg-[#0F96DE] rounded-lg font-semibold ${language === "km" ? "font-kantumruy-pro" : ""}`}
            >
              {editMode ? t("user.modal.saveBtn" as any) : t("user.modal.createBtn" as any)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile/PWA */}
      <button
        onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#12A8EA] text-white shadow-xl hover:bg-[#0F96DE] hover:scale-105 active:scale-95 transition-all lg:hidden"
        aria-label="Add New User"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Compliance Delete Warning Modal */}
      <Dialog open={!!deleteDialogUser} onOpenChange={(open) => !open && setDeleteDialogUser(null)}>
        <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-white/10 text-white rounded-2xl shadow-2xl">
          <DialogHeader className="gap-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center tracking-tight text-white">
              Action Not Permitted
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400 text-sm leading-relaxed pt-2">
              Account <span className="font-medium text-slate-200">"{deleteDialogUser?.name}"</span> cannot be permanently deleted. 
              <br/><br/>
              To comply with strict medical audit records and data retention policies, users cannot be wiped from the database. 
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
            <Button
              className="w-full bg-[#12A8EA] hover:bg-[#0F96DE] text-white shadow-md shadow-[#12A8EA]/20"
              onClick={() => {
                if (deleteDialogUser) {
                  // If they aren't already suspended, suspend them
                  if (deleteDialogUser.status === "Active") {
                    handleToggleStatus(deleteDialogUser);
                  } else {
                    toast.info("This account is already suspended.");
                  }
                  setDeleteDialogUser(null);
                }
              }}
            >
              Suspend Account Instead
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/10 bg-transparent hover:bg-white/5 text-slate-300"
              onClick={() => setDeleteDialogUser(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
