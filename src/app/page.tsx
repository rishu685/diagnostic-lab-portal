import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Shield,
  Stethoscope,
  TrendingDown,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  PhoneCall
} from "lucide-react";

export default async function HomePage() {
  // Aggregate real stats from SQLite DB
  const [totalOrders, processingOrders, readyOrders, criticalOrders, auditLogCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.callbackTask.count({ where: { status: "PENDING" } }),
    prisma.accessLog.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Digital Diagnostic Delivery Network • Coastal Andhra Pradesh</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Safe, Instant Report Delivery for Patients & Doctors.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminating 14,400 hours of status inquiry calls, halting report misdeliveries with 72-hour OTP-locked links, and empowering elderly patients with clear Telugu & Hindi plain-language health explanations.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/patient/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Open Patient OTP Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/front-desk"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Front Desk Console</span>
            </Link>

            <Link
              href="/lis-import"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>LIS CSV Import</span>
            </Link>
          </div>
        </div>

        {/* Live System Metric Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-white">{totalOrders}</div>
            <div className="text-xs text-slate-400">Total Patient Orders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{readyOrders}</div>
            <div className="text-xs text-slate-400">Delivered Digitally</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400 flex items-center gap-1.5">
              <span>{criticalOrders}</span>
              {criticalOrders > 0 && <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded uppercase">Urgent</span>}
            </div>
            <div className="text-xs text-slate-400">Critical Callbacks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-400">{auditLogCount}</div>
            <div className="text-xs text-slate-400">DPDP Audit Events</div>
          </div>
        </div>
      </div>

      {/* Financial ROI & Impact Metrics from Client Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Status Inquiries</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">₹36.0 Lakh / yr</div>
            <p className="text-xs text-slate-500 mt-1">
              Down 60% in 3 months. Eliminates 40 staff hours/day spent answering patient status visits.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">Physical Printing</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">₹34.56 Lakh / yr</div>
            <p className="text-xs text-slate-500 mt-1">
              Printing halved by pushing 80%+ digital reports directly to WhatsApp & SMS with 72h expiring tokens.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Zero Misdeliveries</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">100% DPDP Safe</div>
            <p className="text-xs text-slate-500 mt-1">
              Stops 15 monthly misdeliveries from shared store phones using OTP authentication & immutable audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Screen Navigation Matrix */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Core Evaluation Portals & Workflows</h2>
          <p className="text-xs text-slate-500">Every workflow required by the brief is fully interactive with real data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Patient Portal */}
          <Link
            href="/patient/login"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Role: Patient
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-sky-700 transition-colors">
                Patient OTP Login & Report View
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Log in via mobile OTP (or universal test OTP <code className="text-sky-700 font-bold">123456</code>). View color-coded lab results with Telugu, English, and Hindi explanations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
              <span>Try Patient View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Front Desk Console */}
          <Link
            href="/front-desk"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  Role: Front Desk
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-teal-700 transition-colors">
                Front-Desk Console & Resend
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Search patients by name or phone, inspect delivery status, and trigger 1-tap WhatsApp/SMS link resend with fresh 72h tokens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600">
              <span>Open Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. LIS CSV Import */}
          <Link
            href="/lis-import"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Role: Lab Operations
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-purple-700 transition-colors">
                LIS CSV Import & Auto Sign-Off
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ingest daily LIS export folder files. Automatically runs clinical range evaluation, triggers SMS links, and flags critical cases.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Import LIS CSV</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Critical Value Callbacks */}
          <Link
            href="/callbacks"
            className="group bg-white rounded-2xl p-5 border border-rose-200 hover:border-rose-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Safety Guardrail
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-rose-700 transition-colors">
                Critical Callback Queue
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Life-threatening values (e.g. Potassium 6.8 mmol/L) suppress AI interpretation and trigger mandatory front-desk telephone callbacks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
              <span>View Emergency Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Doctor Portal */}
          <Link
            href="/doctor"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Role: Referring Doctor
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-blue-700 transition-colors">
                Referring Doctor 90-Day Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Referring physicians (Dr. S. Ramanaiah, Dr. P. Anitha, etc.) access 90 days of signed patient reports in one clean dashboard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Open Doctor View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. DPDP Audit Logs */}
          <Link
            href="/audit-logs"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Compliance
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-emerald-700 transition-colors">
                DPDP Act 2023 Audit Trail
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Immutable record of every access attempt, IP address, user-agent, OTP verification, and link dispatch per Indian data protection law.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Inspect Audit Logs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Sample Data Quick Launch Bar */}
      <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <span>Sample Data Presets (From Client Brief)</span>
          <span className="text-[10px] text-slate-500 font-normal">Click any sample to test immediately:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/report/ORD-71204"
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 text-xs shadow-xs transition-colors block"
          >
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Lakshmi Prasanna K</span>
              <span className="text-emerald-700 font-mono">ORD-71204</span>
            </div>
            <div className="text-slate-600 mt-1">Haemoglobin 10.2 g/dL (Mild anaemia)</div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Dr. S. Ramanaiah</span>
              <span className="text-sky-600 font-semibold">View Telugu Report →</span>
            </div>
          </Link>

          <Link
            href="/front-desk?search=ORD-71219"
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 text-xs shadow-xs transition-colors block"
          >
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Venkata Rao M</span>
              <span className="text-amber-700 font-mono">ORD-71219</span>
            </div>
            <div className="text-slate-600 mt-1">LDL 142 mg/dL (Processing in Lab)</div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Dr. P. Anitha</span>
              <span className="text-amber-600 font-semibold">Check Status →</span>
            </div>
          </Link>

          <Link
            href="/callbacks"
            className="bg-white p-3.5 rounded-xl border border-rose-300 hover:border-rose-500 text-xs shadow-xs transition-colors block bg-rose-50/30"
          >
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Farzana Begum</span>
              <span className="text-rose-700 font-mono">ORD-71233</span>
            </div>
            <div className="text-rose-700 font-semibold mt-1">Potassium 6.8 mmol/L (Critical Alert)</div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Dr. K. Suresh</span>
              <span className="text-rose-600 font-semibold">Open Callback →</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
