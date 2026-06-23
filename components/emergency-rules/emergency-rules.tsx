"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api-client";

type Role = "doctor" | "admin";
type Severity = "warning" | "urgent" | "critical";

type Category = {
  id: number;
  name: string;
};

type EmergencyRule = {
  id: number;
  name: string;
  category_id: number | null;
  keyword_pattern: string;
  severity_level: Severity;
  advice_text: string;
  clinic_contact_id: number | null;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
};

type RuleForm = {
  name: string;
  category_id: string;
  keyword_pattern: string;
  severity_level: Severity;
  advice_text: string;
  is_active: boolean;
};

const EMPTY_FORM: RuleForm = {
  name: "",
  category_id: "none",
  keyword_pattern: "",
  severity_level: "urgent",
  advice_text: "",
  is_active: true,
};

const severityStyles: Record<Severity, string> = {
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  urgent: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

function formatBackendError(error: unknown): string {
  const response = error && typeof error === "object" && "response" in error
    ? (error as { response?: { data?: { detail?: unknown; message?: string } } }).response
    : undefined;
  const detail = response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((d) => {
      const item = d as { loc?: string[]; msg?: string };
      const field = item.loc && item.loc.length > 0 ? item.loc[item.loc.length - 1] : "field";
      return `${field}: ${item.msg ?? "Invalid value"}`;
    }).join(", ");
  }

  if (typeof detail === "string") return detail;
  if (response?.data?.message) return response.data.message;
  return error instanceof Error ? error.message : "An error occurred";
}

