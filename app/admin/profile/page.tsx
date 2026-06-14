"use client";

import { useState, useRef } from "react";
import { Upload, X, ChevronRight, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";

// ─── Initial Default User Profile Seeds ──────────────────────────────────────

const defaultProfile = {
  firstName: "Thomas",
  lastName: "Anderson",
  email: "dr.anderson@clinic.com",
  phone: "+855 12 345 678",
  bio: "Obstetrics and Gynecology Specialist with 15 years of experience in women's health. Passionate about empowering women through accurate health education and care.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", // Default premium photo placeholder
  accountCreated: "March 12, 2023",
  status: "Active",
  role: "Super Admin",
};

export default function AdminProfilePage() {
  // Form input states
  const [firstName, setFirstName] = useState(defaultProfile.firstName);
  const [lastName, setLastName] = useState(defaultProfile.lastName);
  const [email, setEmail] = useState(defaultProfile.email);
  const [phone, setPhone] = useState(defaultProfile.phone);
  const [bio, setBio] = useState(defaultProfile.bio);

  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(defaultProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [require2Fa, setRequire2Fa] = useState(false);

  // Initializing initials based on first and last name
  const getInitials = () => {
    const f = firstName.charAt(0) || "";
    const l = lastName.charAt(0) || "";
    return (f + l).toUpperCase() || "TA";
  };

  // Upload photo handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success("Profile photo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    toast.success("Profile photo removed.");
  };

  // Reset form inputs (Cancel button)
  const handleCancelEdits = () => {
    setFirstName(defaultProfile.firstName);
    setLastName(defaultProfile.lastName);
    setEmail(defaultProfile.email);
    setPhone(defaultProfile.phone);
    setBio(defaultProfile.bio);
    toast.info("Changes discarded.");
  };

  // Persist edits (Save button)
  const handleSaveEdits = () => {
    if (!firstName || !lastName || !email) {
      toast.error("First Name, Last Name, and Email are required fields.");
      return;
    }
    toast.success("Personal information updated successfully!");
  };

  // Update password validation
  const handleUpdatePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill out both password input fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Security credentials updated successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("••••••••••••");
  };

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
                {avatar ? (
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
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Name & Title */}
              <h2 className="mt-4 text-lg font-bold text-slate-900 text-center">
                Dr. {firstName} {lastName}
              </h2>
              <p className="text-xs font-semibold text-slate-400 text-center mt-1">
                Medical Director & Admin
              </p>

              {/* Photo Actions */}
              <div className="w-full mt-6 space-y-2 select-none">
                <Button
                  onClick={handleUploadClick}
                  className="w-full h-10 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload New Photo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRemovePhoto}
                  disabled={!avatar}
                  className="w-full h-10 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  Remove Photo
                </Button>
              </div>

              {/* Divider & Meta details */}
              <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Account Created</span>
                  <span className="text-slate-700 font-semibold">{defaultProfile.accountCreated}</span>
                </div>
                
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-600 font-bold">{defaultProfile.status}</span>
                </div>

                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-400">Role</span>
                  <span className="text-slate-700 font-semibold">{defaultProfile.role}</span>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="h-10 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdits}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700"
                >
                  Save Changes
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
                  className="h-10 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Card C: Notifications & Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900">Notifications & Preferences</h3>
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
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailNotifications ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
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
                    onClick={() => setTelegramAlerts(!telegramAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      telegramAlerts ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        telegramAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 2FA Enable */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5 pr-4">
                    <h4 className="text-sm font-bold text-slate-700">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Add an extra layer of security to your admin account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequire2Fa(!require2Fa)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      require2Fa ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        require2Fa ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
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
