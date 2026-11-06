import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.callbackTask.findMany({
      include: {
        order: {
          include: {
            patient: true,
            doctor: true,
            parameters: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (err: unknown) {
    console.error("Fetch callbacks error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to fetch callback tasks" }, { status: 500 });
  }
}
