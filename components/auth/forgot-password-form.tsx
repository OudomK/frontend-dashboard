"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/hooks/use-translation";

export function ForgotPasswordForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("forgot.noEmailError") as string);
      return;
    }
    
    setLoading(true);
    const loadingToastId = toast.loading(t("forgot.toastSending") as string);
    
    try {
      await apiClient.post("/api/v1/users/forgot-password", { 
        email: email.trim(),
        language: language
      });
      toast.dismiss(loadingToastId);
      toast.success(t("forgot.toastSuccess") as string);
      setSuccess(true);
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.response?.data?.detail || error.message || (t("forgot.toastError") as string));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            {t("forgot.successTitle") as React.ReactNode}
          </h1>
          <p className="text-base text-slate-500 font-medium">
            {t("forgot.successDesc1") as React.ReactNode}<span className="font-medium text-slate-900">{email}</span>{t("forgot.successDesc2") as React.ReactNode}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full h-12 text-base font-bold shadow-sm hover:shadow transition-all duration-300"
          onClick={() => router.push("/auth/login")}
        >
          {t("forgot.returnLogin") as React.ReactNode}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          {t("forgot.title") as React.ReactNode}
        </h1>
        <p className="text-base text-slate-500 font-medium">
          {t("forgot.subtitle") as React.ReactNode}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("forgot.emailLabel") as React.ReactNode}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              placeholder={t("forgot.emailPlaceholder") as string}
              className="h-12 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all duration-300 hover:border-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <Button 
          className="h-12 w-full text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" 
          disabled={loading}
        >
          {loading ? (t("forgot.sendingBtn") as React.ReactNode) : (t("forgot.sendLinkBtn") as React.ReactNode)}
        </Button>
      </form>
    </div>
  );
}
