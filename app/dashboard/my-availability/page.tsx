"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, Clock, Plus, Trash2, CalendarDays, ClipboardList, Sparkles, ChevronDown, CheckCircle, Ban, RefreshCcw
} from "lucide-react";
import { doctorApi } from "@/lib/api/doctor";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { useTranslation } from "@/lib/hooks/use-translation";

interface AppointmentSlot {
  id: number;
  start_time: string;
  end_time: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
}

export default function MyAvailabilityPage() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useTranslation();
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genDate, setGenDate] = useState("");
  const [genStart, setGenStart] = useState("08:00");
  const [genEnd, setGenEnd] = useState("17:00");
  const [genInterval, setGenInterval] = useState("30");

  // Tab state for slots
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const data = await doctorApi.getMySlots();
      setSlots(data);
    } catch (err) {
      toast.error(t("myAvailability.errLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimezoneTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = language === "km" ? "km-KH" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        timeZone: "Asia/Phnom_Penh",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).format(date);
    } catch (e) {
      return t("mySchedule.unknownTime") || "Invalid time";
    }
  };

  const formatTimezoneDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = language === "km" ? "km-KH" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        timeZone: "Asia/Phnom_Penh",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return t("mySchedule.unknownTime") || "Invalid date";
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDate) {
      toast.error(t("myAvailability.pleaseSelectDate"));
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await doctorApi.generateMySlots({
        date: genDate,
        start_time: genStart,
        end_time: genEnd,
        interval_minutes: parseInt(genInterval)
      });
      
      toast.success(t("myAvailability.successGenerate").replace("{count}", res.slots_created.toString()));
      fetchSlots();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(detail || t("myAvailability.errGenerate"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await doctorApi.deleteMySlot(slotId);
      toast.success(t("myAvailability.successDelete"));
      fetchSlots();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(detail ? t(detail as any) : t("myAvailability.errDelete"));
    }
  };

  const handleBlockSlot = async (slotId: number) => {
    try {
      await doctorApi.blockMySlot(slotId);
      toast.success(t("myAvailability.successBlock"));
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("myAvailability.errBlock"));
    }
  };

  const handleReopenSlot = async (slotId: number) => {
    try {
      await doctorApi.reopenMySlot(slotId);
      toast.success(t("myAvailability.successReopen"));
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("myAvailability.errReopen"));
    }
  };

  return (
    <DashboardLayout role="unified">
      <div className="min-h-screen bg-slate-50/50">
        <div className="px-4 pt-5 pb-28 md:px-6 lg:px-8 md:pb-10 max-w-7xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t("myAvailability.title")}
                </h1>
              </div>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed pl-11">
                {t("myAvailability.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Generate form */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t("myAvailability.generateSlots")}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t("myAvailability.createNewAvailability")}</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateSlots} className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> {t("myAvailability.date")}
                    </label>
                    <input
                      type="date"
                      className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                      value={genDate}
                      onChange={(e) => setGenDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {t("myAvailability.startTime")}
                      </label>
                      <input
                        type="time"
                        className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                        value={genStart}
                        onChange={(e) => setGenStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {t("myAvailability.endTime")}
                      </label>
                      <input
                        type="time"
                        className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                        value={genEnd}
                        onChange={(e) => setGenEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {t("myAvailability.interval")}
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-[46px] pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none"
                        value={genInterval}
                        onChange={(e) => setGenInterval(e.target.value)}
                      >
                        <option value="15">{t("myAvailability.interval15")}</option>
                        <option value="30">{t("myAvailability.interval30")}</option>
                        <option value="60">{t("myAvailability.interval60")}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? t("myAvailability.generating") : <><Plus className="w-4 h-4" /> {t("myAvailability.generateSlots")}</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Existing Slots Panel */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{t("myAvailability.yourSlots")}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t("myAvailability.manageExisting")}</p>
                    </div>
                  </div>
                  
                  {/* Tab toggles */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "upcoming" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {t("myAvailability.upcoming")}
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "history" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {t("myAvailability.history")}
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[680px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                      <span className="text-sm font-medium">{t("myAvailability.loading")}</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <ClipboardList className="w-12 h-12 mb-3 text-slate-200" />
                      <span className="text-sm font-medium text-slate-400">{t("myAvailability.noSlotsFound")}</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {slots.filter(slot => {
                        const isPast = new Date(slot.start_time) < new Date();
                        return activeTab === "upcoming" ? !isPast : isPast;
                      }).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <span className="text-sm font-medium text-slate-400">
                            {activeTab === "upcoming" ? t("myAvailability.noUpcomingSlots") : t("myAvailability.noHistorySlots")}
                          </span>
                        </div>
                      ) : (
                        slots.filter(slot => {
                          const isPast = new Date(slot.start_time) < new Date();
                          return activeTab === "upcoming" ? !isPast : isPast;
                        }).map(slot => {
                          const isPast = new Date(slot.start_time) < new Date();
                          const isExpired = slot.status === "AVAILABLE" && isPast;

                          return (
                            <div key={slot.id} className={`px-4 py-4 sm:px-5 sm:py-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors ${isPast ? 'opacity-60 bg-slate-50' : ''}`}>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-slate-900">
                                    {formatTimezoneDate(slot.start_time)}
                                  </span>
                                  <span className="text-slate-500 text-sm">
                                    {formatTimezoneTime(slot.start_time)} - {formatTimezoneTime(slot.end_time)}
                                  </span>
                                </div>
                                <div>
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                                    isExpired ? "bg-slate-100 text-slate-500 border-slate-200" :
                                    slot.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    slot.status === "BOOKED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                    {isExpired ? t("myAvailability.expired") : 
                                     slot.status === "AVAILABLE" ? t("status.available") : 
                                     slot.status === "BOOKED" ? t("status.booked") : 
                                     slot.status === "BLOCKED" ? t("status.blocked") : slot.status}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {!isPast && slot.status === "AVAILABLE" && (
                                  <>
                                    <button onClick={() => handleBlockSlot(slot.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all" title={t("myAvailability.blockSlot")!}>
                                      <Ban className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all" title={t("myAvailability.deleteSlot")!}>
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {!isPast && slot.status === "BLOCKED" && (
                                  <button onClick={() => handleReopenSlot(slot.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all" title={t("myAvailability.reopenSlot")!}>
                                    <RefreshCcw className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
