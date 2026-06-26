import type { Metadata } from "next";
import { Inter, Kantumruy_Pro, Poppins, Suwannaphum } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["khmer"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const suwannaphum = Suwannaphum({
  variable: "--font-suwannaphum",
  subsets: ["khmer"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Women Health AI Portal",
  description: "Clinic administrative dashboard and doctor panel for managing emergency thresholds, FAQs, and AI diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${kantumruyPro.variable} ${poppins.variable} ${suwannaphum.variable} h-full antialiased`}
    >
      {/* <body className="min-h-full flex flex-col">{children}</body> */}
      <body>
  {children}
  <Toaster 
    richColors 
    position="top-right" 
    toastOptions={{
      className: 'rounded-2xl border-0 shadow-xl font-sans',
    }}
  />
</body>
    </html>
  );
}
