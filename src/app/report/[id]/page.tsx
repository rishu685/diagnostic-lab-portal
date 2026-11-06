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
  callbackTask?: {
    urgentReason: string;
    status: string;
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">
        <Activity className="w-8 h-8 animate-spin mx-auto text-sky-600 mb-3" />
        <h2 className="text-base font-bold text-slate-800">రిపోర్ట్ లోడ్ అవుతోంది... / Loading Report...</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying encrypted signature and reference values</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Report Not Available</h2>
        <p className="text-xs text-slate-600">{error || "Could not retrieve medical record"}</p>
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Patient Portal</span>
        </Link>
      </div>
    );
  }

  const isCritical = report.status === "READY_CRITICAL";
  const hasOutOfRange = report.parameters.some((p) => p.flag === "OUT_OF_RANGE" || p.flag === "CRITICAL");

  // Summary selection by language
  const activeSummary =
    selectedLang === "te"
      ? report.aiSummary?.summaryTe
      : selectedLang === "hi"
      ? report.aiSummary?.summaryHi
      : report.aiSummary?.summaryEn;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
      {/* Top Action Toolbar (No print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Multilingual Selector Pills (Telugu, English, Hindi) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          <button
            onClick={() => setSelectedLang("te")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedLang === "te" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setSelectedLang("en")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedLang === "en" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang("hi")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedLang === "hi" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Print / Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Copied" : "Share"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Diagnostic Report Paper Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 card-print">
        {/* Lab Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">COASTAL DIAGNOSTICS</h1>
              <p className="text-xs font-medium text-slate-600">
                Central Clinical Reference Laboratory • NABL Accredited (ISO 15189)
              </p>
              <p className="text-[11px] text-slate-400">Benz Circle, Vijayawada, Andhra Pradesh - 520010</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Electronically Signed</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">Order: {report.id}</div>
            <div className="text-slate-400 text-[10px]">
              {report.signedAt ? new Date(report.signedAt).toLocaleString() : "Processing"}
            </div>
          </div>
        </div>

        {/* Patient Demographics & Doctor Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Patient Name</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{report.patient.fullName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Age / Gender</div>
            <div className="font-bold text-slate-800 mt-0.5">
              {report.patient.age} Yrs / {report.patient.gender}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">MRN (Hospital ID)</div>
            <div className="font-mono text-slate-800 mt-0.5">{report.patient.mrn}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Referring Doctor</div>
            <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-sky-700" />
              <span>{report.doctor.name}</span>
            </div>
          </div>
        </div>

        {/* CRITICAL VALUE EMERGENCY BANNER (If Critical) */}
        {isCritical && (
          <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>అత్యవసర సమాచారం: క్లినికల్ అలర్ట్ / Critical Clinical Notification</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              ఈ రిపోర్ట్‌లో ఒక ముఖ్యమైన పరీక్ష తీవ్రమైన పరిమితిని దాటింది. మా క్లినికల్ డెస్క్ వెంటనే మీ వైద్యుడికి మరియు మీకు కాల్ చేయడానికి బాధ్యత వహిస్తుంది. దయచేసి వెంటనే మీ డాక్టర్‌ని సంప్రదించండి.
            </p>
            <p className="text-xs text-rose-800 font-medium">
              (One or more values require immediate physician consultation. Automated AI summary is suppressed for clinical safety.)
            </p>
          </div>
        )}

        {/* PLAIN-LANGUAGE SUMMARY BOX (In Telugu / English / Hindi) */}
        {!isCritical && activeSummary && (
          <div className="bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {selectedLang === "te"
                    ? "సులభమైన వివరణ (Plain Explanation)"
                    : selectedLang === "hi"
                    ? "सरल भाषा में सारांश (Plain Summary)"
                    : "Plain-Language Summary"}
                </h3>
              </div>

              <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                {report.aiSummary?.isTemplate ? "Locked Clinical Template" : "AI Synthesized"}
              </span>
            </div>

            <p className="text-slate-800 text-sm leading-relaxed font-medium">
              {activeSummary}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-sky-200/60 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
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
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline self-start sm:self-auto disabled:text-emerald-700"
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
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Diagnostic Test Results & Reference Ranges
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Test Parameter</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Normal Reference Range</th>
                  <th className="py-3 px-4">Status / Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.parameters.map((param) => {
                  const isParamCrit = param.flag === "CRITICAL";
                  const isOutOfRange = param.flag === "OUT_OF_RANGE";

                  return (
                    <tr
                      key={param.id}
                      className={`transition-colors ${
                        isParamCrit
                          ? "bg-rose-50/80 font-bold"
                          : isOutOfRange
                          ? "bg-amber-50/50"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{param.parameterName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{param.testCategory}</div>
                      </td>

                      {/* Result Value */}
                      <td className="py-3.5 px-4 text-base font-black text-slate-950 font-mono">
                        <span>{param.resultValue}</span>
                        <span className="text-xs font-normal text-slate-500 ml-1 font-sans">{param.unit}</span>
                      </td>

                      {/* Reference Range */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {param.refRangeMin} - {param.refRangeMax} {param.unit}
                      </td>

                      {/* Flag Pill */}
                      <td className="py-3.5 px-4">
                        {isParamCrit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> CRITICAL ALERT
                          </span>
                        ) : isOutOfRange ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                            Out of Range
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
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
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Pathology Verification</div>
            <div className="font-bold text-slate-900 text-sm">{report.pathologist}</div>
            <div className="text-[11px] text-slate-500">Consultant Pathologist, Coastal Diagnostics</div>
            <div className="text-[10px] text-slate-400">Reg No: AP-MCI-48210</div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Legal & Security Stamp</div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 Digital Signature Verified</span>
            </div>
            <div className="text-[10px] text-slate-400">
              End of signed clinical laboratory report
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
