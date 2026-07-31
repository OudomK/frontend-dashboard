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
  Calendar,
  Briefcase,
  PenTool,
  ShieldCheck,
  Brain,
} from "lucide-react";

export type MenuItem = {
  label: string;
  permission?: string;
  icon?: any;
  href?: string;
  items?: MenuItem[];
};

export const doctorMenu: MenuItem[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        permission: "view_dashboard",
        icon: LayoutDashboard,
        href: "/doctor/dashboard",
      }
    ]
  },
  {
    label: "Medical Content",
    icon: BookOpen,
    items: [
      {
        label: "Articles & Posts",
        icon: Newspaper,
        href: "/doctor/articles",
      },
      {
        label: "Categories",
        permission: "manage_categories",
        icon: FolderTree,
        href: "/doctor/categories",
      },
      {
        label: "Manage FAQs",
        icon: MessageSquare,
        href: "/doctor/faqs",
      },
    ]
  },
  {
    label: "Brain AI",
    icon: Brain,
    items: [
      {
        label: "Knowledge Base",
        icon: BookOpen,
        href: "/doctor/documents",
      },
    ]
  },
  {
    label: "Alerts & Monitoring",
    icon: FileWarning,
    items: [
      {
        label: "Review AI Answers",
        icon: FileWarning,
        href: "/doctor/reviews",
      },
      {
        label: "Emergency Rules",
        permission: "manage_emergency_rules",
        icon: AlertTriangle,
        href: "/doctor/emergency-rules",
      },
    ]
  }
];

export const adminMenu: MenuItem[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        permission: "view_dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
      {
        label: "System Analytics",
        permission: "view_analytics",
        icon: Activity,
        href: "/admin/analytics",
      },
    ]
  },
  {
    label: "Operations & Clinic",
    icon: Briefcase,
    items: [
      {
        label: "Appointments",
        permission: "view_appointments",
        icon: Calendar,
        href: "/admin/appointments",
      },
      {
        label: "Push Notifications",
        permission: "manage_notifications",
        icon: Megaphone,
        href: "/admin/notifications",
      },
      {
        label: "System Audit Logs",
        permission: "view_audit_logs",
        icon: ShieldAlert,
        href: "/admin/audit-logs",
      },
    ]
  },
  {
    label: "Brain AI",
    icon: Brain,
    items: [
      {
        label: "Knowledge Base Docs",
        permission: "view_documents",
        icon: BookOpen,
        href: "/admin/documents",
      },
      {
        label: "AI Chat Logs",
        permission: "view_chat_logs",
        icon: MessageSquare,
        href: "/admin/chat-logs",
      },
    ]
  },
  {
    label: "Content Management",
    icon: PenTool,
    items: [
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
        label: "Banners Management",
        permission: "manage_system_settings",
        icon: Megaphone,
        href: "/admin/banners",
      },
      {
        label: "Static Pages",
        permission: "manage_system_settings",
        icon: BookOpen,
        href: "/admin/pages",
      },
    ]
  },
  {
    label: "Access Control",
    icon: Users,
    items: [
      {
        label: "User Management",
        permission: "manage_users",
        icon: Users,
        href: "/admin/users",
      },
      {
        label: "Role Management",
        permission: "manage_roles",
        icon: Users,
        href: "/admin/roles",
      },
      {
        label: "Permission Management",
        permission: "manage_roles",
        icon: ShieldCheck,
        href: "/admin/permissions",
      },
    ]
  },
  {
    label: "System Configuration",
    icon: Settings,
    items: [
      {
        label: "General Settings",
        permission: "manage_system_settings",
        icon: Settings,
        href: "/admin/settings",
      },
      {
        label: "Emergency Rules",
        permission: "manage_emergency_rules",
        icon: AlertTriangleIcon,
        href: "/admin/emergency-rules",
      },
      {
        label: "About Us",
        permission: "manage_about_us",
        icon: Info,
        href: "/admin/about",
      },
    ]
  }
];

export const adminSettingsItem = {
  label: "System Settings",
  permission: "manage_system_settings",
  icon: Settings,
  href: "/admin/settings",
};
