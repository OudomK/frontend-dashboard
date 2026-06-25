"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { AuthVariant } from "./auth-types";
import { authContent } from "./auth-config";
import { useAuthStore } from "@/lib/store/use-auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  variant: AuthVariant;
};

export function LoginForm({ variant }: Props) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const content = authContent[variant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password credentials.");
      return;
    }
    
    setLoading(true);
    const loginToastId = toast.loading(`Authenticating as ${variant === "admin" ? "Admin" : "Doctor"}...`);
    
    try {
      await login(email.trim(), password, variant);
      toast.dismiss(loginToastId);
      toast.success("Welcome back! Login successful.");
      
      if (variant === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/doctor/dashboard");
      }
    } catch (error: any) {
      toast.dismiss(loginToastId);
      toast.error(error.message || "Login failed. Please verify your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {content.title}
        </h1>

        <p className="text-base text-slate-500">
          {content.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="email"
              placeholder="doctor@clinic.com"
              className="h-12 pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10"
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
              Remember me for 30 days
            </label>
          </div>

          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <Button className="h-12 w-full text-base font-semibold" disabled={loading}>
          {loading ? "Authenticating..." : content.buttonText}
        </Button>
      </form>
    </div>
  );
}