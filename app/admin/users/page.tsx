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
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
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
  role: "USER" | "DOCTOR" | "ADMIN" | "MODERATOR";
  status: "Active" | "Suspended";
  joinedDate: string;
  lastActive: string;
  phone?: string;
  createdAt?: Date;
}

// ─── Role Badge Styles ────────────────────────────────────────────────────────

const roleStyles = {
  USER: "bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300",
  DOCTOR: "bg-blue-600 text-white border-transparent hover:bg-blue-700",
  ADMIN: "bg-amber-500 text-white border-transparent hover:bg-amber-600",
  MODERATOR: "bg-emerald-600 text-white border-transparent hover:bg-emerald-700",
};

// ─── Initial Seed Mock Users matching screenshot exactly ──────────────────────

const initialUsers: UserAccount[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    role: "USER",
    status: "Active",
    joinedDate: "Oct 12, 2023",
    lastActive: "2 mins ago",
  },
  {
    id: 2,
    name: "Dr. Emily Chen",
    email: "emily.chen@clinic.com",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
    role: "DOCTOR",
    status: "Active",
    joinedDate: "Jan 05, 2023",
    lastActive: "1 hr ago",
  },
  {
    id: 3,
    name: "Marcus Johnson",
    email: "marcus.j@clinic.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    role: "ADMIN",
    status: "Active",
    joinedDate: "Mar 01, 2022",
    lastActive: "Online",
  },
  {
    id: 4,
    name: "Amanda Torres",
    email: "amandat99@mail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    role: "USER",
    status: "Suspended",
    joinedDate: "Aug 14, 2023",
    lastActive: "Oct 20, 2023",
  },
  {
    id: 5,
    name: "Fatima Al-Sayed",
    email: "fatima.sayed@example.com",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100",
    role: "USER",
    status: "Active",
    joinedDate: "Nov 02, 2023",
    lastActive: "3 hrs ago",
  },
  {
    id: 6,
    name: "James Peterson",
    email: "j.peterson@clinic.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    role: "MODERATOR",
    status: "Active",
    joinedDate: "May 10, 2023",
    lastActive: "yesterday",
  },
];

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
  const { t } = useTranslation();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("Active");

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
  const [formRole, setFormRole] = useState<UserAccount["role"]>("USER");
  const [formStatus, setFormStatus] = useState<UserAccount["status"]>("Active");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const response = await apiClient.get("/api/v1/admin/users");
      const mapped: UserAccount[] = response.data.map((u: any) => {
        let roleName: UserAccount["role"] = "USER";
        if (u.role_id === 2) roleName = "DOCTOR";
        else if (u.role_id === 3) roleName = "ADMIN";

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
    setFormRole("USER");
    setFormStatus("Active");
    setFormPassword("");
    setFormPhone("");
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleEditClick = (user: UserAccount) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPhone(user.phone || "");
    setFormPassword("");
    setEditMode(true);
    setOpenDialog(true);
    setActiveMenuId(null);
  };

  const handleFormSubmit = async () => {
    if (!formName || !formEmail) {
      toast.error(t("users.fillRequired"));
      return;
    }

    if (!editMode && !formPassword) {
      toast.error(t("users.passwordRequired"));
      return;
    }

    if (!editMode && formPassword.length < 6) {
      toast.error(t("users.passwordMinLen"));
      return;
    }

    if (editMode && formPassword && formPassword.length < 6) {
      toast.error(t("users.passwordNewMinLen"));
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
        const targetRoleId = formRole === "ADMIN" ? 3 : formRole === "DOCTOR" ? 2 : 1;
        const currentRoleId = selectedUser.role === "ADMIN" ? 3 : selectedUser.role === "DOCTOR" ? 2 : 1;
        if (targetRoleId !== currentRoleId) {
          await apiClient.patch(`/api/v1/admin/users/${selectedUser.id}/assign-role`, {
            role_id: targetRoleId,
          });
        }

        toast.dismiss(toastId);
        toast.success(t("users.userUpdated"));
      } else {
        // Create new user
        if (formRole === "DOCTOR") {
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
            role_id: formRole === "ADMIN" ? 3 : 1,
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

  // CSV Export simulation
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role,Status,Joined Date,Last Active\n";
    users.forEach((u) => {
      csvContent += `${u.id},"${u.name}",${u.email},${u.role},${u.status},"${u.joinedDate}","${u.lastActive}"\n`;
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

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "All" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

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
    const activeUsers = users.filter((u) => u.role === "USER" && u.status === "Active").length;
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
      title={t("users.title")}
      subtitle={t("users.subtitle")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-10 rounded-lg border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <Download className="mr-1.5 h-4 w-4 text-slate-500" />
            {t("users.exportCsv")}
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-all"
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
                <SelectTrigger className="h-8 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 w-[100px] font-bold text-slate-700">
                  <SelectValue placeholder={t("users.allRoles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t("users.allRoles")}</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
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
              Showing {startRange} to {endRange} of {filteredUsers.length} users
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Dialog: Create / Edit User Modal ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editMode ? "Modify User Account" : "Add New User"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Update name, email contacts, system role, and access suspension status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address *</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. sarah.j@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                {editMode ? "New Password (Optional)" : "Initial Password *"}
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={editMode ? "Leave blank to keep current password" : "Minimum 6 characters"}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Phone Number (Optional)</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +855 12 345 678"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Role *</label>
                <Select value={formRole} onValueChange={(val) => setFormRole(val as any)}>
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Status *</label>
                <Select value={formStatus} onValueChange={(val) => setFormStatus(val as any)}>
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white focus:ring-2 focus:ring-blue-100">
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
              className="rounded-lg border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold"
            >
              {editMode ? "Save Changes" : "Create User"}
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
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all lg:hidden"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20"
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
