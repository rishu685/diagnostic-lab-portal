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
  Save,
  Check
} from "lucide-react";
import Link from "next/link";

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
  const [editingId, setEditingId] = useState<string | null>(null);
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
        setEditingId(null);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Critical Value Callback Queue</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory clinical safety protocol: AI summaries are disabled for critical results. Duty staff must immediately contact the referring physician and patient.
          </p>
        </div>

        <button
          onClick={fetchCallbacks}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Safety Policy Alert Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>Clinical Governance Rule (Brief Constraint)</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] uppercase font-bold animate-pulse">
                {pendingCount} Pending Emergency Contact
              </span>
            )}
          </div>
          <p className="text-rose-800 leading-relaxed">
            Whenever an analyzer detects values exceeding life-threatening thresholds (e.g. Potassium &gt; 6.2 mmol/L, Fasting Sugar &gt; 400 mg/dL), the portal blocks AI plain summaries to prevent dangerous reassurance. A staff callback task is issued within 5 minutes of sign-off.
          </p>
        </div>
      </div>

      {/* Callback Tasks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            <span>Checking critical tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">No Pending Critical Callbacks</h3>
            <p className="text-xs text-slate-500 mt-1">All clinical alerts have been resolved and logged.</p>
          </div>
        ) : (
          tasks.map((t) => {
            const isResolved = t.status === "RESOLVED";
            const isPending = t.status === "PENDING";

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-shadow space-y-4 ${
                  isPending ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                }`}
              >
                {/* Task Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{t.orderId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPending ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-slate-400">• {t.order.labCentre}</span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Assigned to: <strong className="text-slate-800">{t.assignedTo}</strong></span>
                  </div>
                </div>

                {/* Urgent Alert Banner */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-900 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t.urgentReason}</span>
                </div>

                {/* Patient & Doctor Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Patient Info */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span>Patient: {t.order.patient.fullName}</span>
                    </div>
                    <div className="text-slate-600">
                      Age: {t.order.patient.age}y • Gender: {t.order.patient.gender}
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-mono text-slate-800 font-semibold">+91 {t.order.patient.phone}</span>
                      <a
                        href={`tel:${t.order.patient.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 text-white font-semibold text-[11px] hover:bg-sky-500 shadow-2xs"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Patient
                      </a>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Referring Doctor: {t.order.doctor.name}</span>
                    </div>
                    <div className="text-slate-600">
                      Specialty: {t.order.doctor.specialty || "Physician"}
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-mono text-slate-800 font-semibold">{t.order.doctor.phone || "+91 98480 12345"}</span>
                      <a
                        href={`tel:${t.order.doctor.phone || "9848012345"}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-500 shadow-2xs"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Doctor
                      </a>
                    </div>
                  </div>
                </div>

                {/* Staff Action & Call Notes Area */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Duty Staff Resolution Notes:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spoke with Dr. Suresh; patient instructed to visit casualty immediately..."
                      value={notes[t.id] ?? (t.callNotes || "")}
                      onChange={(e) => setNotes({ ...notes, [t.id]: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                      value={statuses[t.id] ?? t.status}
                      onChange={(e) => setStatuses({ ...statuses, [t.id]: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none"
                    >
                      <option value="PENDING">Pending Call</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="ESCALATED">Escalated to MD</option>
                    </select>

                    <button
                      onClick={() => saveCallback(t.id)}
                      disabled={savingId === t.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-2xs"
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
