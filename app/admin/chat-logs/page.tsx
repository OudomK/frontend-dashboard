"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  Info,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Clock,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CitedSource {
  title: string;
  confidence?: number;
  snippet?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: CitedSource[];
  isEmergency?: boolean;
  emergencyInfo?: {
    title: string;
    description: string;
    phone: string;
    telegram: string;
  };
  systemAlert?: string;
}

interface ChatSession {
  id: string;
  userId: string;
  patientName: string;
  patientInitials: string;
  patientAvatarGradient: string;
  category: "Pregnancy" | "Menstruation" | "Emergency" | "Nutrition" | "Postpartum";
  lastMessageText: string;
  lastMessageTime: string;
  messagesCount: number;
  badgeType: "EMERGENCY" | "RESOLVED" | "NORMAL" | "FLAGGED";
  duration: string;
  endedStatus: string;
  messages: Message[];
}

const badgeStyles = {
  EMERGENCY: "bg-red-600 text-white border-transparent",
  RESOLVED: "bg-emerald-600 text-white border-transparent",
  NORMAL: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  FLAGGED: "bg-amber-500 text-white border-transparent",
};

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
      return `${field}: ${d.msg}`;
    }).join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error.response?.data?.message || error.message || "An error occurred";
}

export default function AdminChatLogsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Emergencies" | "Flagged">("All");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/v1/admin/chat-sessions");
      setSessions(response.data);
      if (response.data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(response.data[0].id);
      }
    } catch (error: any) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Actions
  const handleStatusChange = async (id: string, newBadge: ChatSession["badgeType"]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, badgeType: newBadge } : s))
    );
    toast.success(`Session audit badge updated to ${newBadge}`);
  };

  const handleExportLog = (session: ChatSession) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(session, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `ai_chat_log_${session.id.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Chat log of ${session.id} exported successfully!`);
  };

  // Filter Logic
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // 1. Search Query
      const matchesSearch =
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Tab selection
      let matchesTab = true;
      if (activeTab === "Emergencies") {
        matchesTab = s.badgeType === "EMERGENCY";
      } else if (activeTab === "Flagged") {
        matchesTab = s.badgeType === "FLAGGED";
      }

      return matchesSearch && matchesTab;
    });
  }, [sessions, searchQuery, activeTab]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  return (
    <DashboardLayout
      role="admin"
      title="AI Chat Logs"
      subtitle="Monitor user conversations with the AI Assistant, review clinical accuracy, and track emergency flags."
    >
      <div className="space-y-6 pb-20 lg:pb-0">
        
        {/* ── Main Workspace split view ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT PANEL: Chat sessions list */}
          <div className={`col-span-1 space-y-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden lg:col-span-4 lg:block ${selectedSessionId ? "hidden" : "block"}`}>
            
            {/* Search Input and Filter Icon Row */}
            <div className="p-4 border-b border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users, symptoms..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Custom Tab Panel */}
            <div className="flex border-b border-slate-100 bg-slate-50/20">
              {(["All", "Emergencies", "Flagged"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-all ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Scrollable list card */}
            <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-semibold">Loading chat logs...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">No logs found</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isSelected = session.id === selectedSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`relative cursor-pointer p-4 transition-all duration-150 ${
                        isSelected
                          ? "bg-blue-50/25 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? "text-blue-600" : "text-slate-900"}`}>
                          {session.id}
                        </span>
                        <Badge
                          className={`rounded-sm text-[9px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider select-none ${
                            badgeStyles[session.badgeType]
                          }`}
                        >
                          {session.badgeType}
                        </Badge>
                      </div>

                      <div className="mt-1">
                        <p className="text-xs text-slate-400 font-medium line-clamp-1 leading-relaxed">
                          {session.lastMessageText}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>{session.lastMessageTime}</span>
                        <span>{session.messagesCount} messages</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Transcript viewer */}
          <div className={`col-span-1 lg:col-span-8 lg:block ${selectedSessionId ? "block" : "hidden"}`}>
            {activeSession ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-[580px]">
                
                {/* Header info */}
                <div className="border-b border-slate-100 bg-white px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Mobile back trigger */}
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{activeSession.id}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        User ID: {activeSession.userId} • Status: {activeSession.endedStatus}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportLog(activeSession)}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      Export Log
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeSession.id, "FLAGGED")}
                      className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition-colors ${
                        activeSession.badgeType === "FLAGGED"
                          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Flag className="h-3.5 w-3.5 text-slate-500" />
                      Flag for Review
                    </button>
                  </div>
                </div>

                {/* Conversation Stream container with light grey background */}
                <div className="flex-1 bg-slate-50/50 overflow-y-auto p-6 space-y-6 max-h-[500px]">
                  
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                      Chat session details
                    </span>
                  </div>

                  {activeSession.messages.map((message) => {
                    const isUser = message.sender === "user";
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto" : "mr-auto"}`}
                      >
                        {/* Avatar block on Left for AI response */}
                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}

                        {/* Speech card block */}
                        <div className="space-y-3 flex-1">
                          
                          {/* Bubble body styling */}
                          <div
                            className={`px-4 py-3 text-sm leading-relaxed ${
                              isUser
                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none shadow-sm"
                            }`}
                          >
                            <p>{message.text}</p>
                          </div>

                          {/* Render Emergency banner details inside card */}
                          {!isUser && message.isEmergency && message.emergencyInfo && (
                            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                    {message.emergencyInfo.title}
                                  </p>
                                  <p className="text-xs leading-relaxed text-red-800">
                                    {message.emergencyInfo.description}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-red-200/40 text-xs text-red-700 font-semibold">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-red-600" />
                                  <span>Clinic Emergency:</span>
                                  <span className="text-red-900">{message.emergencyInfo.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Send className="h-3.5 w-3.5 text-red-600" />
                                  <span>Telegram Support:</span>
                                  <span className="text-red-900">{message.emergencyInfo.telegram}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Source block */}
                          {!isUser && message.sources && message.sources.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                              <span>Source:</span>
                              <span className="font-semibold text-slate-500 hover:underline cursor-pointer">
                                {message.sources[0].title}
                              </span>
                            </div>
                          )}

                          {/* System Alert block */}
                          {!isUser && message.systemAlert && (
                            <div className="py-2 text-center">
                              <p className="text-[11px] font-semibold text-slate-400 bg-slate-100/60 inline-block px-3 py-1 rounded-full border border-slate-200/50">
                                {message.systemAlert}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              <div className="h-[580px] rounded-2xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                  <Sparkles className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Select a Session</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-sm">
                  Select any historical chat session from the list on the left to examine detailed diagnostic transcripts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
