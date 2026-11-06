"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  RefreshCw,
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

  // Auto-request OTP or inspect token on mount
  useEffect(() => {
    try {
      // Decode base64url token in browser to check expiry locally
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
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Security Link Expired (72 Hours)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Under India's Digital Personal Data Protection (DPDP) Act 2023, health report links expire automatically 72 hours after sign-off to protect your confidential medical data.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/patient/login?phone=${phone}`)}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
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
      {/* Elderly-Friendly Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            మీ ల్యాబ్ రిపోర్ట్ / Lab Report
          </h1>
          <p className="text-xs text-slate-500">
            Order Reference: <strong className="font-mono text-slate-800">{orderId || "Diagnostic Order"}</strong>
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Evaluation Mode:</strong> Test code is <code className="bg-amber-200 px-1 py-0.5 rounded font-mono font-bold text-amber-950">123456</code>. DPDP Act 72-hour TTL is running.
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                మీ నమోదిత మొబైల్ నంబర్ / Mobile Number:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-semibold">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9848011111"
                  className="w-full pl-12 pr-4 py-3 text-base font-semibold tracking-wider rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">We will send a 6-digit verification code to this phone.</p>
            </div>

            <button
              onClick={requestOtp}
              disabled={loading || phone.length < 10}
              className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Sending Code..." : "Send Verification OTP (కోడ్ పంపండి)"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center justify-between">
              <div>
                <span>Code sent to <strong>+91 {phone}</strong></span>
                {simulatedOtp && (
                  <div className="text-[11px] text-sky-700 mt-0.5">
                    Demo OTP: <strong className="font-mono">{simulatedOtp}</strong>
                  </div>
                )}
              </div>
              <button
                onClick={() => setOtp(simulatedOtp || "123456")}
                className="text-[11px] font-bold text-sky-700 underline"
              >
                Auto-fill
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit OTP (ఓటీపీ నంబర్ నమోదు చేయండి):
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full py-3 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifying || otp.length < 6}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{verifying ? "Verifying..." : "View My Report (రిపోర్ట్ చూడండి)"}</span>
            </button>

            <div className="text-center">
              <button
                onClick={requestOtp}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Did not receive code? Resend SMS
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p>Protected by Digital Personal Data Protection Act 2023</p>
          <p>Coastal Diagnostics, Vijayawada Central Lab • NABL Accredited</p>
        </div>
      </div>
    </div>
  );
}
