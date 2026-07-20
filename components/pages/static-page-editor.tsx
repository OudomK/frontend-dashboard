"use client";

import { useState, useEffect } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Props = {
  pageId?: string;
};

export function StaticPageEditor({ pageId }: Props) {
  const router = useRouter();
  
  const [titleEn, setTitleEn] = useState("");
  const [titleKm, setTitleKm] = useState("");
  const [slug, setSlug] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentKm, setContentKm] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(!!pageId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageId) {
      const fetchPage = async () => {
        try {
          const res = await apiClient.get(`/api/v1/settings/pages/${pageId}`);
          const data = res.data;
          setTitleEn(data.title.en || "");
          setTitleKm(data.title.km || "");
          setSlug(data.slug);
          setContentEn(data.content.en || "");
          setContentKm(data.content.km || "");
          setIsPublished(data.is_published);
        } catch (error) {
          toast.error("Failed to load page.");
          router.push("/admin/pages");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPage();
    }
  }, [pageId, router]);

  const handleSave = async () => {
    if (!titleEn || !titleKm || !slug) {
      toast.error("Please fill in all required fields (Titles and Slug).");
      return;
    }

    setIsSaving(true);
    const payload = {
      slug,
      title: {
        en: titleEn,
        km: titleKm,
      },
      content: {
        en: contentEn,
        km: contentKm,
      },
      is_published: isPublished
    };

    try {
      if (pageId) {
        await apiClient.put(`/api/v1/settings/pages/${pageId}`, payload);
        toast.success("Page updated successfully.");
      } else {
        await apiClient.post("/api/v1/settings/pages", payload);
        toast.success("Page created successfully.");
        router.push("/admin/pages");
      }
    } catch (error: any) {
      if (error.response?.data?.detail === "Slug already exists") {
        toast.error("This slug is already used by another page.");
      } else {
        toast.error("Failed to save page.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading editor...</div>;
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/pages")}
            className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900 bg-white border border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
              {pageId ? "Edit Page" : "New Page"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <input 
              type="checkbox" 
              id="is_published" 
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_published" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Published
            </label>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Page"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - English */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> English Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">Title (EN) *</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Content (EN)</label>
                <div className="mt-1">
                  <ReactQuill 
                    theme="snow" 
                    value={contentEn} 
                    onChange={setContentEn}
                    modules={quillModules}
                    className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-container]:min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Khmer */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Khmer Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">Title (KM) *</label>
                <input
                  type="text"
                  value={titleKm}
                  onChange={(e) => setTitleKm(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-kantumruy-pro outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Content (KM)</label>
                <div className="mt-1 font-kantumruy-pro">
                  <ReactQuill 
                    theme="snow" 
                    value={contentKm} 
                    onChange={setContentKm}
                    modules={quillModules}
                    className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-container]:min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Page Settings</h2>
            <div>
              <label className="text-sm font-bold text-slate-700">URL Slug *</label>
              <div className="mt-1 flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="px-3 text-slate-400 font-medium">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="privacy-policy"
                  className="h-full w-full bg-transparent px-2 text-sm outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">This will be the URL of the page (e.g. /privacy-policy)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
