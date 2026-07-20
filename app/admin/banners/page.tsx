"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { BannersManagement } from "@/components/banners/banners-management";

export default function AdminBannersPage() {
  return (
    <DashboardLayout role="admin">
      <BannersManagement />
    </DashboardLayout>
  );
}
