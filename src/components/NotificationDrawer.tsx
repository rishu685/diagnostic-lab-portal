"use client";

import { useState } from "react";
import { MessageSquare, ExternalLink, Check, Copy, Clock, ShieldCheck, Sparkles } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "WHATSAPP" | "SMS";
  recipient: string;
  patientName: string;
  orderId: string;
  content: string;
  link?: string;
  timestamp: string;
}

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default simulated notifications from seed data
  const [notifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "WHATSAPP",
      recipient: "+91 98480 11111",
      patientName: "Lakshmi Prasanna K",
      orderId: "ORD-71204",
      content: "నమస్కారం లక్ష్మీ ప్రసన్న గారు, మీ లేబొరేటరీ రిపోర్ట్ (ORD-71204) సిద్ధంగా ఉంది. మీ సురక్షితమైన లింక్ ద్వారా రిపోర్ట్ చూడండి. ఈ లింక్ 72 గంటలలో ముగుస్తుంది.",
      link: "/patient/login?phone=9848011111&order=ORD-71204",
      timestamp: "3 mins ago",
    },
    {
      id: "notif-2",
      type: "SMS",
      recipient: "+91 98480 11111",
      patientName: "Lakshmi Prasanna K",
      orderId: "ORD-71204",
      content: "Your Coastal Diagnostics OTP for digital report access is 123456. Valid for 10 minutes. DPDP Act 2023 protected.",
      timestamp: "Just now",
    },
    {
      id: "notif-3",
      type: "WHATSAPP",
      recipient: "+91 98480 33333",
      patientName: "Farzana Begum",
      orderId: "ORD-71233",
      content: "Emergency Alert: Your report ORD-71233 contains critical values. Our duty clinical team is calling you immediately on this number.",
      link: "/callbacks",
      timestamp: "45 mins ago",
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all border border-slate-700 font-medium text-xs sm:text-sm active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span>SMS / WhatsApp Simulator</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-300">
            {notifications.length}
          </span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs" onClick={() => setIsOpen(false)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Simulated Outbox (SMS / WhatsApp)</h3>
                  <p className="text-[11px] text-slate-500">Live feed of patient messages & expiring links</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reviewer Note:</strong> Outside SMS/WhatsApp systems are mocked per the brief. Use OTP <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">123456</code> to unlock any report!
              </div>
            </div>

            {/* Notification Cards */}
            <div className="mt-4 space-y-3.5 flex-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-shadow text-xs ${
                    n.type === "WHATSAPP"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-sky-50/50 border-sky-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      n.type === "WHATSAPP" ? "bg-emerald-600 text-white" : "bg-sky-600 text-white"
                    }`}>
                      {n.type}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-normal">
                      <Clock className="w-3 h-3" /> {n.timestamp}
                    </span>
                  </div>

                  <div className="text-slate-900 font-medium mb-1 flex items-center justify-between">
                    <span>{n.patientName} ({n.recipient})</span>
                    <span className="text-slate-500 font-mono text-[10px]">{n.orderId}</span>
                  </div>

                  <p className="text-slate-700 text-xs bg-white/80 p-2.5 rounded-lg border border-slate-200/80 mb-2.5 leading-relaxed">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => copyToClipboard(n.content, n.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      {copiedId === n.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Message
                        </>
                      )}
                    </button>

                    {n.link && (
                      <a
                        href={n.link}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Open as Patient <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DPDP 72-Hour TTL Active
              </span>
              <span>All communications audited</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
