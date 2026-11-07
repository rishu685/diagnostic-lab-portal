"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function ExpiringLinkEntryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    try {
      const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
      const parts = decoded.split(":");
      if (parts.length >= 3) {
        const [ord, ph, expStr] = parts;
        setOrderId(ord);
        setPhone(ph);
        const exp = parseInt(expStr, 10);
        if (Date.now() > exp) {
          setTokenExpired(true);
        }
      }
    } catch {
      setError("This report link appears damaged or malformed. Please contact the collection centre.");
    }
  }, [token]);

  const requestOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setSimulatedOtp(data.simulatedCode || "123456");
      } else {
        setError(data.error || "Failed to dispatch verification code");
      }
    } catch {
      setError("Network connection issue. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      setError(null);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, token }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/report/${data.targetOrderId || orderId}`);
      } else {
        setError(data.error || "Invalid OTP code. Please retry.");
      }
    } catch {
      setError("Verification failed due to network issue.");
    } finally {
      setVerifying(false);
    }
  };

  if (tokenExpired) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16">
        <div className="kanso-card rounded-3xl p-8 bg-[var(--surface)] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[var(--ink)]">Security Link Expired (72 Hours)</h2>
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
            Under India's Digital Personal Data Protection (DPDP) Act 2023, health report links expire automatically 72 hours after sign-off to protect your confidential medical data.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/patient/login?phone=${phone}`)}
              className="w-full kanso-btn-primary py-3.5 text-xs font-semibold"
            >
              Request Fresh OTP Link on Mobile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-12 space-y-6">
      <div className="kanso-card rounded-3xl p-7 sm:p-9 bg-[var(--surface)] shadow-[var(--shadow-md)] space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <span className="w-12 h-12 rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center mx-auto shadow-[var(--shadow-sm)]">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-serif font-semibold text-[var(--ink)] tracking-tight">
            మీ ల్యాబ్ రిపోర్ట్ <span className="font-sans font-normal text-sm text-[var(--ink-muted)] block sm:inline">/ Lab Report</span>
          </h1>
          <p className="text-xs text-[var(--ink-muted)] font-mono">
            Order: <strong className="text-[var(--ink)]">{orderId || "Diagnostic Order"}</strong>
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-3 text-xs text-[var(--ink-secondary)] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Evaluation Mode:</strong> Test code is <code className="bg-[var(--surface)] border border-[var(--border)] px-1 py-0.5 rounded font-mono font-bold text-[var(--ink)]">123456</code>. DPDP Act 72-hour TTL is running.
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!otpSent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5 font-serif">
                మీ నమోదిత మొబైల్ నంబర్ / Mobile Number:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-[var(--ink-muted)] font-mono font-semibold">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9848011111"
                  className="w-full pl-12 pr-4 py-3 text-base font-mono font-semibold tracking-wider rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                />
              </div>
              <p className="text-[11px] text-[var(--ink-muted)] mt-1 font-mono">We will send a 6-digit verification code to this phone.</p>
            </div>

            <button
              onClick={requestOtp}
              disabled={loading || phone.length < 10}
              className="w-full kanso-btn-primary py-3.5 text-sm"
            >
              <span>{loading ? "Sending Code..." : "Send Verification OTP (కోడ్ పంపండి)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--ink)] flex items-center justify-between">
              <div>
                <span>Code sent to <strong>+91 {phone}</strong></span>
                {simulatedOtp && (
                  <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 font-mono">
                    Demo OTP: <strong className="text-[var(--ink)]">{simulatedOtp}</strong>
                  </div>
                )}
              </div>
              <button
                onClick={() => setOtp(simulatedOtp || "123456")}
                className="text-[11px] font-bold text-[var(--ink)] underline font-mono"
              >
                Auto-fill
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5 text-center font-serif">
                Enter 6-Digit OTP (ఓటీపీ నంబర్ నమోదు చేయండి):
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full py-3 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifying || otp.length < 6}
              className="w-full kanso-btn-primary py-3.5 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{verifying ? "Verifying..." : "View My Report (రిపోర్ట్ చూడండి)"}</span>
            </button>

            <div className="text-center">
              <button
                onClick={requestOtp}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] underline"
              >
                Did not receive code? Resend SMS
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[var(--border)] text-center text-[10px] text-[var(--ink-muted)] space-y-1 font-mono">
          <p>Protected by Digital Personal Data Protection Act 2023</p>
          <p>Coastal Diagnostics, Vijayawada Central Lab • NABL Accredited</p>
        </div>
      </div>
    </div>
  );
}
