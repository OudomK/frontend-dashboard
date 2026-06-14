import Image from "next/image";

import { AuthVariant } from "./auth-types";
import { authContent } from "./auth-config";
import { LoginForm } from "./login-form";

type Props = {
  variant: AuthVariant;
};

export function AuthShell({ variant }: Props) {
  const content = authContent[variant];

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT/FIRST SIDE */}
        <div
          className={`
            flex items-center justify-center px-6 py-10 lg:px-16
            ${variant === "doctor" ? "order-1" : "order-2"}
          `}
        >
          <LoginForm variant={variant} />
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
          <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600" />

              <span className="text-2xl font-bold">
                {content.logoText}
              </span>
            </div>

            {/* Bottom Text */}
            <div className="max-w-xl space-y-6">
              <h2 className="text-5xl font-bold leading-tight">
                {content.heroTitle}
              </h2>

              <p className="text-xl text-white/80">
                {content.heroDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}