"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, MessageSquare, Bot, UserRound, Clock, Archive } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isEmergency: boolean;
  sources: { title: string }[];
}

interface ChatSession {
  id: string;
  userId: string;
  patientName: string;
  patientInitials: string;
  patientAvatarGradient: string;
  category: string;
  lastMessageText: string;
  lastMessageTime: string;
  messagesCount: number;
  badgeType: "NORMAL" | "FLAGGED" | "EMERGENCY";
  duration: string;
  endedStatus: string;
  messages: ChatMessage[];
}

export default function AdminChatLogsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "EMERGENCY" | "FLAGGED" | "NORMAL">("ALL");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/api/v1/admin/chat-sessions");
      setSessions(res.data);
      setFilteredSessions(res.data);
      if (res.data.length > 0) {
        setSelectedSession(res.data[0]);
      }
    } catch (error) {
      toast.error("Failed to load chat sessions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = sessions;
    
    if (filterType !== "ALL") {
      result = result.filter(s => s.badgeType === filterType);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.patientName.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q) ||
        s.lastMessageText.toLowerCase().includes(q)
      );
    }
    
    setFilteredSessions(result);
  }, [searchQuery, filterType, sessions]);

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "EMERGENCY": return <ShieldAlert className="h-3 w-3" />;
      case "FLAGGED": return <AlertTriangle className="h-3 w-3" />;
      case "NORMAL": return <CheckCircle2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "EMERGENCY": return "bg-red-50 text-red-700 border-red-200";
      case "FLAGGED": return "bg-amber-50 text-amber-700 border-amber-200";
      case "NORMAL": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.8))] pb-20 md:pb-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0 select-none">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
              <span>Admin Panel</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-600">Chat & QA Logs</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Chat Logs</h1>
            <p className="text-sm text-slate-500">Review anonymized conversations and flagged AI responses.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchSessions}
              className="h-10 rounded-xl bg-white text-sm font-semibold border-slate-200 text-slate-700 shadow-sm"
            >
              Refresh Logs
            </Button>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          
          {/* Left Panel: Session List */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 space-y-4 shrink-0 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, name or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(["ALL", "EMERGENCY", "FLAGGED", "NORMAL"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      filterType === type 
                        ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-32 text-sm text-slate-400 font-medium">Loading sessions...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <MessageSquare className="h-8 w-8 text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No chat sessions found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedSession?.id === session.id
                        ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-500 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${session.patientAvatarGradient} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                          {session.patientInitials}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{session.patientName}</div>
                          <div className="text-[10px] font-medium text-slate-400">{session.id}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeClass(session.badgeType)}`}>
                        {getBadgeIcon(session.badgeType)}
                        <span>{session.badgeType}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2 font-medium">
                      {session.lastMessageText}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>{session.messagesCount} messages</span>
                      <span>{session.lastMessageTime}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Chat Viewer */}
          <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            {selectedSession ? (
              <>
                {/* Viewer Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${selectedSession.patientAvatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                      {selectedSession.patientInitials}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {selectedSession.patientName}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${getBadgeClass(selectedSession.badgeType)}`}>
                          {selectedSession.badgeType}
                        </span>
                      </h2>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1"><UserRound className="h-3 w-3" /> {selectedSession.userId}</span>
                        <span className="flex items-center gap-1"><Archive className="h-3 w-3" /> {selectedSession.endedStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30">
                  {selectedSession.messages.map((msg, idx) => {
                    const isAi = msg.sender === "ai";
                    return (
                      <div key={idx} className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                        <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                          isAi ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isAi ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                        </div>
                        <div className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                          <div className={`text-[10px] font-bold text-slate-400 mb-1 px-1`}>
                            {isAi ? "Bellyn AI" : selectedSession.patientName} • {msg.timestamp}
                          </div>
                          
                          <div className={`p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                            isAi 
                              ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none" 
                              : "bg-blue-600 text-white rounded-tr-none"
                          }`}>
                            {msg.text}
                          </div>

                          {/* Sources for AI */}
                          {isAi && msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.sources.map((src, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                                  Source: {src.title}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Emergency Flag for User Message */}
                          {!isAi && msg.isEmergency && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">
                              <ShieldAlert className="h-3 w-3" /> System Flagged Emergency
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Select a session</h3>
                <p className="text-sm font-medium text-slate-400 mt-1 max-w-xs">
                  Choose a chat session from the left panel to review the full conversation history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
