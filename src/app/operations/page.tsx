import { prisma } from "@/lib/prisma";
import {
  BarChart3,
  TrendingDown,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Users
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Operations & Financial Impact Report</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Executive performance dashboard for Founder-CEO and Head of Lab Operations. Tracking inquiry reduction, printing cost savings, and DPDP compliance.
        </p>
      </div>

      {/* Target vs Actual KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Inquiry Call Elimination</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹36.0 Lakh/yr</div>
          <p className="text-[11px] text-slate-500">
            14,400 staff hours recaptured. Calls down 62% in trial centres.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Paper Printing Halved</span>
            <Printer className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹34.56 Lakh/yr</div>
          <p className="text-[11px] text-slate-500">
            2,88,000 physical reports converted to encrypted SMS/WhatsApp links.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Wrong Number Deliveries</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">0 Incidents</div>
          <p className="text-[11px] text-slate-500">
            Down from ~15/mo to 0 via mandatory OTP verification per DPDP Act.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Median Digital Turnaround</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">&lt; 30 Seconds</div>
          <p className="text-[11px] text-slate-500">
            Link dispatched instantly when pathologist signs off on LIS.
          </p>
        </div>
      </div>

      {/* Lab Centre Delivery Network Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-700" />
            <h2 className="font-bold text-slate-900 text-sm">Delivery Performance Across 6 Regional Labs</h2>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
            Average Digital Adoption: 84.5%
          </span>
        </div>

        <div className="space-y-3">
          {centres.map((c) => (
            <div key={c.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{c.name}</div>
                <div className="text-[11px] text-slate-500">{c.tests} daily tests ingested</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> {c.digitalRate} Digital Delivery
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DPDP Act 2023 Compliance & Security Verification Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm">Statutory Healthcare Compliance Verification</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <div>
            <strong className="text-white block mb-0.5">DPDP Act 2023 Consent</strong>
            Explicit patient opt-in recorded at reception and reaffirmed upon OTP entry.
          </div>
          <div>
            <strong className="text-white block mb-0.5">72-Hour Expiration Window</strong>
            Cryptographic HMAC-SHA256 expiring links render reports inaccessible after 72 hours.
          </div>
          <div>
            <strong className="text-white block mb-0.5">Sovereign Data Storage</strong>
            All medical records and immutable audit logs hosted exclusively within Indian boundaries.
          </div>
        </div>
      </div>
    </div>
  );
}
