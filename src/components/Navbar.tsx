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
import { ThemeToggle } from "./ThemeToggle";

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
    { href: "/", label: "Overview", icon: Home },
    { href: "/front-desk", label: "Front Desk", icon: Activity },
    { href: "/lis-import", label: "LIS Import", icon: FileSpreadsheet },
    {
      href: "/callbacks",
      label: "Critical",
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : undefined,
    },
    { href: "/patient/login", label: "Patient OTP", icon: UserCheck },
    { href: "/doctor", label: "Doctors", icon: Stethoscope },
    { href: "/audit-logs", label: "DPDP Audit", icon: Shield },
    { href: "/operations", label: "Operations", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title with Kanso Geometric Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-8 h-8 rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5"></circle>
                <path d="M12 3v18"></path>
                <path d="M16 8l-4 4 4 4"></path>
              </svg>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight text-[var(--ink)]">
                  Coastal<span className="font-normal italic">Diagnostics</span>
                </span>
                <span className="kanso-pill font-mono text-[9px] py-0 px-1.5">
                  VIJAYAWADA
                </span>
              </div>
              <span className="text-[10px] text-[var(--ink-muted)] tracking-wide">
                6 Labs <span className="ampersand">&amp;</span> 38 Collection Centres
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[var(--surface)] p-1 rounded-full border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[var(--accent-crimson)] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/patient/login"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--ink)] text-xs font-semibold shadow-[var(--shadow-sm)] transition-all"
            >
              <span>Patient Portal</span>
              <span className="kbd-shortcut">OTP</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-[var(--border-subtle)] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "bg-[var(--surface)] text-[var(--ink-secondary)] border border-[var(--border)]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 px-1 py-0.2 rounded-full text-[9px] font-bold bg-[var(--accent-crimson)] text-white">
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
