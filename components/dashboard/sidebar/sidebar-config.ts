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
  MessageCircle,
} from "lucide-react";

export type MenuItem = {
  label: string;
  permission?: string;
  icon?: any;
  href?: string;
  items?: MenuItem[];
};

export const unifiedMenu: MenuItem[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        permission: "view_dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/dashboard",
      },
      {
        label: "System Analytics",
        permission: "view_analytics",
        icon: Activity,
        href: "/dashboard/analytics",
      },
      {
        label: "My Profile",
        icon: Users,
        href: "/dashboard/profile",
      }
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
        href: "/dashboard/appointments",
      },
      {
        label: "Push Notifications",
        permission: "manage_notifications",
        icon: Megaphone,
        href: "/dashboard/notifications",
      },
      {
        label: "System Audit Logs",
        permission: "view_audit_logs",
        icon: ShieldAlert,
        href: "/dashboard/audit-logs",
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
        href: "/dashboard/documents",
      },
      {
        label: "AI Chat Logs",
        permission: "view_chat_logs",
        icon: MessageSquare,
        href: "/dashboard/chat-logs",
      },
      // {
      //   label: "Review AI Answers",
      //   permission: "review_ai_answers",
      //   icon: FileWarning,
      //   href: "/dashboard/reviews",
      // },
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
        href: "/dashboard/articles",
      },
      {
        label: "Categories",
        permission: "view_categories",
        icon: FolderTree,
        href: "/dashboard/categories",
      },
      {
        label: "FAQ Management",
        permission: "view_faqs",
        icon: CircleHelp,
        href: "/dashboard/faqs",
      },
      {
        label: "Banners Management",
        permission: "view_banners",
        icon: Megaphone,
        href: "/dashboard/banners",
      },
      // {
      //   label: "Static Pages",
      //   permission: "view_pages",
      //   icon: BookOpen,
      //   href: "/dashboard/pages",
      // },
    ]
  },
  {
    label: "Access Control",
    icon: Users,
    items: [
      {
        label: "User Management",
        permission: "view_users",
        icon: Users,
        href: "/dashboard/users",
      },
      {
        label: "Role Management",
        permission: "view_roles",
        icon: Users,
        href: "/dashboard/roles",
      },
      {
        label: "Permission Management",
        permission: "view_roles",
        icon: ShieldCheck,
        href: "/dashboard/permissions",
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
        href: "/dashboard/settings",
      },
      {
        label: "Emergency Rules",
        permission: "manage_emergency_rules",
        icon: AlertTriangleIcon,
        href: "/dashboard/emergency-rules",
      },
      {
        label: "About Us",
        permission: "manage_about_us",
        icon: Info,
        href: "/dashboard/about",
      },
    ]
  }
];
