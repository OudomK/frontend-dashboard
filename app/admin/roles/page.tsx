"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Save, RotateCcw, Info, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [draftPermissions, setDraftPermissions] = useState<Record<number, number[]>>({});
  const [originalPermissions, setOriginalPermissions] = useState<Record<number, number[]>>({});
  
  // Create Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.get("/api/v1/admin/rbac/roles"),
        apiClient.get("/api/v1/admin/rbac/permissions"),
      ]);
      const fetchedRoles = rolesRes.data;
      setRoles(fetchedRoles);
      setPermissions(permsRes.data);

      const initialDraft: Record<number, number[]> = {};
      fetchedRoles.forEach((r: any) => {
        initialDraft[r.id] = r.permissions.map((p: any) => p.id);
      });
      setDraftPermissions(initialDraft);
      setOriginalPermissions(initialDraft);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch RBAC data");
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

  const togglePermission = (roleId: number, permId: number) => {
    setDraftPermissions(prev => {
      const current = prev[roleId] || [];
      if (current.includes(permId)) {
        return { ...prev, [roleId]: current.filter(id => id !== permId) };
      } else {
        return { ...prev, [roleId]: [...current, permId] };
      }
    });
  };

  const toggleModuleForRole = (roleId: number, modulePermIds: number[]) => {
    setDraftPermissions(prev => {
      const current = prev[roleId] || [];
      const allSelected = modulePermIds.every(id => current.includes(id));
      
      if (allSelected) {
        // Deselect all
        return { ...prev, [roleId]: current.filter(id => !modulePermIds.includes(id)) };
      } else {
        // Select all
        const newIds = new Set([...current, ...modulePermIds]);
        return { ...prev, [roleId]: Array.from(newIds) };
      }
    });
  };

  const hasChanges = useMemo(() => {
    return Object.keys(draftPermissions).some(roleIdStr => {
      const roleId = Number(roleIdStr);
      const draft = [...(draftPermissions[roleId] || [])].sort();
      const orig = [...(originalPermissions[roleId] || [])].sort();
      return JSON.stringify(draft) !== JSON.stringify(orig);
    });
  }, [draftPermissions, originalPermissions]);

  const handleRevert = () => {
    setDraftPermissions(originalPermissions);
    toast.info("Changes reverted");
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Find roles that changed
      const changedRoleIds = Object.keys(draftPermissions)
        .map(Number)
        .filter(roleId => {
          const draft = [...(draftPermissions[roleId] || [])].sort();
          const orig = [...(originalPermissions[roleId] || [])].sort();
          return JSON.stringify(draft) !== JSON.stringify(orig);
        });

      if (changedRoleIds.length === 0) {
        toast.info("No changes to save");
        return;
      }

      // Update each changed role
      const promises = changedRoleIds.map(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return Promise.resolve();
        return apiClient.put(`/api/v1/admin/rbac/roles/${roleId}`, {
          name: role.name,
          description: role.description,
          permission_ids: draftPermissions[roleId]
        });
      });

      await Promise.all(promises);
      toast.success("Permissions updated successfully");
      
      // Sync original permissions with new draft
      setOriginalPermissions(draftPermissions);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc: any, perm: any) => {
      const mod = perm.module || "Application";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 max-w-[1600px] pb-32 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Access Control</h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-sm ml-13">
              Configure fine-grained permissions for every role in the system. 
              Changes are applied immediately across the entire workspace.
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95 px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Role
          </Button>
        </div>

        {/* Matrix Container */}
        <div className="relative">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading access matrix...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto" style={{ maxHeight: 'none' }}>
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="py-5 px-6 font-semibold text-slate-900 border-b border-slate-200 w-[300px] sticky left-0 top-0 bg-white z-20 shadow-[1px_0_0_0_#e2e8f0]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Modules</span>
                        </div>
                      </th>
                      {roles.map(role => (
                        <th key={role.id} className="py-5 px-4 text-center border-b border-l border-slate-200 min-w-[160px] bg-slate-50/50">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-900 text-base">{role.name}</span>
                            <span className="text-xs text-slate-500 font-normal max-w-[140px] truncate" title={role.description}>
                              {role.description || "Custom Role"}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(groupedPermissions).map((moduleName) => {
                      const modulePerms = groupedPermissions[moduleName];
                      const modulePermIds = modulePerms.map((p: any) => p.id);
                      
                      return (
                        <React.Fragment key={moduleName}>
                          {/* Module Group Header */}
                          <tr className="bg-slate-50 group">
                            <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-200 sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                {moduleName}
                              </div>
                            </td>
                            {roles.map(role => {
                              const rolePerms = draftPermissions[role.id] || [];
                              const allSelected = modulePermIds.every((id: number) => rolePerms.includes(id));
                              const isAdmin = role.name === "ADMIN";

                              return (
                                <td key={`header-${role.id}`} className="py-3 px-4 text-center border-l border-slate-200 bg-slate-50">
                                  {!isAdmin && (
                                    <button 
                                      onClick={() => toggleModuleForRole(role.id, modulePermIds)}
                                      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                        allSelected 
                                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                      }`}
                                    >
                                      {allSelected ? "Deselect All" : "Select All"}
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          
                          {/* Individual Permissions */}
                          {modulePerms.map((perm: any, pIdx: number) => {
                            const isLastInModule = pIdx === modulePerms.length - 1;
                            return (
                              <tr key={perm.id} className="hover:bg-blue-50/30 transition-colors group/row">
                                <td className={`py-4 px-6 border-r border-slate-200 pl-10 sticky left-0 bg-white group-hover/row:bg-slate-50/50 z-10 shadow-[1px_0_0_0_#e2e8f0] ${isLastInModule ? '' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700 font-medium capitalize">{perm.name.replace(/_/g, " ")}</span>
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-help">
                                            <Info className="w-3 h-3" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 text-white border-none shadow-xl">
                                          <p>{perm.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </td>
                                
                                {roles.map(role => {
                                  const isSelected = (draftPermissions[role.id] || []).includes(perm.id);
                                  const isAdmin = role.name === "ADMIN";
                                  
                                  return (
                                    <td key={`${role.id}-${perm.id}`} className="py-4 px-4 text-center border-l border-slate-100">
                                      <div className="flex justify-center">
                                        <Switch 
                                          checked={isSelected}
                                          onCheckedChange={() => !isAdmin && togglePermission(role.id, perm.id)}
                                          disabled={isAdmin}
                                          className={`
                                            data-[state=checked]:bg-blue-600
                                            ${isAdmin ? 'opacity-40 cursor-not-allowed' : ''}
                                          `}
                                        />
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar for Unsaved Changes */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl border border-slate-700 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">You have unsaved permission changes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={handleRevert} 
                disabled={isSaving} 
                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full px-4"
              >
                Discard
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving} 
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-900/50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Role</DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Define a new set of permissions for your team members.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleCreateRole} className="p-6 space-y-5 bg-white">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Role Name <span className="text-red-500">*</span>
              </label>
              <Input 
                required 
                value={newRole.name}
                onChange={e => setNewRole({...newRole, name: e.target.value.toUpperCase()})}
                placeholder="e.g. RECEPTIONIST"
                className="uppercase border-slate-200 focus-visible:ring-blue-600 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <Input 
                value={newRole.description}
                onChange={e => setNewRole({...newRole, description: e.target.value})}
                placeholder="Brief description of responsibilities..."
                className="border-slate-200 focus-visible:ring-blue-600"
              />
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                {isCreating ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
