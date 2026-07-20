"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StaticPagesManagement } from "@/components/pages/static-pages-management";

export default function AdminPagesPage() {
  return (
    <DashboardLayout role="admin">
      <StaticPagesManagement />
    </DashboardLayout>
  );
}
