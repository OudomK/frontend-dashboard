"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    setLoading(true);
    const loadingToastId = toast.loading("Sending reset link...");
    
    try {
      await apiClient.post("/api/v1/users/forgot-password", { email: email.trim() });
      toast.dismiss(loadingToastId);
      toast.success("Reset link sent! Please check your email.");
      setSuccess(true);
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.response?.data?.detail || error.message || "Failed to send reset link.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Check your email
          </h1>
          <p className="text-base text-slate-500 font-medium">
            We have sent a password reset link to <span className="font-medium text-slate-900">{email}</span>.
            Please check your inbox.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full h-12 text-base font-bold shadow-sm hover:shadow transition-all duration-300"
          onClick={() => router.push("/auth/admin-login")}
        >
          Return to login
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
          Forgot password?
        </h1>
        <p className="text-base text-slate-500 font-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              placeholder="admin@example.com"
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
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
