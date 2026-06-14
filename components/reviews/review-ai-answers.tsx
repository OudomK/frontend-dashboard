"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Flag, MessageCircleQuestion } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { aiReviews, type AiReview, type ReviewStatus } from "./review-data";
import { ReviewCard } from "./review-card";

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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mb-1 font-semibold text-slate-900">{message}</h3>
      <p className="max-w-xs text-sm text-slate-500">{sub}</p>
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
  // Local status overrides (would normally mutate server state)
  const [overrides, setOverrides] = useState<Record<string, ReviewStatus>>({});

  function getStatus(review: AiReview): ReviewStatus {
    return overrides[review.id] ?? review.status;
  }

  function handleApprove(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: "approved" }));
  }

  function handleFlag(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: "flagged" }));
  }

  function handleEdit(id: string, _newAnswer: string) {
    // In production: PATCH /api/reviews/:id with newAnswer
    setOverrides((prev) => ({ ...prev, [id]: "flagged" }));
  }

  // Derived lists using the overrides
  const withStatus = aiReviews.map((r) => ({
    ...r,
    status: getStatus(r),
  }));

  const needsReview = withStatus.filter((r) => r.status === "needs_review");
  const approved    = withStatus.filter((r) => r.status === "approved");
  const flagged     = withStatus.filter((r) => r.status === "flagged");

  return (
    <Tabs defaultValue="needs_review">

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <TabsList
        variant="line"
        className="mb-6 w-full justify-start border-b border-slate-200 pb-0"
      >
        <TabsTrigger value="needs_review" className="pb-3 text-sm">
          Needs Review
          {needsReview.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
              {needsReview.length}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="approved" className="pb-3 text-sm">
          Approved
          {approved.length > 0 && (
            <span className="ml-1.5 text-xs font-medium text-slate-400">
              ({approved.length})
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="flagged" className="pb-3 text-sm">
          Flagged &amp; Edited
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
          emptyMessage="All caught up!"
          emptySub="There are no AI answers waiting for your review right now."
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
          emptyMessage="No approved answers yet"
          emptySub="Answers you approve will appear here."
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
          emptyMessage="No flagged answers"
          emptySub="Answers you flag or edit will appear here for tracking."
        />
      </TabsContent>

    </Tabs>
  );
}
