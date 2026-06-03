import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Staff Attendance & Payroll",
  description: "Staff attendance and payroll management system",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Staff Manager",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-100">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
