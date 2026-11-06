"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe
} from "lucide-react";

interface LogEntry {
  id: string;
  orderId: string;
  actorPhone: string;
  actorRole: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  details: string | null;
  createdAt: string;
  order: {
    id: string;
    patient: {
      fullName: string;
    };
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.orderId.toLowerCase().includes(search.toLowerCase()) ||
      l.actorPhone.includes(search) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter !== "ALL" && l.actorRole !== roleFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">DPDP Act 2023 Access Audit Log</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, timestamped record of every access attempt, OTP verification, and dispatch event under Indian digital data privacy law.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Audited Events</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-0.5">100% Traceability</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Data Hosting Residency</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>India (MeitY Empanelled)</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">DPDP Compliant Sovereign Storage</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Expiring Link Policy</div>
          <div className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>72 Hours TTL</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">HMAC-SHA256 Token Signature</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by action, order, or detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1">
            {["ALL", "PATIENT", "FRONT_DESK", "SYSTEM"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  roleFilter === role
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp & IP</th>
                <th className="py-3 px-4">Order & Patient</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Details / Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-900 font-semibold">{new Date(log.createdAt).toLocaleTimeString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()} • {log.ipAddress || "127.0.0.1"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{log.orderId}</div>
                      <div className="text-[11px] text-slate-500">{log.order?.patient?.fullName || "Patient Record"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.actorRole === "PATIENT"
                          ? "bg-sky-100 text-sky-800"
                          : log.actorRole === "FRONT_DESK"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {log.actorRole}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate text-[11px]">
                      {log.details || "No extra metadata"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
