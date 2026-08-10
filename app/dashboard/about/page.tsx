"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { AboutManagement } from "./_components/about-management";

export default function AdminAboutPage() {
  return (
    <DashboardLayout role="admin">
      <AboutManagement />
    </DashboardLayout>
  );
}
