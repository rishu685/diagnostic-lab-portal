"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function PatientLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("9848011111");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  const samplePatients = [
    { name: "Lakshmi Prasanna K (Haemoglobin 10.2)", phone: "9848011111" },
    { name: "Farzana Begum (Critical Potassium 6.8)", phone: "9848033333" },
    { name: "Venkata Rao M (Processing in Lab)", phone: "9848022222" },
    { name: "Subba Rao Chowdary (Routine Normal)", phone: "9848044444" },
    { name: "Bhavani Devi Y (Thyroid & Sugar)", phone: "9848055555" },
  ];

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setSimulatedOtp(data.simulatedCode || "123456");
        setStep("OTP");
      } else {
        setError(data.error || "Failed to dispatch verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/report/${data.targetOrderId}`);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 sm:pt-16 space-y-6">
      <div className="kanso-card rounded-3xl p-7 sm:p-9 bg-[var(--surface)] border-[var(--border)] shadow-[var(--shadow-md)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="w-12 h-12 rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center mx-auto shadow-[var(--shadow-sm)]">
            <UserCheck className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)] tracking-tight">
            రోగి పోర్టల్ <span className="font-sans font-normal text-sm text-[var(--ink-muted)] block sm:inline">/ Patient Portal</span>
          </h1>
          <p className="text-xs text-[var(--ink-muted)] max-w-xs mx-auto">
            Log in with your registered phone number to view all laboratory results.
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-4 text-xs text-[var(--ink)] space-y-2.5">
          <div className="flex items-center gap-1.5 font-serif font-semibold text-[var(--ink)]">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Select Sample Patient from Brief:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {samplePatients.map((sp) => (
              <button
                key={sp.phone}
                onClick={() => {
                  setPhone(sp.phone);
                  setStep("PHONE");
                  setOtp("");
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                  phone === sp.phone
                    ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                    : "bg-[var(--surface)] text-[var(--ink-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "PHONE" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5 font-serif">
                మీ నమోదిత మొబైల్ నంబర్ / Registered Mobile:
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
            </div>

            {/* DPDP Consent */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-[var(--ink-muted)]">
              <input
                type="checkbox"
                id="consent"
                defaultChecked
                className="mt-0.5 rounded text-[var(--ink)]"
              />
              <label htmlFor="consent" className="cursor-pointer">
                I give consent under the DPDP Act 2023 to view my diagnostic report electronically.
              </label>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
              className="w-full kanso-btn-primary py-3.5 text-sm"
            >
              <span>{loading ? "Sending..." : "Send Login OTP (కోడ్ పంపండి)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--ink)] flex items-center justify-between">
              <div>
                <span>Code sent to <strong>+91 {phone}</strong></span>
                {simulatedOtp && (
                  <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5 font-mono">
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
                Enter 6-Digit Verification Code:
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
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full kanso-btn-primary py-3.5 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Verifying..." : "Access Report (రిపోర్ట్ చూడండి)"}</span>
            </button>

            <div className="text-center">
              <button
                onClick={() => setStep("PHONE")}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] underline"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[var(--border)] text-center text-[10px] text-[var(--ink-muted)] space-y-1 font-mono">
          <p>Protected by Digital Personal Data Protection Act 2023</p>
          <p>Coastal Diagnostics • Vijayawada, Andhra Pradesh</p>
        </div>
      </div>
    </div>
  );
}
