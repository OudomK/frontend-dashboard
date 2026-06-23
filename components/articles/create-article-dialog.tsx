"use client";
import { useState, useEffect } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { Category, Content } from "./articles-posts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
  article?: Content | null;
};

export function CreateArticleDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
  article,
}: Props) {
  const { token } = useAuthStore();
  
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("km");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (article) {
        setTitle(article.title || "");
        setCategoryId(article.category_id?.toString() || "");
        setLanguage(article.language || "km");
        setContent(article.body || "");
        setExistingImageUrl(article.cover_image_url || null);
        setImage(null);
      } else {
        setTitle("");
        setCategoryId("");
        setContent("");
        setLanguage("km");
        setExistingImageUrl(null);
        setImage(null);
      }
    }
  }, [open, article]);

  const handleSubmit = async (status: string) => {
    if (!title || !categoryId || !content) {
      alert("Please fill in Title, Category, and Content.");
      return;
    }

    setIsSubmitting(true);
    try {
      let coverUrl = existingImageUrl;
      if (image) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await fetch("http://localhost:8000/api/v1/uploads/image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        coverUrl = uploadData.file_url;
      }

      const payload = {
        title,
        category_id: parseInt(categoryId),
        content_type: "article",
        language,
        short_description: content.substring(0, 150) + "...",
        body: content,
        cover_image_url: coverUrl,
        status,
      };

      if (article) {
        await apiClient.put(`/api/v1/contents/${article.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiClient.post("/api/v1/contents/", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Reset is handled by useEffect on open
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to save article");
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  const isEdit = !!article;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Article" : "Create New Article"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your article content." : "Draft a comprehensive educational post for the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">Article Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navigating the First Trimester"
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
          </div>

          {/* Category + Language */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Category *</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              >
                <option value="en">English</option>
                <option value="km">Khmer</option>
                <option value="both">Khmer + English</option>
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">Cover Image</label>
            <div className="relative flex h-52 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImage(e.target.files[0]);
                    setExistingImageUrl(null);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {image ? (
                <img src={URL.createObjectURL(image)} alt="Preview" className="h-full w-full object-cover" />
              ) : existingImageUrl ? (
                <img src={existingImageUrl.startsWith('http') ? existingImageUrl : `http://localhost:8000${existingImageUrl}`} alt="Existing Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Click to Upload Cover Image</span>
                </div>
              )}
            </div>
            {(image || existingImageUrl) && (
              <button 
                onClick={() => { setImage(null); setExistingImageUrl(null); }}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Write your article content here..."
              className="w-full rounded-lg border border-slate-200 p-4"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <Button 
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
            >
              Save Draft
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={isSubmitting}
              onClick={() => handleSubmit("published")}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {uploadingImage ? "Uploading..." : (isEdit ? "Update Article" : "Publish Article")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}