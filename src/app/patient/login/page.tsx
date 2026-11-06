"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
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
    <div className="max-w-md mx-auto px-4 pt-12 space-y-6">
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            రోగి పోర్టల్ / Patient Portal
          </h1>
          <p className="text-xs text-slate-500">
            Log in with your registered phone number to view all laboratory results.
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
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
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  phone === sp.phone
                    ? "bg-amber-600 text-white border-amber-600 font-bold"
                    : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "PHONE" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                మీ నమోదిత మొబైల్ నంబర్ / Registered Mobile:
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
            </div>

            {/* DPDP Consent */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
              <input
                type="checkbox"
                id="consent"
                defaultChecked
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="consent" className="cursor-pointer">
                I give consent under the DPDP Act 2023 to view my diagnostic report electronically.
              </label>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
              className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Sending..." : "Send Login OTP (ఓటీపీ పంపండి)"}</span>
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
                Enter 6-Digit Verification Code:
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
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{loading ? "Verifying..." : "Access Report (రిపోర్ట్ చూడండి)"}</span>
            </button>

            <div className="text-center">
              <button
                onClick={() => setStep("PHONE")}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p>Protected by Digital Personal Data Protection Act 2023</p>
          <p>Coastal Diagnostics • Vijayawada, Andhra Pradesh</p>
        </div>
      </div>
    </div>
  );
}
