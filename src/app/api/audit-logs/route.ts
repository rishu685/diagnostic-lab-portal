import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.accessLog.findMany({
      include: {
        order: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    console.error("Fetch audit logs error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to load audit logs" }, { status: 500 });
  }
}
