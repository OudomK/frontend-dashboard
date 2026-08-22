"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Calendar, Clock, User, CheckCircle, XCircle, Plus, 
  Stethoscope, CalendarDays, ClipboardList, Loader2, Sparkles, QrCode, ChevronDown
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { useTranslation } from "@/lib/hooks/use-translation";
import { QRScanner } from "@/components/qr-scanner";
import { useAuthStore } from "@/lib/store/use-auth-store";

interface Doctor {
  id: number;
  user_id: number;
  specialty: string;
  user: { full_name: string };
}

interface Appointment {
  id: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  created_at: string;
  symptoms_description: string | null;
  chat_session_id: number | null;
  user: {
    full_name: string;
    email: string;
  };
  slot: {
    start_time: string;
    end_time: string;
    doctor: Doctor;
  };
}

export default function AdminAppointmentsPage() {
  const { t, language } = useTranslation();
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];
  const canCreate = permissions.includes("create_appointments");
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Slot Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genDoctorId, setGenDoctorId] = useState("");
  const [genDate, setGenDate] = useState("");
  const [genStart, setGenStart] = useState("08:00");
  const [genEnd, setGenEnd] = useState("17:00");
  const [genInterval, setGenInterval] = useState("30");

  const [activeTab, setActiveTab] = useState<"list" | "generate" | "scan">("list");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAppointments(), fetchDoctors()]);
    setIsLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/appointments/list");
      setAppointments(res.data);
    } catch (err) {
      toast.error("Failed to load appointments");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get("/api/v1/appointments/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to load doctors");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/appointments/${id}/status`, { status });
      toast.success(t("appointments.successStatusUpdate").replace("{status}", t(`status.${status.toLowerCase()}` as any) || status));
      fetchAppointments();
    } catch (err) {
      toast.error(t("appointments.errStatusUpdate"));
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDoctorId || !genDate) {
      toast.error(t("appointments.errSelectDoctorDate"));
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await apiClient.post("/api/v1/admin/appointments/slots/generate", {
        doctor_id: parseInt(genDoctorId),
        date: genDate,
        start_time: genStart,
        end_time: genEnd,
        interval_minutes: parseInt(genInterval)
      });
      
      const successMsg = t("appointments.generateSuccess").replace("{count}", res.data.slots_created.toString());
      toast.success(successMsg, {
        icon: "✨",
        style: {
          background: "#ECFDF5",
          color: "#065F46",
          border: "1px solid #34D399"
        }
      });
      
      setGenDate("");
      setActiveTab("list");
      fetchAppointments();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const isSlotExistError = detail === "Time slots already exist for this time period. No new slots were generated.";
      
      toast.error(isSlotExistError ? t("appointments.errSlotsExist") : (detail || t("appointments.errGenerateFailed")), {
        icon: "⚠️",
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #F87171"
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // decodedText could be "APT-123" or just "123"
      const idMatch = decodedText.match(/\d+/);
      if (!idMatch) {
        toast.error(t("appointments.errInvalidQr"));
        return;
      }
      
      const aptId = parseInt(idMatch[0]);
      await handleUpdateStatus(aptId, "COMPLETED");
      // Go back to list tab to see the updated status
      setActiveTab("list");
    } catch (err) {
      toast.error(t("appointments.errProcessQr"));
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-slate-50/50">
        {/* Page Container */}
        <div className="px-4 pt-5 pb-28 md:px-6 lg:px-8 md:pb-10 max-w-7xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t("appointments.title")}
                </h1>
              </div>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed pl-11">
                {t("appointments.subtitle")}
              </p>
            </div>

            {/* Desktop Tab Switcher — hidden on mobile */}
            <div className="hidden md:flex bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm shrink-0">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "list" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <ClipboardList className="w-4 h-4" /> {t("appointments.tabList")}
              </button>
              <button
                onClick={() => setActiveTab("scan")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "scan" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <QrCode className="w-4 h-4" /> {t("appointments.tabScan")}
              </button>
              {canCreate && (
                <button
                  onClick={() => setActiveTab("generate")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "generate" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Plus className="w-4 h-4" /> {t("appointments.tabGenerate")}
                </button>
              )}
            </div>

            {/* Mobile Tab Switcher — sticky bar below header */}
            <div className="flex md:hidden bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm w-full">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "list" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <ClipboardList className="w-3.5 h-3.5" /> {t("appointments.tabList")}
              </button>
              <button
                onClick={() => setActiveTab("scan")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "scan" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <QrCode className="w-3.5 h-3.5" /> {t("appointments.tabScan")}
              </button>
              {canCreate && (
                <button
                  onClick={() => setActiveTab("generate")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "generate" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Plus className="w-3.5 h-3.5" /> {t("appointments.tabGenerate")}
                </button>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* Left Panel: Generate Slots Form */}
            {canCreate && (
              <div className={`lg:col-span-4 ${activeTab !== "generate" ? "hidden lg:block" : "block"}`}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{t("appointments.generateSlots")}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t("appointments.createAvailability")}</p>
                    </div>
                  </div>

                  <form onSubmit={handleGenerateSlots} className="p-5 space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                        {t("appointments.selectDoctor")}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <select
                          className="w-full h-[46px] pl-10 pr-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                          value={genDoctorId}
                          onChange={(e) => setGenDoctorId(e.target.value)}
                          required
                        >
                          <option value="" disabled hidden>-- {t("appointments.select") || "Select Doctor"} --</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.user?.full_name || "Unknown"} • {d.specialty}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {t("appointments.date")}
                      </label>
                      <input
                        type="date"
                        className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm cursor-pointer"
                        value={genDate}
                        onChange={(e) => setGenDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" /> Start Time
                        </label>
                        <input
                          type="time"
                          className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm cursor-pointer"
                          value={genStart}
                          onChange={(e) => setGenStart(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" /> End Time
                        </label>
                        <input
                          type="time"
                          className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm cursor-pointer"
                          value={genEnd}
                          onChange={(e) => setGenEnd(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {t("appointments.interval") || "INTERVAL"}
                      </label>
                      <div className="relative">
                        <select
                          className="w-full h-[46px] pl-4 pr-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                          value={genInterval}
                          onChange={(e) => setGenInterval(e.target.value)}
                        >
                          <option value="15">15 Minutes</option>
                          <option value="30">30 Minutes</option>
                          <option value="60">60 Minutes</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("appointments.generating")}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {t("appointments.generate")}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Right Panel */}
            <div className={`${canCreate ? "lg:col-span-8" : "lg:col-span-12"} ${activeTab === "generate" ? "hidden lg:block" : "block"}`}>
              {activeTab === "scan" ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{t("appointments.scanQrTitle")}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t("appointments.scanQrDesc")}</p>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center bg-slate-50 min-h-[360px]">
                    <QRScanner onScanSuccess={handleScanSuccess} />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* List Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">{t("appointments.recentBookings")}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{t("appointments.allScheduled")}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shrink-0">
                      {appointments.length} {t("appointments.total")}
                    </span>
                  </div>

                  {/* List Body */}
                  <div className="overflow-y-auto max-h-[680px]">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                        <span className="text-sm font-medium">{t("appointments.loading")}</span>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <ClipboardList className="w-12 h-12 mb-3 text-slate-200" />
                        <span className="text-sm font-medium text-slate-400">{t("appointments.noAppointments")}</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {appointments.map(apt => (
                          <div key={apt.id} className="px-4 py-4 sm:px-5 sm:py-5 hover:bg-slate-50/70 transition-colors">
                            <div className="flex gap-3 sm:gap-4">
                              {/* Avatar */}
                              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                                {apt.user?.full_name?.charAt(0) || "U"}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                    {apt.user?.full_name || t("appointments.unknownUser")}
                                  </h3>
                                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                                    apt.status === "SCHEDULED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    apt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                    {apt.status === "COMPLETED" ? t("status.completed") : 
                                     apt.status === "CANCELLED" ? t("status.cancelled") : 
                                     apt.status === "SCHEDULED" ? t("status.scheduled") : apt.status}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  <span className="text-xs text-slate-600 font-medium flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                    <Stethoscope className="w-3 h-3 text-blue-500" />
                                    Dr. {apt.slot?.doctor?.user?.full_name || "Unknown"}
                                  </span>
                                  <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {apt.slot?.start_time ? new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-US", {
                                      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                                    }).format(new Date(apt.slot.start_time)) : t("mySchedule.unknownTime")}
                                  </span>
                                </div>

                                {apt.symptoms_description && (
                                  <div className="mt-2.5 text-xs text-slate-700 bg-amber-50/70 px-3 py-2 rounded-lg border border-amber-100">
                                    <span className="font-bold text-amber-700 block mb-0.5 uppercase tracking-wide text-[10px]">
                                      {t("appointments.symptomsNotes")}
                                    </span>
                                    <span className="line-clamp-2">{apt.symptoms_description}</span>
                                  </div>
                                )}

                                {apt.chat_session_id && (
                                  <button className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> {t("appointments.viewAiChat")}
                                  </button>
                                )}

                                {apt.status === "SCHEDULED" && (
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all shadow-sm"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{t("appointments.markCompleted")}</span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 px-3 py-2 rounded-lg transition-all shadow-sm"
                                    >
                                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{t("appointments.cancel")}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
