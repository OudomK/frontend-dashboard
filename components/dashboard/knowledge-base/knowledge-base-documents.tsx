"use client";

import { ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

import {
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { UploadDocumentDialog } from "@/app/doctor/documents/upload-document-dialog";
import { ViewDocumentDialog } from "./view-document-dialog";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



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

type Role = "admin" | "doctor";

export interface DocAccount {
  id: number;
  name: string;
  type: string;
  size: string;
  author: string;
  date: string;
  status: string; // completed, processing, uploaded, failed
  active: boolean;
  categoryId?: number;
  categoryName?: string;
  icon: any;
  iconTone: string;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  if (normalized === "synced" || normalized === "completed") {
    return (
      <Badge className="rounded-md bg-emerald-600 px-2.5 text-xs font-bold uppercase text-white border-transparent">
        Synced
      </Badge>
    );
  }

  if (normalized === "processing" || normalized === "uploaded") {
    return (
      <Badge className="rounded-md bg-amber-500 px-2.5 text-xs font-bold uppercase text-slate-950 border-transparent">
        {normalized === "uploaded" ? "Uploaded" : "Processing"}
      </Badge>
    );
  }

  if (normalized === "failed") {
    return (
      <Badge className="rounded-md bg-red-600 px-2.5 text-xs font-bold uppercase text-white border-transparent">
        Failed
      </Badge>
    );
  }

  return (
    <Badge className="rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold uppercase text-slate-400">
      Inactive
    </Badge>
  );
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: any; tone: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 lg:mt-7 lg:text-4xl">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

export function KnowledgeBaseDocuments({ role }: { role: Role }) {
  const isAdmin = role === "admin";

  const [documents, setDocuments] = useState<DocAccount[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [categories, setCategories] = useState<any[]>([]);
  const [viewDocId, setViewDocId] = useState<number | null>(null);
  const [viewDocName, setViewDocName] = useState<string>("");

  const fetchDocuments = useCallback(async () => {
    setLoadingList(true);
    try {
      const [docRes, catRes] = await Promise.all([
        apiClient.get("/api/documents/"),
        apiClient.get("/api/v1/categories/")
      ]);

      const catMap = new Map<number, string>();
      catRes.data.forEach((c: any) => {
        catMap.set(c.id, c.name);
      });

      const mapped: DocAccount[] = docRes.data.map((doc: any) => {
        let sizeStr = "N/A";
        if (doc.file_type) {
          sizeStr = doc.file_type.toUpperCase() + " File";
        }

        const formattedDate = doc.created_at
          ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "N/A";

        let icon = File;
        let iconTone = "text-slate-500";
        if (doc.file_type === "pdf") {
          icon = FileText;
          iconTone = "text-red-500";
        } else if (doc.file_type === "docx") {
          icon = FileText;
          iconTone = "text-blue-500";
        } else if (doc.file_type === "xlsx") {
          icon = FileSpreadsheet;
          iconTone = "text-emerald-500";
        } else if (doc.file_type === "csv") {
          icon = File;
          iconTone = "text-violet-500";
        }

        return {
          id: doc.id,
          name: doc.title || doc.file_name,
          type: (doc.file_type || "txt").toUpperCase() + " Document",
          size: sizeStr,
          author: doc.uploader?.full_name || "Doctor",
          date: formattedDate,
          status: doc.status || "uploaded",
          active: doc.is_active || false,
          categoryId: doc.category_id,
          categoryName: doc.category_id ? catMap.get(doc.category_id) : "Uncategorized",
          icon,
          iconTone,
        };
      });

      setDocuments(mapped);
      setCategories(catRes.data || []);
    } catch (error: any) {
      toast.error(formatBackendError(error));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryId === "All" || doc.categoryId === selectedCategoryId;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && doc.active) ||
        (selectedStatus === "Inactive" && !doc.active) ||
        (selectedStatus === "Processing" && (doc.status === "processing" || doc.status === "uploaded")) ||
        (selectedStatus === "Failed" && doc.status === "failed");

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documents, searchQuery, selectedCategoryId, selectedStatus]);

  const computedStats = useMemo(() => {
    const total = documents.length;
    const active = documents.filter((d) => d.active && d.status === "completed").length;
    const processing = documents.filter((d) => d.status === "processing" || d.status === "uploaded").length;
    const failed = documents.filter((d) => d.status === "failed").length;

    return [
      {
        title: "Total Documents",
        value: total.toString(),
        icon: FileText,
        tone: "bg-blue-50 text-blue-600",
      },
      {
        title: "Active for AI",
        value: active.toString(),
        icon: RefreshCcw,
        tone: "bg-lime-100 text-lime-600",
      },
      {
        title: "Processing",
        value: processing.toString(),
        icon: RefreshCcw,
        tone: "bg-amber-100 text-amber-600",
      },
      {
        title: "Failed/Errors",
        value: failed.toString(),
        icon: File,
        tone: "bg-red-50 text-red-500",
      },
    ];
  }, [documents]);

  return (
    <DashboardLayout
      role={role}
      title={isAdmin ? "Knowledge Base Documents" : "Knowledge Base"}
      subtitle={
        isAdmin
          ? "View all clinic documents indexed in the AI knowledge base. Only doctors can upload documents."
          : "Upload and manage documents that support your clinic's AI answers."
      }
      actions={
        <>
          {isAdmin && (
            <Button variant="outline" className="h-10 rounded-md px-4">
              <RefreshCcw />
              Sync AI DB
            </Button>
          )}
          {!isAdmin && (
            <UploadDocumentDialog
              onUploadSuccess={fetchDocuments}
              trigger={
                <Button className="bg-blue-600 text-white">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              }
            />
          )}
        </>
      }
      
      
    >
      {/* Mobile Actions - Doctor only */}
{!isAdmin && (
  <div className="mb-4 flex gap-2 lg:hidden">
    <UploadDocumentDialog
      onUploadSuccess={fetchDocuments}
      trigger={
        <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload
        </Button>
      }
    />
  </div>
)}
      <div className="space-y-8">
        {isAdmin && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {computedStats.map((stat: any) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"> 
          {isAdmin ? (
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center lg:px-6 lg:py-5">
              <div className="relative w-full lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 rounded-md bg-slate-50 pl-10"
                  placeholder="Search by name, type, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-[180px]">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-10 rounded-md bg-white">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status: All" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <button className="border-b-2 border-blue-600 pb-3 text-sm font-semibold text-blue-700">
                  All Documents
                </button>
                <button className="pb-3 text-sm font-medium text-slate-400">
                  Needs Review
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-9 rounded-md">
                  <Filter />
                  Category
                </Button>
                <Button variant="outline" className="h-9 rounded-md">
                  Sort by: Date
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400">
                  <th className="px-6 py-4">{isAdmin ? "Document Name" : "Document Details"}</th>
                  {isAdmin && <th className="px-5 py-4">Size</th>}
                  <th className="px-5 py-4">Uploaded By</th>
                  <th className="px-5 py-4">Date Added</th>
                  <th className="px-5 py-4">{isAdmin ? "AI Status" : "Category"}</th>
                  {!isAdmin && <th className="px-5 py-4">AI Status</th>}
                  <th className="px-5 py-4">Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 5} className="py-12 text-center text-slate-400">
                      <p className="font-semibold">No documents found</p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((document: DocAccount) => {
                    const Icon = document.icon;

                    return (
                      <tr key={document.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Icon className={`h-5 w-5 ${document.iconTone}`} />
                            <div>
                              <p className="font-medium text-slate-950">{document.name}</p>
                              <p className="text-sm text-slate-400">{document.type}</p>
                            </div>
                          </div>
                        </td>
                        {isAdmin && <td className="px-5 py-4 text-slate-400">{document.size}</td>}
                        <td className="px-5 py-4 text-slate-950">{document.author}</td>
                        <td className="px-5 py-4 text-slate-400">{document.date}</td>
                        <td className="px-5 py-4">
                          {isAdmin ? (
                            <StatusBadge status={document.status} />
                          ) : (
                            <span className="text-slate-700">
                              {document.categoryName || "Uncategorized"}
                            </span>
                          )}
                        </td>
                        {!isAdmin && (
                          <td className="px-5 py-4">
                            <StatusBadge status={document.status} />
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <Switch
                            checked={document.active}
                            onCheckedChange={async (checked) => {
                              const action = checked ? "activate" : "deactivate";
                              const toastId = toast.loading(`${checked ? "Activating" : "Deactivating"} document...`);
                              try {
                                await apiClient.patch(`/api/documents/${document.id}/${action}`);
                                toast.dismiss(toastId);
                                toast.success(`Document ${checked ? "activated" : "deactivated"} successfully!`);
                                fetchDocuments();
                              } catch (error: any) {
                                toast.dismiss(toastId);
                                toast.error(formatBackendError(error));
                              }
                            }}
                            size="default"
                            className="data-checked:bg-emerald-600 data-unchecked:bg-slate-100"
                            aria-label={`Toggle ${document.name}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3 text-slate-400">
                            <button
                              aria-label={`View ${document.name}`}
                              className="transition hover:text-blue-600"
                              onClick={() => {
                                setViewDocId(document.id);
                                setViewDocName(document.name);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {/* Doctor-only: re-process and delete */}
                            {!isAdmin && (document.status === "uploaded" || document.status === "failed") && (
                              <button
                                onClick={async () => {
                                  const toastId = toast.loading("Processing document chunks and embeddings...");
                                  try {
                                    await apiClient.post(`/api/documents/${document.id}/process`);
                                    toast.dismiss(toastId);
                                    toast.success("Document chunked and embedded successfully!");
                                    fetchDocuments();
                                  } catch (error: any) {
                                    toast.dismiss(toastId);
                                    toast.error(formatBackendError(error));
                                  }
                                }}
                                title="Process Document"
                                className="transition hover:text-emerald-500"
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </button>
                            )}
                            {!isAdmin && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to delete ${document.name}?`)) return;
                                  const toastId = toast.loading("Deleting document...");
                                  try {
                                    await apiClient.delete(`/api/documents/${document.id}`);
                                    toast.dismiss(toastId);
                                    toast.success("Document deleted successfully!");
                                    fetchDocuments();
                                  } catch (error: any) {
                                    toast.dismiss(toastId);
                                    toast.error(formatBackendError(error));
                                  }
                                }}
                                aria-label={`Delete ${document.name}`}
                                className="transition hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {/* Mobile Cards */}
            <div className="space-y-3 p-3 lg:hidden bg-slate-50/50">
              {filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="font-semibold">No documents found</p>
                </div>
              ) : (
                filteredDocs.map((document: DocAccount) => {
                  const Icon = document.icon;

                  return (
                    <div
                      key={document.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`mt-1 h-5 w-5 shrink-0 ${document.iconTone}`} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">
                            {document.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {document.type} • {document.size}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            By {document.author} • {document.date}
                          </p>

                          <p className="mt-1.5 text-xs font-semibold text-slate-500">
                            Category: {document.categoryName || "Uncategorized"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={document.active}
                            onCheckedChange={async (checked) => {
                              const action = checked ? "activate" : "deactivate";
                              const toastId = toast.loading(`${checked ? "Activating" : "Deactivating"} document...`);
                              try {
                                await apiClient.patch(`/api/documents/${document.id}/${action}`);
                                toast.dismiss(toastId);
                                toast.success(`Document ${checked ? "activated" : "deactivated"} successfully!`);
                                fetchDocuments();
                              } catch (error: any) {
                                toast.dismiss(toastId);
                                toast.error(formatBackendError(error));
                              }
                            }}
                            aria-label={`Toggle ${document.name}`}
                          />
                          <span className="text-xs text-slate-500 font-semibold">Active</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={document.status} />

                          <button
                            aria-label={`View ${document.name}`}
                            className="rounded-lg p-2 hover:bg-slate-100 text-slate-400"
                            onClick={() => {
                              setViewDocId(document.id);
                              setViewDocName(document.name);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Doctor-only actions */}
                          {!isAdmin && (document.status === "uploaded" || document.status === "failed") && (
                            <button
                              onClick={async () => {
                                const toastId = toast.loading("Processing document chunks and embeddings...");
                                try {
                                  await apiClient.post(`/api/documents/${document.id}/process`);
                                  toast.dismiss(toastId);
                                  toast.success("Document chunked and embedded successfully!");
                                  fetchDocuments();
                                } catch (error: any) {
                                  toast.dismiss(toastId);
                                  toast.error(formatBackendError(error));
                                }
                              }}
                              title="Process Document"
                              className="rounded-lg p-2 hover:bg-slate-100 text-emerald-500"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </button>
                          )}

                          {!isAdmin && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to delete ${document.name}?`)) return;
                                const toastId = toast.loading("Deleting document...");
                                try {
                                  await apiClient.delete(`/api/documents/${document.id}`);
                                  toast.dismiss(toastId);
                                  toast.success("Document deleted successfully!");
                                  fetchDocuments();
                                } catch (error: any) {
                                  toast.dismiss(toastId);
                                  toast.error(formatBackendError(error));
                                }
                              }}
                              className="rounded-lg p-2 hover:bg-slate-100 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-400">Showing 1 to 6 of 142 documents</p>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 rounded-md text-slate-400">
                  Previous
                </Button>
                <Button variant="outline" className="h-8 rounded-md text-slate-950">
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <ViewDocumentDialog
        documentId={viewDocId}
        documentName={viewDocName}
        open={viewDocId !== null}
        onOpenChange={(open) => !open && setViewDocId(null)}
      />
    </DashboardLayout>
  );
}
