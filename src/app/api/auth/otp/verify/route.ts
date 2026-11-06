import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, logAuditTrail, verifyExpiringToken } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, token } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone number and OTP code are required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    const otpResult = verifyOtp(cleanPhone, code);
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.error || "Invalid OTP code" }, { status: 400 });
    }

    // Token validation if token provided
    let tokenOrderId: string | undefined;
    if (token) {
      const tokenCheck = verifyExpiringToken(token);
      if (tokenCheck.valid && tokenCheck.payload) {
        tokenOrderId = tokenCheck.payload.orderId;
      }
    }

    // Lookup patient
    const patient = await prisma.patient.findFirst({
      where: { phone: { contains: cleanPhone } },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    const matchedOrderId = tokenOrderId || patient.orders[0]?.id || "UNKNOWN";

    // DPDP Act Consent Affirmation & Audit
    await logAuditTrail({
      orderId: matchedOrderId,
      actorPhone: cleanPhone,
      actorRole: "PATIENT",
      action: "OTP_VERIFIED_SESSION_GRANTED",
      status: "SUCCESS",
      details: "Two-factor authentication successful. Patient consented to digital report access.",
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        mrn: patient.mrn,
        preferredLang: patient.preferredLang,
      },
      targetOrderId: matchedOrderId,
    });

    // Set secure cookie for authorized report access
    response.cookies.set("patient_session", JSON.stringify({
      patientId: patient.id,
      phone: cleanPhone,
      verifiedAt: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 72 * 3600, // 72 hours
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: (err as Error).message || "Verification failed" }, { status: 500 });
  }
}
