import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateTestParameters } from "@/lib/clinical-rules";
import { generateExpiringToken, logAuditTrail } from "@/lib/security";
import { generateReportSummary } from "@/lib/ai-service";

interface RawRow {
  orderId: string;
  patientName: string;
  parameterRaw: string;
  resultVal: number;
  refRangeRaw: string;
  statusRaw: string;
  doctorName: string;
  phone: string;
  age: number;
  gender: string;
}

export async function POST(req: NextRequest) {
  try {
    const { csvContent } = await req.json();
    if (!csvContent?.trim()) {
      return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
    }

    const lines = csvContent.trim().split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must contain a header and at least one data row" }, { status: 400 });
    }

    const separator = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(separator).map((h: string) => h.trim().toLowerCase());

    const findIdx = (needle: string) => headers.findIndex((h: string) => h.includes(needle));
    const [orderIdx, patIdx, resIdx, parIdx, refIdx, statIdx, docIdx, phIdx, ageIdx, genIdx] = [
      findIdx("order"), findIdx("patient"), findIdx("result"), findIdx("parameter"),
      headers.findIndex((h: string) => h.includes("reference") || h.includes("range")),
      findIdx("status"), findIdx("doctor"), findIdx("phone"), findIdx("age"), findIdx("gender")
    ];

    if (orderIdx === -1 || patIdx === -1 || resIdx === -1) {
      return NextResponse.json({ error: "CSV missing mandatory columns (Order ID, Patient, Result)" }, { status: 400 });
    }

    // Group rows by Order ID
    const grouped: Record<string, RawRow[]> = lines.slice(1).reduce((acc: Record<string, RawRow[]>, line: string) => {
      const p = line.split(separator).map((s: string) => s.trim());
      if (p.length > Math.max(orderIdx, patIdx, resIdx)) {
        const id = p[orderIdx];
        if (!acc[id]) acc[id] = [];
        acc[id].push({
          orderId: id,
          patientName: p[patIdx],
          parameterRaw: parIdx !== -1 ? p[parIdx] : "General Chemistry",
          resultVal: parseFloat(p[resIdx]) || 0,
          refRangeRaw: refIdx !== -1 ? p[refIdx] : "0 - 100",
          statusRaw: statIdx !== -1 ? p[statIdx] : "Ready",
          doctorName: docIdx !== -1 ? p[docIdx] : "Dr. S. Ramanaiah",
          phone: phIdx !== -1 && p[phIdx] ? p[phIdx] : "98480" + Math.floor(10000 + Math.random() * 90000),
          age: ageIdx !== -1 && parseInt(p[ageIdx], 10) ? parseInt(p[ageIdx], 10) : 45,
          gender: genIdx !== -1 && p[genIdx] ? p[genIdx] : "Female",
        });
      }
      return acc;
    }, {});

    const processedOrders = [];

    for (const [orderId, rawRows] of Object.entries(grouped)) {
      const rows = rawRows as RawRow[];
      const first = rows[0];

      // Upsert Doctor & Patient
      const doctor = (await prisma.doctor.findFirst({ where: { name: { contains: first.doctorName } } })) ??
        await prisma.doctor.create({
          data: { name: first.doctorName, code: `DOC-${Math.floor(100 + Math.random() * 900)}`, specialty: "Physician" },
        });

      const patient = (await prisma.patient.findFirst({ where: { fullName: first.patientName } })) ??
        await prisma.patient.create({
          data: {
            mrn: `MRN-VJ-${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: first.patientName,
            phone: first.phone,
            age: first.age,
            gender: first.gender,
            consentGiven: true,
          },
        });

      const token = generateExpiringToken(orderId, patient.phone, 72);
      const isCriticalStatus = first.statusRaw.toLowerCase().includes("critical");
      let status = isCriticalStatus ? "READY_CRITICAL" : first.statusRaw.toLowerCase().includes("process") ? "PROCESSING" : "READY";

      const order = await prisma.order.upsert({
        where: { id: orderId },
        update: { status, signedAt: status !== "PROCESSING" ? new Date() : null, secureToken: token },
        create: {
          id: orderId,
          patientId: patient.id,
          doctorId: doctor.id,
          labCentre: "Vijayawada Central Lab",
          status,
          signedAt: status !== "PROCESSING" ? new Date() : null,
          secureToken: token,
          tokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        },
      });

      // Parse & insert parameters
      await prisma.testResult.deleteMany({ where: { orderId } });
      const parsedParams = rows.map((r: RawRow) => {
        const lastSpace = r.parameterRaw.lastIndexOf(" ");
        const hasUnit = lastSpace > 0 && r.parameterRaw.length - lastSpace < 10;
        const [refMin, refMax] = r.refRangeRaw.split("-").map((v: string) => parseFloat(v.trim()));

        return {
          parameterName: hasUnit ? r.parameterRaw.substring(0, lastSpace).trim() : r.parameterRaw,
          unit: hasUnit ? r.parameterRaw.substring(lastSpace + 1).trim() : "units",
          resultValue: r.resultVal,
          refRangeMin: isNaN(refMin) ? 0 : refMin,
          refRangeMax: isNaN(refMax) ? 100 : refMax,
          category: "Diagnostic Panel",
        };
      });

      for (const p of parsedParams) {
        await prisma.testResult.create({
          data: {
            orderId: order.id,
            testCategory: p.category,
            parameterName: p.parameterName,
            resultValue: p.resultValue,
            unit: p.unit,
            refRangeMin: p.refRangeMin,
            refRangeMax: p.refRangeMax,
            flag: p.resultValue < p.refRangeMin || p.resultValue > p.refRangeMax ? "OUT_OF_RANGE" : "NORMAL",
          },
        });
      }

      // Evaluate clinical outcome
      const outcome = evaluateTestParameters(parsedParams);
      if (outcome.isCritical || isCriticalStatus) {
        status = "READY_CRITICAL";
        await prisma.order.update({ where: { id: order.id }, data: { status, signedAt: new Date() } });
        await prisma.callbackTask.upsert({
          where: { orderId: order.id },
          update: { urgentReason: outcome.criticalReason || "Critical value detected", status: "PENDING" },
          create: {
            orderId: order.id,
            urgentReason: outcome.criticalReason || "Critical value detected",
            assignedTo: "Front Desk Nurse Coordinator",
            status: "PENDING",
          },
        });
      } else if (status === "READY") {
        const summary = await generateReportSummary(patient.fullName, patient.age, patient.gender, parsedParams);
        if (summary) {
          await prisma.aiSummary.upsert({
            where: { orderId: order.id },
            update: { summaryEn: summary.summaryEn, summaryTe: summary.summaryTe, summaryHi: summary.summaryHi, isTemplate: summary.isTemplate },
            create: { orderId: order.id, summaryEn: summary.summaryEn, summaryTe: summary.summaryTe, summaryHi: summary.summaryHi, isTemplate: summary.isTemplate, pathologistApproved: true },
          });
        }
      }

      await logAuditTrail({
        orderId: order.id,
        actorPhone: "LIS_IMPORT",
        actorRole: "SYSTEM",
        action: "LIS_CSV_INGESTION_COMPLETED",
        details: `Imported ${parsedParams.length} parameters. Status set to ${status}.`,
      });

      processedOrders.push({ orderId: order.id, patientName: patient.fullName, doctor: doctor.name, status, secureToken: token });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedOrders.length} orders from LIS export.`,
      orders: processedOrders,
    });
  } catch (err: unknown) {
    console.error("LIS CSV import failed:", err);
    return NextResponse.json({ error: (err as Error).message || "Internal server error" }, { status: 500 });
  }
}
