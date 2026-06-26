"use client";

import { useState, useEffect } from "react";
import { apiClient, API_URL } from "@/lib/api-client";
import { Loader2, Pencil, Save, Plus, Trash2, Shield, HeartPulse, Building2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/use-translation";

export function AboutManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [savingClinic, setSavingClinic] = useState(false);
  const [clinic, setClinic] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

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
    setTeam([...team, { name: "", role: "", description: "", image_url: "", display_order: team.length + 1 }]);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t("abt.clinicName")}</label>
                <Input name="clinic_name" value={clinic.clinic_name || ""} onChange={handleClinicChange} placeholder="e.g. Bellyn Clinic" />
              </div>
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
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("abt.aboutText")}</label>
              <Textarea name="about_text" value={clinic.about_text || ""} onChange={handleClinicChange} rows={3} placeholder="Brief introduction about the clinic..." className="resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> {t("abt.mission")}
                </label>
                <Textarea name="mission" value={clinic.mission || ""} onChange={handleClinicChange} rows={3} placeholder="Our mission is..." className="resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" /> {t("abt.vision")}
                </label>
                <Textarea name="vision" value={clinic.vision || ""} onChange={handleClinicChange} rows={3} placeholder="Our vision is..." className="resize-none" />
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
                      <img src={member.image_url.startsWith('/uploads') ? `${API_URL}${member.image_url}` : member.image_url} alt={member.name} className="w-full h-full object-cover" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{t("abt.name")}</label>
                      <Input name="name" value={member.name || ""} onChange={(e) => handleTeamChange(index, e)} placeholder="Full Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{t("abt.role")}</label>
                      <Input name="role" value={member.role || ""} onChange={(e) => handleTeamChange(index, e)} placeholder="e.g. UX/UI Designer" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t("abt.desc")}</label>
                    <Textarea name="description" value={member.description || ""} onChange={(e) => handleTeamChange(index, e)} rows={2} placeholder="Brief bio..." className="resize-none" />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-3 w-1/3">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t("abt.displayOrder")}</label>
                      <Input type="number" name="display_order" value={member.display_order || 0} onChange={(e) => handleTeamChange(index, e)} className="w-20 text-center" />
                    </div>
                    <Button onClick={() => saveTeamMember(index)} size="sm" className="bg-rose-500 hover:bg-rose-600 shadow-sm transition-all duration-200">
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
    </div>
  );
}
