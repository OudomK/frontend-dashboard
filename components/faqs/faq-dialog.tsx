"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: any | null;   // null = Add mode, non-null = Edit mode
  categories: any[];
  onSuccess: () => void;
  role: "admin" | "doctor";
};

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
      return `${field}: ${d.msg}`;
    }).join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error.response?.data?.message || error.message || "An error occurred";
}

export function FaqDialog({ open, onOpenChange, faq, categories, onSuccess, role }: Props) {
  const isEdit = faq !== null;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Sync form when faq changes (switching from add → edit or vice-versa)
  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || "");
      setAnswer(faq.answer || "");
      setCategoryId(faq.category_id ? faq.category_id.toString() : "");
      setIsActive(faq.is_active ?? true);
    } else {
      setQuestion("");
      setAnswer("");
      setCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
      setIsActive(true);
    }
  }, [faq, open, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !answer) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const toastId = toast.loading(isEdit ? "Saving modifications..." : "Adding FAQ...");
    const payload = {
      question,
      answer,
      category_id: categoryId ? parseInt(categoryId) : null,
      is_active: isActive,
      language: "km",
      display_order: faq?.display_order || 0
    };

    try {
      if (isEdit && faq) {
        await apiClient.put(`/api/v1/faqs/${faq.id}`, payload);
        toast.dismiss(toastId);
        toast.success("FAQ updated successfully!");
      } else {
        await apiClient.post("/api/v1/faqs/", payload);
        toast.dismiss(toastId);
        toast.success("FAQ created successfully!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">

        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <MessageCircleQuestion className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {isEdit ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEdit
                  ? "Update the question, answer, or settings below."
                  : "Fill in the details to add a new frequently asked question."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-1 space-y-4">

          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the early signs of pregnancy?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Answer */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a clear and concise answer…"
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-right text-xs text-slate-400">
              {answer.length} / 500 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Publish FAQ</p>
              <p className="text-xs text-slate-500">
                {isActive
                  ? "This FAQ is visible to users"
                  : "This FAQ is saved as a draft"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle FAQ status"
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? "Save Changes" : "Add FAQ"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
