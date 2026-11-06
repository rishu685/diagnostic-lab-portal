import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditTrail } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        parameters: true,
        aiSummary: true,
        callbackTask: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Log access in DPDP audit trail
    await logAuditTrail({
      orderId: order.id,
      actorPhone: order.patient.phone,
      actorRole: "PATIENT",
      action: "REPORT_ACCESSED_AND_VIEWED",
      status: "SUCCESS",
      details: `Full medical report opened. Parameters rendered: ${order.parameters.length}.`,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    console.error("Fetch single order error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to load order" }, { status: 500 });
  }
}
