"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { AuthVariant } from "./auth-types";
import { authContent } from "./auth-config";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useTranslation } from "@/lib/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  variant: AuthVariant;
};

export function LoginForm({ variant }: Props) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password credentials.");
      return;
    }
    
    setLoading(true);
    
    try {
      const finalEmail = email.includes("@") ? email.trim() : `${email.trim()}@gmail.com`;
      await login(finalEmail, password, variant);
      
      setModalState({
        isOpen: true,
        type: "success",
        title: t("login.successTitle") as string,
        message: t("login.successMessage") as string
      });
      
      setTimeout(() => {
        if (variant === "unified" || variant === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/doctor/dashboard");
        }
      }, 1500);
      
    } catch (error: any) {
      setModalState({
        isOpen: true,
        type: "error",
        title: t("login.failedTitle") as string,
        message: error.message || "Please verify your credentials and try again."
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md text-center p-6 border-0 shadow-2xl rounded-2xl">
          <div className="flex justify-center mb-4 mt-2">
            {modalState.type === "success" ? (
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-slate-800">
              {modalState.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-slate-500 font-medium pt-2">
              {modalState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 sm:justify-center border-t-0 bg-transparent">
            {modalState.type === "error" && (
              <Button 
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className="w-full font-semibold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {t("login.tryAgain")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex justify-center mb-6">
        <div className="relative h-16 w-48 lg:h-20 lg:w-56">
          <Image
            src="/asset/logo-transparent.png"
            alt="Clinic Logo"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>

      <div className="space-y-3 text-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
          {variant === "unified" ? authContent.unified.title : (variant === "admin" ? t("login.title.admin") : t("login.title.doctor"))}
        </h1>

        <p className="text-sm lg:text-base text-slate-500 font-medium px-4">
          {variant === "unified" ? authContent.unified.subtitle : (variant === "admin" ? t("login.subtitle.admin") : t("login.subtitle.doctor"))}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("login.email")}
          </label>

          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 transition-all duration-300 hover:border-blue-400 overflow-hidden h-12">
            <div className="pl-3 flex items-center justify-center text-slate-400">
              <Mail className="h-4 w-4" />
            </div>

            <input
              type="text"
              placeholder={t("login.emailPlaceholder") as string}
              className="flex-1 h-full w-full bg-transparent border-none focus:outline-none px-3 text-sm text-slate-900 placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="px-4 text-slate-500 font-medium text-sm flex items-center justify-center bg-slate-100 h-full border-l border-slate-200">
              @gmail.com
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("login.password")}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />

            <label
              htmlFor="remember"
              className="text-sm text-slate-700"
            >
              {t("login.remember")}
            </label>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        {/* Submit */}
        <Button 
          className="h-12 w-full text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" 
          disabled={loading}
        >
          {loading ? t("login.authenticating") : (variant === "unified" ? authContent.unified.buttonText : (variant === "admin" ? t("login.button.admin") : t("login.button.doctor")))}
        </Button>
      </form>
    </div>
  );
}