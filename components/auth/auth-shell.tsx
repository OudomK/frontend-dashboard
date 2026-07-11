"use client";

import Image from "next/image";

import { AuthVariant } from "./auth-types";
import { authContent } from "./auth-config";
import { LoginForm } from "./login-form";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/hooks/use-translation";

type Props = {
  variant: AuthVariant;
  children?: React.ReactNode;
};

export function AuthShell({ variant, children }: Props) {
  const content = authContent[variant];
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT/FIRST SIDE */}
        <div
          className={`
            relative flex items-center justify-center px-6 py-10 lg:px-16
            ${variant === "doctor" ? "order-1" : "order-2"}
          `}
        >
          <div className="absolute top-6 right-6">
            <LanguageSwitcher light />
          </div>
          {children ? children : <LoginForm variant={variant} />}
        </div>

        {/* HERO SECTION */}
        <div
          className={`
            relative hidden overflow-hidden lg:flex
            ${variant === "doctor" ? "order-2" : "order-1"}
          `}
        >
          <div className="absolute inset-0">
            <Image
              src={content.image}
              alt="Auth image"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-end lg:justify-between p-8 lg:p-16 text-white">
            {/* Logo removed and moved to login form */}

            {/* Bottom Text */}
            {(content.heroTitle || content.heroDescription) && (
              <div className="max-w-xl space-y-6">
                {content.heroTitle && (
                  <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                    {variant === "admin" ? (t("login.heroTitle.admin") as React.ReactNode) : content.heroTitle}
                  </h2>
                )}

                {content.heroDescription && (
                  <p className="text-lg lg:text-xl text-white/80">
                    {variant === "admin" ? (t("login.heroDescription.admin") as React.ReactNode) : content.heroDescription}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}