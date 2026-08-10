"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StaticPageEditor } from "@/components/pages/static-page-editor";

export default function NewPagePage() {
  return (
    <DashboardLayout role="admin">
      <StaticPageEditor />
    </DashboardLayout>
  );
}
