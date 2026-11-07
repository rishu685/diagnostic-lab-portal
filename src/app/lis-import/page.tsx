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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
            LIS CSV Ingestion <span className="ampersand">&amp;</span> Sign-Off
          </h1>
          <span className="kanso-pill font-mono text-[9px]">
            LAB WORKER
          </span>
        </div>
        <p className="text-xs text-[var(--ink-muted)] mt-1">
          Feeds from your desktop Laboratory Information System (LIS) export folder. Ingests CSV files, verifies reference ranges, issues 72-hour expiring links, and pushes emergency callbacks.
        </p>
      </div>

      {/* Preset Controls */}
      <div className="kanso-card rounded-2xl p-4 bg-[var(--surface-card)] flex flex-wrap items-center justify-between gap-3 border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--ink)]">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="font-serif font-semibold">Sample LIS CSV Ready</span>
          <span className="text-[11px] text-[var(--ink-muted)] hidden sm:inline">• Includes sample patients from the brief</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvContent(SAMPLE_CSV)}
            className="kanso-btn-secondary py-1 px-3 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Brief Samples</span>
          </button>

          <label className="kanso-btn-primary py-1 px-3.5 text-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* CSV Editor Area */}
      <div className="kanso-card rounded-3xl p-5 bg-[var(--surface)] space-y-3 border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
          <span className="font-semibold text-[var(--ink)]">RAW LIS CSV STREAM</span>
          <span>Tab or comma separated</span>
        </div>

        <textarea
          rows={9}
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          className="w-full p-4 font-mono text-xs rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)] leading-relaxed"
          placeholder="Paste CSV rows here..."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
          <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Auto-hashes tokens with 72-hour TTL upon sign-off</span>
          </div>

          <button
            onClick={runImport}
            disabled={importing || !csvContent.trim()}
            className="kanso-btn-primary py-2.5 px-5 text-xs font-semibold disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${importing ? "animate-spin" : ""}`} />
            <span>{importing ? "Processing & Flagging..." : "Process & Sign-Off All"}</span>
          </button>
        </div>
      </div>

      {/* Import Result Panel */}
      {result && (
        <div
          className={`p-6 rounded-3xl border ${
            result.error
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "kanso-card bg-[var(--surface)] border-emerald-300 text-[var(--ink)]"
          } space-y-4 animate-in fade-in`}
        >
          <div className="flex items-center gap-2 font-serif font-bold text-sm">
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

          {result.error && <p className="text-xs text-rose-700 font-mono">{result.error}</p>}

          {result.orders && (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                Generated Orders &amp; Tokens:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                {result.orders.map((o) => (
                  <div key={o.orderId} className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--ink)]">{o.orderId} - {o.patientName}</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">Status: <span className="font-semibold text-[var(--ink)]">{o.status}</span></div>
                    </div>
                    <Link
                      href={`/report/${o.orderId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline"
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
