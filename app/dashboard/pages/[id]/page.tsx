"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StaticPageEditor } from "@/components/pages/static-page-editor";

export default function EditPagePage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout role="admin">
      <StaticPageEditor pageId={params.id} />
    </DashboardLayout>
  );
}
