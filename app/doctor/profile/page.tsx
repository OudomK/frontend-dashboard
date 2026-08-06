"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Info,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Save,
  Shield,
  Smartphone,
  Upload,
  User,
  X,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { toast } from "sonner";
import { useRef } from "react";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

// ─── Input with optional leading icon ────────────────────────────────────────

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  icon: Icon,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          Icon ? "pl-10 pr-4" : "px-4"
        }`}
      />
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  accent = "blue",
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accent?: "blue" | "violet";
  children: React.ReactNode;
}) {
  const accentMap = {
    blue:   "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 lg:px-6">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="px-4 py-5 lg:px-6">{children}</div>
    </div>
  );
}

// ─── Security row ─────────────────────────────────────────────────────────────

function SecurityRow({
  icon: Icon,
  iconBg,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="truncate text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ─── Save toast ───────────────────────────────────────────────────────────────

function SaveToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl ring-1 ring-white/10 lg:bottom-8">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
        <Check className="h-3 w-3 text-white" />
      </div>
      Profile saved successfully
    </div>
  );
}

// ─── Profile hero card ────────────────────────────────────────────────────────

// ─── Profile hero card removed in favor of grid layout ───────────────

// ─── Change Password Modal ──────────────────────────────────────────────────────

function ChangePasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters, include upper & lower case, numbers, and symbols.");
      return;
    }

    setSaving(true);
    try {
      await apiClient.put("/api/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      onOpenChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new secure password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <FieldLabel>Current Password</FieldLabel>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>New Password</FieldLabel>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Confirm New Password</FieldLabel>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DoctorProfilePage() {
  const { t, language } = useTranslation();
  const { updateAvatar, updateName, logout } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [firstName,     setFirstName]    = useState("");
  const [lastName,      setLastName]     = useState("");
  const [title,         setTitle]        = useState("");
  const [email,         setEmail]        = useState("");
  const [phone,         setPhone]        = useState("");
  const [bio,           setBio]          = useState("");
  const [clinicName,    setClinicName]   = useState("");
  const [telegram,      setTelegram]     = useState("t.me/auraclinic_support");
  const [emergencyTel,  setEmergencyTel] = useState("+855 23 999 999");
  const [clinicAddress, setClinicAddress] = useState("");
  const [twoFA,         setTwoFA]        = useState(true);
  const [saved,         setSaved]        = useState(false);
  const [loading,       setLoading]      = useState(true);
  const [avatarUrl,     setAvatarUrl]    = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [fullImageOpen, setFullImageOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiClient.get("/api/v1/users/me");
        const p = res.data;
        const nameParts = (p.full_name || "").split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setTitle(p.specialization || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
        setBio(p.medical_note || "");
        setClinicName(p.hospital_name || "");
        setClinicAddress(p.address || "");
        
        if (p.avatar_url) {
          const fullUrl = p.avatar_url.startsWith("http")
            ? p.avatar_url
            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${p.avatar_url}`;
          setAvatarUrl(fullUrl);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    try {
      await apiClient.put("/api/v1/users/profile", {
        full_name: `${firstName} ${lastName}`.trim(),
        specialization: title,
        phone,
        medical_note: bio,
        hospital_name: clinicName,
        address: clinicAddress,
      });
      useAuthStore.getState().updateName(`${firstName} ${lastName}`.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB.");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post("/api/v1/uploads/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      let newAvatarUrl = res.data.file_url;
      if (!newAvatarUrl.startsWith("http")) {
        newAvatarUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${newAvatarUrl}`;
      }

      setAvatarUrl(newAvatarUrl);
      useAuthStore.getState().updateAvatar(newAvatarUrl);

      // Save to profile
      await apiClient.put("/api/v1/users/profile", {
        avatar_url: res.data.file_url, // store relative path in db
      });
      
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Failed to upload avatar", error);
      toast.error(error.response?.data?.detail || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingAvatar(true);
      await apiClient.put("/api/v1/users/profile", { avatar_url: null });
      setAvatarUrl("");
      useAuthStore.getState().updateAvatar("");
      toast.success("Photo removed successfully.");
    } catch (err: any) {
      toast.error("Failed to remove photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const f = firstName.charAt(0) || "";
    const l = lastName.charAt(0) || "";
    return (f + l).toUpperCase() || "DR";
  };

  const fields = [firstName, lastName, title, phone, bio, clinicName, telegram, emergencyTel, clinicAddress, avatarUrl];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex h-full min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="doctor"
      title={t("profile.title")}
      subtitle={t("profile.subtitle")}
      actions={
        <Button
          onClick={handleSave}
          className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      }
    >
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/gif, image/webp"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleAvatarUpload}
      />
      
      {/* Mobile save button */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all active:opacity-90"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 pb-12 lg:pb-0">
        {/* ── Left Column: Avatar & Overview ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
            
            {/* Avatar */}
            <div className="relative group mt-2">
              {uploadingAvatar ? (
                <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-md">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${firstName} ${lastName}`}
                  onClick={() => setFullImageOpen(true)}
                  className="h-28 w-28 rounded-full object-cover border border-slate-100 shadow-md transition-all duration-300 group-hover:opacity-90 cursor-pointer"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-md flex items-center justify-center text-3xl font-extrabold select-none">
                  {getInitials()}
                </div>
              )}
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 text-center">
              Dr. {firstName} {lastName}
            </h2>
            <p className="text-xs font-semibold text-slate-400 text-center mt-1">
              {title || "Specialization not set"}
            </p>

            <div className="w-full mt-6 space-y-2 select-none">
              <Button
                onClick={triggerAvatarUpload}
                disabled={uploadingAvatar}
                className="w-full h-10 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
              >
                <Upload className="mr-1.5 h-4 w-4" />
                Upload New
              </Button>
              <Button
                variant="outline"
                onClick={handleRemovePhoto}
                disabled={!avatarUrl || uploadingAvatar}
                className="w-full h-10 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Remove Picture
              </Button>
            </div>

            {/* Profile Completeness */}
            <div className="w-full mt-6 border-t border-slate-100 pt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Profile Completeness</span>
                <span className={`text-xs font-bold ${completeness >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                  {completeness}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness >= 80 ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            {/* Meta details */}
            <div className="w-full mt-6 space-y-3.5 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-400">Account Type</span>
                <span className="text-slate-700 font-semibold">Doctor</span>
              </div>
            </div>
          </div>

          {/* Last Saved */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Clock className="h-4 w-4 text-slate-500" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Last saved</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Just now</span>
          </div>

          {/* Logout Button */}
          <div className="w-full">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full h-11 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold shadow-sm transition-all ${language === "km" ? "font-kantumruy-pro" : ""}`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("nav.logout" as any)}
            </Button>
          </div>
        </div>

        {/* ── Right Column: Forms & Settings ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <SectionCard
            icon={User}
            title="Personal Information"
            subtitle="Shown to users when you publish content."
            accent="blue"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel required>First Name</FieldLabel>
                <TextInput value={firstName} onChange={setFirstName} placeholder="Sarah" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>Last Name</FieldLabel>
                <TextInput value={lastName} onChange={setLastName} placeholder="Jenkins" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Specialization</FieldLabel>
                <TextInput value={title} onChange={setTitle} placeholder="Gynecologist" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Phone Number</FieldLabel>
                <TextInput value={phone} onChange={setPhone} icon={Phone} placeholder="+855 12 345 678" type="tel" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Email Address</FieldLabel>
                <TextInput value={email} disabled icon={Mail} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Short Bio</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="Tell patients and colleagues about your experience…"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Visible on published articles</span>
                  <span className={`text-xs font-medium ${bio.length > 280 ? "text-amber-600" : "text-slate-400"}`}>
                    {bio.length}/300
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Clinic Contact Information */}
          <SectionCard
            icon={Building2}
            title="Clinic Contact Information"
            subtitle="Used by the AI Assistant to guide patients to your clinic during emergencies."
            accent="violet"
          >
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Info className="h-3 w-3 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800">AI Recommendation Notice</p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                  Keep your Telegram link and Emergency Phone accurate — the AI shares them automatically when it detects high-risk symptoms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Clinic / Hospital Name</FieldLabel>
                <TextInput value={clinicName} onChange={setClinicName} icon={Building2} />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Telegram Contact Link</FieldLabel>
                <TextInput value={telegram} onChange={setTelegram} placeholder="t.me/yourclinic" />
                <p className="mt-1 text-[11px] font-medium text-slate-400">For patient reception chat.</p>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Emergency Phone</FieldLabel>
                <TextInput value={emergencyTel} onChange={setEmergencyTel} icon={Phone} type="tel" />
                <p className="mt-1 text-[11px] font-medium text-slate-400">Dedicated urgent-care line.</p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Clinic Address</FieldLabel>
                <TextInput value={clinicAddress} onChange={setClinicAddress} icon={MapPin} />
              </div>
            </div>
          </SectionCard>

          {/* Security Settings */}
          <SectionCard
            icon={Shield}
            title="Security Settings"
            subtitle="Manage your account protection and active sessions."
            accent="blue"
          >
            <div className="divide-y divide-slate-100 -mx-4 lg:-mx-6 px-4 lg:px-6">
              <SecurityRow
                icon={KeyRound}
                iconBg="bg-slate-100 text-slate-600"
                title="Password"
                description="Manage your account password."
                action={
                  <button 
                    onClick={() => setPasswordModalOpen(true)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                  >
                    Update
                  </button>
                }
              />
              <SecurityRow
                icon={Smartphone}
                iconBg="bg-emerald-50 text-emerald-600"
                title="Two-Factor Auth"
                description={twoFA ? "Authenticator app enabled." : "Currently disabled."}
                action={
                  <Switch
                    checked={twoFA}
                    onCheckedChange={setTwoFA}
                    aria-label="Toggle 2FA"
                  />
                }
              />
            </div>
          </SectionCard>

          {/* Deactivate Account */}
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/50 shadow-sm transition-all hover:bg-red-50">
            <div className="border-b border-red-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-800">Deactivate Account</h3>
                  <p className="text-xs text-red-600 mt-0.5">Temporarily disable your doctor account.</p>
                </div>
              </div>
              <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm">
                Deactivate
              </button>
            </div>
          </div>

        </div>
      </div>

      <SaveToast visible={saved} />
      <ChangePasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
      
      {/* Full Image Dialog */}
      <Dialog open={fullImageOpen} onOpenChange={setFullImageOpen}>
        <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 flex justify-center items-center">
          <DialogTitle className="sr-only">Full Profile Picture</DialogTitle>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Full Profile Picture"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-sm rounded-2xl shadow-xl text-center">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <LogOut className="h-7 w-7" />
            </div>
            <DialogTitle className={`text-xl font-bold text-slate-900 text-center ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {t("nav.logoutConfirmTitle" as any)}
            </DialogTitle>
            <DialogDescription className={`text-slate-500 text-sm mt-1 text-center ${language === "km" ? "font-kantumruy-pro" : ""}`}>
              {t("nav.logoutConfirmDesc" as any)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className={`w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all ${language === "km" ? "font-kantumruy-pro" : ""}`}
            >
              {t("nav.logoutCancelBtn" as any)}
            </button>
            <button
              onClick={() => { logout(); setShowLogoutConfirm(false); }}
              className={`w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md shadow-red-200 ${language === "km" ? "font-kantumruy-pro" : ""}`}
            >
              {t("nav.logoutConfirmBtn" as any)}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
