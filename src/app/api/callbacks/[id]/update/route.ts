import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditTrail } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, callNotes, assignedTo } = body;

    const task = await prisma.callbackTask.findUnique({
      where: { id },
      include: { order: { include: { patient: true } } },
    });

    if (!task) {
      return NextResponse.json({ error: "Callback task not found" }, { status: 404 });
    }

    const updated = await prisma.callbackTask.update({
      where: { id },
      data: {
        status: status || task.status,
        callNotes: callNotes !== undefined ? callNotes : task.callNotes,
        assignedTo: assignedTo || task.assignedTo,
        calledAt: status === "IN_PROGRESS" || status === "RESOLVED" ? new Date() : task.calledAt,
        resolvedAt: status === "RESOLVED" ? new Date() : task.resolvedAt,
      },
    });

    await logAuditTrail({
      orderId: task.orderId,
      actorPhone: "FRONT_DESK",
      actorRole: "FRONT_DESK",
      action: "CALLBACK_TASK_STATUS_UPDATED",
      status: "SUCCESS",
      details: `Callback updated to ${status}. Notes: ${callNotes || "None"}`,
    });

    return NextResponse.json({
      success: true,
      message: `Critical callback status updated to ${status}.`,
      task: updated,
    });
  } catch (err: unknown) {
    console.error("Callback update error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to update callback" }, { status: 500 });
  }
}
