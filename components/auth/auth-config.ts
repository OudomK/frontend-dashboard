import { AuthVariant } from "./auth-types";

export const authContent: Record<
  AuthVariant,
  {
    title: string;
    subtitle: string;
    buttonText: string;
    heroTitle: string;
    heroDescription: string;
    image: string;
    logoText: string;
  }
> = {
  admin: {
    title: "Welcome Back",
    subtitle: "Log in to the WomenHealth Admin Portal",
    buttonText: "Sign In to Dashboard",

    heroTitle: "Empowering Women's Health Care.",

    heroDescription:
      "Manage the knowledge base, review AI interactions, update health content, and oversee the emergency warning system from one central platform.",

    image: "/asset/image-login/admin-login.png",

    logoText: "WomenHealth Admin",
  },

  doctor: {
    title: "Welcome back, Doctor",

    subtitle:
      "Log in to your dashboard to manage clinic knowledge, review AI answers, and publish content.",

    buttonText: "Log in to Dashboard",

    heroTitle:
      "Empowering clinics to provide accurate 24/7 health guidance through doctor-approved AI knowledge.",

    heroDescription: "Aura Health Care Clinic Management Platform",

     image: "/asset/image-login/doctor-login.png",

    logoText: "Aura Health Care",
  },
};