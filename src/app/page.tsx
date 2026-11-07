import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  ChevronRight
} from "lucide-react";

const MODULES = [
  {
    href: "/patient/login",
    pill: "PATIENT PORTAL",
    role: "Role: Patient",
    title: "Patient OTP Login & Report",
    desc: "Log in via mobile OTP (or universal test OTP 123456). View color-coded lab results with Telugu, English, and Hindi explanations.",
    hoverColor: "group-hover:text-sky-600",
  },
  {
    href: "/front-desk",
    pill: "FRONT DESK",
    role: "Role: Desk Staff",
    title: "Front-Desk Console & Resend",
    desc: "Search patients by name or phone, inspect 72h countdowns, and trigger 1-tap WhatsApp/SMS link resend with fresh HMAC tokens.",
    hoverColor: "group-hover:text-teal-600",
  },
  {
    href: "/lis-import",
    pill: "LAB OPERATIONS",
    role: "Role: LIS Operator",
    title: "LIS CSV Import & Sign-Off",
    desc: "Ingest daily LIS export folder files. Automatically runs clinical range evaluation, triggers SMS links, and flags critical cases.",
    hoverColor: "group-hover:text-purple-600",
  },
  {
    href: "/callbacks",
    pill: "SAFETY KILLSWITCH",
    role: "Priority Alert",
    title: "Critical Callback Queue",
    desc: "Life-threatening values (e.g. Potassium 6.8 mmol/L) suppress AI interpretation and trigger mandatory front-desk telephone callbacks.",
    hoverColor: "group-hover:text-rose-600",
    isPriority: true,
  },
  {
    href: "/doctor",
    pill: "PHYSICIAN ARCHIVE",
    role: "Role: Doctor",
    title: "Referring Doctor 90-Day Portal",
    desc: "Referring physicians (Dr. S. Ramanaiah, Dr. P. Anitha, Dr. K. Suresh) access 90 days of signed patient reports in one clean dashboard.",
    hoverColor: "group-hover:text-indigo-600",
  },
  {
    href: "/audit-logs",
    pill: "COMPLIANCE",
    role: "DPDP Act 2023",
    title: "DPDP Access Audit Trail",
    desc: "Immutable record of every access attempt, IP address, user-agent, OTP verification, and link dispatch per Indian data protection law.",
    hoverColor: "group-hover:text-emerald-600",
  },
];

const TENETS = [
  {
    num: "1",
    title: "Human dignity in patient communication",
    desc: "Medical jargon causes undue anxiety for elderly patients. Reports provide compassionate plain explanations in Telugu, Hindi, and English using locked clinical templates for 30 common tests.",
  },
  {
    num: "2",
    title: "Cryptographic containment of sensitive data",
    desc: "Under India's DPDP Act 2023, health data is sensitive personal data. Reports expire strictly after 72 hours and require two-factor phone OTP authentication with immutable audit trails.",
  },
  {
    num: "3",
    title: "Fail-safe clinical governance",
    desc: "Whenever a life-threatening critical threshold is crossed (e.g. Potassium 6.8), automated AI is suppressed by rule and an urgent telephone callback task is issued to duty staff.",
  },
];

