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
  Clock,
  Printer,
  ShieldCheck,
  User
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Referring Doctor Clinical Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access 90 days of signed diagnostic reports for your referred patients across all 6 coastal AP labs.
          </p>
        </div>

        {/* Doctor Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-600">Active Doctor:</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Referred Patients (90 Days)</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{currentDoctor.orders.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total cases received</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Critical Alerts</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">{criticalOrdersCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Urgent lab escalations</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Doctor Code</div>
            <div className="text-xl font-bold font-mono text-indigo-700 mt-1">{currentDoctor.code}</div>
            <div className="text-xs text-slate-500 mt-0.5">{currentDoctor.specialty}</div>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search referred patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Showing records from the last <strong>90 days</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Order & Date</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Parameters & Findings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No patient records found for this doctor.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isCrit = o.status === "READY_CRITICAL";
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        <div>{o.id}</div>
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{o.patient.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {o.patient.age}y / {o.patient.gender} • MRN: {o.patient.mrn}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {o.parameters.map((p, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                p.flag === "CRITICAL"
                                  ? "bg-rose-100 text-rose-800 font-bold"
                                  : p.flag === "OUT_OF_RANGE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {p.parameterName}: {p.resultValue} {p.unit}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isCrit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Critical Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/report/${o.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors"
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
