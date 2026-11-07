"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  RefreshCw,
  ShieldAlert,
  Save
} from "lucide-react";

interface CallbackItem {
  id: string;
  orderId: string;
  urgentReason: string;
  assignedTo: string | null;
  status: string;
  callNotes: string | null;
  calledAt: string | null;
  resolvedAt: string | null;
  order: {
    id: string;
    labCentre: string;
    signedAt: string | null;
    patient: {
      fullName: string;
      phone: string;
      age: number;
      gender: string;
    };
    doctor: {
      name: string;
      phone: string | null;
      specialty: string | null;
    };
    parameters: Array<{
      parameterName: string;
      resultValue: number;
      unit: string;
      refRangeMin: number;
      refRangeMax: number;
      flag: string;
    }>;
  };
}

export default function CallbacksPage() {
  const [tasks, setTasks] = useState<CallbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchCallbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/callbacks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        const initNotes: Record<string, string> = {};
        const initStatuses: Record<string, string> = {};
        data.tasks.forEach((t: CallbackItem) => {
          initNotes[t.id] = t.callNotes || "";
          initStatuses[t.id] = t.status;
        });
        setNotes(initNotes);
        setStatuses(initStatuses);
      }
    } catch (err) {
      console.error("Failed to load callbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
  }, []);

  const saveCallback = async (id: string) => {
    try {
      setSavingId(id);
      const res = await fetch(`/api/callbacks/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statuses[id],
          callNotes: notes[id],
        }),
      });

      if (res.ok) {
        fetchCallbacks();
      } else {
        alert("Failed to update callback");
      }
    } catch {
      alert("Network error");
    } finally {
      setSavingId(null);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
              Critical Value Callback Queue
            </h1>
            <span className="kanso-pill font-mono text-[9px] bg-rose-50 border-rose-200 text-rose-800">
              SAFETY GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Mandatory clinical safety protocol: AI summaries are disabled for critical results. Duty staff must immediately contact the physician and patient.
          </p>
        </div>

        <button
          onClick={fetchCallbacks}
          className="kanso-btn-secondary py-1.5 px-3 text-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Safety Policy Alert Banner */}
      <div className="kanso-card rounded-2xl p-5 bg-[var(--surface-card)] border-rose-300 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-serif font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <span>Clinical Governance Rule (Brief Constraint)</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                {pendingCount} PENDING ACTION
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
            Whenever an analyzer detects values exceeding life-threatening thresholds (e.g. Potassium &gt; 6.2 mmol/L, Fasting Sugar &gt; 400 mg/dL), the portal blocks AI plain summaries to prevent dangerous reassurance. A staff callback task is issued within 5 minutes of sign-off.
          </p>
        </div>
      </div>

      {/* Callback Tasks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-[var(--ink-muted)] kanso-card rounded-3xl bg-[var(--surface)]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--ink-muted)]" />
            <span>Checking critical tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-muted)] kanso-card rounded-3xl bg-[var(--surface)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-[var(--ink)] text-base">No Pending Critical Callbacks</h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1">All clinical alerts have been resolved and logged.</p>
          </div>
        ) : (
          tasks.map((t) => {
            const isPending = t.status === "PENDING";

            return (
              <div
                key={t.id}
                className={`kanso-card rounded-3xl p-6 bg-[var(--surface)] space-y-4 shadow-[var(--shadow-sm)] ${
                  isPending ? "border-rose-300 ring-2 ring-rose-100/50" : "border-[var(--border)]"
                }`}
              >
                {/* Task Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--ink)] text-sm">{t.orderId}</span>
                    <span className={`kanso-pill font-mono text-[9px] uppercase tracking-wider ${
                      isPending ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-[var(--ink-muted)] font-mono">• {t.order.labCentre}</span>
                  </div>

                  <div className="text-xs text-[var(--ink-muted)] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Assigned to: <strong className="text-[var(--ink)]">{t.assignedTo}</strong></span>
                  </div>
                </div>

                {/* Urgent Alert Banner */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t.urgentReason}</span>
                </div>

                {/* Patient & Doctor Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Patient Info */}
                  <div className="bg-[var(--surface-card)] p-4 rounded-2xl border border-[var(--border)] space-y-1.5">
                    <div className="font-serif font-bold text-[var(--ink)] text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                      <span>Patient: {t.order.patient.fullName}</span>
                    </div>
                    <div className="text-[var(--ink-muted)]">
                      Age: {t.order.patient.age}y • Gender: {t.order.patient.gender}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="font-mono text-[var(--ink)] font-semibold">+91 {t.order.patient.phone}</span>
                      <a
                        href={`tel:${t.order.patient.phone}`}
                        className="kanso-btn-primary py-1 px-3 text-[11px]"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Patient
                      </a>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="bg-[var(--surface-card)] p-4 rounded-2xl border border-[var(--border)] space-y-1.5">
                    <div className="font-serif font-bold text-[var(--ink)] text-sm flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                      <span>Referring Doctor: {t.order.doctor.name}</span>
                    </div>
                    <div className="text-[var(--ink-muted)]">
                      Specialty: {t.order.doctor.specialty || "Physician"}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="font-mono text-[var(--ink)] font-semibold">{t.order.doctor.phone || "+91 98480 12345"}</span>
                      <a
                        href={`tel:${t.order.doctor.phone || "9848012345"}`}
                        className="kanso-btn-secondary py-1 px-3 text-[11px]"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Doctor
                      </a>
                    </div>
                  </div>
                </div>

                {/* Staff Action & Call Notes Area */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[11px] font-serif font-semibold text-[var(--ink)] mb-1">
                      Duty Staff Resolution Notes:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spoke with Dr. Suresh; patient instructed to visit casualty immediately..."
                      value={notes[t.id] ?? (t.callNotes || "")}
                      onChange={(e) => setNotes({ ...notes, [t.id]: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                      value={statuses[t.id] ?? t.status}
                      onChange={(e) => setStatuses({ ...statuses, [t.id]: e.target.value })}
                      className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs font-semibold text-[var(--ink)] bg-[var(--surface)] focus:outline-none"
                    >
                      <option value="PENDING">Pending Call</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="ESCALATED">Escalated</option>
                    </select>

                    <button
                      onClick={() => saveCallback(t.id)}
                      disabled={savingId === t.id}
                      className="kanso-btn-primary py-1.5 px-3 text-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingId === t.id ? "Saving..." : "Update Status"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
