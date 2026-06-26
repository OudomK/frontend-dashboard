"use client";

import { useState, useEffect } from "react";
import { Save, X, Plus, ChevronRight, Settings } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  // Page Form States
  const [clinicName, setClinicName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [enableAutoDetection, setEnableAutoDetection] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [languagePreference, setLanguagePreference] = useState("Khmer & English (Auto-detect)");
  const [strictness, setStrictness] = useState("Strict (Only use uploaded Docs)");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [require2Fa, setRequire2Fa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  const [isLoading, setIsLoading] = useState(true);

  // Keyword Tags management state
  const [newTagInput, setNewTagInput] = useState("");

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/api/v1/settings/global");
      const data = res.data;
      setClinicName(data.clinic_name || "");
      setEmergencyPhone(data.emergency_phone || "");
      setTelegramLink(data.telegram_link || "");
      setEnableAutoDetection(data.enable_auto_detection || false);
      setKeywords(data.keywords || []);
      setEmergencyMessage(data.emergency_message || "");
      setLanguagePreference(data.language_preference || "Khmer & English (Auto-detect)");
      setStrictness(data.strictness || "Strict (Only use uploaded Docs)");
      setSystemPrompt(data.system_prompt || "");
      setRequire2Fa(data.require_2fa || false);
      setSessionTimeout(data.session_timeout || 30);
    } catch (error) {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddKeyword = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      toast.warning(`"${trimmed}" is already added.`);
      return;
    }
    setKeywords((prev) => [...prev, trimmed]);
    setNewTagInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    setKeywords((prev) => prev.filter((k) => k !== tagToRemove));
  };

  // Action: Reset all form fields by fetching from server again
  const handleDiscardChanges = () => {
    fetchSettings();
    toast.info("Settings reverted to saved configurations.");
  };

  // Action: Save and display confirmation toast
  const handleSaveChanges = async () => {
    const toastId = toast.loading("Saving changes...");
    try {
      const payload = {
        clinic_name: clinicName,
        emergency_phone: emergencyPhone,
        telegram_link: telegramLink,
        enable_auto_detection: enableAutoDetection,
        keywords: keywords,
        emergency_message: emergencyMessage,
        language_preference: languagePreference,
        strictness: strictness,
        system_prompt: systemPrompt,
        require_2fa: require2Fa,
        session_timeout: sessionTimeout
      };
      await apiClient.put("/api/v1/settings/global", payload);
      toast.dismiss(toastId);
      toast.success("System configurations updated successfully!");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to update settings.");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 pb-24 lg:pb-8">
        {/* Breadcrumbs & Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
          <div className="space-y-1">
            {/* Custom Breadcrumb matching screenshot exactly */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span>{t("chat.adminPanel")}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-600">{t("set.title")}</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
              {t("set.title")}
            </h1>
            <p className="text-sm text-slate-500 lg:text-base">
              {t("set.subtitle")}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDiscardChanges}
              className="h-10 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
            >
              {t("set.discard")}
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {t("set.save")}
            </Button>
          </div>
        </div>

        {/* Main Settings Card Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
          
          {/* Section 1: Clinic Contact Details */}
          <div className="p-6 lg:p-8 flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-1/3 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">{t("set.clinicDetailsTitle")}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                {t("set.clinicDetailsDesc")}
              </p>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">{t("set.clinicName")}</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder={t("set.clinicNamePlaceholder")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("set.emergencyPhone")}</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="e.g. +855 12 345 678"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("set.telegramLink")}</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <span className="flex items-center bg-slate-50 px-3 text-xs font-bold text-slate-400 border-r border-slate-200 select-none">
                      t.me/
                    </span>
                    <input
                      type="text"
                      value={telegramLink}
                      onChange={(e) => setTelegramLink(e.target.value)}
                      placeholder="telegram_handle"
                      className="h-11 flex-1 bg-white px-4 text-sm font-medium text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Detection */}
          <div className="p-6 lg:p-8 flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-1/3 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">{t("set.emergencyDetectionTitle")}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                {t("set.emergencyDetectionDesc")}
              </p>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-700">{t("set.enableAutoDetect")}</h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {t("set.enableAutoDetectDesc")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEnableAutoDetection(!enableAutoDetection)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableAutoDetection ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enableAutoDetection ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Keywords Tag Panel */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">{t("set.highRiskKeywords")}</label>
                <div className="flex flex-wrap gap-2 p-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white items-center focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  {keywords.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-slate-600 select-none transition-colors hover:border-slate-300"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(tag)}
                        className="p-0.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  
                  <div className="flex-1 flex items-center min-w-[150px]">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("set.typeAndEnter")}
                        className="h-8 w-full border-none outline-none text-sm font-medium text-slate-800 px-2 bg-transparent placeholder:text-slate-400"
                      />
                    {newTagInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {t("set.matchStrongly")}
                </p>
              </div>

              {/* Alert Message Textarea */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">{t("set.alertMessage")}</label>
                <textarea
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  placeholder={t("set.alertMessagePlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-xs text-slate-400 font-medium">
                  {t("set.alertMessageDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: AI Assistant Behavior */}
          <div className="p-6 lg:p-8 flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-1/3 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">{t("set.aiBehaviorTitle")}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                {t("set.aiBehaviorDesc")}
              </p>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("set.langPref")}</label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Khmer & English (Auto-detect)">Khmer & English (Auto-detect)</option>
                    <option value="Khmer Only">Khmer Only</option>
                    <option value="English Only">English Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("set.strictness")}</label>
                  <select
                    value={strictness}
                    onChange={(e) => setStrictness(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Strict (Only use uploaded Docs)">Strict (Only use uploaded Docs)</option>
                    <option value="Balanced (Fallback to generic model)">Balanced (Fallback to generic model)</option>
                    <option value="Flexible (Generate using general model)">Flexible (Generate using general model)</option>
                  </select>
                </div>
              </div>

              {/* Persona TextArea */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">{t("set.systemPrompt")}</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={t("set.systemPromptPlaceholder")}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security Settings */}
          <div className="p-6 lg:p-8 flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-1/3 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">{t("set.securityTitle")}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                {t("set.securityDesc")}
              </p>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              {/* Toggle 2FA */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-700">{t("set.require2fa")}</h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {t("set.require2faDesc")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRequire2Fa(!require2Fa)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    require2Fa ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      require2Fa ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Session Timeout */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">{t("set.sessionTimeout")}</label>
                <div className="w-full sm:w-1/2">
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value={15}>{t("set.min15")}</option>
                    <option value={30}>{t("set.min30")}</option>
                    <option value={60}>{t("set.hour1")}</option>
                    <option value={240}>{t("set.hour4")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
