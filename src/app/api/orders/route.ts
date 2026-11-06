import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        patient: true,
        doctor: true,
        parameters: true,
        callbackTask: true,
        aiSummary: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    console.error("Fetch orders failed:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to fetch orders" }, { status: 500 });
  }
}
