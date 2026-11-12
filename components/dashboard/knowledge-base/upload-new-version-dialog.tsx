"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { documentErrorMessage, formatBackendError } from "@/lib/document-errors";
import { useTranslation } from "@/lib/hooks/use-translation";

type Props = {
  documentId: number | null;
  documentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionUploaded?: () => void;
  // Reports the source document as busy while /update + /process run, so the
  // list can disable that document's other processing actions.
  onBusyChange?: (documentId: number, busy: boolean) => void;
};

// Uploads a replacement file as a NEW VERSION of an existing document.
// Posts to /{id}/update WITH a file (creates version_no+1, linked to the same
// root via parent_id), then /process on the returned new doc - which embeds it
// and, on success, activates it while deactivating the prior version. The old
// version keeps serving until processing succeeds (see process_document).
export function UploadNewVersionDialog({ documentId, documentName, open, onOpenChange, onVersionUploaded, onBusyChange }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Synchronous guard: a second click before React re-renders must not send
  // a second /update (which would create yet another version) or /process.
  const inFlightRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState("km");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !documentId) return;
    setFile(null);
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
      .catch((err) => toast.error(formatBackendError(err)))
      .finally(() => setIsLoading(false));
  }, [open, documentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!documentId) return;
    if (!file) {
      toast.error("Please select the new version's file.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const sourceId = documentId;
    setIsUploading(true);
    onBusyChange?.(sourceId, true);
    const toastId = toast.loading("Uploading new version...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      if (categoryId) formData.append("category_id", categoryId);
      formData.append("description", description);
      formData.append("source_url", sourceUrl);
      formData.append("language", language);

      const res = await apiClient.post(`/api/documents/${documentId}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newDoc = res.data;
      toast.dismiss(toastId);
      toast.success("New version uploaded.");

      // Embed + activate the new version (deactivates the prior one on success).
      const processToastId = toast.loading("Processing new version (chunking & embeddings)...");
      try {
        await apiClient.post(`/api/documents/${newDoc.id}/process`);
        toast.dismiss(processToastId);
        toast.success("New version is now the active document.");
      } catch (procErr: any) {
        toast.dismiss(processToastId);
        toast.error(`Uploaded, but processing failed (previous version stays active): ${documentErrorMessage(procErr, t)}`);
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(documentErrorMessage(error, t));
    } finally {
      inFlightRef.current = false;
      setIsUploading(false);
      onBusyChange?.(sourceId, false);
      onVersionUploaded?.();
    }
  };

  // Keep the dialog (and its spinner) open until the request settles.
  const handleOpenChange = (next: boolean) => {
    if (!next && inFlightRef.current) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Upload New Version</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Replace the file for <span className="font-semibold text-slate-600">{documentName}</span>. The current
            version keeps serving until the new one finishes processing, then is superseded.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            <p className="text-sm">Loading document...</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* New file */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">New version file *</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.csv,.txt"
                className="hidden"
              />
              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="mb-3 rounded-full bg-blue-50 p-4 text-blue-500 border border-blue-100 shadow-sm">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-blue-600">Click to upload the new file</p>
                  <p className="mt-1 text-xs text-slate-400 font-medium">PDF, DOCX, XLSX, CSV, or TXT (max 10MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-md">{file.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Title + Language */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
            </div>

            <DialogFooter className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => onOpenChange(false)}
                className="rounded-lg border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isUploading}
                onClick={handleSubmit}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold"
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : "Upload New Version"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
