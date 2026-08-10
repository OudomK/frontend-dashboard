"use client";

import { useState } from "react";
import { Send, Megaphone, Users, UserRound, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "patients" | "doctors">("all");
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error(t("notif.fillBoth"));
      return;
    }

    const toastId = toast.loading(t("notif.sending"));
    setIsSending(true);

    try {
      let roleId = null;
      if (targetAudience === "patients") roleId = 1;
      if (targetAudience === "doctors") roleId = 2;

      await apiClient.post("/api/v1/admin/notifications/broadcast", {
        title: title.trim(),
        body: body.trim(),
        target_role_id: roleId,
      });

      toast.success(t("notif.success"), { id: toastId });
      setTitle("");
      setBody("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("notif.failed"), { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 pb-24 lg:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
              {t("notif.title")}
            </h1>
            <p className="text-sm text-slate-500 lg:text-base">
              {t("notif.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t("notif.compose")}</h2>
                  <p className="text-xs text-slate-500 font-medium">{t("notif.composeDesc")}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("notif.notifTitle")}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("notif.notifTitlePlaceholder")}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t("notif.notifBody")}</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t("notif.notifBodyPlaceholder")}
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="text-sm font-bold text-slate-700">{t("notif.target")}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setTargetAudience("all")}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        targetAudience === "all"
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${targetAudience === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${targetAudience === "all" ? "text-blue-900" : "text-slate-700"}`}>{t("notif.everyone")}</div>
                        <div className="text-xs font-medium text-slate-500">{t("notif.everyoneDesc")}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTargetAudience("patients")}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        targetAudience === "patients"
                          ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${targetAudience === "patients" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${targetAudience === "patients" ? "text-purple-900" : "text-slate-700"}`}>{t("notif.patients")}</div>
                        <div className="text-xs font-medium text-slate-500">{t("notif.patientsDesc")}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTargetAudience("doctors")}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        targetAudience === "doctors"
                          ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${targetAudience === "doctors" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${targetAudience === "doctors" ? "text-teal-900" : "text-slate-700"}`}>{t("notif.doctors")}</div>
                        <div className="text-xs font-medium text-slate-500">{t("notif.doctorsDesc")}</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleSendBroadcast}
                    disabled={isSending}
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t("notif.sendNow")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t("notif.preview")}</h3>
              <div className="relative mx-auto w-[260px] rounded-[32px] border-[6px] border-slate-800 bg-white shadow-xl overflow-hidden h-[450px]">
                {/* Status Bar Fake */}
                <div className="h-6 w-full bg-white flex justify-between items-center px-4 pt-1">
                  <div className="text-[10px] font-medium text-black">9:41</div>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-black"></div>
                    <div className="h-2 w-3 rounded-full bg-black"></div>
                  </div>
                </div>
                
                {/* iOS Notification Style Fake */}
                <div className="mt-4 px-3 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-100 p-3 flex gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[11px] font-bold text-slate-900">Bellyn Clinic</span>
                        <span className="text-[10px] font-medium text-slate-500">{t("notif.now")}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {title || t("notif.previewTitle")}
                      </div>
                      <div className="text-xs font-medium text-slate-600 leading-snug line-clamp-2 mt-0.5">
                        {body || t("notif.previewBody")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
