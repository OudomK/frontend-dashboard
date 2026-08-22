"use client";

import { PenLine, UploadCloud, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useAuthStore } from "@/lib/store/use-auth-store";

export function QuickActionsWidget() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  const actions = [];

  if (permissions.includes("create_articles")) {
    actions.push(
      <Button key="write_article" variant="secondary" className="h-9 rounded-md bg-slate-100 px-4 text-slate-900" asChild>
        <Link href="/dashboard/articles">
          <PenLine className="mr-2 h-4 w-4" />
          {t("doctor.writeArticleBtn")}
        </Link>
      </Button>
    );
  }

  if (permissions.includes("create_documents")) {
    actions.push(
      <Button key="manage_docs" className="h-9 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700" asChild>
        <Link href="/dashboard/documents">
          <UploadCloud className="mr-2 h-4 w-4" />
          {t("doctor.manageDocsBtn")}
        </Link>
      </Button>
    );
  }
  
  if (permissions.includes("manage_emergency")) {
    actions.push(
      <Button key="manage_emergency" variant="outline" className="h-9 rounded-md px-4 text-slate-700" asChild>
        <Link href="/dashboard/emergency-rules">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Manage Emergency Rules
        </Link>
      </Button>
    );
  }

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions}
    </div>
  );
}
