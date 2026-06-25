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
  Info
} from "lucide-react";

export const doctorMenu = [
  {
    label: "Dashboard",
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
    icon: FolderTree,
    href: "/doctor/categories",
  },
];

export const adminMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },

  {
    label: "System Audit Logs",
    icon: Activity,
    href: "/admin/audit-logs",
  },

  {
    label: "System Analytics",
    icon: ShieldAlert,
    href: "/admin/analytics",
  },

  {
    label: "Knowledge Base Docs",
    icon: BookOpen,
    href: "/admin/documents",
  },

  {
    label: "Emergency Rules",
    icon: AlertTriangleIcon,
    href: "/admin/emergency-rules",
  },

  {
    label: "Push Notifications",
    icon: Megaphone,
    href: "/admin/notifications",
  },

  {
    label: "AI Chat Logs",
    icon: MessageSquare,
    href: "/admin/chat-logs",
  },

  {
    label: "Health Articles",
    icon: Newspaper,
    href: "/admin/articles",
  },

  {
    label: "Categories",
    icon: FolderTree,
    href: "/admin/categories",
  },

  {
    label: "FAQ Management",
    icon: CircleHelp,
    href: "/admin/faqs",
  },

  {
    label: "User Management",
    icon: Users,
    href: "/admin/users",
  },

  {
    label: "About Us",
    icon: Info,
    href: "/admin/about",
  },
];

export const adminSettingsItem = {
  label: "System Settings",
  icon: Settings,
  href: "/admin/settings",
};
