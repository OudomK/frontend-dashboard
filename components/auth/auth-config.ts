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

    heroTitle: "Empowering Healthcare with AI.",

    heroDescription:
      "Access patient records, manage appointments, and utilize AI-driven diagnostic tools in one unified dashboard.",

    image: "/asset/image-login/admin-login.png",

    logoText: "WomenHealth Admin",
  },

  doctor: {
    title: "Welcome back, Doctor",

    subtitle:
      "Log in to your dashboard to manage clinic knowledge, review AI answers, and publish content.",

    buttonText: "Log in to Dashboard",

    heroTitle: "",

    heroDescription: "",

     image: "/asset/image-login/doctor-login.png",

    logoText: "Aura Health Care",
  },
  unified: {
    title: "Welcome Back",
    subtitle: "Log in to securely access tools, records, and insights based on your role and permissions.",
    buttonText: "Sign In",
    heroTitle: "Welcome to WomenHealth AI Portal",
    heroDescription: "Log in to securely access tools, records, and insights based on your role and permissions.",
    image: "/asset/image-login/admin-login.png",
    logoText: "WomenHealth AI",
  },
};