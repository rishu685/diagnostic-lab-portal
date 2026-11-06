import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditTrail } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const summary = await prisma.aiSummary.findUnique({
      where: { orderId },
    });

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    const updated = await prisma.aiSummary.update({
      where: { orderId },
      data: {
        isFlaggedByPatient: true,
        patientFeedback: reason || "Patient requested clarification from clinical team.",
      },
    });

    await logAuditTrail({
      orderId,
      actorPhone: "PATIENT",
      actorRole: "PATIENT",
      action: "AI_SUMMARY_FLAGGED_FOR_REVIEW",
      status: "SUCCESS",
      details: `Summary flagged for pathologist audit. Reason: ${reason || "Unspecified"}`,
    });

    return NextResponse.json({
      success: true,
      message: "Summary has been flagged for weekly pathologist quality review. Our clinical desk has been alerted.",
      summary: updated,
    });
  } catch (err: unknown) {
    console.error("Flag summary error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to flag summary" }, { status: 500 });
  }
}
