import { NextRequest, NextResponse } from "next/server";
import { issueOtp, logAuditTrail, verifyExpiringToken } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    let orderId: string | undefined;

    if (token) {
      const verification = verifyExpiringToken(token);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error || "Invalid or expired link" }, { status: 403 });
      }
      orderId = verification.payload?.orderId;
    }

    // Verify patient exists in records
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
      return NextResponse.json(
        { error: "No patient record found matching this mobile number. Please check the number or contact the front desk." },
        { status: 404 }
      );
    }

    const targetOrderId = orderId || patient.orders[0]?.id || "UNKNOWN";

    const { code, expiresAt } = issueOtp(cleanPhone);

    // DPDP Act Audit Log
    await logAuditTrail({
      orderId: targetOrderId,
      actorPhone: cleanPhone,
      actorRole: "PATIENT",
      action: "OTP_REQUESTED",
      status: "SUCCESS",
      details: `OTP dispatched to registered mobile number ending with ${cleanPhone.slice(-4)}.`,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent via SMS to ******${cleanPhone.slice(-4)}.`,
      // Provide simulatedCode for sandbox staging environments
      simulatedCode: code,
      expiresAt,
    });
  } catch (err: unknown) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to send OTP" }, { status: 500 });
  }
}
