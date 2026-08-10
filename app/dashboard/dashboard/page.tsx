"use client";

import { useAuthStore } from "@/lib/store/use-auth-store";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import AdminDashboardPage from "./components/admin-dashboard";
import DoctorDashboardPage from "./components/doctor-dashboard";

export default function UnifiedDashboardPage() {
  const { roleId } = useAuthStore();
  
  // If roleId === 3, they are super admin.
  // We can render AdminDashboard for roleId 3 and DoctorDashboard for others.
  // Or we can be more granular based on permissions later.
  const isAdmin = roleId === 3;

  return (
    <>
      {isAdmin ? <AdminDashboardPage /> : <DoctorDashboardPage />}
    </>
  );
}
