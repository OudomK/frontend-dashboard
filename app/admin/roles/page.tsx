"use client";

import React, { useState, useEffect } from "react";
import { Plus, Shield, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/hooks/use-translation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

export default function RolesPage() {
  const { t, language } = useTranslation();
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Delete modal state
  const [roleToDelete, setRoleToDelete] = useState<{ id: number, name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const rolesRes = await apiClient.get("/api/v1/admin/rbac/roles");
      setRoles(rolesRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await apiClient.post("/api/v1/admin/rbac/roles", {
        name: newRole.name.toUpperCase(),
        description: newRole.description,
        permission_ids: []
      });
      toast.success("Role created successfully");
      setIsModalOpen(false);
      setNewRole({ name: "", description: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await apiClient.delete(`/api/v1/admin/rbac/roles/${roleToDelete.id}`);
      
      const successMsg = t("roles.deleteSuccess") || `Role "${roleToDelete.name}" deleted successfully`;
      toast.success(successMsg.includes('{roleName}') 
        ? successMsg.replace('{roleName}', roleToDelete.name) 
        : successMsg);
      
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      setRoleToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || t("roles.deleteError") || "Failed to delete role");
    }
  };

  const handleDeleteRole = (roleId: number, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t("roles.title")}</h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-sm ml-13">
              {t("roles.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/permissions">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                <ShieldAlert className="mr-2 h-4 w-4 text-blue-500" /> {t("roles.managePermissions")}
              </Button>
            </Link>
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95 px-6"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("roles.addBtn")}
            </Button>
          </div>
        </div>

        {/* Roles List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading roles...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-900 w-[250px]">{t("roles.table.name")}</th>
                    <th className="py-4 px-6 font-semibold text-slate-900">{t("roles.table.description")}</th>
                    <th className="py-4 px-6 font-semibold text-slate-900 w-[120px] text-center">{t("roles.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map(role => {
                    const isSystemRole = ['user', 'admin', 'doctor manager', 'doctor'].includes(role.name.toLowerCase());
                    
                    return (
                      <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 text-base">{role.name}</span>
                          {isSystemRole && (
                            <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              System
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {role.description || "No description provided."}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {!isSystemRole ? (
                            <button
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-medium uppercase tracking-widest">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {roles.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">No roles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-slate-900 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {t("roles.modal.createTitle" as any)}
            </DialogTitle>
            <DialogDescription className={`text-slate-400 font-medium ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {t("roles.modal.createDesc" as any)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                {t("roles.modal.roleName" as any)} *
              </label>
              <Input 
                required 
                value={newRole.name}
                onChange={e => setNewRole({...newRole, name: e.target.value.toUpperCase()})}
                placeholder={t("roles.modal.roleNamePlaceholder" as any)}
                className={`h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium ${language === "km" ? "font-kantumruy-pro" : ""}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`block text-sm font-semibold text-slate-700 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                {t("roles.modal.description" as any)}
              </label>
              <Input 
                value={newRole.description}
                onChange={e => setNewRole({...newRole, description: e.target.value})}
                placeholder={t("roles.modal.descPlaceholder" as any)}
                className={`h-11 w-full rounded-xl border border-slate-200 px-4 text-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${language === "km" ? "font-kantumruy-pro" : ""}`}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2 select-none">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className={`rounded-lg border-slate-200 hover:bg-slate-50 ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                {t("roles.modal.cancel" as any)}
              </Button>
              <Button type="submit" disabled={isCreating} className={`bg-[#12A8EA] hover:bg-[#0F96DE] text-white rounded-lg font-semibold ${language === "km" ? "font-kantumruy-pro" : ""}`}>
                {isCreating ? t("roles.modal.creatingBtn" as any) : t("roles.modal.createBtn" as any)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 text-center w-full">
                {t("roles.deleteConfirmTitle") || "Delete Role?"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-base">
                {t("roles.deleteConfirmDesc") ? (
                  t("roles.deleteConfirmDesc").replace("{roleName}", roleToDelete?.name || "")
                ) : (
                  <>
                    Are you sure you want to delete the <strong className="text-slate-900">{roleToDelete?.name}</strong> role? 
                    This action cannot be undone and may affect users assigned to this role.
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Button variant="outline" onClick={() => setRoleToDelete(null)} className="w-full sm:w-auto sm:min-w-[120px]">
              {t("roles.cancel") || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole} className="w-full sm:w-auto sm:min-w-[120px] bg-red-600 hover:bg-red-700 text-white">
              {t("roles.deleteConfirmBtn") || "Yes, delete role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
