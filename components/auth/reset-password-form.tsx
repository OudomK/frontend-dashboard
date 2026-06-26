"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Missing reset token. Please check your email link.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    const loadingToastId = toast.loading("Resetting password...");
    
    try {
      await apiClient.post("/api/v1/users/reset-password", { 
        token: token,
        new_password: password
      });
      toast.dismiss(loadingToastId);
      toast.success("Password reset successfully!");
      setSuccess(true);
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.response?.data?.detail || error.message || "Failed to reset password.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Password Reset
          </h1>
          <p className="text-base text-slate-500 font-medium">
            Your password has been successfully reset. You can now login with your new password.
          </p>
        </div>
        <Button 
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          onClick={() => router.push("/auth/admin-login")}
        >
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Link 
        href="/auth/admin-login"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          Reset password
        </h1>
        <p className="text-base text-slate-500 font-medium">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              placeholder="••••••••"
              className="h-12 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all duration-300 hover:border-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              placeholder="••••••••"
              className="h-12 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all duration-300 hover:border-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button 
          className="h-12 w-full text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" 
          disabled={loading || !token}
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
