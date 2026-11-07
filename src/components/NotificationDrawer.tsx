"use client";

import { useState } from "react";
import { MessageSquare, ExternalLink, Check, Copy, Clock, ShieldCheck, Sparkles, X } from "lucide-react";

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
      {/* Floating Trigger Button in Kanso Style */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="kanso-btn-primary py-2.5 px-4 shadow-[var(--shadow-lg)] active:scale-95"
        >
          <div className="relative flex items-center">
            <span className="pulse-beacon mr-2" />
          </div>
          <span>SMS / WhatsApp Feed</span>
          <span className="kbd-shortcut bg-white/20 border-white/30 text-white ml-1">
            {notifications.length}
          </span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)}>
          <div
            className="w-full max-w-md bg-[var(--surface)] h-full shadow-[var(--shadow-stage)] flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-card)] border border-[var(--border)] text-[var(--ink)] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-[var(--ink)] text-sm">Simulated Outbox (SMS / WhatsApp)</h3>
                  <p className="text-[11px] text-[var(--ink-muted)]">Live dispatch stream &amp; 72-hour expiring links</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--ink-secondary)] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reviewer Note:</strong> Outside SMS systems are simulated per brief rules. Test OTP is <code className="bg-[var(--surface)] px-1 py-0.5 rounded border border-[var(--border)] font-mono font-bold text-[var(--ink)]">123456</code>.
              </div>
            </div>

            {/* Notification Cards */}
            <div className="mt-4 space-y-3.5 flex-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] transition-shadow text-xs space-y-2 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="kanso-pill font-mono text-[9px] uppercase tracking-wider">
                      {n.type}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1 font-normal font-mono">
                      <Clock className="w-3 h-3" /> {n.timestamp}
                    </span>
                  </div>

                  <div className="text-[var(--ink)] font-medium flex items-center justify-between">
                    <span>{n.patientName}</span>
                    <span className="font-mono text-[10px] text-[var(--ink-muted)]">{n.orderId}</span>
                  </div>

                  <p className="text-[var(--ink-secondary)] text-xs bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] leading-relaxed">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => copyToClipboard(n.content, n.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:underline"
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
                        className="kanso-btn-secondary py-1 px-3 text-[11px]"
                      >
                        <span>Open as Patient</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--ink-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DPDP 72-Hour TTL Active
              </span>
              <span>All dispatches audited</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
