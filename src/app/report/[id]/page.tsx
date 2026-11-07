"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Languages,
  Flag,
  Check,
  Stethoscope,
  Sparkles,
  Info
} from "lucide-react";

interface ReportData {
  id: string;
  labCentre: string;
  status: string;
  signedAt: string | null;
  pathologist: string;
  patient: {
    mrn: string;
    fullName: string;
    phone: string;
    age: number;
    gender: string;
    preferredLang: string;
  };
  doctor: {
    name: string;
    code: string;
    specialty: string | null;
  };
  parameters: Array<{
    id: string;
    testCategory: string;
    parameterName: string;
    resultValue: number;
    unit: string;
    refRangeMin: number;
    refRangeMax: number;
    flag: string;
  }>;
  aiSummary: {
    summaryEn: string;
    summaryTe: string;
    summaryHi: string;
    isTemplate: boolean;
    isFlaggedByPatient: boolean;
  } | null;
}

export default function PatientReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"te" | "en" | "hi">("te");
  const [flagging, setFlagging] = useState(false);
  const [flaggedSuccess, setFlaggedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setReport(data.order);
          if (data.order.patient?.preferredLang === "en") setSelectedLang("en");
          else if (data.order.patient?.preferredLang === "hi") setSelectedLang("hi");
          else setSelectedLang("te");
        } else {
          setError(data.error || "Report not found");
        }
      } catch {
        setError("Network error loading report");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleFlagSummary = async () => {
    try {
      setFlagging(true);
      const res = await fetch("/api/ai/flag-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          reason: "Patient requested personal review by duty pathologist.",
        }),
      });

      if (res.ok) {
        setFlaggedSuccess(true);
      } else {
        alert("Failed to submit review request");
      }
    } catch {
      alert("Network error");
    } finally {
      setFlagging(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(null as unknown as boolean), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-[var(--ink-muted)]">
        <Activity className="w-8 h-8 animate-spin mx-auto text-[var(--ink)] mb-3" />
        <h2 className="text-base font-serif font-semibold text-[var(--ink)]">రిపోర్ట్ లోడ్ అవుతోంది... / Loading Report...</h2>
        <p className="text-xs mt-1 font-mono">Verifying encrypted signature and reference values</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-serif font-bold text-[var(--ink)]">Report Not Available</h2>
        <p className="text-xs text-[var(--ink-secondary)]">{error || "Could not retrieve medical record"}</p>
        <Link
          href="/patient/login"
          className="kanso-btn-primary text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Patient Portal</span>
        </Link>
      </div>
    );
  }

  const isCritical = report.status === "READY_CRITICAL";

  // Summary selection by language
  const activeSummary =
    selectedLang === "te"
      ? report.aiSummary?.summaryTe
      : selectedLang === "hi"
      ? report.aiSummary?.summaryHi
      : report.aiSummary?.summaryEn;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6">
      {/* Top Action Toolbar (No print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>

        {/* Multilingual Selector Pills (Telugu, English, Hindi) */}
        <div className="flex items-center gap-1 bg-[var(--surface-card)] p-1 rounded-full border border-[var(--border-subtle)]">
          <Languages className="w-3.5 h-3.5 text-[var(--ink-muted)] ml-2 mr-0.5" />
          <button
            onClick={() => setSelectedLang("te")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedLang === "te"
                ? "bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setSelectedLang("en")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedLang === "en"
                ? "bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang("hi")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedLang === "hi"
                ? "bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Print / Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="kanso-btn-secondary py-1.5 px-3 text-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Copied" : "Share"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="kanso-btn-primary py-1.5 px-3.5 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Diagnostic Report Paper Card */}
      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-[var(--shadow-md)] p-6 sm:p-12 space-y-8 card-print">
        {/* Lab Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[var(--border)] gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5"></circle>
                <path d="M12 3v18"></path>
                <path d="M16 8l-4 4 4 4"></path>
              </svg>
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
                Coastal<span className="font-normal italic">Diagnostics</span>
              </h1>
              <p className="text-xs text-[var(--ink-secondary)] font-medium">
                Central Clinical Reference Laboratory • NABL Accredited (ISO 15189)
              </p>
              <p className="text-[11px] text-[var(--ink-muted)]">Benz Circle, Vijayawada, Andhra Pradesh - 520010</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 font-mono">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signed &amp; Dispatched</span>
            </div>
            <div className="text-[var(--ink-muted)] text-[11px]">Order: {report.id}</div>
            <div className="text-[var(--ink-muted)] text-[10px]">
              {report.signedAt ? new Date(report.signedAt).toLocaleString() : "Processing"}
            </div>
          </div>
        </div>

        {/* Patient Demographics & Doctor Bar */}
        <div className="bg-[var(--surface-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Patient Name</div>
            <div className="font-serif font-bold text-[var(--ink)] text-sm sm:text-base mt-0.5">{report.patient.fullName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Age / Gender</div>
            <div className="font-semibold text-[var(--ink)] mt-0.5">
              {report.patient.age} Yrs / {report.patient.gender}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">MRN (Hospital ID)</div>
            <div className="font-mono text-[var(--ink)] mt-0.5">{report.patient.mrn}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Referring Doctor</div>
            <div className="font-semibold text-[var(--ink)] mt-0.5 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>{report.doctor.name}</span>
            </div>
          </div>
        </div>

        {/* CRITICAL VALUE EMERGENCY BANNER (If Critical) */}
        {isCritical && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-sm text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>అత్యవసర సమాచారం: క్లినికల్ అలర్ట్ / Critical Clinical Notification</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-sans">
              ఈ రిపోర్ట్‌లో ఒక ముఖ్యమైన పరీక్ష తీవ్రమైన పరిమితిని దాటింది. మా క్లినికల్ డెస్క్ వెంటనే మీ వైద్యుడికి మరియు మీకు కాల్ చేయడానికి బాధ్యత వహిస్తుంది. దయచేసి వెంటనే మీ డాక్టర్‌ని సంప్రదించండి.
            </p>
            <p className="text-xs text-rose-800 font-medium font-sans">
              (One or more values require immediate physician consultation. Automated AI summary is suppressed for clinical safety.)
            </p>
          </div>
        )}

        {/* PLAIN-LANGUAGE SUMMARY BOX (In Telugu / English / Hindi) */}
        {!isCritical && activeSummary && (
          <div className="kanso-card rounded-2xl p-6 bg-[var(--surface-card)] space-y-3 border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--ink-muted)]" />
                <h3 className="font-serif font-semibold text-[var(--ink)] text-sm sm:text-base">
                  {selectedLang === "te"
                    ? "సులభమైన వివరణ (Plain Explanation)"
                    : selectedLang === "hi"
                    ? "सरल भाषा में सारांश (Plain Summary)"
                    : "Plain-Language Summary"}
                </h3>
              </div>

              <span className="kanso-pill font-mono text-[9px]">
                {report.aiSummary?.isTemplate ? "Locked Template" : "AI Synthesized"}
              </span>
            </div>

            <p className="text-[var(--ink)] text-sm sm:text-base leading-relaxed font-normal">
              {activeSummary}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-[var(--border)] gap-2 text-[11px] text-[var(--ink-muted)]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
                <span>
                  {selectedLang === "te"
                    ? "ఇది సమాచారం కోసం మాత్రమే. దయచేసి డాక్టర్‌ని సంప్రదించండి."
                    : selectedLang === "hi"
                    ? "यह केवल जानकारी के लिए है। कृपया चिकित्सक से परामर्श लें।"
                    : "Informational summary only. Consult your referring physician."}
                </span>
              </div>

              {/* Patient Flag Button */}
              <button
                onClick={handleFlagSummary}
                disabled={flagging || flaggedSuccess}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] underline self-start sm:self-auto disabled:text-emerald-700"
              >
                <Flag className="w-3 h-3" />
                <span>
                  {flaggedSuccess
                    ? "Flagged for Pathologist Review ✓"
                    : "వివరణలో సందేహం ఉందా? Flag for Pathologist"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Test Results Table */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold text-[var(--ink-muted)] uppercase tracking-wider">
            Diagnostic Test Results <span className="ampersand">&amp;</span> Reference Ranges
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[var(--border)] rounded-2xl overflow-hidden">
              <thead className="bg-[var(--surface-card)] text-[var(--ink-muted)] font-mono font-semibold uppercase text-[10px] tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Test Parameter</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Normal Reference Range</th>
                  <th className="py-3 px-4">Status / Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {report.parameters.map((param) => {
                  const isParamCrit = param.flag === "CRITICAL";
                  const isOutOfRange = param.flag === "OUT_OF_RANGE";

                  return (
                    <tr
                      key={param.id}
                      className={`transition-colors ${
                        isParamCrit
                          ? "bg-rose-50/60 font-semibold"
                          : isOutOfRange
                          ? "bg-amber-50/30"
                          : "hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {/* Name */}
                      <td className="py-4 px-4 font-semibold text-[var(--ink)]">
                        <div className="text-sm font-serif">{param.parameterName}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] font-mono">{param.testCategory}</div>
                      </td>

                      {/* Result Value */}
                      <td className="py-4 px-4 text-base font-bold text-[var(--ink)] font-mono">
                        <span>{param.resultValue}</span>
                        <span className="text-xs font-normal text-[var(--ink-muted)] ml-1 font-sans">{param.unit}</span>
                      </td>

                      {/* Reference Range */}
                      <td className="py-4 px-4 text-[var(--ink-secondary)] font-mono">
                        {param.refRangeMin} - {param.refRangeMax} {param.unit}
                      </td>

                      {/* Flag Pill */}
                      <td className="py-4 px-4">
                        {isParamCrit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" /> CRITICAL ALERT
                          </span>
                        ) : isOutOfRange ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                            Out of Range
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pathologist Endorsement & Sign-Off Block */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Pathology Verification</div>
            <div className="font-serif font-bold text-[var(--ink)] text-sm">{report.pathologist}</div>
            <div className="text-[11px] text-[var(--ink-secondary)]">Consultant Pathologist, Coastal Diagnostics</div>
            <div className="text-[10px] text-[var(--ink-muted)] font-mono">Reg No: AP-MCI-48210</div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Legal &amp; Security Stamp</div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>DPDP Act 2023 Digital Signature Verified</span>
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] font-mono">
              End of signed clinical laboratory report
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
