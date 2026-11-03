"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

type Props = {
  documentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess?: () => void;
};

// Metadata-only edit: title/category/description/source_url/language on the
// existing document row, via POST /{document_id}/update with no "file" part
// (that endpoint treats a missing file as "update in place", and only
// creates a new version when a replacement file is actually attached).
export function EditDocumentDialog({ documentId, open, onOpenChange, onUpdateSuccess }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("km");

  useEffect(() => {
    if (!open || !documentId) return;

    setIsLoading(true);
    Promise.all([
      apiClient.get(`/api/documents/${documentId}`),
      apiClient.get("/api/v1/categories/"),
    ])
      .then(([docRes, catRes]) => {
        const doc = docRes.data;
        setTitle(doc.title || "");
        setCategoryId(doc.category_id ? String(doc.category_id) : "");
        setDescription(doc.description || "");
        setSourceUrl(doc.source_url || "");
        setLanguage(doc.language || "km");
        setCategories(catRes.data || []);
      })
      .catch((err) => {
        toast.error(formatBackendError(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open, documentId]);

  const handleSave = async () => {
    if (!documentId) return;
    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving document...");
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (categoryId) formData.append("category_id", categoryId);
      formData.append("description", description);
      formData.append("source_url", sourceUrl);
      formData.append("language", language);
      // Deliberately no "file" field - the backend treats that as a
      // metadata-only update of the existing row, not a new version.

      await apiClient.post(`/api/documents/${documentId}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(toastId);
      toast.success("Document updated successfully!");
      onOpenChange(false);
      onUpdateSuccess?.();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Document</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Update this document's details without re-uploading the file.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            <p className="text-sm">Loading document...</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Title + Language */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clinical Guidelines 2026"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="km">Khmer (km)</option>
                  <option value="en">English (en)</option>
                  <option value="both">Both (Khmer + English)</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {typeof c.name === "string" ? c.name : ((c.name as any)?.en || (c.name as any)?.km || "")}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the contents of this document..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Source URL */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="e.g. https://www.who.int/... or https://www.nhs.uk/..."
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-slate-400">
                The real external source (WHO, NHS, etc.) this document is based on. Shown as a clickable link under AI chat answers that cite it.
              </p>
            </div>

            {/* Footer */}
            <DialogFooter className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
                className="rounded-lg border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
