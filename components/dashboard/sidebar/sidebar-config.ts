import {
  AlertTriangle,
  BookOpen,
  CircleHelp,
  FolderTree,
  FileWarning,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldAlert,
  Users,
  Megaphone,
  AlertTriangle as AlertTriangleIcon,
  Activity,
  Info,
  Calendar
} from "lucide-react";

export const doctorMenu = [
  {
    label: "Dashboard",
    permission: "view_dashboard",
    icon: LayoutDashboard,
    href: "/doctor/dashboard",
  },

  {
    label: "Knowledge Base",
    icon: BookOpen,
    href: "/doctor/documents",
  },

  {
    label: "Emergency Rules",
    permission: "manage_emergency_rules",
    icon: AlertTriangle,
    href: "/doctor/emergency-rules",
  },

  {
    label: "Review AI Answers",
    icon: FileWarning,
    href: "/doctor/reviews",
  },

  {
    label: "Articles & Posts",
    icon: Newspaper,
    href: "/doctor/articles",
  },

  {
    label: "Manage FAQs",
    icon: MessageSquare,
    href: "/doctor/faqs",
  },

  {
    label: "Categories",
    permission: "manage_categories",
    icon: FolderTree,
    href: "/doctor/categories",
  },
];

export const adminMenu = [
  {
    label: "Dashboard",
    permission: "view_dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },

  {
    label: "Appointments",
    permission: "view_appointments",
    icon: Calendar,
    href: "/admin/appointments",
  },
  {
    label: "System Audit Logs",
    permission: "view_audit_logs",
    icon: Activity,
    href: "/admin/audit-logs",
  },

  {
    label: "System Analytics",
    permission: "view_analytics",
    icon: ShieldAlert,
    href: "/admin/analytics",
  },

  {
    label: "Knowledge Base Docs",
    permission: "view_documents",
    icon: BookOpen,
    href: "/admin/documents",
  },

  {
    label: "Emergency Rules",
    permission: "manage_emergency_rules",
    icon: AlertTriangleIcon,
    href: "/admin/emergency-rules",
  },

  {
    label: "Push Notifications",
    permission: "manage_notifications",
    icon: Megaphone,
    href: "/admin/notifications",
  },

  {
    label: "AI Chat Logs",
    permission: "view_chat_logs",
    icon: MessageSquare,
    href: "/admin/chat-logs",
  },

  {
    label: "Health Articles",
    permission: "view_articles",
    icon: Newspaper,
    href: "/admin/articles",
  },

  {
    label: "Categories",
    permission: "manage_categories",
    icon: FolderTree,
    href: "/admin/categories",
  },

  {
    label: "FAQ Management",
    permission: "manage_faqs",
    icon: CircleHelp,
    href: "/admin/faqs",
  },

  {
    label: "User Management",
    permission: "manage_users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Roles & Permissions",
    permission: "manage_roles",
    icon: ShieldAlert,
    href: "/admin/roles",
  },

  {
    label: "About Us",
    permission: "manage_about_us",
    icon: Info,
    href: "/admin/about",
  },
  {
    label: "Static Pages",
    permission: "manage_system_settings",
    icon: BookOpen,
    href: "/admin/pages",
  },
  {
    label: "Banners Management",
    permission: "manage_system_settings",
    icon: Megaphone,
    href: "/admin/banners",
  },
];

export const adminSettingsItem = {
  label: "System Settings",
    permission: "manage_system_settings",
  icon: Settings,
  href: "/admin/settings",
};
