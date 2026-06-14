"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: any | null;
  onSuccess: () => void;
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

export function DeleteFaqDialog({ open, onOpenChange, faq, onSuccess }: Props) {
  async function handleConfirm() {
    if (!faq) return;
    const toastId = toast.loading("Deleting FAQ...");
    try {
      await apiClient.delete(`/api/v1/faqs/${faq.id}`);
      toast.dismiss(toastId);
      toast.success("FAQ deleted successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">

        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete FAQ
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium leading-snug text-red-800">
            {faq?.question}
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Are you sure you want to permanently delete this FAQ? It will be removed from the knowledge base and will no longer be visible to users.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete FAQ
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
