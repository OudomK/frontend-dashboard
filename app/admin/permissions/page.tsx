"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Shield, Info, AlertCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/hooks/use-translation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PermissionsPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [draftPermissions, setDraftPermissions] = useState<number[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<number[]>([]);

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
      
      if (fetchedRoles.length > 0 && !selectedRoleId) {
        handleSelectRole(String(fetchedRoles[0].id), fetchedRoles);
      } else if (selectedRoleId) {
        // Refresh currently selected role if it exists
        handleSelectRole(selectedRoleId, fetchedRoles);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch RBAC data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (roleIdStr: string, currentRoles: any[] = roles) => {
    setSelectedRoleId(roleIdStr);
    const roleId = Number(roleIdStr);
    const role = currentRoles.find(r => r.id === roleId);
    if (role) {
      const perms = role.permissions.map((p: any) => p.id);
      setOriginalPermissions(perms);
      setDraftPermissions(perms);
    }
  };

  const togglePermission = (permId: number) => {
    setDraftPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(id => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const toggleModuleForRole = (modulePermIds: number[]) => {
    setDraftPermissions(prev => {
      const allSelected = modulePermIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all
        return prev.filter(id => !modulePermIds.includes(id));
      } else {
        // Select all
        const newIds = new Set([...prev, ...modulePermIds]);
        return Array.from(newIds);
      }
    });
  };

  const hasChanges = useMemo(() => {
    const draft = [...draftPermissions].sort();
    const orig = [...originalPermissions].sort();
    return JSON.stringify(draft) !== JSON.stringify(orig);
  }, [draftPermissions, originalPermissions]);

  const handleRevert = () => {
    setDraftPermissions(originalPermissions);
    toast.info("Changes reverted");
  };

  const handleSaveChanges = async () => {
    if (!selectedRoleId) return;
    const roleId = Number(selectedRoleId);
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    try {
      setIsSaving(true);
      await apiClient.put(`/api/v1/admin/rbac/roles/${roleId}`, {
        name: role.name,
        description: role.description,
        permission_ids: draftPermissions
      });

      toast.success("Permissions updated successfully");
      setOriginalPermissions(draftPermissions);
      
      // We could also re-fetch data to be completely in sync
      const rolesRes = await apiClient.get("/api/v1/admin/rbac/roles");
      setRoles(rolesRes.data);
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

  const selectedRoleName = roles.find(r => r.id === Number(selectedRoleId))?.name || "";
  const isAdminRole = selectedRoleName.toLowerCase() === "admin";

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-[1000px] mx-auto pb-32">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Permission Management</h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-sm ml-13">
              Configure fine-grained feature and functional permissions for specific roles.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Role to Edit</span>
            <Select value={selectedRoleId} onValueChange={(val) => handleSelectRole(val)}>
              <SelectTrigger className="w-[240px] h-11 border-slate-200 bg-slate-50 focus:ring-blue-500 rounded-xl font-semibold">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)} className="font-medium cursor-pointer">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Matrix Container */}
        <div className="relative">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading permissions...</p>
            </div>
          ) : !selectedRoleId ? (
            <div className="h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 font-medium">
              Please select a role to view and edit its permissions.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    Permissions for <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-sm">{selectedRoleName}</span>
                  </h2>
                  {isAdminRole && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> System admin permissions cannot be modified here.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {Object.keys(groupedPermissions).map((moduleName) => {
                  const modulePerms = groupedPermissions[moduleName];
                  const modulePermIds = modulePerms.map((p: any) => p.id);
                  const allSelected = modulePermIds.every((id: number) => draftPermissions.includes(id));
                  
                  return (
                    <div key={moduleName} className="p-0">
                      {/* Module Header */}
                      <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-y border-slate-100 first:border-t-0">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                          <h3 className="font-bold text-slate-800 text-sm">{moduleName}</h3>
                        </div>
                        {!isAdminRole && (
                          <button 
                            onClick={() => toggleModuleForRole(modulePermIds)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                              allSelected 
                                ? "bg-rose-100 text-rose-700 hover:bg-rose-200" 
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            {allSelected ? "Deselect All" : "Select All in Module"}
                          </button>
                        )}
                      </div>
                      
                      {/* Permissions List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 px-6 py-2">
                        {modulePerms.map((perm: any) => {
                          const isSelected = draftPermissions.includes(perm.id);
                          return (
                            <div key={perm.id} className="flex items-center justify-between py-3 group">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-700 font-medium text-sm capitalize">{perm.name.replace(/_/g, " ")}</span>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-help">
                                        <Info className="w-2.5 h-2.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white border-none shadow-xl max-w-xs">
                                      <p>{perm.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Switch 
                                checked={isSelected}
                                onCheckedChange={() => !isAdminRole && togglePermission(perm.id)}
                                disabled={isAdminRole}
                                className={`
                                  data-[state=checked]:bg-rose-600
                                  ${isAdminRole ? 'opacity-40 cursor-not-allowed' : ''}
                                `}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
                className="bg-rose-600 hover:bg-rose-500 text-white rounded-full px-6 shadow-lg shadow-rose-900/50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
