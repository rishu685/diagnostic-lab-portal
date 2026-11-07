"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  RefreshCw
} from "lucide-react";

interface OrderItem {
  id: string;
  patient: { fullName: string; phone: string; age: number; gender: string };
  doctor: { name: string };
  labCentre: string;
  status: string;
  tokenExpiresAt: string | null;
  parameters: Array<{ parameterName: string; resultValue: number; unit: string; flag: string }>;
}

export default function FrontDeskPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleResend = async (orderId: string, channel: "WHATSAPP" | "SMS") => {
    try {
      setResendingId(orderId);
      setActionSuccess(null);
      const res = await fetch(`/api/orders/${orderId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, staffNote: "Requested by patient via front-desk inquiry" }),
      });
      if (res.ok) {
        setActionSuccess(`Fresh 72h link dispatched via ${channel} to patient!`);
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to resend link");
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setResendingId(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(term) || o.patient.fullName.toLowerCase().includes(term) || o.patient.phone.includes(term);
    return matchesSearch && (statusFilter === "ALL" || o.status === statusFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
              Front-Desk Dispatch <span className="ampersand">&amp;</span> Resend Console
            </h1>
            <span className="kanso-pill font-mono text-[9px]">VIJAYAWADA CENTRAL</span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Resolve patient status inquiries instantly, monitor 72h token countdowns, and resend secure links.
          </p>
        </div>

        <button onClick={fetchOrders} className="kanso-btn-secondary py-1.5 px-3 self-start text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-3.5 text-xs font-medium flex items-center justify-between shadow-[var(--shadow-sm)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 text-sm">✕</button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="kanso-card rounded-2xl p-3.5 bg-[var(--surface)] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, phone or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "READY", label: "Ready" },
            { id: "READY_CRITICAL", label: "Critical Alert" },
            { id: "PROCESSING", label: "Processing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:text-[var(--ink)] border border-[var(--border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="kanso-card rounded-3xl overflow-hidden bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-[var(--surface-card)] border-b border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order ID &amp; Centre</th>
                <th className="py-3.5 px-4">Patient Details</th>
                <th className="py-3.5 px-4">Tests &amp; Findings</th>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Link Window (72h)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--ink-muted)]" />
                    <span>Loading patient records...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)] font-mono">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isCritical = o.status === "READY_CRITICAL";
                  const isProcessing = o.status === "PROCESSING";
                  const hasExpired = o.tokenExpiresAt ? new Date(o.tokenExpiresAt) < new Date() : false;

                  return (
                    <tr key={o.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <div className="text-[var(--ink)]">{o.id}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] font-sans font-normal truncate max-w-[140px]">{o.labCentre}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-serif font-semibold text-[var(--ink)] text-sm">{o.patient.fullName}</div>
                        <div className="text-[11px] text-[var(--ink-muted)] font-mono">
                          {o.patient.age}y / {o.patient.gender} • +91 {o.patient.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1 font-mono">
                          {o.parameters.map((p, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                p.flag === "CRITICAL"
                                  ? "bg-rose-100 text-rose-800 font-bold border border-rose-200"
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

                      <td className="py-3.5 px-4 text-[var(--ink-secondary)]">{o.doctor.name}</td>

                      <td className="py-3.5 px-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <ShieldAlert className="w-3 h-3" /> Ready (Critical)
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" /> In Analyzer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Ready &amp; Signed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        {isProcessing ? (
                          <span className="text-[var(--ink-muted)]">Not signed yet</span>
                        ) : hasExpired ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3 h-3" /> Expired (&gt;72h)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-emerald-600" /> Active 72h Link
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleResend(o.id, "WHATSAPP")}
                          disabled={resendingId === o.id || isProcessing}
                          className="kanso-btn-secondary py-1 px-2.5 text-xs font-semibold disabled:opacity-40"
                          title="Resend 72h secure link via WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>{resendingId === o.id ? "Sending..." : "Resend Link"}</span>
                        </button>

                        <Link href={`/report/${o.id}`} className="kanso-btn-primary py-1 px-2.5 text-xs font-semibold">
                          <span>Report</span>
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
