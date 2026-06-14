"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";

type Props = {
  trigger: ReactNode;
  onUploadSuccess?: () => void;
};

export function UploadDocumentDialog({ trigger, onUploadSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("km"); // Default Khmer language
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories dynamically on open/mount
  useEffect(() => {
    if (open) {
      apiClient.get("/api/v1/categories/")
        .then((res) => {
          setCategories(res.data || []);
          if (res.data && res.data.length > 0) {
            setCategoryId(res.data[0].id.toString());
          }
        })
        .catch((err) => {
          console.error("Failed to load categories:", err);
        });
    }
  }, [open]);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      // Automatically prefill title if empty
      if (!title) {
        const baseName = selected.name.substring(0, selected.name.lastIndexOf(".")) || selected.name;
        setTitle(baseName.replace(/[_-]/g, " "));
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error("Please select a document file.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading document file...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category_id", categoryId);
      formData.append("description", description);
      formData.append("language", language);

      const res = await apiClient.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newDoc = res.data;
      toast.dismiss(toastId);
      toast.success("Document uploaded successfully!");

      // Close modal and reset form fields
      setOpen(false);
      setFile(null);
      setTitle("");
      setDescription("");
      setLanguage("km");

      // Trigger refresh callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Automatically trigger chunk processing and embeddings generation
      const processToastId = toast.loading("Extracting pages & generating Gemini vector embeddings...");
      try {
        await apiClient.post(`/api/documents/${newDoc.id}/process`);
        toast.dismiss(processToastId);
        toast.success("Gemini RAG vector indexing completed successfully!");
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } catch (procErr: any) {
        toast.dismiss(processToastId);
        const detail = procErr.response?.data?.detail;
        const procErrMsg = Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc ? d.loc[d.loc.length - 1] : "field"}: ${d.msg}`).join(", ")
          : procErr.response?.data?.message || procErr.message || "Failed to process text";
        toast.error(`Upload succeeded but processing failed: ${procErrMsg}`);
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      const detail = error.response?.data?.detail;
      const errMsg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc ? d.loc[d.loc.length - 1] : "field"}: ${d.msg}`).join(", ")
        : error.response?.data?.message || error.message || "Upload transaction failed";
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Upload Document</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Add a new document to the clinic's AI RAG knowledge base.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Upload Area */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">File *</label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              className="hidden"
            />

            {!file ? (
              <div
                onClick={handleDropzoneClick}
                className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-colors"
              >
                <div className="mb-3 rounded-full bg-blue-50 p-4 text-blue-500 border border-blue-100 shadow-sm">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-semibold text-blue-600">Click to upload or drag and drop</p>
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
                    <p className="text-xs text-slate-400 font-medium">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
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
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
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

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => {
                setOpen(false);
                setFile(null);
              }}
              className="rounded-lg border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={isUploading}
              onClick={handleUploadSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}