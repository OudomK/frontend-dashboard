"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/ui/access-denied";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function StaticPagesManagement() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/api/v1/settings/pages");
      setPages(res.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsAccessDenied(true);
      } else {
        toast.error("Failed to load pages.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    try {
      await apiClient.delete(`/api/v1/settings/pages/${id}`);
      toast.success("Page deleted successfully.");
      fetchPages();
    } catch (error) {
      toast.error("Failed to delete page.");
    }
  };

  const handleTogglePublish = async (page: any) => {
    try {
      await apiClient.put(`/api/v1/settings/pages/${page.id}`, {
        slug: page.slug,
        title: page.title,
        content: page.content,
        is_published: !page.is_published
      });
      toast.success(page.is_published ? "Page unpublished" : "Page published");
      fetchPages();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredPages = pages.filter(page => 
    page.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (page.title.en && page.title.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (page.title.km && page.title.km.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isAccessDenied) {
    return <div className="mt-8"><AccessDenied /></div>;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">{t("pages.title")}</h1>
          <p className="text-sm text-slate-500 lg:text-base mt-1">
            {t("pages.subtitle")}
          </p>
        </div>
        
        <Button
          onClick={() => router.push('/dashboard/pages/new')}
          className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("pages.addBtn")}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">{t("pages.table.title")}</th>
                <th className="px-6 py-4">{t("pages.table.slug")}</th>
                <th className="px-6 py-4">{t("pages.table.status")}</th>
                <th className="px-6 py-4">{t("pages.table.updatedAt")}</th>
                <th className="px-6 py-4 text-right">{t("pages.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading pages...
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No pages found.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{page.title.en}</div>
                      <div className="text-xs text-slate-500 font-kantumruy-pro">{page.title.km}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                        /{page.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePublish(page)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          page.is_published 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {page.is_published ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Published</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5" /> Draft</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {page.updated_at ? format(new Date(page.updated_at), 'MMM dd, yyyy') : format(new Date(page.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => router.push(`/dashboard/pages/${page.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
