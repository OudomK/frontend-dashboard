"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { CategoryManagement } from "@/components/categories/category-management";

export default function DoctorCategoriesPage() {
  return (
    <DashboardLayout role="doctor">
      <CategoryManagement role="doctor" />
    </DashboardLayout>
  );
}
