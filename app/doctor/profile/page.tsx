"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  Clock,
  Info,
  KeyRound,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Save,
  Shield,
  Smartphone,
  User,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { toast } from "sonner";
import { useRef } from "react";
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

function ProfileHero({
  firstName,
  lastName,
  title,
  avatarUrl,
  onAvatarUpload,
  uploadingAvatar,
}: {
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl: string;
  onAvatarUpload: () => void;
  uploadingAvatar: boolean;
}) {
  const displayAvatar = avatarUrl || "https://i.pravatar.cc/80?img=47";
  
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Gradient banner */}
      <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 lg:h-24" />

      {/* Mobile layout: centered */}
      <div className="block lg:hidden">
        <div className="flex flex-col items-center px-4 pb-5">
          {/* Avatar overlapping banner */}
          <div className="relative -mt-10">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white shadow-md bg-slate-100">
              <img
                src={displayAvatar}
                alt="Doctor Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={onAvatarUpload}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white hover:bg-blue-700 disabled:opacity-50"
              aria-label="Change avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          {/* Name & title */}
          <div className="mt-3 text-center">
            <h3 className="text-base font-bold text-slate-900">
              Dr. {firstName} {lastName}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{title}</p>
          </div>

          {/* Action row */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onAvatarUpload}
              disabled={uploadingAvatar}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading..." : "Change Avatar"}
            </button>
            <button className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 transition">
              Remove
            </button>
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            JPG, GIF or PNG, 1MB max.
          </p>
        </div>
      </div>

      {/* Desktop layout: row */}
      <div className="hidden lg:block px-6 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white shadow-md bg-slate-100">
              <img
                src={displayAvatar}
                alt="Doctor Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={onAvatarUpload}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white hover:bg-blue-700 disabled:opacity-50"
              aria-label="Change avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="mb-1 min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900">
              Dr. {firstName} {lastName}
            </h3>
            <p className="truncate text-sm text-slate-500">{title}</p>
          </div>

          <div className="mb-1 flex shrink-0 items-center gap-2">
            <button 
              onClick={onAvatarUpload}
              disabled={uploadingAvatar}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading..." : "Change Avatar"}
            </button>
            <button className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition">
              Remove
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          JPG, GIF or PNG, 1MB max.
        </p>
      </div>
    </div>
  );
}

// ─── Change Password Modal ──────────────────────────────────────────────────────

function ChangePasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
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
              <TextInput 
                type="password" 
                value={currentPassword} 
                onChange={setCurrentPassword} 
                placeholder="••••••••" 
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>New Password</FieldLabel>
              <TextInput 
                type="password" 
                value={newPassword} 
                onChange={setNewPassword} 
                placeholder="••••••••" 
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Confirm New Password</FieldLabel>
              <TextInput 
                type="password" 
                value={confirmPassword} 
                onChange={setConfirmPassword} 
                placeholder="••••••••" 
              />
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

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const fields = [firstName, lastName, title, phone, bio, clinicName, telegram, emergencyTel, clinicAddress, avatarUrl];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <DashboardLayout
      role="doctor"
      title="Doctor Profile"
      subtitle="Manage your personal information, clinic contact details, and account security."
      actions={
        <Button
          onClick={handleSave}
          className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
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
      {/* Mobile save button (DashboardLayout hides actions on mobile) */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:opacity-90"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/*
       * Two-column layout:
       *   - Mobile: single column, but RIGHT column is ordered BEFORE the forms
       *     so Security/Completeness appears near the top
       *   - Desktop: proper side-by-side grid
       */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* ── Left column (forms) — appears first on mobile ─── */}
        <div className="space-y-5">

          {/* Hero card */}
          <ProfileHero 
            firstName={firstName} 
            lastName={lastName} 
            title={title} 
            avatarUrl={avatarUrl}
            onAvatarUpload={triggerAvatarUpload}
            uploadingAvatar={uploadingAvatar}
          />

          {/* Personal Information */}
          <SectionCard
            icon={User}
            title="Personal Information"
            subtitle="Shown to users when you publish content."
            accent="blue"
          >
            <div className="space-y-4">
              {/* First / Last Name — always 2-col even on mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <TextInput value={firstName} onChange={setFirstName} placeholder="Sarah" />
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <TextInput value={lastName} onChange={setLastName} placeholder="Jenkins" />
                </div>
              </div>

              <div>
                <FieldLabel>Specialization</FieldLabel>
                <TextInput
                  value={title}
                  onChange={setTitle}
                  placeholder="E.g. Gynecologist, Clinic Owner"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  E.g. Medical Doctor, Clinic Owner, Gynecologist
                </p>
              </div>

              <div>
                <FieldLabel>Email Address</FieldLabel>
                <TextInput value={email} disabled icon={Mail} />
              </div>

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <TextInput
                  value={phone}
                  onChange={setPhone}
                  icon={Phone}
                  placeholder="+855 12 345 678"
                  type="tel"
                />
              </div>

              <div>
                <FieldLabel>Short Bio</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="Tell patients and colleagues about your experience…"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            {/* AI notice */}
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
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

            <div className="space-y-4">
              <div>
                <FieldLabel>Clinic / Hospital Name</FieldLabel>
                <TextInput value={clinicName} onChange={setClinicName} icon={Building2} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Telegram Contact Link</FieldLabel>
                  <TextInput value={telegram} onChange={setTelegram} placeholder="t.me/yourclinic" />
                  <p className="mt-1.5 text-xs text-slate-400">For patient reception chat.</p>
                </div>
                <div>
                  <FieldLabel>Emergency Phone</FieldLabel>
                  <TextInput value={emergencyTel} onChange={setEmergencyTel} icon={Phone} type="tel" />
                  <p className="mt-1.5 text-xs text-slate-400">Dedicated urgent-care line.</p>
                </div>
              </div>

              <div>
                <FieldLabel>Clinic Address</FieldLabel>
                <TextInput value={clinicAddress} onChange={setClinicAddress} icon={MapPin} />
              </div>
            </div>
          </SectionCard>

        </div>

        {/* ── Right column — appears second on mobile ─────────── */}
        <div className="space-y-4">

          {/* Profile Completeness */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Profile Completeness</p>
              <span className={`text-sm font-bold ${completeness >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                {completeness}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completeness >= 80 ? "bg-emerald-500" : "bg-amber-400"
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {completeness >= 80
                ? "Great — your profile is well filled."
                : "Fill in all fields for best AI accuracy."}
            </p>
          </div>

          {/* Security Settings */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Security Settings</h2>
                <p className="text-xs text-slate-500">Manage your account protection.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              <SecurityRow
                icon={KeyRound}
                iconBg="bg-slate-100 text-slate-600"
                title="Password"
                description="Manage your account password."
                action={
                  <button 
                    onClick={() => setPasswordModalOpen(true)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
              <SecurityRow
                icon={Monitor}
                iconBg="bg-blue-50 text-blue-600"
                title="Active Sessions"
                description="Logged in on 2 devices."
                action={
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                    Review
                  </button>
                }
              />
            </div>
          </div>

          {/* Last Saved */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Clock className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Last saved</p>
              <p className="text-xs text-slate-400">Today at 10:35 AM</p>
            </div>
          </div>

          {/* Deactivate Account */}
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/60 shadow-sm">
            <div className="border-b border-red-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                </div>
                <h3 className="text-sm font-bold text-red-700">Deactivate Account</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                Temporarily disable your doctor account. Published content stays visible.
              </p>
              <button className="w-full rounded-xl border border-red-300 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition active:opacity-80">
                Deactivate account
              </button>
            </div>
          </div>

        </div>
      </div>

      <SaveToast visible={saved} />
      <ChangePasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
    </DashboardLayout>
  );
}