function splitKeywords(pattern: string) {
  return pattern
    .split(/[,\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function StatusToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
      <span className={`text-sm font-semibold ${checked ? "text-emerald-700" : "text-slate-400"}`}>
        {checked ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

export function EmergencyRules({ role = "doctor" }: { role?: Role }) {
  const isAdmin = role === "admin";
  const [rules, setRules] = useState<EmergencyRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EmergencyRule | null>(null);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, categoriesRes] = await Promise.all([
        apiClient.get("/api/v1/emergency-rules/"),
        apiClient.get("/api/v1/categories/"),
      ]);
      setRules((rulesRes.data || []) as EmergencyRule[]);
      setCategories((categoriesRes.data || []) as Category[]);
    } catch (error: unknown) {
      toast.error(formatBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rules;

    return rules.filter((rule) => {
      const category = rule.category_id ? categoryMap.get(rule.category_id) ?? "" : "";
      return [rule.name, rule.keyword_pattern, rule.advice_text, rule.severity_level, category]
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [rules, search, categoryMap]);

  const openCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (rule: EmergencyRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      category_id: rule.category_id ? String(rule.category_id) : "none",
      keyword_pattern: rule.keyword_pattern,
      severity_level: rule.severity_level,
      advice_text: rule.advice_text,
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const saveRule = async () => {
    if (!form.name.trim() || !form.keyword_pattern.trim() || !form.advice_text.trim()) {
      toast.error("Name, trigger keywords, and advice text are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id === "none" ? null : Number(form.category_id),
      keyword_pattern: form.keyword_pattern.trim(),
      severity_level: form.severity_level,
      advice_text: form.advice_text.trim(),
      clinic_contact_id: null,
    };

    setSaving(true);
    const toastId = toast.loading(editingRule ? "Updating emergency rule..." : "Creating emergency rule...");
    try {
      let savedRule: EmergencyRule;
      if (editingRule) {
        const res = await apiClient.put(`/api/v1/emergency-rules/${editingRule.id}`, payload);
        savedRule = res.data as EmergencyRule;
      } else {
        const res = await apiClient.post("/api/v1/emergency-rules/", payload);
        savedRule = res.data as EmergencyRule;
      }

      if (savedRule.is_active !== form.is_active) {
        const action = form.is_active ? "activate" : "deactivate";
        await apiClient.patch(`/api/v1/emergency-rules/${savedRule.id}/${action}`);
      }

      toast.dismiss(toastId);
      toast.success(editingRule ? "Emergency rule updated." : "Emergency rule created.");
      setDialogOpen(false);
      await fetchData();
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (rule: EmergencyRule, checked: boolean) => {
    const action = checked ? "activate" : "deactivate";
    const toastId = toast.loading(`${checked ? "Activating" : "Deactivating"} rule...`);
    try {
      await apiClient.patch(`/api/v1/emergency-rules/${rule.id}/${action}`);
      toast.dismiss(toastId);
      toast.success(`Rule ${checked ? "activated" : "deactivated"}.`);
      await fetchData();
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  };

  const deleteRule = async (rule: EmergencyRule) => {
    if (!confirm(`Delete emergency rule "${rule.name}"?`)) return;

    const toastId = toast.loading("Deleting emergency rule...");
    try {
      await apiClient.delete(`/api/v1/emergency-rules/${rule.id}`);
      toast.dismiss(toastId);
      toast.success("Emergency rule deleted.");
      await fetchData();
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  };

  return (
    <DashboardLayout
      role={role}
      title="Emergency Rules"
      subtitle="Configure medical guidance and alert messages for high-risk symptoms."
      actions={
        <Button onClick={openCreate} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      }
    >
      <section className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-900">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Emergency protocol rules affect AI safety responses.</p>
            <p className="mt-0.5 text-sm text-orange-800">
              Keep triggers specific and advice direct. Admin changes apply to future high-risk chat detection.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configured Emergency Protocols</h2>
            <p className="text-sm text-slate-500">{rules.length} total rules</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rules or symptoms..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading emergency rules...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center m-4">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 shadow-inner">
              <ShieldAlert className="h-10 w-10 text-blue-500/60" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">No emergency rules found</h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
              Create rules to automatically alert doctors and provide instant guidance for high-risk symptoms.
            </p>
            <Button
              onClick={openCreate}
              className="h-10 gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" /> New Rule
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Rule</th>
                    <th className="px-5 py-4">Triggers</th>
                    <th className="px-5 py-4">Advice</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => {
                    const category = rule.category_id ? categoryMap.get(rule.category_id) ?? "Uncategorized" : "Uncategorized";
                    return (
                      <tr key={rule.id} className="border-t border-slate-100 align-top hover:bg-slate-50/70">
                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900">{rule.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{category}</p>
                          <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${severityStyles[rule.severity_level]}`}>
                            {rule.severity_level}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex max-w-sm flex-wrap gap-2">
                            {splitKeywords(rule.keyword_pattern).map((keyword) => (
                              <span key={keyword} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <p className="max-w-md rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                            {rule.advice_text}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <StatusToggle checked={rule.is_active} disabled={false} onChange={(checked) => toggleRule(rule, checked)} />
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" disabled={false} onClick={() => openEdit(rule)}>
                              <Pencil className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled={false} onClick={() => deleteRule(rule)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredRules.map((rule) => {
                const category = rule.category_id ? categoryMap.get(rule.category_id) ?? "Uncategorized" : "Uncategorized";
                return (
                  <div key={rule.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{rule.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{category}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${severityStyles[rule.severity_level]}`}>
                        {rule.severity_level}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {splitKeywords(rule.keyword_pattern).map((keyword) => (
                        <span key={keyword} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                      {rule.advice_text}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <StatusToggle checked={rule.is_active} disabled={false} onChange={(checked) => toggleRule(rule, checked)} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={false} onClick={() => openEdit(rule)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" disabled={false} onClick={() => deleteRule(rule)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-2xl rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Emergency Rule" : "Create Emergency Rule"}</DialogTitle>
            <DialogDescription>
              Define trigger keywords and the guidance the AI should show for high-risk symptoms.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rule Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ectopic pregnancy suspected"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <Select value={form.category_id} onValueChange={(value) => setForm((current) => ({ ...current, category_id: value }))}>
                  <SelectTrigger className="h-10 rounded-lg border-slate-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Severity</label>
                <Select value={form.severity_level} onValueChange={(value) => setForm((current) => ({ ...current, severity_level: value as Severity }))}>
                  <SelectTrigger className="h-10 rounded-lg border-slate-200">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active Rule</p>
                  <p className="text-xs text-slate-500">Use for future AI detection</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Trigger Keywords</label>
              <textarea
                value={form.keyword_pattern}
                onChange={(event) => setForm((current) => ({ ...current, keyword_pattern: event.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="severe abdominal pain, shoulder pain, heavy bleeding"
              />
              <p className="text-xs text-slate-400">Separate keywords with commas, line breaks, or pipes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">AI Advice Text</label>
              <textarea
                value={form.advice_text}
                onChange={(event) => setForm((current) => ({ ...current, advice_text: event.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Seek immediate emergency medical care..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveRule} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingRule ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
