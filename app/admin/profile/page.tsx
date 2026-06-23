"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, ChevronRight, Check, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/use-auth-store";

// ─── Initial Default User Profile Seeds ──────────────────────────────────────

export default function AdminProfilePage() {
  const { updateAvatar, updateName } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Meta data
  const [accountCreated, setAccountCreated] = useState("");
  const [status, setStatus] = useState("Active");
  const [role, setRole] = useState("Admin");

  // Notification states (stubbed for now if not in backend schema)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [require2Fa, setRequire2Fa] = useState(false);

  // Load Profile from API
  const loadProfile = async () => {
    try {
      const res = await apiClient.get("/api/v1/users/me");
      const data = res.data;
      
      const nameParts = (data.full_name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setBio(data.medical_note || "");
      
      const avatarFullUrl = data.avatar_url 
        ? (data.avatar_url.startsWith('http') ? data.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${data.avatar_url}`) 
        : null;
      setAvatar(avatarFullUrl);

      if (data.created_at) {
        setAccountCreated(new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      }
      setStatus(data.status === "active" ? "Active" : data.status);
      setRole(data.role_id === 3 ? "Admin" : data.role_id === 2 ? "Doctor" : "User");

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Initializing initials based on first and last name
  const getInitials = () => {
    const f = firstName.charAt(0) || "";
    const l = lastName.charAt(0) || "";
    return (f + l).toUpperCase() || "AD";
  };

  // Upload photo handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadRes = await apiClient.post("/api/v1/uploads/image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        const fileUrl = uploadRes.data.file_url;
        
        // Save to profile
        await apiClient.put("/api/v1/users/profile", {
          avatar_url: fileUrl
        });

        const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${fileUrl}`;
        setAvatar(fullUrl);
        updateAvatar(fullUrl);
        
        toast.success("Profile photo updated successfully!");
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to upload image");
      } finally {
        setUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingAvatar(true);
      await apiClient.put("/api/v1/users/profile", { avatar_url: null });
      setAvatar(null);
      updateAvatar("");
      toast.success("Profile photo removed.");
    } catch (err: any) {
      toast.error("Failed to remove photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Reset form inputs (Cancel button)
  const handleCancelEdits = () => {
    loadProfile();
    toast.info("Changes discarded.");
  };

  // Persist edits (Save button)
  const handleSaveEdits = async () => {
    if (!firstName || !email) {
      toast.error("First Name and Email are required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const newFullName = `${firstName} ${lastName}`.trim();
      await apiClient.put("/api/v1/users/profile", {
        full_name: newFullName,
        phone: phone,
        medical_note: bio,
      });
      updateName(newFullName);
      toast.success("Personal information updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update password validation
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill out all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await apiClient.put("/api/v1/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success("Security credentials updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-full items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 pb-24 lg:pb-8">
        
        {/* Breadcrumb Header block */}
        <div className="space-y-1 select-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Admin Panel</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-600">Profile Settings</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Profile Settings
          </h1>
          <p className="text-sm text-slate-500 lg:text-base">
            Manage your account information and preferences.
          </p>
        </div>

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* 1. Left Profile Visual Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
              
              {/* Profile Avatar Container */}
              <div className="relative group mt-2">
                {uploadingAvatar ? (
                  <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-md">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : avatar ? (
                  <img
                    src={avatar}
                    alt={`${firstName} ${lastName}`}
                    className="h-28 w-28 rounded-full object-cover border border-slate-100 shadow-md transition-all duration-300 group-hover:opacity-90"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-md flex items-center justify-center text-3xl font-extrabold select-none">
                    {getInitials()}
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                />
              </div>

              {/* Name & Title */}
              <h2 className="mt-4 text-lg font-bold text-slate-900 text-center">
                {firstName} {lastName}
              </h2>
              <p className="text-xs font-semibold text-slate-400 text-center mt-1">
                Medical Director & {role}
              </p>

              {/* Photo Actions */}
              <div className="w-full mt-6 space-y-2 select-none">
                <Button
                  onClick={handleUploadClick}
                  disabled={uploadingAvatar}
                  className="w-full h-10 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload New Photo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRemovePhoto}
                  disabled={!avatar || uploadingAvatar}
                  className="w-full h-10 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  Remove Photo
                </Button>
              </div>

              {/* Divider & Meta details */}
              <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Account Created</span>
                  <span className="text-slate-700 font-semibold">{accountCreated || "N/A"}</span>
                </div>
                
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-600 font-bold">{status}</span>
                </div>

                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Role</span>
                  <span className="text-slate-700 font-semibold">{role}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Right Form Cards Block */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card A: Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bio / Specialty</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your background or specialization..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-50 pt-4 select-none">
                <Button
                  variant="ghost"
                  onClick={handleCancelEdits}
                  disabled={submitting}
                  className="h-10 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSaveEdits}
                  disabled={submitting}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Card B: Security Settings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900">Security Settings</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end border-t border-slate-50 pt-4 select-none">
                <Button
                  variant="outline"
                  onClick={handleUpdatePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="h-10 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>

            {/* Card C: Notifications & Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 opacity-70">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Notifications & Preferences</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {/* Email Notifications */}
                <div className="flex items-center justify-between pb-4 first:pt-0 pt-4">
                  <div className="space-y-0.5 pr-4">
                    <h4 className="text-sm font-bold text-slate-700">Email Notifications</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Receive system updates, daily reports, and alerts via email.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-blue-600 opacity-50`}
                  >
                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>

                {/* Telegram Notifications */}
                <div className="flex items-center justify-between pb-4 pt-4">
                  <div className="space-y-0.5 pr-4">
                    <h4 className="text-sm font-bold text-slate-700">Telegram Emergency Alerts</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Get urgent notifications directly to your connected Telegram account.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-blue-600 opacity-50`}
                  >
                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
