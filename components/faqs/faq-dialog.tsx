"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion, Sparkles, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "@/lib/hooks/use-translation";
import type { Faq } from "./faq-management";

type Category = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: Faq | null;
  categories: Category[];
  onSuccess: () => void;
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
  if (typeof detail === "string") {
    return detail;
  }
  if (response?.data?.message) {
    return response.data.message;
  }
  return error instanceof Error ? error.message : "An error occurred";
}

export function FaqDialog({ open, onOpenChange, faq, categories, onSuccess }: Props) {
  const { t } = useTranslation();
  const isEdit = faq !== null;

  const [question, setQuestion] = useState<{ en: string; km: string }>({ en: "", km: "" });
  const [answer, setAnswer] = useState<{ en: string; km: string }>({ en: "", km: "" });
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateAll = async (currentTab: "en" | "km") => {
    const otherLang = currentTab === "en" ? "km" : "en";
    
    let sourceLang = otherLang;
    let targetLang = currentTab;

    if (!question[otherLang].trim() && !answer[otherLang].trim() && (question[currentTab].trim() || answer[currentTab].trim())) {
      sourceLang = currentTab;
      targetLang = otherLang;
    }

    const sourceQ = question[sourceLang];
    const sourceA = answer[sourceLang];

    if (!sourceQ.trim() && !sourceA.trim()) {
      toast.error(t("faqs.nothingToTranslate" as any));
      return;
    }

    setIsTranslating(true);
    const toastId = toast.loading(t("faqs.translating" as any));

    try {
      let transQ = question[targetLang];
      let transA = answer[targetLang];

      if (sourceQ.trim()) {
        const resQ = await apiClient.post("/api/v1/faqs/translate", {
          text: sourceQ,
          target_lang: targetLang
        });
        transQ = resQ.data.translated_text;
      }

      if (sourceA.trim()) {
        const resA = await apiClient.post("/api/v1/faqs/translate", {
          text: sourceA,
          target_lang: targetLang
        });
        transA = resA.data.translated_text;
      }

      setQuestion(prev => ({ ...prev, [targetLang]: transQ }));
      setAnswer(prev => ({ ...prev, [targetLang]: transA }));
      
      toast.success(t("faqs.translateSuccess" as any), { id: toastId });
    } catch (error) {
      console.error("Translation failed", error);
      toast.error(t("faqs.translateFailed" as any), { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  };

  // Sync form when faq changes
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (faq) {
        setQuestion({
          en: faq.question?.en || "",
          km: faq.question?.km || ""
        } as any);
        setAnswer({
          en: faq.answer?.en || "",
          km: faq.answer?.km || ""
        } as any);
        setCategoryId(faq.category_id ? faq.category_id.toString() : "");
        setIsActive(faq.is_active ?? true);
      } else {
        setQuestion({ en: "", km: "" });
        setAnswer({ en: "", km: "" });
        setCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
        setIsActive(true);
        setErrors({});
      }
    });
  }, [faq, open, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!question.km.trim() && !question.en.trim()) newErrors.question = true;
    if (!answer.km.trim() && !answer.en.trim()) newErrors.answer = true;
    if (!categoryId) newErrors.category = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("faqs.fillBoth" as any));
      return;
    }
    setErrors({});

    const toastId = toast.loading(isEdit ? t("faqs.saving" as any) : t("faqs.adding" as any));
    const payload = {
      question: {
        en: question.en.trim(),
        km: question.km.trim()
      },
      answer: {
        en: answer.en.trim(),
        km: answer.km.trim()
      },
      category_id: categoryId ? parseInt(categoryId) : null,
      is_active: isActive,
      display_order: faq?.display_order || 0
    };

    try {
      if (isEdit && faq) {
        await apiClient.put(`/api/v1/faqs/${faq.id}`, payload);
        toast.dismiss(toastId);
        toast.success(t("faqs.updatedSuccess" as any));
      } else {
        await apiClient.post("/api/v1/faqs/", payload);
        toast.dismiss(toastId);
        toast.success(t("faqs.createdSuccess" as any));
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(formatBackendError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-lg rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <MessageCircleQuestion className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {isEdit ? t("faqs.editTitle" as any) : t("faqs.addNew" as any)}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEdit
                  ? t("faqs.editDesc" as any)
                  : t("faqs.addDesc" as any)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-1 space-y-4">
          <Tabs defaultValue="km" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="km">Khmer 🇰🇭</TabsTrigger>
              <TabsTrigger value="en">English 🇬🇧</TabsTrigger>
            </TabsList>

            {["km", "en"].map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleTranslateAll(lang as 'en'|'km')}
                    disabled={isTranslating}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {t("faqs.autoTranslate" as any)}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t("faqs.questionLabel" as any)} ({lang.toUpperCase()}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={question[lang as 'en'|'km']}
                    onChange={(e) => { 
                      setQuestion({ ...question, [lang]: e.target.value }); 
                      if (errors.question) setErrors({ ...errors, question: false }); 
                    }}
                    placeholder={t("faqs.questionPlaceholder" as any)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.question ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {t("faqs.answerLabel" as any)} ({lang.toUpperCase()}) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={answer[lang as 'en'|'km']}
                    onChange={(e) => { 
                      setAnswer({ ...answer, [lang]: e.target.value }); 
                      if (errors.answer) setErrors({ ...errors, answer: false }); 
                    }}
                    placeholder={t("faqs.answerPlaceholder" as any)}
                    className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.answer ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              {t("faqs.category" as any)} <span className="text-red-500">*</span>
            </label>
            <Select
              value={categoryId}
              onValueChange={(val) => { setCategoryId(val); if (errors.category) setErrors({ ...errors, category: false }); }}
            >
              <SelectTrigger className={`h-10 w-full rounded-lg text-sm ${
                errors.category ? "border-red-500 ring-2 ring-red-100 bg-red-50" : "border-slate-200"
              }`}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t("faqs.publishFaq" as any)}</p>
              <p className="text-xs text-slate-500">
                {isActive
                  ? t("faqs.visibleDesc" as any)
                  : t("faqs.draftDesc" as any)}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle FAQ status"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-slate-200"
            >
              {t("faqs.cancel" as any)}
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? t("faqs.saveChanges" as any) : t("faqs.addNewFaqBtn" as any)}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
