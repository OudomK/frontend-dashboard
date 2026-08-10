"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { ReviewAIAnswers } from "@/components/reviews/review-ai-answers";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function DoctorReviewsPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout
      role="doctor"
      title={t("reviews.pageTitle")}
      subtitle={t("reviews.pageSubtitle")}
    >
      <ReviewAIAnswers />
    </DashboardLayout>
  );
}
