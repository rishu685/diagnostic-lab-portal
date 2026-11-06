import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        orders: {
          include: {
            patient: true,
            parameters: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, doctors });
  } catch (err: unknown) {
    console.error("Fetch doctors error:", err);
    return NextResponse.json({ error: (err as Error).message || "Failed to load doctors" }, { status: 500 });
  }
}
