"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Shield,
  Stethoscope,
  BarChart3,
  Home
} from "lucide-react";

export function Navbar({ criticalCount: initialCount = 1 }: { criticalCount?: number }) {
  const pathname = usePathname();
  const [criticalCount, setCriticalCount] = useState(initialCount);

  useEffect(() => {
    fetch("/api/callbacks")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          const pending = data.tasks.filter((t: { status: string }) => t.status === "PENDING").length;
          setCriticalCount(pending);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/front-desk", label: "Front Desk", icon: Activity },
    { href: "/lis-import", label: "LIS Import", icon: FileSpreadsheet },
    {
      href: "/callbacks",
      label: "Critical Callbacks",
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeColor: "bg-rose-600 text-white animate-pulse"
    },
    { href: "/patient/login", label: "Patient OTP Portal", icon: UserCheck },
    { href: "/doctor", label: "Doctor Portal", icon: Stethoscope },
    { href: "/audit-logs", label: "DPDP Audit", icon: Shield },
    { href: "/operations", label: "Operations ROI", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Coastal Diagnostics</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Vijayawada
                </span>
              </div>
              <p className="text-xs text-slate-500">6 Labs • 38 Centres across Coastal AP</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative ${
                    isActive
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Reviewer / Demo Mode Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium">DPDP 2023 Compliant</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
