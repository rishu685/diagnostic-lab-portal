import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateTestParameters } from "@/lib/clinical-rules";
import { generateExpiringToken, logAuditTrail } from "@/lib/security";
import { generateReportSummary } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
    }

    const lines = csvContent
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must contain a header and at least one data row" }, { status: 400 });
    }

    // Split headers: support tabs or commas
    const separator = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase());

    const orderIdIdx = headers.findIndex((h) => h.includes("order"));
    const patientIdx = headers.findIndex((h) => h.includes("patient"));
    const paramIdx = headers.findIndex((h) => h.includes("parameter"));
    const resultIdx = headers.findIndex((h) => h.includes("result"));
    const refRangeIdx = headers.findIndex((h) => h.includes("reference") || h.includes("range"));
    const statusIdx = headers.findIndex((h) => h.includes("status"));
    const doctorIdx = headers.findIndex((h) => h.includes("doctor"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone"));
    const ageIdx = headers.findIndex((h) => h.includes("age"));
    const genderIdx = headers.findIndex((h) => h.includes("gender"));

    if (orderIdIdx === -1 || patientIdx === -1 || resultIdx === -1) {
      return NextResponse.json({ error: "CSV missing mandatory columns (Order ID, Patient, Result)" }, { status: 400 });
    }

    // Group rows by Order ID
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

    const groupedByOrder: Record<string, RawRow[]> = {};

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(separator).map((p) => p.trim());
      if (parts.length <= Math.max(orderIdIdx, patientIdx, resultIdx)) continue;

      const orderId = parts[orderIdIdx];
      const patientName = parts[patientIdx];
      const parameterRaw = paramIdx !== -1 ? parts[paramIdx] : "General Chemistry";
      const resultVal = parseFloat(parts[resultIdx]) || 0;
      const refRangeRaw = refRangeIdx !== -1 ? parts[refRangeIdx] : "0 - 100";
      const statusRaw = statusIdx !== -1 ? parts[statusIdx] : "Ready";
      const doctorName = doctorIdx !== -1 ? parts[doctorIdx] : "Dr. S. Ramanaiah";
      const phone = phoneIdx !== -1 && parts[phoneIdx] ? parts[phoneIdx] : "98480" + Math.floor(10000 + Math.random() * 90000);
      const age = ageIdx !== -1 && parseInt(parts[ageIdx], 10) ? parseInt(parts[ageIdx], 10) : 45;
      const gender = genderIdx !== -1 && parts[genderIdx] ? parts[genderIdx] : "Female";

      if (!groupedByOrder[orderId]) {
        groupedByOrder[orderId] = [];
      }

      groupedByOrder[orderId].push({
        orderId,
        patientName,
        parameterRaw,
        resultVal,
        refRangeRaw,
        statusRaw,
        doctorName,
        phone,
        age,
        gender,
      });
    }

    const processedOrders = [];

    for (const [orderId, rows] of Object.entries(groupedByOrder)) {
      const first = rows[0];

      // Find or create Doctor
      let doctor = await prisma.doctor.findFirst({
        where: { name: { contains: first.doctorName } },
      });
      if (!doctor) {
        doctor = await prisma.doctor.create({
          data: {
            name: first.doctorName,
            code: `DOC-${Math.floor(100 + Math.random() * 900)}`,
            specialty: "Referring Physician",
          },
        });
      }

      // Find or create Patient
      let patient = await prisma.patient.findFirst({
        where: { fullName: first.patientName },
      });
      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            mrn: `MRN-VJ-${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: first.patientName,
            phone: first.phone,
            age: first.age,
            gender: first.gender,
            consentGiven: true,
          },
        });
      }

      // Check if order exists or create
      let order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      const token = generateExpiringToken(orderId, patient.phone, 72);
      const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const isCriticalStatus = first.statusRaw.toLowerCase().includes("critical");
      const isProcessing = first.statusRaw.toLowerCase().includes("process");

      let initialStatus = isCriticalStatus ? "READY_CRITICAL" : isProcessing ? "PROCESSING" : "READY";

      if (!order) {
        order = await prisma.order.create({
          data: {
            id: orderId,
            patientId: patient.id,
            doctorId: doctor.id,
            labCentre: "Vijayawada Central Lab",
            status: initialStatus,
            signedAt: initialStatus !== "PROCESSING" ? new Date() : null,
            secureToken: token,
            tokenExpiresAt,
          },
        });
      }

      // Delete old parameters if re-importing
      await prisma.testResult.deleteMany({ where: { orderId } });

      const parsedParameters = rows.map((r) => {
        // Parse parameter name and unit
        // e.g. "Haemoglobin g/dL" -> name: Haemoglobin, unit: g/dL
        let name = r.parameterRaw;
        let unit = "";
        const spaceIdx = r.parameterRaw.lastIndexOf(" ");
        if (spaceIdx > 0 && r.parameterRaw.length - spaceIdx < 10) {
          name = r.parameterRaw.substring(0, spaceIdx).trim();
          unit = r.parameterRaw.substring(spaceIdx + 1).trim();
        }

        // Parse ref range e.g. "12.0-15.5" or "0-100"
        let refMin = 0;
        let refMax = 100;
        const rangeParts = r.refRangeRaw.split("-").map((p) => parseFloat(p.trim()));
        if (rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1])) {
          refMin = rangeParts[0];
          refMax = rangeParts[1];
        }

        return {
          parameterName: name,
          resultValue: r.resultVal,
          unit: unit || "units",
          refRangeMin: refMin,
          refRangeMax: refMax,
          category: "Diagnostic Panel",
        };
      });

      // Insert TestResults
      for (const p of parsedParameters) {
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

      // Run Clinical Evaluation
      const evalOutcome = evaluateTestParameters(parsedParameters);
      if (evalOutcome.isCritical || isCriticalStatus) {
        initialStatus = "READY_CRITICAL";
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "READY_CRITICAL", signedAt: new Date() },
        });

        // Upsert urgent CallbackTask
        await prisma.callbackTask.upsert({
          where: { orderId: order.id },
          update: {
            urgentReason: evalOutcome.criticalReason || "Critical value detected from LIS import",
            status: "PENDING",
          },
          create: {
            orderId: order.id,
            urgentReason: evalOutcome.criticalReason || "Critical value detected from LIS import",
            assignedTo: "Front Desk Nurse Coordinator",
            status: "PENDING",
          },
        });
      } else if (initialStatus === "READY") {
        // Generate AI/Template Summary
        const summary = await generateReportSummary(patient.fullName, patient.age, patient.gender, parsedParameters);
        if (summary) {
          await prisma.aiSummary.upsert({
            where: { orderId: order.id },
            update: {
              summaryEn: summary.summaryEn,
              summaryTe: summary.summaryTe,
              summaryHi: summary.summaryHi,
              isTemplate: summary.isTemplate,
              pathologistApproved: true,
            },
            create: {
              orderId: order.id,
              summaryEn: summary.summaryEn,
              summaryTe: summary.summaryTe,
              summaryHi: summary.summaryHi,
              isTemplate: summary.isTemplate,
              pathologistApproved: true,
            },
          });
        }
      }

      // Log DPDP audit trail for LIS import
      await logAuditTrail({
        orderId: order.id,
        actorPhone: "LIS_IMPORT",
        actorRole: "SYSTEM",
        action: "LIS_CSV_INGESTION_COMPLETED",
        status: "SUCCESS",
        details: `Imported with ${parsedParameters.length} parameters. Status set to ${initialStatus}.`,
      });

      processedOrders.push({
        orderId: order.id,
        patientName: patient.fullName,
        doctor: doctor.name,
        status: initialStatus,
        secureToken: token,
      });
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
