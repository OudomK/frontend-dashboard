"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  is_active: boolean;
  display_order: number;
  parent_id: number | null;
  created_at: string;
  // enriched
  articleCount: number;
  lastUpdated: string;
}

type IconKey = "menstrual" | "infection" | "pregnancy" | "reproductive" | "hygiene" | "general";

// ─── Icon Config ──────────────────────────────────────────────────────────────

const ICON_OPTIONS: { value: IconKey; label: string; bg: string; text: string; border: string }[] = [
  { value: "menstrual",    label: "Rose Drop — Menstrual Health",       bg: "bg-rose-50",    text: "text-rose-500",    border: "border-rose-100" },
  { value: "infection",   label: "Amber Shield — Infection Care",       bg: "bg-amber-50",   text: "text-amber-500",   border: "border-amber-100" },
  { value: "pregnancy",   label: "Purple Smile — Pregnancy Care",       bg: "bg-purple-50",  text: "text-purple-500",  border: "border-purple-100" },
  { value: "reproductive",label: "Emerald Leaf — Reproductive Health",  bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-100" },
  { value: "hygiene",     label: "Blue Sparkle — Personal Hygiene",     bg: "bg-blue-50",    text: "text-blue-500",    border: "border-blue-100" },
  { value: "general",     label: "Indigo Folder — General",             bg: "bg-indigo-50",  text: "text-indigo-500",  border: "border-indigo-100" },
];

function getIconStyle(key: string) {
  return ICON_OPTIONS.find((o) => o.value === key) ?? ICON_OPTIONS[5];
}

function CategoryIcon({ iconKey, size = "md" }: { iconKey: string; size?: "sm" | "md" | "lg" }) {
  const s = getIconStyle(iconKey);
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const ico = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const iconMap: Record<string, React.ReactNode> = {
    menstrual: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={ico}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.25 5.5-8.25 9-8.25 12.25a8.25 8.25 0 1 0 16.5 0c0-3.25-3-6.75-8.25-12.25Z" />
      </svg>
    ),
    infection: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={ico}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
      </svg>
    ),
    pregnancy: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={ico}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
    reproductive: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={ico}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697-.056-4.024-.166C6.845 6.51 6 5.271 6 3.88V3.75a.75.75 0 0 1 .75-.75h.5c1.39 0 2.63.845 3.16 2.167.31-.767.755-1.472 1.31-2.09A3.75 3.75 0 0 1 18.25 3h.5a.75.75 0 0 1 .75.75v.13c0 1.391-.845 2.63-2.167 3.16a22.445 22.445 0 0 1-4.024.166m0 0v1.5m0 0c1.355 0 2.697.056 4.024.166 1.13.094 1.976 1.333 1.976 2.724v.13a.75.75 0 0 1-.75.75h-.5a3.75 3.75 0 0 1-3.21-1.812c-.555.618-1 1.323-1.31 2.09A3.251 3.251 0 0 1 12 15.25v1.5m0-3.5c-1.355 0-2.697-.056-4.024-.166C6.845 13.49 6 12.251 6 10.86v-.13a.75.75 0 0 1 .75-.75h.5c1.39 0 2.63.845 3.16 2.167.31-.767.755-1.472 1.31-2.09A3.75 3.75 0 0 1 18.25 10h.5a.75.75 0 0 1 .75.75v.13c0 1.391-.845 2.63-2.167 3.16a22.445 22.445 0 0 1-4.024.166m-4.024-.166A22.43 22.43 0 0 1 12 11.75m0 0v5m0-5c1.355 0 2.697.056 4.024.166M12 16.75v5" />
      </svg>
    ),
    hygiene: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={ico}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.09 15.09l5.096-.813L9 9.187l.813 5.096 5.096.813-5.096.813zM19.071 4.929l-.244 1.53-.244-1.53-1.53-.244 1.53-.244.244-1.53.244 1.53 1.53.244-1.53.244zM18.825 15.175l-.162 1.02-.163-1.02-1.02-.162 1.02-.163.163-1.02.162 1.02 1.02.163-1.02.162z" />
      </svg>
    ),
    general: (
      <FolderOpen className={ico} />
    ),
  };

  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.text} border ${s.border} shadow-sm`}>
      {iconMap[iconKey] ?? iconMap.general}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
      return `${field}: ${d.msg}`;
    }).join(", ");
  }
  if (typeof detail === "string") return detail;
  return error.response?.data?.message || error.message || "An error occurred";
}

function formatDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-48 rounded-full bg-slate-100" />
            <div className="h-3 w-72 rounded-full bg-slate-100" />
          </div>
          <div className="h-3 w-10 rounded-full bg-slate-100" />
          <div className="h-5 w-14 rounded-full bg-slate-100" />
          <div className="h-3 w-20 rounded-full bg-slate-100" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = { role: "admin" | "doctor" };

const ITEMS_PER_PAGE = 8;

export function CategoryManagement({ role }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "ACTIVE" | "DRAFT">("All");
  const [sortOption, setSortOption] = useState<"Newest" | "Oldest" | "Name A-Z">("Newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIconKey, setFormIconKey] = useState<IconKey>("general");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "DRAFT">("ACTIVE");
  const [formOrder, setFormOrder] = useState("0");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, artRes] = await Promise.all([
        apiClient.get("/api/v1/categories/"),
        apiClient.get("/api/v1/contents/management"),
      ]);

      const articles: any[] = artRes.data || [];

      // Build article-count map by category_id
      const countMap = new Map<number, number>();
      articles.forEach((a: any) => {
        if (a.category_id) {
          countMap.set(a.category_id, (countMap.get(a.category_id) ?? 0) + 1);
        }
      });

      const mapped: Category[] = (catRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        icon_url: c.icon_url || "general",
        is_active: c.is_active,
        display_order: c.display_order ?? 0,
        parent_id: c.parent_id ?? null,
        created_at: c.created_at,
        articleCount: countMap.get(c.id) ?? 0,
        lastUpdated: formatDate(c.updated_at || c.created_at),
      }));

      setCategories(mapped);
    } catch (err: any) {
      toast.error(formatBackendError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Form Reset ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormIconKey("general");
    setFormStatus("ACTIVE");
    setFormOrder("0");
    setEditMode(false);
    setSelectedCategory(null);
  };

  const openCreate = () => { resetForm(); setOpenDialog(true); };

  const openEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormIconKey((cat.icon_url as IconKey) || "general");
    setFormStatus(cat.is_active ? "ACTIVE" : "DRAFT");
    setFormOrder(String(cat.display_order));
    setEditMode(true);
    setOpenDialog(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!formName.trim()) { toast.error("Category name is required."); return; }

    setSubmitting(true);
    const toastId = toast.loading(editMode ? "Saving changes..." : "Creating category...");

    try {
      const payload = {
        name: formName.trim(),
        slug: formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formDescription.trim() || null,
        icon_url: formIconKey,
        display_order: parseInt(formOrder) || 0,
        is_active: formStatus === "ACTIVE",
        parent_id: null,
      };

      if (editMode && selectedCategory) {
        await apiClient.put(`/api/v1/categories/${selectedCategory.id}`, payload);
        toast.dismiss(toastId);
        toast.success("Category updated successfully!");
      } else {
        await apiClient.post("/api/v1/categories/", payload);
        toast.dismiss(toastId);
        toast.success("Category created successfully!");
      }

      setOpenDialog(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (cat: Category) => {
    if (cat.articleCount > 0) {
      toast.error(`Cannot delete "${cat.name}" — it has ${cat.articleCount} article(s). Reassign them first.`);
      return;
    }
    if (!confirm(`Delete category "${cat.name}"? This action cannot be undone.`)) return;

    const toastId = toast.loading("Deleting category...");
    try {
      await apiClient.delete(`/api/v1/categories/${cat.id}`);
      toast.dismiss(toastId);
      toast.success("Category deleted successfully.");
      fetchCategories();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(err));
    }
  };

  // ── Derived Data ───────────────────────────────────────────────────────────

  const processed = useMemo(() => {
    let result = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((c) => (statusFilter === "ACTIVE") === c.is_active);
    }

    result.sort((a, b) => {
      if (sortOption === "Name A-Z") return a.name.localeCompare(b.name);
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      return sortOption === "Newest" ? dB - dA : dA - dB;
    });

    return result;
  }, [categories, search, statusFilter, sortOption]);

  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE));
  const paginated = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: categories.length,
    active: categories.filter((c) => c.is_active).length,
    draft: categories.filter((c) => !c.is_active).length,
    totalArticles: categories.reduce((sum, c) => sum + c.articleCount, 0),
  }), [categories]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Category Management
          </h1>
          <p className="text-sm text-slate-500">
            Organize health topics used across Articles, Documents, and FAQs.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Categories"   value={stats.total}        icon={Layers}    color="bg-blue-50 text-blue-600" />
        <StatCard label="Active"             value={stats.active}       icon={Tag}       color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Draft / Inactive"   value={stats.draft}        icon={FolderOpen} color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Articles"     value={stats.totalArticles} icon={BookOpen}  color="bg-purple-50 text-purple-600" />
      </div>

      {/* ── Filter / Search Row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search categories..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-xl px-3 h-10 bg-slate-50/20">
            <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer font-semibold"
            >
              <option value="All">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl px-3 h-10 bg-slate-50/20">
            <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer font-semibold"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Name A-Z">Name A-Z</option>
            </select>
          </div>

          <span className="hidden sm:inline text-sm font-semibold text-slate-400">
            {processed.length} result{processed.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-semibold text-slate-500">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Articles</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Created</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center m-4">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
                          <FolderOpen className="h-10 w-10 text-blue-500/60" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-slate-800">No categories found</h3>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
                          Categories help organize articles and FAQs by health topic.
                        </p>
                        <Button
                          onClick={openCreate}
                          className="h-10 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
                        >
                          <Plus className="h-4 w-4" /> Create First Category
                        </Button>
                      </div>
                    </td>
                  </tr>
              ) : (
                paginated.map((cat) => {
                  const s = getIconStyle(cat.icon_url);
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CategoryIcon iconKey={cat.icon_url} />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 leading-snug">{cat.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{cat.description || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cat.articleCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`rounded-sm text-[9px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider border-transparent ${
                            cat.is_active
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium text-xs">
                        {cat.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
                            title="Edit Category"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden divide-y divide-slate-100 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm font-semibold">Loading categories...</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center m-4">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
                <FolderOpen className="h-10 w-10 text-blue-500/60" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">No categories found</h3>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
                Categories help organize your medical knowledge base.
              </p>
            </div>
          ) : (
            paginated.map((cat) => (
              <div key={cat.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CategoryIcon iconKey={cat.icon_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 leading-snug">{cat.name}</span>
                      <Badge
                        className={`rounded-sm text-[9px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider border-transparent shrink-0 ${
                          cat.is_active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.is_active ? "Active" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                      {cat.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {cat.articleCount} articles
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">{cat.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && processed.length > ITEMS_PER_PAGE && (
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500 font-medium">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, processed.length)} of {processed.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={openDialog} onOpenChange={(open) => { if (!open) resetForm(); setOpenDialog(open); }}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-md rounded-2xl p-4 sm:p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editMode ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              {editMode
                ? "Update category name, description, icon and visibility."
                : "Create a new health topic category for Articles, Documents and FAQs."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Category Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Pregnancy Care"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {formName && (
                <p className="text-xs text-slate-400">
                  Slug: <code className="bg-slate-100 px-1 rounded text-slate-600">{formName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</code>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Brief summary of articles under this topic..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition-all resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Icon picker */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Topic Icon</label>
              <div className="grid grid-cols-3 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const selected = formIconKey === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormIconKey(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <CategoryIcon iconKey={opt.value} size="sm" />
                      <span className="text-[10px] font-semibold text-slate-500 leading-tight">{opt.label.split("—")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status + Order row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => { setOpenDialog(false); resetForm(); }}
              disabled={submitting}
              className="rounded-lg border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formName.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{editMode ? "Saving..." : "Creating..."}</span>
              ) : (
                editMode ? "Save Changes" : "Create Category"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all lg:hidden"
        aria-label="New Category"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
