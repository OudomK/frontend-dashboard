"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { CategoryManagement } from "@/components/categories/category-management";

export default function AdminCategoriesPage() {
  return (
    <DashboardLayout role="admin">
      <CategoryManagement role="admin" />
    </DashboardLayout>
  );
}
