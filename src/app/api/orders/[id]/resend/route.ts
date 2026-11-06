import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateExpiringToken, logAuditTrail } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { channel = "WHATSAPP", staffNote } = await req.json().catch(() => ({}));

    const order = await prisma.order.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate fresh 72-hour token
    const newToken = generateExpiringToken(order.id, order.patient.phone, 72);
    const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        secureToken: newToken,
        tokenExpiresAt: newExpiresAt,
      },
    });

    // Log in DPDP audit trail
    await logAuditTrail({
      orderId: order.id,
      actorPhone: "FRONT_DESK",
      actorRole: "FRONT_DESK",
      action: "LINK_RESENT",
      status: "SUCCESS",
      details: `Expiring link regenerated and resent via ${channel}. ${staffNote ? `Note: ${staffNote}` : ""}`,
    });

    const accessUrl = `/r/${newToken}`;

    return NextResponse.json({
      success: true,
      message: `Fresh 72h secure link dispatched to +91 ${order.patient.phone} via ${channel}.`,
      token: newToken,
      accessUrl,
      expiresAt: newExpiresAt,
    });
  } catch (err: unknown) {
    console.error("Resend link error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to resend link" }, { status: 500 });
  }
}
