import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { ReviewAIAnswers } from "@/components/reviews/review-ai-answers";

export default function DoctorReviewsPage() {
  return (
    <DashboardLayout
      role="doctor"
      title="Review AI Answers"
      subtitle="Monitor AI responses to ensure accuracy and adherence to clinic guidelines."
    >
      <ReviewAIAnswers />
    </DashboardLayout>
  );
}
