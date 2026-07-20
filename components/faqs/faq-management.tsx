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
import { useTranslation } from "@/lib/hooks/use-translation";

type Category = {
  id: number;
  name: string;
};

export type Faq = {
  id: number;
  category_id: number | null;
  created_by?: number | null;
  question: { en: string; km: string };
  answer: { en: string; km: string };
  display_order: number;
  is_active: boolean;
  created_at: string;
};

type FaqWithCategory = Faq & {
  categoryName: string;
};

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

function formatBackendError(error: unknown): string {
  const response = error && typeof error === "object" && "response" in error
    ? (error as { response?: { data?: { detail?: unknown; message?: string } } }).response
    : undefined;
  const detail = response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => {
      const item = d as { loc?: string[]; msg?: string };
      const field = item.loc && item.loc.length > 0 ? item.loc[item.loc.length - 1] : "field";
      return `${field}: ${item.msg ?? "Invalid value"}`;
    }).join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (response?.data?.message) {
    return response.data.message;
  }
  return error instanceof Error ? error.message : "An error occurred";
}

export function FAQManagement({ role, addOpen, onAddOpenChange }: Props) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useTranslation();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

  const canManage = role === "admin" || role === "doctor";

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const [faqRes, catRes] = await Promise.all([
        apiClient.get("/api/v1/faqs/"),
        apiClient.get("/api/v1/categories/")
      ]);
      setFaqs((faqRes.data || []) as Faq[]);
      setCategories((catRes.data || []) as Category[]);
    } catch (error: unknown) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchFaqs);
  }, []);

  const handleToggleActive = async (faqId: number, currentActive: boolean) => {
    const action = currentActive ? "deactivate" : "activate";
    const toastId = toast.loading(`${currentActive ? "Deactivating" : "Activating"} FAQ...`);
    try {
      await apiClient.patch(`/api/v1/faqs/${faqId}/${action}`);
      toast.dismiss(toastId);
      toast.success(`FAQ ${currentActive ? "deactivated" : "activated"} successfully!`);
      fetchFaqs();
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  };

  function handleAdd() {
    if (!canManage) return;
    setEditingFaq(null);
    setDialogOpen(true);
  }

  function handleEdit(faq: Faq) {
    if (!canManage) return;
    setEditingFaq(faq);
    setDialogOpen(true);
  }

  function handleDeleteClick(faq: Faq) {
    if (!canManage) return;
    setDeletingFaq(faq);
    setDeleteDialogOpen(true);
  }

  // Filter Logic
  const filtered = useMemo(() => {
    const catMap = new Map<number, string>();
    categories.forEach((c) => catMap.set(c.id, c.name));

    return faqs
      .map<FaqWithCategory>((faq) => ({
        ...faq,
        categoryName: faq.category_id ? catMap.get(faq.category_id) ?? t("faqs.uncategorized") : t("faqs.uncategorized")
      }))
      .filter((faq) => {
        const qStr = ((faq.question?.km || "") + " " + (faq.question?.en || "")).toLowerCase();
        const aStr = ((faq.answer?.km || "") + " " + (faq.answer?.en || "")).toLowerCase();
        const matchesSearch =
          search === "" ||
          qStr.includes(search.toLowerCase()) ||
          aStr.includes(search.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || faq.category_id?.toString() === categoryFilter;

        return matchesSearch && matchesCategory;
      });
  }, [faqs, categories, search, categoryFilter]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useMemo(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, faqs]);

  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startRange = filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endRange = Math.min(currentPage * itemsPerPage, filtered.length);

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
              placeholder={t("faqs.searchPlaceholder")}
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
                  <SelectValue placeholder={t("faqs.filterCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("faqs.allCategories")}</SelectItem>
                  {categories.map((cat) => {
                    const catName = typeof cat.name === 'string' ? cat.name : ((cat.name as any)?.[language as 'en'|'km'] || (cat.name as any)?.en || (cat.name as any)?.km || "");
                    return (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {catName}
                      </SelectItem>
                    );
                  })}
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
                  ? t("faqs.filterCategory")
                  : (() => {
                      const c = categories.find((c) => c.id.toString() === categoryFilter);
                      return c ? (typeof c.name === 'string' ? c.name : ((c.name as any)?.[language as 'en'|'km'] || (c.name as any)?.en || (c.name as any)?.km || "")) : t("faqs.category");
                    })()}
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
                  <th className="px-6 py-4 font-semibold">{t("faqs.tableQuestionAnswer")}</th>
                  <th className="px-6 py-4 font-semibold">{t("faqs.tableCategory")}</th>
                  <th className="px-6 py-4 font-semibold">{t("faqs.tableStatus")}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t("faqs.tableActions")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      {t("faqs.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center m-4">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
                          <MessageCircleQuestion className="h-10 w-10 text-blue-500/60" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-slate-800">{t("faqs.noFaqs")}</h3>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
                          {t("faqs.noFaqsDesc")}
                        </p>
                        {canManage && (
                          <Button
                            onClick={handleAdd}
                            className="h-10 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
                          >
                            <Plus className="h-4 w-4" /> {t("faqs.addFirstFaq")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedFaqs.map((faq) => (
                    <tr
                      key={faq.id}
                      className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-5 max-w-md">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {faq.question?.[language as 'en'|'km'] || faq.question?.km || faq.question?.en}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {faq.answer?.[language as 'en'|'km'] || faq.answer?.km || faq.answer?.en}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <CategoryPill category={typeof faq.categoryName === 'string' ? faq.categoryName : ((faq.categoryName as any)?.[language as 'en'|'km'] || (faq.categoryName as any)?.en || (faq.categoryName as any)?.km || "")} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.is_active}
                            onCheckedChange={(checked) => handleToggleActive(faq.id, !checked)}
                            aria-label={faq.is_active ? "Deactivate FAQ" : "Activate FAQ"}
                          />
                          <span className={`text-sm font-medium ${faq.is_active ? "text-slate-900" : "text-slate-400"}`}>
                            {faq.is_active ? t("faqs.active") : t("faqs.inactive")}
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
                {t("faqs.loading")}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircleQuestion className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">{t("faqs.noFaqs")}</p>
              </div>
            ) : (
              paginatedFaqs.map((faq) => (
                <div key={faq.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CategoryPill category={typeof faq.categoryName === 'string' ? faq.categoryName : ((faq.categoryName as any)?.[language as 'en'|'km'] || (faq.categoryName as any)?.en || (faq.categoryName as any)?.km || "")} />
                      <p className="mt-2 font-semibold leading-snug text-slate-900">
                        {faq.question?.[language as 'en'|'km'] || faq.question?.km || faq.question?.en}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {faq.answer?.[language as 'en'|'km'] || faq.answer?.km || faq.answer?.en}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.is_active}
                            onCheckedChange={(checked) => handleToggleActive(faq.id, !checked)}
                          />
                          <span className={`text-sm font-medium ${faq.is_active ? "text-slate-900" : "text-slate-400"}`}>
                            {faq.is_active ? t("faqs.active") : t("faqs.inactive")}
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
          
          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white select-none">
              <span className="text-sm text-slate-500 font-medium">
                {t("pagination.showing" as any)} {startRange} {t("pagination.to" as any)} {endRange} {t("pagination.of" as any)} {filtered.length} {t("pagination.results" as any)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
                >
                  {t("pagination.previous" as any)}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
                >
                  {t("pagination.next" as any)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={editingFaq}
        categories={categories}
        onSuccess={fetchFaqs}
      />

      {onAddOpenChange && (
        <FaqDialog
          open={addOpen || false}
          onOpenChange={onAddOpenChange}
          faq={null}
          categories={categories}
          onSuccess={fetchFaqs}
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
