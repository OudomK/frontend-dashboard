"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, ImageIcon, Upload, X, Sparkles, FileText, Globe, Eye, BookOpen } from "lucide-react";
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
import { useTranslation } from "@/lib/hooks/use-translation";
import { Category, Article } from "./articles-posts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
  article?: Article | null;
};

export function CreateArticleDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
  article,
}: Props) {
  const { token } = useAuthStore();
  const { language: appLang } = useTranslation();
  
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("km");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!article;

  useEffect(() => {
    if (open) {
      if (article) {
        const lang = article.language || "km";
        setTitle(article.title?.[lang as "en"|"km"] || article.title?.km || article.title?.en || "");
        setCategoryId(article.category_id?.toString() || "");
        setLanguage(lang);
        setContent(article.body?.[lang as "en"|"km"] || article.body?.km || article.body?.en || "");
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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setExistingImageUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

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

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to save article");
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  const previewImage = image
    ? URL.createObjectURL(image)
    : existingImageUrl
      ? (existingImageUrl.startsWith("http") ? existingImageUrl : `http://localhost:8000${existingImageUrl}`)
      : null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl p-0 gap-0 rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                {isEdit ? <BookOpen className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Article" : "Create New Article"}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  {isEdit ? "Update your article content and metadata." : "Draft a comprehensive educational post for the platform."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Language Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {[
                { value: "km", label: "🇰🇭 ខ្មែរ" },
                { value: "en", label: "🇬🇧 English" },
                { value: "both", label: "🌐 Both" },
              ].map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === lang.value
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {/* Live stats */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {wordCount} words
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Article Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Stay Healthy During Pregnancy"
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Category + Language row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">Select category...</option>
                {categories.map((c) => {
                  const catName = typeof c.name === "string" ? c.name : ((c.name as any)?.[appLang as "en"|"km"] || (c.name as any)?.en || (c.name as any)?.km || "");
                  return <option key={c.id} value={c.id}>{catName}</option>;
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                defaultValue="published"
              >
                <option value="published">✅ Published</option>
                <option value="draft">📝 Draft</option>
              </select>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cover Image
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex items-center justify-center rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : previewImage
                    ? "border-transparent"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
              } ${previewImage ? "h-44" : "h-36"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Cover preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-semibold">Click to change image</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImage(null); setExistingImageUrl(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — max 5 MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your article content here... Be detailed and educational."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Supports markdown formatting</span>
              <span className={wordCount > 50 ? "text-emerald-500 font-medium" : ""}>{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">
            Fields marked with <span className="text-rose-500 font-bold">*</span> are required
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
              className="flex-1 sm:flex-none h-10 rounded-xl border-slate-200 text-slate-600 font-semibold"
            >
              📝 Save Draft
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => handleSubmit("published")}
              className="flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md shadow-blue-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {uploadingImage ? "Uploading..." : isEdit ? "Update Article" : "Publish Article"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}