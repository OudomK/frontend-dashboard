"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { Loader2, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ViewDocumentDialog({
  documentId,
  documentName,
  open,
  onOpenChange,
}: {
  documentId: number | null;
  documentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [chunks, setChunks] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && documentId) {
      setLoading(true);
      setError("");
      setSearch("");
      setVersions([]);
      apiClient
        .get(`/api/documents/${documentId}/chunks`)
        .then((res) => {
          setChunks(res.data);
        })
        .catch((err) => {
          setError(err.response?.data?.detail || err.message || "Failed to load document content");
        })
        .finally(() => {
          setLoading(false);
        });
      // Version history (best-effort; a single-version doc just shows one row)
      apiClient
        .get(`/api/documents/${documentId}/versions`)
        .then((res) => setVersions(res.data || []))
        .catch(() => setVersions([]));
    } else {
      setChunks([]);
      setVersions([]);
    }
  }, [open, documentId]);

  const filteredChunks = chunks.filter((chunk) =>
    chunk.chunk_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {documentName}
          </DialogTitle>
        </DialogHeader>

        {versions.length > 1 && (
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Version history
            </p>
            <ul className="flex flex-col gap-1.5">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="font-semibold">v{v.version_no}</span>
                    <span className="truncate max-w-[280px] text-slate-500">{v.title}</span>
                    {v.id === documentId && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        viewing
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {v.is_active ? (
                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                        Superseded
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within document..."
            className="h-10 rounded-md bg-slate-50 pl-10"
            disabled={loading || chunks.length === 0}
          />
        </div>

        <div className="flex-1 mt-4 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/50 p-4">
          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin" />
              <p className="text-sm">Loading document content...</p>
            </div>
          ) : error ? (
            <div className="flex h-40 flex-col items-center justify-center text-red-500">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-slate-500">
              <p className="text-sm font-semibold">No content available.</p>
              <p className="text-xs">This document might not be processed yet.</p>
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-slate-500">
              <p className="text-sm font-semibold">No matches found.</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {filteredChunks.map((chunk) => (
                <div key={chunk.id} className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Page {chunk.page_number}</span>
                    <span>Chunk #{chunk.chunk_index + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {chunk.chunk_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
