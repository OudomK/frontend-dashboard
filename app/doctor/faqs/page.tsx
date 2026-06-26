"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { FAQManagement } from "@/components/faqs/faq-management";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function DoctorFaqPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <DashboardLayout
      role="doctor"
      title={t("faqs.manageTitle")}
      subtitle={t("faqs.manageSubtitle")}
      actions={
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t("faqs.addNewFaqBtn")}
        </Button>
      }
    >
      <FAQManagement role="doctor" addOpen={dialogOpen} onAddOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
  
}