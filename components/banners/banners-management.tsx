"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/ui/access-denied";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function BannersManagement() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/api/v1/settings/banners");
      setBanners(res.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsAccessDenied(true);
      } else {
        toast.error("Failed to load banners.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    try {
      await apiClient.delete(`/api/v1/settings/banners/${id}`);
      toast.success("Banner deleted successfully.");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete banner.");
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      await apiClient.put(`/api/v1/settings/banners/${banner.id}`, {
        is_active: !banner.is_active
      });
      toast.success(banner.is_active ? "Banner deactivated" : "Banner activated");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  };

  if (isAccessDenied) {
    return <div className="mt-8"><AccessDenied /></div>;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Banners Management</h1>
          <p className="text-sm text-slate-500 lg:text-base mt-1">
            Manage the dynamic banners displayed on the web app.
          </p>
        </div>
        
        <Button
          onClick={() => router.push('/admin/banners/new')}
          className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Banner
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Preview / Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading banners...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No banners found.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {banner.type === 'image' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-8 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {banner.image_url ? (
                              <img src={getFullImageUrl(banner.image_url)} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="text-slate-500 text-xs truncate max-w-[150px]">{banner.image_url}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900">{banner.title?.en || "No Title"}</div>
                          <div className="text-xs text-slate-500 font-kantumruy-pro">{banner.title?.km || "No Title (KM)"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                        banner.type === 'image' 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {banner.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                        {banner.type === 'image' ? 'Image Banner' : 'Color Text Banner'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(banner)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          banner.is_active 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {banner.is_active ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Active</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5" /> Hidden</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-medium text-slate-600">
                        {banner.display_order}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => router.push(`/admin/banners/${banner.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(banner.id)}
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