export default async function HomePage() {
  const [totalOrders, processingOrders, readyOrders, criticalOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.callbackTask.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink-secondary)] shadow-[var(--shadow-sm)]">
          <span className="pulse-beacon" />
          <span className="font-medium tracking-wide">
            DPDP Act 2023 Compliant <span className="ampersand">&amp;</span> Automated Lab Delivery
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-[var(--ink)] leading-[1.15]">
          Safe, dignified report delivery<br />
          <em className="font-normal italic text-[var(--ink-secondary)]">for patients <span className="ampersand">&amp;</span> doctors</em>
        </h1>

        <p className="text-base sm:text-lg text-[var(--ink-muted)] max-w-2xl mx-auto leading-relaxed">
          Eliminating 14,400 hours of status inquiry calls, halting misdeliveries with 72-hour OTP-locked links, and empowering elderly patients with clear Telugu, Hindi, and English clinical explanations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/patient/login" className="kanso-btn-primary">
            <span>Open Patient OTP Portal</span>
            <span className="kbd-shortcut bg-white/20 border-white/30 text-white">123456</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/front-desk" className="kanso-btn-secondary">
            <Activity className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
            <span>Front Desk Console</span>
          </Link>
          <Link href="/lis-import" className="kanso-btn-secondary">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
            <span>LIS CSV Import</span>
          </Link>
        </div>
      </section>

      {/* Live Perspective Stage / Stream Card */}
      <section className="kanso-card rounded-3xl p-6 sm:p-8 bg-[var(--surface-card)] border-[var(--border)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-olive)] animate-pulse" />
            <span className="font-serif font-semibold text-sm text-[var(--ink)]">Live Clinical Activity Stream</span>
            <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">— 6 Labs &amp; 38 Centres Active in Coastal AP</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="kanso-pill font-mono text-[10px]">{totalOrders} Orders Synced</span>
            <span className="kanso-pill font-mono text-[10px] text-emerald-800 bg-emerald-50 border-emerald-200">{readyOrders} Delivered</span>
            {criticalOrders > 0 && (
              <span className="kanso-pill font-mono text-[10px] text-rose-800 bg-rose-50 border-rose-200">{criticalOrders} Critical Callbacks</span>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">DELIVERED</span>
              <span className="font-semibold text-[var(--ink)]">ORD-71204</span>
              <span className="text-[var(--ink-secondary)]">Lakshmi Prasanna K (Haemoglobin 10.2 g/dL)</span>
            </div>
            <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-2">
              <span>WhatsApp Link Sent (72h TTL)</span>
              <Link href="/report/ORD-71204" className="text-sky-600 hover:underline flex items-center gap-0.5">
                Inspect <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">CRITICAL ALERT</span>
              <span className="font-semibold text-[var(--ink)]">ORD-71233</span>
              <span className="text-[var(--ink-secondary)]">Farzana Begum (Potassium 6.8 mmol/L)</span>
            </div>
            <div className="text-[11px] text-rose-700 flex items-center gap-2">
              <span>AI Suppressed • Callback Assigned to Nurse</span>
              <Link href="/callbacks" className="font-bold underline flex items-center gap-0.5">
                Open Queue <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">IN ANALYZER</span>
              <span className="font-semibold text-[var(--ink)]">ORD-71219</span>
              <span className="text-[var(--ink-secondary)]">Venkata Rao M (LDL cholesterol 142 mg/dL)</span>
            </div>
            <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-2">
              <span>LIS Processing • Guntur Lab</span>
              <Link href="/front-desk" className="text-sky-600 hover:underline flex items-center gap-0.5">
                Track <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financial ROI Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kanso-card rounded-2xl p-6 bg-[var(--surface)]">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">Status Inquiries Eliminated</div>
          <div className="text-3xl font-serif font-semibold text-[var(--ink)] mt-2">
            ₹36.0 Lakh <span className="text-sm font-sans font-normal text-[var(--ink-muted)]">/ year</span>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 leading-relaxed">
            Eliminates 14,400 hours of front-desk staff time answering phone inquiries by pushing automated status links.
          </p>
        </div>

        <div className="kanso-card rounded-2xl p-6 bg-[var(--surface)]">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">Paper Printing Halved</div>
          <div className="text-3xl font-serif font-semibold text-[var(--ink)] mt-2">
            ₹34.56 Lakh <span className="text-sm font-sans font-normal text-[var(--ink-muted)]">/ year</span>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 leading-relaxed">
            2,88,000 physical reports converted to digital delivery with clean, print-on-demand hospital PDFs.
          </p>
        </div>

        <div className="kanso-card rounded-2xl p-6 bg-[var(--surface)]">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">Misdelivery Eradication</div>
          <div className="text-3xl font-serif font-semibold text-[var(--ink)] mt-2">
            Zero Incidents <span className="text-sm font-sans font-normal text-[var(--ink-muted)]">/ month</span>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 leading-relaxed">
            Stops 15 monthly leaks caused by shared WhatsApp phones via cryptographic 72-hour HMAC tokens &amp; OTPs.
          </p>
        </div>
      </section>

      {/* Driving Clinical Tenets */}
      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-[var(--ink)]">Our driving clinical tenets</h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1">Governing privacy, medical safety, and patient comprehension across all 38 centres.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TENETS.map((item) => (
            <div key={item.num} className="kanso-card rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-center text-xs font-serif font-bold text-[var(--ink)]">
                {item.num}
              </div>
              <h3 className="font-serif font-semibold text-base text-[var(--ink)]">{item.title}</h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-[var(--ink)]">Core system modules</h2>
          <p className="text-xs text-[var(--ink-muted)]">Select any interface below to test the end-to-end functionality.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`kanso-card rounded-2xl p-5 bg-[var(--surface)] flex flex-col justify-between group ${
                mod.isPriority ? "border-rose-200/60" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`kanso-pill font-mono text-[10px] ${mod.isPriority ? "bg-rose-50 border-rose-200 text-rose-800" : ""}`}>
                    {mod.pill}
                  </span>
                  <span className={`text-xs ${mod.isPriority ? "text-rose-600 font-semibold" : "text-[var(--ink-muted)]"}`}>
                    {mod.role}
                  </span>
                </div>
                <h3 className={`font-serif font-semibold text-base text-[var(--ink)] mt-3 transition-colors ${mod.hoverColor}`}>
                  {mod.title}
                </h3>
                <p className="text-xs text-[var(--ink-secondary)] mt-1.5 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--ink)]">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brief Sample Presets */}
      <section className="kanso-card rounded-3xl p-6 bg-[var(--surface-card)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--ink-muted)]" />
            <span className="font-serif font-semibold text-sm text-[var(--ink)]">Sample Data from Client Brief</span>
          </div>
          <span className="text-[11px] text-[var(--ink-muted)]">One-click inspection for review committee</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/report/ORD-71204"
            className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] transition-colors block shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[var(--ink)]">ORD-71204</span>
              <span className="text-emerald-700 font-semibold">Ready</span>
            </div>
            <div className="font-serif text-sm font-semibold text-[var(--ink)] mt-1.5">Lakshmi Prasanna K</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">Haemoglobin 10.2 g/dL (Mild anaemia)</div>
            <div className="text-[11px] text-[var(--ink-secondary)] mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span>Dr. S. Ramanaiah</span>
              <span className="underline">View Telugu →</span>
            </div>
          </Link>

          <Link
            href="/front-desk"
            className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] transition-colors block shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[var(--ink)]">ORD-71219</span>
              <span className="text-amber-700 font-semibold">Processing</span>
            </div>
            <div className="font-serif text-sm font-semibold text-[var(--ink)] mt-1.5">Venkata Rao M</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">LDL cholesterol 142 mg/dL (In Analyzer)</div>
            <div className="text-[11px] text-[var(--ink-secondary)] mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span>Dr. P. Anitha</span>
              <span className="underline">Track Desk →</span>
            </div>
          </Link>

          <Link
            href="/callbacks"
            className="p-4 rounded-xl bg-[var(--surface)] border border-rose-300 hover:border-rose-600 transition-colors block shadow-[var(--shadow-sm)] bg-rose-50/20"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-rose-700">ORD-71233</span>
              <span className="text-rose-700 font-semibold">Critical Alert</span>
            </div>
            <div className="font-serif text-sm font-semibold text-[var(--ink)] mt-1.5">Farzana Begum</div>
            <div className="text-xs text-rose-700 mt-0.5">Potassium 6.8 mmol/L (Cardiac risk)</div>
            <div className="text-[11px] text-[var(--ink-secondary)] mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span>Dr. K. Suresh</span>
              <span className="font-bold text-rose-700 underline">Open Callback →</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
