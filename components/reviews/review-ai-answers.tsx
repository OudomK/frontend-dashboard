"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Flag, MessageCircleQuestion } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { type AiReview, type ReviewStatus } from "./review-data";
import { ReviewCard } from "./review-card";
import { useTranslation } from "@/lib/hooks/use-translation";

// ─── Tab empty states ─────────────────────────────────────────────────────────

function EmptyTab({
  icon: Icon,
  message,
  sub,
}: {
  icon: React.ElementType;
  message: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center mt-4">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
        <Icon className="h-10 w-10 text-blue-500/60" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">{message}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Review list ──────────────────────────────────────────────────────────────

function ReviewList({
  reviews,
  onApprove,
  onFlag,
  onEdit,
  emptyIcon,
  emptyMessage,
  emptySub,
}: {
  reviews: AiReview[];
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
  onEdit: (id: string, answer: string) => void;
  emptyIcon: React.ElementType;
  emptyMessage: string;
  emptySub: string;
}) {
  if (reviews.length === 0) {
    return (
      <EmptyTab icon={emptyIcon} message={emptyMessage} sub={emptySub} />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onApprove={onApprove}
          onFlag={onFlag}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReviewAIAnswers() {
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState<Record<string, ReviewStatus>>({});
  const [flags, setFlags] = useState<AiReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const { apiClient } = await import("@/lib/api-client");
        const res = await apiClient.get("/api/v1/emergency-flags/");
        const fetched = res.data.map((f: any) => ({
          id: `flag-${f.id}`,
          sessionId: `Session #${f.session_id}`,
          timestamp: new Date(f.flagged_at).toLocaleString(),
          userQuestion: f.message_content || "(No message content)",
          aiAnswer: `[System Action: ${f.rule_name}] ${f.advice_text}`,
          isEmergency: true,
          emergencyNote: `Severity: ${f.severity_level?.toUpperCase()} | Detected: "${f.detected_text}"`,
          confidence: "high" as const,
          confidenceScore: 100,
          sources: [],
          status: f.status || ("needs_review" as const),
        }));
        setFlags(fetched);
      } catch (err) {
        console.error("Failed to load emergency flags", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlags();
  }, []);

  function getStatus(review: AiReview): ReviewStatus {
    return review.status;
  }

  async function handleApprove(id: string) {
    const numericId = id.replace('flag-', '');
    try {
      const { apiClient } = await import("@/lib/api-client");
      await apiClient.patch(`/api/v1/emergency-flags/${numericId}/status`, { status: "approved" });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status: "approved" } : f));
    } catch (err) {
      console.error("Failed to approve flag", err);
    }
  }

  async function handleFlag(id: string) {
    const numericId = id.replace('flag-', '');
    try {
      const { apiClient } = await import("@/lib/api-client");
      await apiClient.patch(`/api/v1/emergency-flags/${numericId}/status`, { status: "flagged" });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status: "flagged" } : f));
    } catch (err) {
      console.error("Failed to flag item", err);
    }
  }

  async function handleEdit(id: string, newAnswer: string) {
    const numericId = id.replace('flag-', '');
    try {
      const { apiClient } = await import("@/lib/api-client");
      await apiClient.patch(`/api/v1/emergency-flags/${numericId}/status`, { status: "flagged" });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status: "flagged" } : f));
    } catch (err) {
      console.error("Failed to edit item", err);
    }
  }

  // Derived lists
  const combined = [...flags];
  const withStatus = combined.map((r) => ({
    ...r,
    status: getStatus(r),
  }));

  const needsReview = withStatus.filter((r) => r.status === "needs_review");
  const approved    = withStatus.filter((r) => r.status === "approved");
  const flagged     = withStatus.filter((r) => r.status === "flagged");

  if (loading && flags.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="needs_review">

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <TabsList
        variant="line"
        className="mb-6 w-full justify-start border-b border-slate-200 pb-0"
      >
        <TabsTrigger value="needs_review" className="pb-3 text-sm">
          {t("rev.needsReview")}
          {needsReview.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
              {needsReview.length}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="approved" className="pb-3 text-sm">
          {t("rev.approved")}
          {approved.length > 0 && (
            <span className="ml-1.5 text-xs font-medium text-slate-400">
              ({approved.length})
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="flagged" className="pb-3 text-sm">
          {t("rev.flagged")}
          {flagged.length > 0 && (
            <span className="ml-1.5 text-xs font-medium text-slate-400">
              ({flagged.length})
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* ── Needs Review ─────────────────────────────────────────────────── */}
      <TabsContent value="needs_review">
        <ReviewList
          reviews={needsReview}
          onApprove={handleApprove}
          onFlag={handleFlag}
          onEdit={handleEdit}
          emptyIcon={CheckCircle2}
          emptyMessage={t("rev.caughtUp")}
          emptySub={t("rev.caughtUpDesc")}
        />
      </TabsContent>

      {/* ── Approved ─────────────────────────────────────────────────────── */}
      <TabsContent value="approved">
        <ReviewList
          reviews={approved}
          onApprove={handleApprove}
          onFlag={handleFlag}
          onEdit={handleEdit}
          emptyIcon={CheckCircle2}
          emptyMessage={t("rev.noApproved")}
          emptySub={t("rev.noApprovedDesc")}
        />
      </TabsContent>

      {/* ── Flagged & Edited ─────────────────────────────────────────────── */}
      <TabsContent value="flagged">
        <ReviewList
          reviews={flagged}
          onApprove={handleApprove}
          onFlag={handleFlag}
          onEdit={handleEdit}
          emptyIcon={Flag}
          emptyMessage={t("rev.noFlagged")}
          emptySub={t("rev.noFlaggedDesc")}
        />
      </TabsContent>

    </Tabs>
  );
}
