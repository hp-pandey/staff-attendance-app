import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staff Attendance & Payroll",
  description: "Staff attendance and payroll management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-100">{children}</body>
    </html>
  );
}
