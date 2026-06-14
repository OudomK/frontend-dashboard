"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { FAQManagement } from "@/components/faqs/faq-management";

export default function AdminFaqPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <DashboardLayout
      role="admin"
      title="FAQ Management"
      subtitle="Manage and update frequently asked questions for the knowledge base."
      actions={
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New FAQ
        </Button>
      }
    >
      <FAQManagement role="admin" addOpen={dialogOpen} onAddOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
}