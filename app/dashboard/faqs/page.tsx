"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { FAQManagement } from "@/components/faqs/faq-management";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useAuthStore } from "@/lib/store/use-auth-store";

export default function AdminFaqPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { user, roleId } = useAuthStore();
  
  const isAdmin = roleId === 3;
  const canCreate = isAdmin || (user?.permissions || []).includes("create_faqs");

  return (
    <DashboardLayout
      title={t("faqs.title")}
      subtitle={t("faqs.subtitle")}
      actions={
        canCreate && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("faqs.addNew")}
          </Button>
        )
      }
    >
      <FAQManagement role="admin" addOpen={dialogOpen} onAddOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
}