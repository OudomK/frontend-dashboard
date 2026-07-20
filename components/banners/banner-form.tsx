"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessDenied } from "@/components/ui/access-denied";

interface BannerFormProps {
  bannerId?: number;
}

export function BannerForm({ bannerId }: BannerFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!bannerId);
  
  const [type, setType] = useState<"image" | "color">("image");
  const [imageUrl, setImageUrl] = useState("");
  const [bgGradient, setBgGradient] = useState("bg-gradient-to-r from-blue-500 to-indigo-500");
  const [title, setTitle] = useState({ en: "", km: "" });
  const [subtitle, setSubtitle] = useState({ en: "", km: "" });
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    if (bannerId) {
      fetchBanner();
    }
  }, [bannerId]);

  const fetchBanner = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/api/v1/settings/banners");
      const banner = res.data.find((b: any) => b.id === bannerId);
      if (banner) {
        setType(banner.type);
        setImageUrl(banner.image_url || "");
        setBgGradient(banner.bg_gradient || "bg-gradient-to-r from-blue-500 to-indigo-500");
        setTitle({ en: banner.title?.en || "", km: banner.title?.km || "" });
        setSubtitle({ en: banner.subtitle?.en || "", km: banner.subtitle?.km || "" });
        setLinkUrl(banner.link_url || "");
        setIsActive(banner.is_active);
        setDisplayOrder(banner.display_order || 0);
      } else {
        toast.error("Banner not found");
        router.push("/admin/banners");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsAccessDenied(true);
      } else {
        toast.error("Failed to load banner");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const toastId = toast.loading("Uploading image...");
      const res = await apiClient.post("/api/v1/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageUrl(res.data.file_url);
      toast.success("Image uploaded successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (type === "image" && !imageUrl) {
      toast.error("Please upload an image.");
      return;
    }
    
    setIsSaving(true);
    
    const data = {
      type,
      image_url: type === "image" ? imageUrl : null,
      bg_gradient: type === "color" ? bgGradient : null,
      title: type === "color" ? title : null,
      subtitle: type === "color" ? subtitle : null,
      link_url: linkUrl || null,
      is_active: isActive,
      display_order: Number(displayOrder)
    };
    
    try {
      if (bannerId) {
        await apiClient.put(`/api/v1/settings/banners/${bannerId}`, data);
        toast.success("Banner updated successfully");
      } else {
        await apiClient.post("/api/v1/settings/banners", data);
        toast.success("Banner created successfully");
      }
      router.push("/admin/banners");
    } catch (error) {
      toast.error("Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  };

  if (isAccessDenied) return <div className="mt-8"><AccessDenied /></div>;
  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/banners")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {bannerId ? "Edit Banner" : "Create Banner"}
          </h1>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Banner"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Banner Details</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Banner Type</label>
              <Select value={type} onValueChange={(v: "image" | "color") => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image Banner</SelectItem>
                  <SelectItem value="color">Color Text Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {type === "image" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Image Upload</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-10 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {imageUrl ? (
                    <img src={getFullImageUrl(imageUrl)} alt="Banner Preview" className="max-h-64 rounded-lg object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-300" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                        <span className="font-semibold text-blue-600">Click to upload</span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Background Gradient (Tailwind CSS)</label>
                  <Input 
                    value={bgGradient}
                    onChange={e => setBgGradient(e.target.value)}
                    placeholder="bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                  <div className={`w-full h-16 rounded-lg ${bgGradient} mt-2`}></div>
                </div>
                
                <Tabs defaultValue="en">
                  <TabsList className="mb-4">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="km">Khmer</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title (EN)</label>
                      <Input value={title.en} onChange={e => setTitle({...title, en: e.target.value})} placeholder="e.g. Track Your Wellness" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Subtitle (EN)</label>
                      <Input value={subtitle.en} onChange={e => setSubtitle({...subtitle, en: e.target.value})} placeholder="e.g. Your health journey starts here" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="km" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title (KM)</label>
                      <Input value={title.km} onChange={e => setTitle({...title, km: e.target.value})} placeholder="e.g. តាមដានសុខភាពរបស់អ្នក" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Subtitle (KM)</label>
                      <Input value={subtitle.km} onChange={e => setSubtitle({...subtitle, km: e.target.value})} placeholder="e.g. ដំណើរការសុខភាពចាប់ផ្តើមពីទីនេះ" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Active Status</label>
                <p className="text-xs text-slate-500">Show this banner on the site</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Order</label>
              <Input 
                type="number" 
                value={Number.isNaN(displayOrder) ? "" : displayOrder} 
                onChange={e => setDisplayOrder(e.target.value ? parseInt(e.target.value) : 0)} 
              />
              <p className="text-xs text-slate-500">Lower numbers appear first</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Link URL (Optional)</label>
              <Input 
                type="url" 
                value={linkUrl} 
                onChange={e => setLinkUrl(e.target.value)} 
                placeholder="https://..."
              />
              <p className="text-xs text-slate-500">Where this banner should navigate when clicked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
