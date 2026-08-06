"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/hooks/use-translation";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t("reset.invalidToken") as string);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error(t("reset.missingToken") as string);
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters, include upper & lower case, numbers, and symbols.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t("reset.passwordMatch") as string);
      return;
    }
    
    setLoading(true);
    const loadingToastId = toast.loading(t("reset.toastResetting") as string);
    
    try {
      await apiClient.post("/api/v1/users/reset-password", { 
        token: token,
        new_password: password
      });
      toast.dismiss(loadingToastId);
      toast.success(t("reset.toastSuccess") as string);
      setSuccess(true);
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.response?.data?.detail || error.message || (t("reset.toastError") as string));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            {t("reset.successTitle") as React.ReactNode}
          </h1>
          <p className="text-base text-slate-500 font-medium">
            {t("reset.successDesc") as React.ReactNode}
          </p>
        </div>
        <Button 
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          onClick={() => router.push("/auth/login")}
        >
          {t("reset.goToLogin") as React.ReactNode}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          {t("reset.title") as React.ReactNode}
        </h1>
        <p className="text-base text-slate-500 font-medium">
          {t("reset.subtitle") as React.ReactNode}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("reset.newPassword") as React.ReactNode}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all duration-300 hover:border-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("reset.confirmPassword") as React.ReactNode}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all duration-300 hover:border-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button 
          className="h-12 w-full text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" 
          disabled={loading || !token}
        >
          {loading ? (t("reset.resettingBtn") as React.ReactNode) : (t("reset.resetBtn") as React.ReactNode)}
        </Button>
      </form>
    </div>
  );
}
