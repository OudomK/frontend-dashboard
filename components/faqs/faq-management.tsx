"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  MessageCircleQuestion,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { FaqDialog } from "./faq-dialog";
import { DeleteFaqDialog } from "./delete-faq-dialog";

type Props = {
  role: "admin" | "doctor";
  addOpen?: boolean;
  onAddOpenChange?: (open: boolean) => void;
};

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      {category}
    </span>
  );
}

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

export function FAQManagement({ role, addOpen, onAddOpenChange }: Props) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<any | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const [faqRes, catRes] = await Promise.all([
        apiClient.get("/api/v1/faqs/"),
        apiClient.get("/api/v1/categories/")
      ]);
      setFaqs(faqRes.data || []);
      setCategories(catRes.data || []);
    } catch (error: any) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleToggleActive = async (faqId: number, currentActive: boolean) => {
    const action = currentActive ? "deactivate" : "activate";
    const toastId = toast.loading(`${currentActive ? "Deactivating" : "Activating"} FAQ...`);
    try {
      await apiClient.patch(`/api/v1/faqs/${faqId}/${action}`);
      toast.dismiss(toastId);
      toast.success(`FAQ ${currentActive ? "deactivated" : "activated"} successfully!`);
      fetchFaqs();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  };

  function handleAdd() {
    setEditingFaq(null);
    setDialogOpen(true);
  }

  function handleEdit(faq: any) {
    setEditingFaq(faq);
    setDialogOpen(true);
  }

  function handleDeleteClick(faq: any) {
    setDeletingFaq(faq);
    setDeleteDialogOpen(true);
  }

  // Filter Logic
  const filtered = useMemo(() => {
    const catMap = new Map<number, string>();
    categories.forEach((c) => catMap.set(c.id, c.name));

    return faqs
      .map((faq) => ({
        ...faq,
        categoryName: faq.category_id ? catMap.get(faq.category_id) : "Uncategorized"
      }))
      .filter((faq) => {
        const matchesSearch =
          search === "" ||
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || faq.category_id?.toString() === categoryFilter;

        return matchesSearch && matchesCategory;
      });
  }, [faqs, categories, search, categoryFilter]);

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              aria-label="Search FAQs"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter by Category */}
          <div className="relative shrink-0">
            {showCategoryFilter ? (
              <Select
                open
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setShowCategoryFilter(false);
                }}
                onOpenChange={(open) => {
                  if (!open) setShowCategoryFilter(false);
                }}
              >
                <SelectTrigger className="h-10 w-[200px] rounded-lg border-slate-200 text-sm font-medium text-slate-700">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                onClick={() => setShowCategoryFilter(true)}
                className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
                  categoryFilter !== "all"
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                {categoryFilter === "all"
                  ? "Filter by Category"
                  : categories.find((c) => c.id.toString() === categoryFilter)?.name || "Category"}
              </button>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="px-6 py-4 font-semibold">Question & Answer</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      Loading FAQs...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                          <MessageCircleQuestion className="h-7 w-7 text-slate-400" />
                        </div>
                        <h3 className="mb-1 font-semibold text-slate-900">No FAQs found</h3>
                        <p className="mb-6 max-w-xs text-sm text-slate-500">
                          No FAQs match your current filters. Try adding a new FAQ.
                        </p>
                        <Button
                          onClick={handleAdd}
                          className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add FAQ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((faq) => (
                    <tr
                      key={faq.id}
                      className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-5 max-w-md">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {faq.question}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {faq.answer}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <CategoryPill category={faq.categoryName} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.is_active}
                            onCheckedChange={(checked) => handleToggleActive(faq.id, !checked)}
                            aria-label={faq.is_active ? "Deactivate FAQ" : "Activate FAQ"}
                          />
                          <span className={`text-sm font-medium ${faq.is_active ? "text-slate-900" : "text-slate-400"}`}>
                            {faq.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(faq)}
                            aria-label={`Edit FAQ`}
                            className="text-slate-400 transition hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(faq)}
                            aria-label={`Delete FAQ`}
                            className="text-slate-400 transition hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                Loading FAQs...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircleQuestion className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No FAQs found</p>
              </div>
            ) : (
              filtered.map((faq) => (
                <div key={faq.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CategoryPill category={faq.categoryName} />
                      <p className="mt-2 font-semibold leading-snug text-slate-900">
                        {faq.question}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {faq.answer}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.is_active}
                            onCheckedChange={(checked) => handleToggleActive(faq.id, !checked)}
                          />
                          <span className={`text-sm font-medium ${faq.is_active ? "text-slate-900" : "text-slate-400"}`}>
                            {faq.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 pt-1">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(faq)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={editingFaq}
        categories={categories}
        onSuccess={fetchFaqs}
        role={role}
      />

      {onAddOpenChange && (
        <FaqDialog
          open={addOpen || false}
          onOpenChange={onAddOpenChange}
          faq={null}
          categories={categories}
          onSuccess={fetchFaqs}
          role={role}
        />
      )}

      <DeleteFaqDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        faq={deletingFaq}
        onSuccess={fetchFaqs}
      />
    </>
  );
}