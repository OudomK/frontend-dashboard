"use client";

import { useState, useEffect } from "react";
import { apiClient, API_URL } from "@/lib/api-client";
import { Loader2, Pencil, Save, Plus, Trash2, Shield, HeartPulse, Building2, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useAuthStore } from "@/lib/store/use-auth-store";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export function AboutManagement() {
  const { t } = useTranslation();
  const { roleId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [savingClinic, setSavingClinic] = useState(false);
  const [clinic, setClinic] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [isTranslatingClinic, setIsTranslatingClinic] = useState(false);
  const [translatingMemberIndex, setTranslatingMemberIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clinicRes, teamRes] = await Promise.all([
        apiClient.get("/api/v1/about/clinic"),
        apiClient.get("/api/v1/about/team")
      ]);
      setClinic(clinicRes.data);
      setTeam(teamRes.data);
    } catch (err) {
      console.error(err);
      toast.error(t("abt.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  const handleClinicChange = (e: any) => {
    setClinic({ ...clinic, [e.target.name]: e.target.value });
  };

  const handleClinicLocalizedChange = (field: string, lang: 'en' | 'km', value: string) => {
    setClinic((prev: any) => {
      if (!prev) return prev;
      if (prev[field]?.[lang] === value) return prev;
      return {
        ...prev,
        [field]: {
          ...(prev[field] || {}),
          [lang]: value
        }
      };
    });
  };

  const saveClinicInfo = async () => {
    setSavingClinic(true);
    try {
      await apiClient.put("/api/v1/about/clinic", clinic);
      toast.success(t("abt.clinicUpdated"));
    } catch (err) {
      console.error(err);
      toast.error(t("abt.clinicUpdateFailed"));
    } finally {
      setSavingClinic(false);
    }
  };

  const handleTeamChange = (index: number, e: any) => {
    const updated = [...team];
    updated[index][e.target.name] = e.target.value;
    setTeam(updated);
  };

  const handleTeamLocalizedChange = (index: number, field: string, lang: 'en' | 'km', value: string) => {
    setTeam((prev) => {
      if (prev[index]?.[field]?.[lang] === value) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index] };
      updated[index][field] = {
        ...(updated[index][field] || {}),
        [lang]: value
      };
      return updated;
    });
  };

  const saveTeamMember = async (index: number) => {
    const member = team[index];
    try {
      if (member.id) {
        await apiClient.put(`/api/v1/about/team/${member.id}`, member);
        toast.success(t("abt.memberUpdated"));
      } else {
        const res = await apiClient.post("/api/v1/about/team", member);
        const updated = [...team];
        updated[index] = res.data;
        setTeam(updated);
        toast.success(t("abt.memberCreated"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("abt.memberSaveFailed"));
    }
  };

  const removeTeamMember = async (index: number) => {
    const member = team[index];
    if (member.id) {
      try {
        await apiClient.delete(`/api/v1/about/team/${member.id}`);
        toast.success(t("abt.memberRemoved"));
      } catch (err) {
        console.error(err);
        toast.error(t("abt.memberRemoveFailed"));
        return;
      }
    }
    const updated = [...team];
    updated.splice(index, 1);
    setTeam(updated);
  };

  const addNewMember = () => {
    setTeam([...team, { 
      name: { en: "", km: "" }, 
      role: { en: "", km: "" }, 
      description: { en: "", km: "" }, 
      image_url: "", 
      display_order: team.length + 1 
    }]);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/api/v1/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = [...team];
      updated[index].image_url = res.data.file_url;
      setTeam(updated);
      toast.success(t("abt.imgUploaded"));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail ?? t("abt.imgUploadFailed"));
    } finally {
      setUploadingImage(null);
    }
  };

  const handleTranslateClinic = async () => {
    setIsTranslatingClinic(true);
    const toastId = toast.loading("Translating clinic info using Gemini AI...");
    try {
      const res = await apiClient.post("/api/v1/about/translate", {
        data: {
          clinic_name: clinic.clinic_name?.km || "",
          address: clinic.address?.km || "",
          opening_hours: clinic.opening_hours?.km || "",
          about_text: clinic.about_text?.km || "",
          mission: clinic.mission?.km || "",
          vision: clinic.vision?.km || "",
        }
      });
      const translated = res.data;
      setClinic((prev: any) => ({
        ...prev,
        clinic_name: { ...prev.clinic_name, en: translated.clinic_name || prev.clinic_name?.en },
        address: { ...prev.address, en: translated.address || prev.address?.en },
        opening_hours: { ...prev.opening_hours, en: translated.opening_hours || prev.opening_hours?.en },
        about_text: { ...prev.about_text, en: translated.about_text || prev.about_text?.en },
        mission: { ...prev.mission, en: translated.mission || prev.mission?.en },
        vision: { ...prev.vision, en: translated.vision || prev.vision?.en },
      }));
      toast.success("Clinic info translated successfully!", { id: toastId });
    } catch (err) {
      toast.error("Translation failed.", { id: toastId });
    } finally {
      setIsTranslatingClinic(false);
    }
  };

  const handleTranslateTeamMember = async (index: number) => {
    const member = team[index];
    setTranslatingMemberIndex(index);
    const toastId = toast.loading("Translating member info using Gemini AI...");
    try {
      const res = await apiClient.post("/api/v1/about/translate", {
        data: {
          name: member.name?.km || "",
          role: member.role?.km || "",
          description: member.description?.km || "",
        }
      });
      const translated = res.data;
      const updated = [...team];
      updated[index].name = { ...updated[index].name, en: translated.name || updated[index].name?.en };
      updated[index].role = { ...updated[index].role, en: translated.role || updated[index].role?.en };
      updated[index].description = { ...updated[index].description, en: translated.description || updated[index].description?.en };
      setTeam(updated);
      toast.success("Member info translated successfully!", { id: toastId });
    } catch (err) {
      toast.error("Translation failed.", { id: toastId });
    } finally {
      setTranslatingMemberIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{t("abt.title")}</h1>
        <p className="text-gray-500 text-lg">{t("abt.subtitle")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-800">{t("abt.clinicInfo")}</h2>
        </div>
        
        {clinic && (
          <div className="p-6 space-y-6">
            <Tabs defaultValue="km" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="km">Khmer 🇰🇭</TabsTrigger>
                  <TabsTrigger value="en">English 🇬🇧</TabsTrigger>
                </TabsList>
                <Button 
                  onClick={handleTranslateClinic} 
                  disabled={isTranslatingClinic}
                  variant="outline"
                  size="sm"
                  className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                >
                  {isTranslatingClinic ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Auto Translate
                </Button>
              </div>

              {["km", "en"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{t("abt.clinicName")} ({lang.toUpperCase()})</label>
                      <Input value={clinic.clinic_name?.[lang] || ""} onChange={(e) => handleClinicLocalizedChange("clinic_name", lang as 'en'|'km', e.target.value)} placeholder="e.g. Bellyn Clinic" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Address ({lang.toUpperCase()})</label>
                      <Input value={clinic.address?.[lang] || ""} onChange={(e) => handleClinicLocalizedChange("address", lang as 'en'|'km', e.target.value)} placeholder="Clinic address..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Opening Hours ({lang.toUpperCase()})</label>
                      <Input value={clinic.opening_hours?.[lang] || ""} onChange={(e) => handleClinicLocalizedChange("opening_hours", lang as 'en'|'km', e.target.value)} placeholder="e.g. 8:00 AM - 5:00 PM" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t("abt.aboutText")} ({lang.toUpperCase()})</label>
                    <ReactQuill theme="snow" value={clinic.about_text?.[lang] || ""} onChange={(val) => handleClinicLocalizedChange("about_text", lang as 'en'|'km', val)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" /> {t("abt.mission")} ({lang.toUpperCase()})
                      </label>
                      <ReactQuill theme="snow" value={clinic.mission?.[lang] || ""} onChange={(val) => handleClinicLocalizedChange("mission", lang as 'en'|'km', val)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-rose-500" /> {t("abt.vision")} ({lang.toUpperCase()})
                      </label>
                      <ReactQuill theme="snow" value={clinic.vision?.[lang] || ""} onChange={(val) => handleClinicLocalizedChange("vision", lang as 'en'|'km', val)} />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-md font-medium text-gray-800 mb-4">Contact Information (Non-translated)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t("abt.phone")}</label>
                  <Input name="phone" value={clinic.phone || ""} onChange={handleClinicChange} placeholder="e.g. 012 345 678" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t("abt.email")}</label>
                  <Input name="email" value={clinic.email || ""} onChange={handleClinicChange} placeholder="e.g. contact@bellyn.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t("abt.tgLink")}</label>
                  <Input name="telegram_link" value={clinic.telegram_link || ""} onChange={handleClinicChange} placeholder="e.g. https://t.me/bellyn" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Map Link</label>
                  <Input name="map_link" value={clinic.map_link || ""} onChange={handleClinicChange} placeholder="Google Maps URL" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={saveClinicInfo} disabled={savingClinic} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200">
                {savingClinic ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t("abt.saveClinic")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {roleId === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-semibold text-gray-800">{t("abt.teamMembers")}</h2>
            </div>
          <Button onClick={addNewMember} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
            <Plus className="w-4 h-4 mr-2" /> {t("abt.addMember")}
          </Button>
        </div>
        
        <div className="p-6 space-y-8">
          {team.map((member, index) => (
            <div key={index} className="relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm group hover:border-rose-200 transition-all duration-300">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button size="icon" variant="destructive" onClick={() => removeTeamMember(index)} className="h-8 w-8 shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative group/image">
                    {uploadingImage === index ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : member.image_url ? (
                      <img src={member.image_url.startsWith('/uploads') ? `${API_URL}${member.image_url}` : member.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">{t("abt.noImage")}</span>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium">{t("abt.upload")}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} disabled={uploadingImage === index} />
                    </label>
                  </div>
                  <Input name="image_url" value={member.image_url || ""} onChange={(e) => handleTeamChange(index, e)} placeholder="Or paste image URL" className="text-xs" />
                </div>
                
                <div className="md:col-span-9 space-y-4">
                  <Tabs defaultValue="km" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        <TabsTrigger value="km">Khmer 🇰🇭</TabsTrigger>
                        <TabsTrigger value="en">English 🇬🇧</TabsTrigger>
                      </TabsList>
                      <Button 
                        onClick={() => handleTranslateTeamMember(index)} 
                        disabled={translatingMemberIndex === index}
                        variant="outline"
                        size="sm"
                        className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                      >
                        {translatingMemberIndex === index ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Auto Translate
                      </Button>
                    </div>
                    
                    {["km", "en"].map((lang) => (
                      <TabsContent key={lang} value={lang} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("abt.name")} ({lang.toUpperCase()})</label>
                            <Input value={member.name?.[lang] || ""} onChange={(e) => handleTeamLocalizedChange(index, "name", lang as 'en'|'km', e.target.value)} placeholder="Full Name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("abt.role")} ({lang.toUpperCase()})</label>
                            <Input value={member.role?.[lang] || ""} onChange={(e) => handleTeamLocalizedChange(index, "role", lang as 'en'|'km', e.target.value)} placeholder="e.g. UX/UI Designer" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">{t("abt.desc")} ({lang.toUpperCase()})</label>
                          <ReactQuill theme="snow" value={member.description?.[lang] || ""} onChange={(val) => handleTeamLocalizedChange(index, "description", lang as 'en'|'km', val)} />
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 mt-2 w-1/3">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t("abt.displayOrder")}</label>
                      <Input type="number" name="display_order" value={member.display_order || 0} onChange={(e) => handleTeamChange(index, e)} className="w-20 text-center" />
                    </div>
                    <Button onClick={() => saveTeamMember(index)} size="sm" className="bg-rose-500 hover:bg-rose-600 shadow-sm transition-all duration-200 mt-2">
                      <Save className="w-4 h-4 mr-2" /> {t("abt.saveMember")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              {t("abt.noTeam")}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
