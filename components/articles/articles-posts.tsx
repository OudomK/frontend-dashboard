"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Globe,
  Image as ImageIcon,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Upload,
  Star,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  category_id?: number;
  trimester?: number;
  authorName: string;
  authorId: number;
  status: "PUBLISHED" | "DRAFT";
  date: string;
  content: string;
  readTime: string;
  cover_image_url?: string;
  is_featured?: boolean;
}

// ─── Category color palette ──────────────────────────────────────────────────

const CATEGORY_PALETTE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Pregnancy Care":    { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  "Menstrual Health":  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  "Infection Care":    { bg: "bg-cyan-50",    text: "text-cyan-700",   border: "border-cyan-200",   dot: "bg-cyan-500"   },
  "Reproductive Health":{ bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Hygiene":           { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400"  },
  "Nutrition":         { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500"  },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_PALETTE[cat] ?? { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-400" };
}

// ─── Category Icon Avatar ────────────────────────────────────────────────────

function CategoryAvatar({ category, size = "md" }: { category: string; size?: "sm" | "md" | "lg" }) {
  const style = getCategoryStyle(category);
  const dims = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const icon = size === "lg" ? "h-8 w-8" : "h-5 w-5";

  const n = category.toLowerCase();
  let emoji = "📰";
  if (n.includes("preg")) emoji = "🤰";
  else if (n.includes("menstr")) emoji = "🔄";
  else if (n.includes("infect")) emoji = "🛡️";
  else if (n.includes("reprod")) emoji = "💗";
  else if (n.includes("nutri")) emoji = "🥗";
  else if (n.includes("hygi")) emoji = "🫧";

  return (
    <div className={`${dims} shrink-0 flex items-center justify-center rounded-xl ${style.bg} ${style.border} border text-lg shadow-sm`}>
      {emoji}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "PUBLISHED" | "DRAFT" }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
      <AlertCircle className="h-2.5 w-2.5" />
      Draft
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ArticlesPosts({ role }: { role: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  const [selectedStatus, setSelectedStatus] = useState("Any");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Form
  const [editMode, setEditMode] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
  const [formTrimester, setFormTrimester] = useState<number | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formFeatured, setFormFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, articlesRes] = await Promise.all([
        apiClient.get("/api/v1/categories/"),
        apiClient.get("/api/v1/contents/management"),
      ]);

      const cats: Category[] = catsRes.data || [];
      setCategories(cats);

      const mapped: Article[] = (articlesRes.data || []).map((a: any) => {
        const cat = cats.find((c) => c.id === a.category_id);
        const body = (a.body || "") as string;
        const wordCount = body.split(/\s+/).filter(Boolean).length;
        return {
          id: a.id,
          title: a.title || "Untitled",
          excerpt: a.short_description || "",
          content: body,
          category: cat?.name ?? "Uncategorized",
          category_id: a.category_id ?? undefined,
          trimester: a.trimester ?? undefined,
          authorName: a.author_id === 1 ? "Admin" : "Dr. Anderson",
          authorId: a.author_id,
          status: (a.status?.toLowerCase() === "published" ? "PUBLISHED" : "DRAFT") as "PUBLISHED" | "DRAFT",
          date: a.published_at
            ? new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min`,
          cover_image_url: a.cover_image_url || undefined,
          is_featured: a.is_featured ?? false,
        };
      });
      setArticles(mapped);
    } catch (err: any) {
      console.error("Failed to load articles:", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to load articles. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormTitle("");
    setFormExcerpt("");
    setFormContent("");
    setFormCategoryId(categories[0]?.id ?? null);
    setFormTrimester(null);
    setCoverImageUrl("");
    setFormStatus("PUBLISHED");
    setFormFeatured(false);
    setEditMode(false);
    setSelectedArticle(null);
    setErrors({});
  };

  const handleEditClick = (article: Article) => {
    setSelectedArticle(article);
    setFormTitle(article.title);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormCategoryId(article.category_id ?? null);
    setFormTrimester(article.trimester ?? null);
    setCoverImageUrl(article.cover_image_url ?? "");
    setFormStatus(article.status);
    setFormFeatured(article.is_featured ?? false);
    setEditMode(true);
    setOpenCreateDialog(true);
  };

  const handlePreviewClick = (article: Article) => {
    setSelectedArticle(article);
    setOpenPreviewDialog(true);
  };

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post("/api/v1/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCoverImageUrl(res.data.file_url);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail ?? "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleFormSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!formTitle.trim()) newErrors.title = true;
    if (!formContent.trim()) newErrors.content = true;
    if (!formCategoryId) newErrors.category = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    setErrors({});

    const payload = {
      title: formTitle.trim(),
      body: formContent.trim(),
      short_description: formExcerpt.trim(),
      category_id: formCategoryId,
      cover_image_url: coverImageUrl || null,
      status: formStatus.toLowerCase(),
      content_type: "article",
      language: "km",
      trimester: formTrimester || null,
      is_featured: formFeatured,
    };

    try {
      if (editMode && selectedArticle) {
        await apiClient.put(`/api/v1/contents/${selectedArticle.id}`, payload);
        toast.success("Article updated successfully!");
      } else {
        await apiClient.post("/api/v1/contents/", payload);
        toast.success("Article created successfully!");
      }
      setOpenCreateDialog(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(detail ?? "Failed to save article.");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await apiClient.delete(`/api/v1/contents/${id}`);
      toast.success("Article deleted.");
      fetchData();
    } catch {
      toast.error("Failed to delete article.");
    }
  };

  // ── Filtering & Pagination ────────────────────────────────────────────────

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return articles.filter((a) => {
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      const matchCat = selectedCategory === "All Topics" || a.category === selectedCategory;
      const matchStatus =
        selectedStatus === "Any" ||
        (selectedStatus === "Published" && a.status === "PUBLISHED") ||
        (selectedStatus === "Draft" && a.status === "DRAFT");
      return matchSearch && matchCat && matchStatus;
    });
  }, [articles, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const paginated = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;

  // ── Image helper ──────────────────────────────────────────────────────────
  const resolveImage = (url?: string) =>
    url
      ? url.startsWith("/")
        ? `http://localhost:8000${url}`
        : url
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      role={role as any}
      title="Health Articles"
      subtitle="Create and manage educational health content published to the patient app."
      actions={
        <Button
          onClick={() => { resetForm(); setOpenCreateDialog(true); }}
          className="h-10 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      }
    >
      <div className="space-y-5 pb-24 lg:pb-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Articles", value: articles.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Published", value: publishedCount, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Drafts", value: draftCount, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm flex items-center gap-3">
              <div className={`${bg} ${color} p-2.5 rounded-xl`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
                <p className="text-xs font-medium text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or keyword…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-blue-400 shadow-sm font-medium cursor-pointer"
              >
                <option value="All Topics">All Topics</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-blue-400 shadow-sm font-medium cursor-pointer"
              >
                <option value="Any">Any Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 transition-colors ${viewMode === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <Loader2 className="h-9 w-9 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading articles…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
              <Newspaper className="h-10 w-10 text-blue-500/60" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">No articles found</h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
              You haven't published any articles matching this criteria. Start writing to educate your patients!
            </p>
            <Button
              onClick={() => { resetForm(); setOpenCreateDialog(true); }}
              className="h-10 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" /> Create First Article
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((article) => {
              const img = resolveImage(article.cover_image_url);
              const style = getCategoryStyle(article.category);
              return (
                <div key={article.id} className="group rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden bg-slate-50">
                    {img ? (
                      <img src={img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center ${style.bg}`}>
                        <CategoryAvatar category={article.category} size="lg" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={article.status} />
                    </div>
                    {article.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-yellow-900">
                          <Star className="h-2.5 w-2.5 fill-yellow-900" /> Featured
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div className="flex-1 flex flex-col p-4 gap-2">
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                      {article.category}
                    </span>
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                    )}
                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                          {article.authorName[0]}
                        </div>
                        <span className="font-medium">{article.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handlePreviewClick(article)}
                        className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 text-xs font-semibold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => handleEditClick(article)}
                        className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Table View ── */
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    {["Article", "Category", "Author", "Status", "Date", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 ${i === 5 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((article) => {
                    const img = resolveImage(article.cover_image_url);
                    const style = getCategoryStyle(article.category);
                    return (
                      <tr key={article.id} className="group hover:bg-blue-50/20 transition-colors">
                        {/* Article Title + Excerpt */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 max-w-sm">
                            {img ? (
                              <img src={img} alt={article.title} className="h-11 w-11 shrink-0 rounded-xl object-cover border border-slate-100 shadow-sm" />
                            ) : (
                              <CategoryAvatar category={article.category} size="md" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="font-bold text-slate-900 truncate text-sm leading-tight">{article.title}</p>
                                {article.is_featured && (
                                  <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate leading-snug">{article.excerpt || "No excerpt"}</p>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-300">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{article.readTime}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {article.category}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                              {article.authorName[0]}
                            </div>
                            <span className="text-sm font-medium text-slate-600">{article.authorName}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={article.status} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {article.date}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePreviewClick(article)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditClick(article)}
                              className="p-1.5 rounded-lg border border-blue-100 bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="block lg:hidden divide-y divide-slate-50">
              {paginated.map((article) => {
                const img = resolveImage(article.cover_image_url);
                const style = getCategoryStyle(article.category);
                return (
                  <div key={article.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {img ? (
                        <img src={img} alt={article.title} className="h-14 w-14 shrink-0 rounded-xl object-cover border border-slate-100 shadow-sm" />
                      ) : (
                        <CategoryAvatar category={article.category} size="md" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                            {article.category}
                          </span>
                          <StatusBadge status={article.status} />
                        </div>
                        <p className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{article.title}</p>
                        {article.excerpt && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{article.excerpt}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                        <span className="text-slate-200">•</span>
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handlePreviewClick(article)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleEditClick(article)} className="p-1.5 rounded-lg border border-blue-100 bg-white text-blue-500 hover:bg-blue-50 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between bg-white">
              <p className="text-sm text-slate-400 font-medium">
                {filteredArticles.length === 0 ? "No results" : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredArticles.length)} of ${filteredArticles.length}`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        page === currentPage
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          Dialog: Create / Edit Article
      ════════════════════════════════════════════════════════ */}
      <Dialog open={openCreateDialog} onOpenChange={(open) => { if (!open) resetForm(); setOpenCreateDialog(open); }}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-3xl rounded-2xl shadow-2xl p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {editMode ? "✏️ Edit Article" : "📝 Create New Article"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                {editMode ? "Update the article details below." : "Fill in the details to publish a new health article."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => { setFormTitle(e.target.value); if (errors.title) setErrors({ ...errors, title: false }); }}
                placeholder="e.g. Healthy Eating in the First Trimester"
                className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all placeholder:text-slate-300 focus:ring-2 ${
                  errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                }`}
              />
            </div>

            {/* Category + Trimester + Status */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategoryId ?? ""}
                  onChange={(e) => { setFormCategoryId(e.target.value ? Number(e.target.value) : null); if (errors.category) setErrors({ ...errors, category: false }); }}
                  className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none cursor-pointer ${
                    errors.category ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 bg-red-50" : "border-slate-200 focus:border-blue-400"
                  }`}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Trimester</label>
                <select
                  value={formTrimester ?? ""}
                  onChange={(e) => setFormTrimester(e.target.value ? Number(e.target.value) : null)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="">General (All weeks)</option>
                  <option value="1">1st Trimester</option>
                  <option value="2">2nd Trimester</option>
                  <option value="3">3rd Trimester</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Short Excerpt</label>
              <input
                type="text"
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="A brief one-line description shown in the article list…"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Cover Image</label>
              {coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-44 group">
                  <img
                    src={resolveImage(coverImageUrl) ?? coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-lg transition-transform hover:scale-105"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-transform hover:scale-105"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-7 w-7 text-blue-500 animate-spin mb-2" />
                      <p className="text-sm font-semibold text-slate-500">Uploading…</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-slate-300 group-hover:text-blue-400 mb-2 transition-colors" />
                      <p className="text-sm font-semibold text-slate-500">Click to upload cover image</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5 MB</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Full Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formContent}
                onChange={(e) => { setFormContent(e.target.value); if (errors.content) setErrors({ ...errors, content: false }); }}
                rows={9}
                placeholder="Write your article content here. Use double line breaks to separate paragraphs…"
                className={`w-full rounded-xl border p-4 text-sm outline-none transition-all placeholder:text-slate-300 focus:ring-2 resize-y ${
                  errors.content ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                }`}
              />
              <p className="text-xs text-slate-400">
                {formContent.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(formContent.split(/\s+/).filter(Boolean).length / 200))} min read
              </p>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setFormFeatured(!formFeatured)}
                className={`relative h-5 w-9 rounded-full transition-colors ${formFeatured ? "bg-yellow-400" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${formFeatured ? "translate-x-4" : ""}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Star className={`h-3.5 w-3.5 ${formFeatured ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                  Featured Article
                </p>
                <p className="text-xs text-slate-400">Pinned at the top of the health feed</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={() => { resetForm(); setOpenCreateDialog(false); }}
              className="rounded-xl border-slate-200 hover:bg-slate-50 h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 shadow-sm"
            >
              {editMode ? "Save Changes" : "Publish Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          Dialog: Article Preview Modal
      ════════════════════════════════════════════════════════ */}
      <Dialog open={openPreviewDialog} onOpenChange={setOpenPreviewDialog}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-2xl rounded-2xl shadow-2xl p-0">
          {/* Visually hidden title for screen readers — required by Radix Dialog */}
          <VisuallyHidden.Root>
            <DialogTitle>
              {selectedArticle ? selectedArticle.title : "Article Preview"}
            </DialogTitle>
          </VisuallyHidden.Root>

          {selectedArticle && (() => {
            const img = resolveImage(selectedArticle.cover_image_url);
            const style = getCategoryStyle(selectedArticle.category);
            const paragraphs = (selectedArticle.content || "").split(/\n\n+/).filter(Boolean);

            return (
              <div>
                {/* Hero Image / Cover */}
                <div className="relative h-52 overflow-hidden rounded-t-2xl">
                  {img ? (
                    <img src={img} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${style.bg}`}>
                      <CategoryAvatar category={selectedArticle.category} size="lg" />
                      <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${style.text}`}>{selectedArticle.category}</p>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Top badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <StatusBadge status={selectedArticle.status} />
                    {selectedArticle.is_featured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-yellow-900">
                        <Star className="h-2.5 w-2.5 fill-yellow-900" /> Featured
                      </span>
                    )}
                  </div>
                  {/* Category badge on image */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text} ${style.border} border shadow-sm`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {selectedArticle.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                  {/* Title + excerpt */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedArticle.title}</h2>
                    {selectedArticle.excerpt && (
                      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{selectedArticle.excerpt}</p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between py-3 border-y border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {selectedArticle.authorName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedArticle.authorName}</p>
                        <p className="text-[10px] font-medium text-slate-400">Healthcare Contributor</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1 justify-end text-slate-500 font-semibold">
                        <Calendar className="h-3 w-3" />
                        {selectedArticle.date}
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {selectedArticle.readTime} read
                      </div>
                    </div>
                  </div>

                  {/* Article Body */}
                  <div className="text-sm leading-relaxed text-slate-700 space-y-3">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((para, i) => (
                        <p key={i} className="leading-7">{para}</p>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-center py-4">No content has been written for this article yet.</p>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setOpenPreviewDialog(false);
                        handleEditClick(selectedArticle);
                      }}
                      className="flex items-center gap-2 h-9 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Article
                    </button>
                    <Button
                      onClick={() => setOpenPreviewDialog(false)}
                      className="h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-5 font-semibold"
                    >
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <button
        onClick={() => { resetForm(); setOpenCreateDialog(true); }}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all lg:hidden"
        aria-label="New Article"
      >
        <Plus className="h-6 w-6" />
      </button>
    </DashboardLayout>
  );
}
