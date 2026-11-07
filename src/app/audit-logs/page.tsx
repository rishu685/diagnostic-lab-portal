"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  RefreshCw,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
              DPDP Act 2023 Access Audit Log
            </h1>
            <span className="kanso-pill font-mono text-[9px]">
              LEGAL COMPLIANCE
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Immutable, timestamped record of every access attempt, OTP verification, and dispatch event under Indian digital data privacy law.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="kanso-btn-secondary py-1.5 px-3 text-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Total Audited Events</div>
          <div className="text-3xl font-serif font-semibold text-[var(--ink)] mt-1">{logs.length}</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">100% Traceability</div>
        </div>

        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Data Hosting Residency</div>
          <div className="text-lg font-serif font-semibold text-[var(--ink)] mt-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>India (MeitY Empanelled)</span>
          </div>
          <div className="text-xs text-[var(--ink-muted)] mt-0.5">DPDP Compliant Sovereign Storage</div>
        </div>

        <div className="kanso-card rounded-2xl p-5 bg-[var(--surface)]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)]">Expiring Link Policy</div>
          <div className="text-xl font-bold font-mono text-[var(--ink)] mt-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[var(--ink-muted)]" />
            <span>72 Hours TTL</span>
          </div>
          <div className="text-xs text-[var(--ink-muted)] mt-0.5">HMAC-SHA256 Token Signature</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="kanso-card rounded-3xl bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, order, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
            />
          </div>

          <div className="flex items-center gap-1">
            {["ALL", "PATIENT", "FRONT_DESK", "SYSTEM"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  roleFilter === role
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:text-[var(--ink)] border border-[var(--border)]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-[var(--surface-card)] border-b border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp &amp; IP</th>
                <th className="py-3 px-4">Order &amp; Patient</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Details / Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)] font-mono">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-[var(--ink)]">{new Date(log.createdAt).toLocaleTimeString()}</div>
                      <div className="text-[10px] text-[var(--ink-muted)]">
                        {new Date(log.createdAt).toLocaleDateString()} • {log.ipAddress || "127.0.0.1"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-[var(--ink)]">{log.orderId}</div>
                      <div className="text-[11px] text-[var(--ink-muted)] font-sans">{log.order?.patient?.fullName || "Patient Record"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="kanso-pill font-mono text-[9px] uppercase tracking-wider">
                        {log.actorRole}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[var(--ink)] text-[11px]">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-[var(--ink-secondary)] max-w-sm truncate text-[11px]">
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
