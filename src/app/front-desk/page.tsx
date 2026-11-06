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
  Phone,
  RefreshCw,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface OrderItem {
  id: string;
  patient: {
    fullName: string;
    phone: string;
    age: number;
    gender: string;
  };
  doctor: {
    name: string;
  };
  labCentre: string;
  status: string;
  signedAt: string | null;
  secureToken: string | null;
  tokenExpiresAt: string | null;
  parameters: Array<{
    parameterName: string;
    resultValue: number;
    unit: string;
    flag: string;
  }>;
  callbackTask?: {
    status: string;
    urgentReason: string;
  } | null;
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
      if (data.orders) {
        setOrders(data.orders);
      }
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
        body: JSON.stringify({ channel, staffNote: "Requested by patient via front-desk desk inquiry" }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Fresh 72h link dispatched via ${channel} to patient!`);
        fetchOrders();
      } else {
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
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.patient.phone.includes(searchTerm);

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "READY_CRITICAL") return o.status === "READY_CRITICAL";
    if (statusFilter === "PROCESSING") return o.status === "PROCESSING";
    if (statusFilter === "READY") return o.status === "READY";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Front-Desk Dispatch & Resend Console</h1>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              Vijayawada Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Instantly resolve patient status inquiries, track delivery states, and resend secure 72h links.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 text-sm">✕</button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Patient name, phone or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Centre</th>
                <th className="py-3.5 px-4">Patient Details</th>
                <th className="py-3.5 px-4">Tests & Flags</th>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4">Link Window (72h)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading patient orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching orders found. Try a different query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isCritical = o.status === "READY_CRITICAL";
                  const isProcessing = o.status === "PROCESSING";
                  const hasExpired = o.tokenExpiresAt ? new Date(o.tokenExpiresAt) < new Date() : false;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        <div>{o.id}</div>
                        <div className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[140px]">
                          {o.labCentre}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{o.patient.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {o.patient.age}y / {o.patient.gender} • +91 {o.patient.phone}
                        </div>
                      </td>

                      {/* Parameters & Flags */}
                      <td className="py-3.5 px-4 max-w-[200px]">
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

                      {/* Doctor */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{o.doctor.name}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <ShieldAlert className="w-3 h-3" /> Ready (Critical)
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> In Analyzer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Ready & Signed
                          </span>
                        )}
                      </td>

                      {/* Link Expiry Window */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {isProcessing ? (
                          <span className="text-slate-400">Not signed yet</span>
                        ) : hasExpired ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Expired (&gt;72h)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" /> Active 72h Link
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Resend Link Button */}
                        <button
                          onClick={() => handleResend(o.id, "WHATSAPP")}
                          disabled={resendingId === o.id || isProcessing}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold disabled:opacity-40 transition-colors"
                          title="Resend 72h secure link via WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>{resendingId === o.id ? "Sending..." : "Resend Link"}</span>
                        </button>

                        {/* View Report */}
                        <Link
                          href={`/report/${o.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold transition-colors"
                        >
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
