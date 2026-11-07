"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface DoctorData {
  id: string;
  name: string;
  code: string;
  specialty: string | null;
  phone: string | null;
  orders: Array<{
    id: string;
    status: string;
    labCentre: string;
    signedAt: string | null;
    createdAt: string;
    patient: {
      fullName: string;
      phone: string;
      age: number;
      gender: string;
      mrn: string;
    };
    parameters: Array<{
      parameterName: string;
      resultValue: number;
      unit: string;
      flag: string;
    }>;
  }>;
}

export default function DoctorPortalPage() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDoctorData() {
      try {
        setLoading(true);
        const res = await fetch("/api/doctors");
        const data = await res.json();
        if (data.doctors && data.doctors.length > 0) {
          setDoctors(data.doctors);
          setSelectedDoctorId(data.doctors[0].id);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, []);

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const filteredOrders = (currentDoctor?.orders || []).filter((o) => {
    return (
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.patient.phone.includes(search)
    );
  });

  const criticalOrdersCount = (currentDoctor?.orders || []).filter((o) => o.status === "READY_CRITICAL").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
              Referring Doctor Clinical Portal
            </h1>
            <span className="kanso-pill font-mono text-[9px]">
              90-DAY ARCHIVE
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Access 90 days of signed diagnostic reports for your referred patients across all 6 coastal AP labs.
          </p>
        </div>

        {/* Doctor Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-serif font-semibold text-[var(--ink)]">Active Physician:</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] font-serif font-semibold text-xs text-[var(--ink)] focus:outline-none"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialty || "Physician"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentDoctor && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Referred Patients (90 Days)</div>
            <div className="text-3xl font-serif font-semibold text-[var(--ink)] mt-1">{currentDoctor.orders.length}</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">Total cases received</div>
          </div>

          <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Critical Alerts</div>
            <div className="text-3xl font-serif font-semibold text-rose-600 mt-1">{criticalOrdersCount}</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">Urgent lab escalations</div>
          </div>

          <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Doctor Code</div>
            <div className="text-xl font-bold font-mono text-[var(--ink)] mt-1">{currentDoctor.code}</div>
            <div className="text-xs text-[var(--ink-secondary)] mt-0.5">{currentDoctor.specialty}</div>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="kanso-card rounded-3xl bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search referred patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
            />
          </div>

          <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 self-start sm:self-auto font-mono">
            <Calendar className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
            <span>Archive window: <strong>Last 90 days</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-[var(--surface-card)] border-b border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Order &amp; Date</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Parameters &amp; Findings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)] font-mono">
                    No patient records found for this doctor.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isCrit = o.status === "READY_CRITICAL";
                  return (
                    <tr key={o.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <div className="text-[var(--ink)]">{o.id}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] font-sans font-normal">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-serif font-semibold text-[var(--ink)] text-sm">{o.patient.fullName}</div>
                        <div className="text-[11px] text-[var(--ink-muted)] font-mono">
                          {o.patient.age}y / {o.patient.gender} • MRN: {o.patient.mrn}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex flex-wrap gap-1 font-mono">
                          {o.parameters.map((p, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                p.flag === "CRITICAL"
                                  ? "bg-rose-100 text-rose-800 font-bold border border-rose-300"
                                  : p.flag === "OUT_OF_RANGE"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-[var(--surface-card)] text-[var(--ink-secondary)] border border-[var(--border)]"
                              }`}
                            >
                              {p.parameterName}: {p.resultValue} {p.unit}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isCrit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" /> Critical Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/report/${o.id}`}
                          className="kanso-btn-secondary py-1 px-3 text-xs"
                        >
                          <span>View Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
