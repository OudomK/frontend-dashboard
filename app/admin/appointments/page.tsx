"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Calendar, Clock, User, CheckCircle, XCircle, Plus, 
  Stethoscope, CalendarDays, ClipboardList, Loader2, Sparkles, QrCode
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
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];
  const isRootAdmin = user?.roleId === 3;
  const canCreate = isRootAdmin || permissions.includes("create_appointments");
  
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
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDoctorId || !genDate) {
      toast.error("Please select a doctor and date");
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
      toast.success(res.data.message);
      setGenDate("");
      setActiveTab("list");
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate slots");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // decodedText could be "APT-123" or just "123"
      const idMatch = decodedText.match(/\d+/);
      if (!idMatch) {
        toast.error("Invalid QR Code format");
        return;
      }
      
      const aptId = parseInt(idMatch[0]);
      await handleUpdateStatus(aptId, "COMPLETED");
      // Go back to list tab to see the updated status
      setActiveTab("list");
    } catch (err) {
      toast.error("Failed to process QR code");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-blue-600" />
              {t("appointments.title")}
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
              {t("appointments.subtitle")}
            </p>
          </div>
          
          {/* Mobile Tabs */}
          <div className="flex md:hidden bg-white p-1 rounded-xl shadow-sm border border-slate-200 mt-4">
            <button 
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {t("appointments.recentBookings")}
            </button>
            <button 
              onClick={() => setActiveTab("scan")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'scan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Scan QR
            </button>
            {canCreate && (
              <button 
                onClick={() => setActiveTab("generate")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'generate' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {t("appointments.generateSlots")}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Actions (Hidden on mobile if list tab active) */}
          <div className={`lg:col-span-4 space-y-6 ${activeTab === 'list' ? 'hidden md:block' : 'block'}`}>
            
            {/* Action Buttons for Desktop */}
            <div className="hidden md:flex gap-3 mb-6">
              <button 
                onClick={() => setActiveTab("list")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                <ClipboardList className="w-5 h-5" />
                List
              </button>
              <button 
                onClick={() => setActiveTab("scan")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'scan' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                <QrCode className="w-5 h-5" />
                Scan QR
              </button>
              {canCreate && (
                <button 
                  onClick={() => setActiveTab("generate")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'generate' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <Plus className="w-5 h-5" />
                  Generate
                </button>
              )}
            </div>

            {canCreate && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t("appointments.generateSlots")}</h2>
                  <p className="text-sm text-slate-500 font-medium">{t("appointments.createAvailability")}</p>
                </div>
              </div>

              <form onSubmit={handleGenerateSlots} className="p-6 md:p-8 space-y-5">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {t("appointments.selectDoctor")}
                  </label>
                  <select 
                    className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm py-3"
                    value={genDoctorId}
                    onChange={(e) => setGenDoctorId(e.target.value)}
                    required
                  >
                    <option value="">{t("appointments.select")}</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.user?.full_name || "Unknown"} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {t("appointments.date")}
                  </label>
                  <input 
                    type="date"
                    className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm py-3"
                    value={genDate}
                    onChange={(e) => setGenDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                    <input 
                      type="time"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm py-3"
                      value={genStart}
                      onChange={(e) => setGenStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                    <input 
                      type="time"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm py-3"
                      value={genEnd}
                      onChange={(e) => setGenEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t("appointments.interval")}
                  </label>
                  <select 
                    className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm py-3"
                    value={genInterval}
                    onChange={(e) => setGenInterval(e.target.value)}
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("appointments.generating")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {t("appointments.generate")}
                    </>
                  )}
                </button>
              </form>
            </div>
            )}
          </div>

          {/* Right Column: Appointments List or Scanner (Hidden on mobile if generate tab active) */}
          <div className={`lg:col-span-8 ${activeTab === 'generate' ? 'hidden md:block' : 'block'}`}>
            {activeTab === 'scan' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Scan Patient QR Code</h2>
                      <p className="text-xs text-slate-500 font-medium">Point your camera at the patient's invoice QR</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50">
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t("appointments.recentBookings")}</h2>
                    <p className="text-xs text-slate-500 font-medium">{t("appointments.allScheduled")}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                  {appointments.length} {t("appointments.total")}
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto min-h-[400px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <span className="font-medium">{t("appointments.loading")}</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                    <ClipboardList className="w-12 h-12 mb-3 text-slate-200" />
                    <span className="font-medium text-slate-500">{t("appointments.noAppointments")}</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto p-4 md:p-6 space-y-4">
                    {appointments.map(apt => (
                      <div key={apt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                              {apt.user?.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{apt.user?.full_name || "Unknown User"}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-sm text-slate-600 font-medium flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Dr. {apt.slot?.doctor?.user?.full_name || "Unknown"}
                                </span>
                                <span className="text-sm text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" /> 
                                  {apt.slot?.start_time ? format(new Date(apt.slot.start_time), "MMM dd, yyyy • hh:mm a") : "Unknown time"}
                                </span>
                              </div>
                              
                              {apt.symptoms_description && (
                                <div className="mt-4 text-sm text-slate-700 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/50">
                                  <span className="font-bold text-amber-800 block mb-1 text-xs uppercase tracking-wider">{t("appointments.symptomsNotes")}</span>
                                  {apt.symptoms_description}
                                </div>
                              )}

                              {apt.chat_session_id && (
                                <button className="mt-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg border border-purple-200 transition-colors shadow-sm flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5" /> View AI Chat History
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm border ${
                              apt.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                              'bg-rose-100 text-rose-700 border-rose-200'
                            }`}>
                              {apt.status === 'COMPLETED' ? t("appointments.completed") : apt.status === 'CANCELLED' ? t("appointments.cancelled") : apt.status}
                            </span>

                            {apt.status === 'SCHEDULED' && (
                              <div className="flex items-center gap-2 mt-auto">
                                <button 
                                  onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                                  className="text-emerald-600 bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all font-semibold text-sm flex items-center gap-1.5 shadow-sm hover:shadow"
                                >
                                  <CheckCircle className="w-4 h-4" /> {t("appointments.markCompleted")}
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                                  className="text-rose-600 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all font-semibold text-sm flex items-center gap-1.5 shadow-sm hover:shadow"
                                >
                                  <XCircle className="w-4 h-4" /> {t("appointments.cancel")}
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
    </DashboardLayout>
  );
}
