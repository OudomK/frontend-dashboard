"use client";

import { use } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { BannerForm } from "@/components/banners/banner-form";

export default function AdminBannerFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <DashboardLayout role="admin">
      <BannerForm bannerId={resolvedParams.id === "new" ? undefined : parseInt(resolvedParams.id)} />
    </DashboardLayout>
  );
}
