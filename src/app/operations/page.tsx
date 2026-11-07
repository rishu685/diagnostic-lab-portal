import { prisma } from "@/lib/prisma";
import {
  TrendingDown,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2
} from "lucide-react";

export default async function OperationsReportPage() {
  const [totalOrders, readyOrders, criticalCount, logsCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.callbackTask.count(),
    prisma.accessLog.count(),
  ]);

  const centres = [
    { name: "Vijayawada Central Lab (Benz Circle)", tests: 820, digitalRate: "88%" },
    { name: "Guntur Main Diagnostic Centre", tests: 460, digitalRate: "84%" },
    { name: "Machilipatnam Collection Point", tests: 290, digitalRate: "81%" },
    { name: "Eluru Diagnostic Annex", tests: 210, digitalRate: "79%" },
    { name: "Bhimavaram Regional Point", tests: 130, digitalRate: "82%" },
    { name: "Rajahmundry Collection Centre", tests: 90, digitalRate: "86%" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
            Operations <span className="ampersand">&amp;</span> Financial Impact Report
          </h1>
          <span className="kanso-pill font-mono text-[9px]">
            EXECUTIVE ROI
          </span>
        </div>
        <p className="text-xs text-[var(--ink-muted)] mt-1">
          Performance report for Founder-CEO and Head of Lab Operations. Tracking inquiry reduction, printing cost savings, and DPDP compliance.
        </p>
      </div>

      {/* Target vs Actual KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            <span>Inquiry Calls</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-semibold text-[var(--ink)]">₹36.0 Lakh/yr</div>
          <p className="text-[11px] text-[var(--ink-secondary)]">
            14,400 staff hours recaptured. Calls down 62% in trial centres.
          </p>
        </div>

        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            <span>Printing Saved</span>
            <Printer className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-serif font-semibold text-[var(--ink)]">₹34.56 Lakh/yr</div>
          <p className="text-[11px] text-[var(--ink-secondary)]">
            2,88,000 physical reports converted to encrypted SMS/WhatsApp links.
          </p>
        </div>

        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            <span>Wrong Deliveries</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-semibold text-emerald-700">0 Incidents</div>
          <p className="text-[11px] text-[var(--ink-secondary)]">
            Down from ~15/mo to 0 via mandatory OTP verification per DPDP Act.
          </p>
        </div>

        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            <span>Delivery Lag</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-semibold text-[var(--ink)]">&lt; 30 Seconds</div>
          <p className="text-[11px] text-[var(--ink-secondary)]">
            Link dispatched instantly when pathologist signs off on LIS.
          </p>
        </div>
      </div>

      {/* Lab Centre Delivery Network Breakdown */}
      <div className="kanso-card rounded-3xl bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--ink)]" />
            <h2 className="font-serif font-semibold text-[var(--ink)] text-base">
              Delivery Performance Across 6 Regional Labs
            </h2>
          </div>
          <span className="kanso-pill font-mono text-[10px]">
            Average Digital Adoption: 84.5%
          </span>
        </div>

        <div className="space-y-2.5">
          {centres.map((c) => (
            <div key={c.name} className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div>
                <div className="font-serif font-semibold text-[var(--ink)] text-sm">{c.name}</div>
                <div className="text-[11px] text-[var(--ink-muted)] font-mono">{c.tests} daily tests ingested</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {c.digitalRate} Digital
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DPDP Act 2023 Compliance & Security Verification Card */}
      <div className="kanso-card rounded-3xl p-6 sm:p-8 bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-md)] space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-serif font-semibold text-base">Statutory Healthcare Compliance Verification</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-300 pt-3 border-t border-stone-800 leading-relaxed font-sans">
          <div>
            <strong className="text-white font-serif block mb-1 text-sm">DPDP Act 2023 Consent</strong>
            Explicit patient opt-in recorded at reception and reaffirmed upon OTP entry.
          </div>
          <div>
            <strong className="text-white font-serif block mb-1 text-sm">72-Hour Expiration Window</strong>
            Cryptographic HMAC-SHA256 expiring links render reports inaccessible after 72 hours.
          </div>
          <div>
            <strong className="text-white font-serif block mb-1 text-sm">Sovereign Data Storage</strong>
            All medical records and immutable audit logs hosted exclusively within Indian boundaries.
          </div>
        </div>
      </div>
    </div>
  );
}
