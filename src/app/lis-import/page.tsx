"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

const SAMPLE_CSV = `Order ID,Patient,Parameter,Result,Reference Range,Status,Referring Doctor,Phone,Age,Gender
ORD-71204,Lakshmi Prasanna K,Haemoglobin g/dL,10.2,12.0-15.5,Ready,Dr. S. Ramanaiah,9848011111,48,Female
ORD-71219,Venkata Rao M,LDL cholesterol mg/dL,142,0-100,Processing,Dr. P. Anitha,9848022222,62,Male
ORD-71233,Farzana Begum,Potassium mmol/L,6.8,3.5-5.1,Ready (critical),Dr. K. Suresh,9848033333,55,Female
ORD-71260,T. Venkateswarlu,Fasting Blood Sugar mg/dL,164,70-100,Ready,Dr. S. Ramanaiah,9848066666,54,Male
ORD-71261,A. Sujatha,Serum Creatinine mg/dL,0.85,0.6-1.2,Ready,Dr. P. Anitha,9848077777,36,Female`;

export default function LisImportPage() {
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    orders?: Array<{ orderId: string; patientName: string; doctor: string; status: string; secureToken: string }>;
    error?: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setCsvContent(text);
      };
      reader.readAsText(file);
    }
  };

  const runImport = async () => {
    try {
      setImporting(true);
      setResult(null);

      const res = await fetch("/api/lis/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setResult({ error: (err as Error).message || "Failed to process LIS CSV" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">LIS CSV Export Ingestion & Sign-Off</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Feeds from your desktop Laboratory Information System (LIS) export folder. Ingests CSV files, verifies reference ranges, issues 72-hour expiring links, and pushes emergency callbacks.
        </p>
      </div>

      {/* Preset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-900">Sample LIS CSV Ready</span>
          <span className="text-[11px] text-purple-700 hidden sm:inline">• Includes sample patients from the brief (Lakshmi, Venkata Rao, Farzana Begum)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvContent(SAMPLE_CSV)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-50 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Brief Samples</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* CSV Editor Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Raw LIS CSV Stream</span>
          <span>Tab or comma separated supported</span>
        </div>

        <textarea
          rows={9}
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          className="w-full p-3.5 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 leading-relaxed"
          placeholder="Paste CSV rows here..."
        />

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Auto-hashes tokens with 72-hour TTL upon sign-off</span>
          </div>

          <button
            onClick={runImport}
            disabled={importing || !csvContent.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Play className={`w-4 h-4 ${importing ? "animate-spin" : ""}`} />
            <span>{importing ? "Processing & Flagging..." : "Process & Sign-Off All"}</span>
          </button>
        </div>
      </div>

      {/* Import Result Panel */}
      {result && (
        <div
          className={`p-5 rounded-2xl border ${
            result.error
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          } space-y-3 animate-in fade-in`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.error ? (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Import Failed</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{result.message}</span>
              </>
            )}
          </div>

          {result.error && <p className="text-xs text-rose-700">{result.error}</p>}

          {result.orders && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-emerald-800">Generated Orders & Tokens:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {result.orders.map((o) => (
                  <div key={o.orderId} className="bg-white/90 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{o.orderId} - {o.patientName}</div>
                      <div className="text-[11px] text-slate-500">Status: <span className="font-semibold">{o.status}</span></div>
                    </div>
                    <Link
                      href={`/report/${o.orderId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline"
                    >
                      <span>Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
