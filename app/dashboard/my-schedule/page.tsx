"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, Clock, User, CheckCircle, XCircle, 
  Stethoscope, CalendarDays, ClipboardList, Sparkles, ChevronDown
} from "lucide-react";
import { doctorApi } from "@/lib/api/doctor";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
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
  };
}

export default function MySchedulePage() {
  const { t, language } = useTranslation();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Format dates in Asia/Phnom_Penh timezone
  const formatTimezoneDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = language === "km" ? "km-KH" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        timeZone: "Asia/Phnom_Penh",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).format(date);
    } catch (e) {
      return t("mySchedule.unknownTime");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await doctorApi.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error(t("mySchedule.errLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelModal = (id: number) => {
    setSelectedAppointmentId(id);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedAppointmentId(null);
    setCancellationReason("");
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointmentId) return;
    setIsCancelling(true);
    
    try {
      await doctorApi.cancelMyAppointment(selectedAppointmentId, cancellationReason.trim() || undefined);
      toast.success(t("mySchedule.successCancel"));
      fetchAppointments();
      closeCancelModal();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("mySchedule.errCancel"));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout role="unified">
      <div className="min-h-screen bg-slate-50/50">
        <div className="px-4 pt-5 pb-28 md:px-6 lg:px-8 md:pb-10 max-w-5xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t("mySchedule.title")}
                </h1>
              </div>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed pl-11">
                {t("mySchedule.subtitle")}
              </p>
            </div>
          </div>

          {/* Main List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t("mySchedule.yourAppointments")}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t("mySchedule.allScheduledAndCompleted")}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shrink-0">
                {appointments.length} {t("mySchedule.total")}
              </span>
            </div>

            <div className="overflow-y-auto max-h-[680px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <span className="text-sm font-medium">{t("mySchedule.loading")}</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <ClipboardList className="w-12 h-12 mb-3 text-slate-200" />
                  <span className="text-sm font-medium text-slate-400">{t("mySchedule.noAppointments")}</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map(apt => {
                    const aptDate = new Date(apt.slot?.start_time);
                    const isPast = aptDate < new Date();

                    return (
                      <div key={apt.id} className={`px-4 py-4 sm:px-5 sm:py-5 hover:bg-slate-50/70 transition-colors ${isPast ? 'opacity-70' : ''}`}>
                        <div className="flex gap-3 sm:gap-4">
                          {/* Avatar */}
                          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                            {apt.user?.full_name?.charAt(0) || "U"}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                {apt.user?.full_name || t("mySchedule.unknownPatient")}
                              </h3>
                              <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                                apt.status === "SCHEDULED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                apt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-rose-50 text-rose-700 border-rose-200"
                              }`}>
                                {apt.status === "SCHEDULED" ? t("status.scheduled") : 
                                 apt.status === "COMPLETED" ? t("status.completed") : 
                                 apt.status === "CANCELLED" ? t("status.cancelled") : apt.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {apt.slot?.start_time ? formatTimezoneDate(apt.slot.start_time) : t("mySchedule.unknownTime")}
                              </span>
                            </div>

                            {apt.symptoms_description && (
                              <div className="mt-2.5 text-xs text-slate-700 bg-amber-50/70 px-3 py-2 rounded-lg border border-amber-100">
                                <span className="font-bold text-amber-700 block mb-0.5 uppercase tracking-wide text-[10px]">
                                  {t("mySchedule.symptomsNotes")}
                                </span>
                                <span className="line-clamp-2">{apt.symptoms_description}</span>
                              </div>
                            )}

                            {apt.status === "SCHEDULED" && !isPast && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => openCancelModal(apt.id)}
                                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 px-3 py-2 rounded-lg transition-all shadow-sm"
                                >
                                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{t("mySchedule.cancelBtn")}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={(open) => !open && closeCancelModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("mySchedule.cancelDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("mySchedule.cancelDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-sm font-medium">
                {t("mySchedule.cancelReasonLabel")}
              </label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={t("mySchedule.cancelReasonPlaceholder")!}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeCancelModal}
              disabled={isCancelling}
            >
              {t("mySchedule.keepAppointment")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? t("mySchedule.cancelling") : t("mySchedule.cancelDialogTitle")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
