"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  FileSpreadsheet,
  FileText,
  FileType,
  Flag,
  Info,
  Pencil,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { type AiReview, type ReviewSource } from "./review-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileIcon(type: ReviewSource["type"]) {
  if (type === "xlsx") return FileSpreadsheet;
  if (type === "docx") return FileType;
  return FileText;
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({
  level,
  score,
}: {
  level: AiReview["confidence"];
  score: number;
}) {
  const map = {
    high:   { color: "text-emerald-600", icon: "✓", label: "High Confidence"   },
    medium: { color: "text-amber-600",   icon: "◎", label: "Medium Confidence" },
    low:    { color: "text-red-600",     icon: "⚠", label: "Low Confidence"    },
  };
  const { color, icon, label } = map[level];

  return (
    <span className={`flex items-center gap-1.5 text-sm font-semibold ${color}`}>
      <span>{icon}</span>
      {label} ({score}%)
    </span>
  );
}

// ─── Source pill ──────────────────────────────────────────────────────────────

function SourcePill({ source }: { source: ReviewSource }) {
  const Icon = fileIcon(source.type);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {source.filename}
    </span>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

type ReviewCardProps = {
  review: AiReview;
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
  onEdit: (id: string, newAnswer: string) => void;
};

export function ReviewCard({
  review,
  onApprove,
  onFlag,
  onEdit,
}: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    review.editedAnswer ?? review.aiAnswer
  );

  const isApproved = review.status === "approved";
  const isFlagged  = review.status === "flagged";
  const isDone     = isApproved || isFlagged;

  function handleSaveEdit() {
    onEdit(review.id, editedText);
    setIsEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* ── Card top bar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-5 py-3 gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">
            Session ID: {review.sessionId}
          </span>
          <span>•</span>
          <span>{review.timestamp}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge level={review.confidence} score={review.confidenceScore} />

          {isDone && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isApproved
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isApproved ? "Approved" : "Flagged & Edited"}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-3">

        {/* User question bubble */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium leading-relaxed text-slate-800">
              {review.userQuestion}
            </p>
            {review.userQuestionTranslation && (
              <p className="mt-1 text-xs italic text-slate-400">
                English Translation: {review.userQuestionTranslation}
              </p>
            )}
          </div>
        </div>

        {/* AI answer bubble */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Emergency banner */}
            {review.isEmergency && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    ⚠️ EMERGENCY WARNING DETECTED
                  </p>
                  {review.emergencyNote && (
                    <p className="mt-1 text-xs text-amber-700">
                      {review.emergencyNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Answer text or edit area */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm leading-relaxed text-slate-800"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedText(review.editedAnswer ?? review.aiAnswer);
                      setIsEditing(false);
                    }}
                    className="rounded-lg border-slate-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {isFlagged && review.editedAnswer
                    ? review.editedAnswer
                    : review.aiAnswer}
                </p>

                {/* "Edited" notice */}
                {isFlagged && review.editedAnswer && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                    <Pencil className="h-3 w-3" />
                    Edited by {review.reviewedBy} · {review.reviewedAt}
                  </p>
                )}
              </div>
            )}

            {/* Sources */}
            {review.sources.length > 0 && !isEditing && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Sources used:
                </span>
                {review.sources.map((s) => (
                  <SourcePill key={s.filename} source={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100 px-5 py-3">

          {isDone ? (
            /* Already reviewed — show info */
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5" />
              Reviewed by {review.reviewedBy} · {review.reviewedAt}
            </p>
          ) : (
            <>
              {/* Flag & Reject */}
              <button
                onClick={() => onFlag(review.id)}
                className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-red-300 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Flag className="h-3.5 w-3.5" />
                Flag & Reject
              </button>

              {/* Edit Response */}
              <button
                onClick={() => setIsEditing(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Response
              </button>

              {/* Approve as Accurate */}
              <button
                onClick={() => onApprove(review.id)}
                className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" />
                Approve as Accurate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
