import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NotificationDrawer } from "@/components/NotificationDrawer";

export const metadata: Metadata = {
  title: "Coastal Diagnostics | Vijayawada Lab Report Delivery Portal",
  description: "Secure, DPDP Act 2023 compliant diagnostic report delivery portal for patients and referring doctors across coastal Andhra Pradesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <NotificationDrawer />
      </body>
    </html>
  );
}
