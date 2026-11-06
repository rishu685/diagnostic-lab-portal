import { PrismaClient } from "@prisma/client";
import { generateExpiringToken } from "../src/lib/security";
import { evaluateTestParameters } from "../src/lib/clinical-rules";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Diagnostic Lab Portal database...");

  // Clean existing records
  await prisma.accessLog.deleteMany();
  await prisma.callbackTask.deleteMany();
  await prisma.aiSummary.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.order.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  // Seed Doctors
  const doc1 = await prisma.doctor.create({
    data: {
      id: "doc-1",
      name: "Dr. S. Ramanaiah",
      code: "DOC-RAM-01",
      specialty: "General Medicine",
      phone: "+91 98480 12345",
    },
  });

  const doc2 = await prisma.doctor.create({
    data: {
      id: "doc-2",
      name: "Dr. P. Anitha",
      code: "DOC-ANI-02",
      specialty: "Cardiology",
      phone: "+91 98480 23456",
    },
  });

  const doc3 = await prisma.doctor.create({
    data: {
      id: "doc-3",
      name: "Dr. K. Suresh",
      code: "DOC-SUR-03",
      specialty: "Nephrology & Critical Care",
      phone: "+91 98480 34567",
    },
  });

  const doc4 = await prisma.doctor.create({
    data: {
      id: "doc-4",
      name: "Dr. Ch. Madhavilatha",
      code: "DOC-MAD-04",
      specialty: "Endocrinology",
      phone: "+91 98480 45678",
    },
  });

  // Seed Patients
  // 1. Lakshmi Prasanna K (Sample 1 from brief)
  const p1 = await prisma.patient.create({
    data: {
      id: "pat-1",
      mrn: "MRN-VJ-1049",
      fullName: "Lakshmi Prasanna K",
      phone: "9848011111",
      age: 48,
      gender: "Female",
      preferredLang: "te",
      consentGiven: true,
    },
  });

  // 2. Venkata Rao M (Sample 2 from brief)
  const p2 = await prisma.patient.create({
    data: {
      id: "pat-2",
      mrn: "MRN-VJ-1052",
      fullName: "Venkata Rao M",
      phone: "9848022222",
      age: 62,
      gender: "Male",
      preferredLang: "te",
      consentGiven: true,
    },
  });

  // 3. Farzana Begum (Sample 3 from brief - CRITICAL)
  const p3 = await prisma.patient.create({
    data: {
      id: "pat-3",
      mrn: "MRN-VJ-1088",
      fullName: "Farzana Begum",
      phone: "9848033333",
      age: 55,
      gender: "Female",
      preferredLang: "te",
      consentGiven: true,
    },
  });

  // 4. Subba Rao Chowdary (All Normal)
  const p4 = await prisma.patient.create({
    data: {
      id: "pat-4",
      mrn: "MRN-VJ-1102",
      fullName: "Subba Rao Chowdary",
      phone: "9848044444",
      age: 39,
      gender: "Male",
      preferredLang: "en",
      consentGiven: true,
    },
  });

  // 5. Bhavani Devi Y (Thyroid & Sugar screening)
  const p5 = await prisma.patient.create({
    data: {
      id: "pat-5",
      mrn: "MRN-VJ-1145",
      fullName: "Bhavani Devi Y",
      phone: "9848055555",
      age: 52,
      gender: "Female",
      preferredLang: "te",
      consentGiven: true,
    },
  });

  // Helper for generating orders with clinical evaluation
  const now = new Date();
  const expires72h = new Date(Date.now() + 72 * 60 * 60 * 1000);

  // --- ORDER 1: ORD-71204 (Lakshmi Prasanna K - Haemoglobin 10.2) ---
  const token1 = generateExpiringToken("ORD-71204", p1.phone, 72);
  const o1 = await prisma.order.create({
    data: {
      id: "ORD-71204",
      patientId: p1.id,
      doctorId: doc1.id,
      labCentre: "Vijayawada Central Lab (Benz Circle)",
      status: "READY",
      signedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // signed 3 hrs ago
      secureToken: token1,
      tokenExpiresAt: expires72h,
    },
  });

  const p1Results = [
    { parameterName: "Haemoglobin", resultValue: 10.2, unit: "g/dL", refRangeMin: 12.0, refRangeMax: 15.5, category: "Complete Blood Count" },
    { parameterName: "Platelet Count", resultValue: 240.0, unit: "x10^3/µL", refRangeMin: 150.0, refRangeMax: 450.0, category: "Complete Blood Count" },
    { parameterName: "Serum Creatinine", resultValue: 0.9, unit: "mg/dL", refRangeMin: 0.6, refRangeMax: 1.2, category: "Renal Function" },
  ];

  for (const r of p1Results) {
    await prisma.testResult.create({
      data: {
        orderId: o1.id,
        testCategory: r.category,
        parameterName: r.parameterName,
        resultValue: r.resultValue,
        unit: r.unit,
        refRangeMin: r.refRangeMin,
        refRangeMax: r.refRangeMax,
        flag: r.resultValue < r.refRangeMin ? "OUT_OF_RANGE" : "NORMAL",
      },
    });
  }

  const eval1 = evaluateTestParameters(p1Results);
  await prisma.aiSummary.create({
    data: {
      orderId: o1.id,
      summaryEn: eval1.summaryEn || "",
      summaryTe: eval1.summaryTe || "",
      summaryHi: eval1.summaryHi || "",
      isTemplate: true,
      pathologistApproved: true,
    },
  });

  // --- ORDER 2: ORD-71219 (Venkata Rao M - LDL 142 - PROCESSING) ---
  const token2 = generateExpiringToken("ORD-71219", p2.phone, 72);
  const o2 = await prisma.order.create({
    data: {
      id: "ORD-71219",
      patientId: p2.id,
      doctorId: doc2.id,
      labCentre: "Guntur Main Collection Centre",
      status: "PROCESSING",
      signedAt: null, // Still in lab analyzer
      secureToken: token2,
      tokenExpiresAt: expires72h,
    },
  });

  await prisma.testResult.create({
    data: {
      orderId: o2.id,
      testCategory: "Lipid Profile",
      parameterName: "LDL cholesterol",
      resultValue: 142.0,
      unit: "mg/dL",
      refRangeMin: 0.0,
      refRangeMax: 100.0,
      flag: "OUT_OF_RANGE",
    },
  });

  // --- ORDER 3: ORD-71233 (Farzana Begum - Potassium 6.8 - READY CRITICAL) ---
  const token3 = generateExpiringToken("ORD-71233", p3.phone, 72);
  const o3 = await prisma.order.create({
    data: {
      id: "ORD-71233",
      patientId: p3.id,
      doctorId: doc3.id,
      labCentre: "Vijayawada Central Lab (Benz Circle)",
      status: "READY_CRITICAL",
      signedAt: new Date(Date.now() - 45 * 60 * 1000), // signed 45 mins ago
      secureToken: token3,
      tokenExpiresAt: expires72h,
    },
  });

  const p3Results = [
    { parameterName: "Potassium", resultValue: 6.8, unit: "mmol/L", refRangeMin: 3.5, refRangeMax: 5.1, category: "Electrolytes" },
    { parameterName: "Serum Creatinine", resultValue: 2.4, unit: "mg/dL", refRangeMin: 0.6, refRangeMax: 1.2, category: "Renal Function" },
  ];

  for (const r of p3Results) {
    const isPotassiumCrit = r.parameterName === "Potassium" && r.resultValue >= 6.2;
    await prisma.testResult.create({
      data: {
        orderId: o3.id,
        testCategory: r.category,
        parameterName: r.parameterName,
        resultValue: r.resultValue,
        unit: r.unit,
        refRangeMin: r.refRangeMin,
        refRangeMax: r.refRangeMax,
        flag: isPotassiumCrit ? "CRITICAL" : "OUT_OF_RANGE",
      },
    });
  }

  // Critical Value Callback Task creation (NO AI summary created per medical safety rule)
  await prisma.callbackTask.create({
    data: {
      orderId: o3.id,
      urgentReason: "Critical Potassium level 6.8 mmol/L (Severe hyperkalemia, cardiac risk). Immediate doctor & patient callback required.",
      assignedTo: "Front Desk Nurse Coordinator (Kavitha)",
      status: "PENDING",
    },
  });

  // --- ORDER 4: ORD-71240 (Subba Rao Chowdary - Routine Wellness - ALL NORMAL) ---
  const token4 = generateExpiringToken("ORD-71240", p4.phone, 72);
  const o4 = await prisma.order.create({
    data: {
      id: "ORD-71240",
      patientId: p4.id,
      doctorId: doc1.id,
      labCentre: "Machilipatnam Diagnostic Annex",
      status: "READY",
      signedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      secureToken: token4,
      tokenExpiresAt: expires72h,
    },
  });

  const p4Results = [
    { parameterName: "Haemoglobin", resultValue: 14.5, unit: "g/dL", refRangeMin: 12.0, refRangeMax: 15.5, category: "Complete Blood Count" },
    { parameterName: "Fasting Blood Sugar", resultValue: 88.0, unit: "mg/dL", refRangeMin: 70.0, refRangeMax: 100.0, category: "Diabetic Profile" },
    { parameterName: "Serum Creatinine", resultValue: 0.85, unit: "mg/dL", refRangeMin: 0.6, refRangeMax: 1.2, category: "Renal Function" },
  ];

  for (const r of p4Results) {
    await prisma.testResult.create({
      data: {
        orderId: o4.id,
        testCategory: r.category,
        parameterName: r.parameterName,
        resultValue: r.resultValue,
        unit: r.unit,
        refRangeMin: r.refRangeMin,
        refRangeMax: r.refRangeMax,
        flag: "NORMAL",
      },
    });
  }

  const eval4 = evaluateTestParameters(p4Results);
  await prisma.aiSummary.create({
    data: {
      orderId: o4.id,
      summaryEn: eval4.summaryEn || "",
      summaryTe: eval4.summaryTe || "",
      summaryHi: eval4.summaryHi || "",
      isTemplate: true,
      pathologistApproved: true,
    },
  });

  // --- ORDER 5: ORD-71255 (Bhavani Devi Y - Elevated TSH & HbA1c) ---
  const token5 = generateExpiringToken("ORD-71255", p5.phone, 72);
  const o5 = await prisma.order.create({
    data: {
      id: "ORD-71255",
      patientId: p5.id,
      doctorId: doc4.id,
      labCentre: "Eluru Collection Point",
      status: "READY",
      signedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      secureToken: token5,
      tokenExpiresAt: expires72h,
    },
  });

  const p5Results = [
    { parameterName: "TSH (Thyroid Stimulating Hormone)", resultValue: 8.4, unit: "µIU/mL", refRangeMin: 0.4, refRangeMax: 4.5, category: "Thyroid Profile" },
    { parameterName: "HbA1c (Glycated Haemoglobin)", resultValue: 7.2, unit: "%", refRangeMin: 4.0, refRangeMax: 5.7, category: "Diabetic Profile" },
  ];

  for (const r of p5Results) {
    await prisma.testResult.create({
      data: {
        orderId: o5.id,
        testCategory: r.category,
        parameterName: r.parameterName,
        resultValue: r.resultValue,
        unit: r.unit,
        refRangeMin: r.refRangeMin,
        refRangeMax: r.refRangeMax,
        flag: "OUT_OF_RANGE",
      },
    });
  }

  const eval5 = evaluateTestParameters(p5Results);
  await prisma.aiSummary.create({
    data: {
      orderId: o5.id,
      summaryEn: eval5.summaryEn || "",
      summaryTe: eval5.summaryTe || "",
      summaryHi: eval5.summaryHi || "",
      isTemplate: true,
      pathologistApproved: true,
    },
  });

  // Seed Access Logs (DPDP Act audit trail)
  await prisma.accessLog.create({
    data: {
      orderId: o1.id,
      actorPhone: p1.phone,
      actorRole: "SYSTEM",
      action: "LINK_GENERATED_SMS_SENT",
      ipAddress: "14.139.122.45",
      status: "SUCCESS",
      details: "SMS with 72h secure link dispatched automatically upon pathologist sign-off.",
    },
  });

  await prisma.accessLog.create({
    data: {
      orderId: o1.id,
      actorPhone: p1.phone,
      actorRole: "PATIENT",
      action: "LINK_OPENED",
      ipAddress: "49.37.112.98",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      status: "SUCCESS",
      details: "Patient opened secure link from WhatsApp notification.",
    },
  });

  await prisma.accessLog.create({
    data: {
      orderId: o1.id,
      actorPhone: p1.phone,
      actorRole: "PATIENT",
      action: "OTP_VERIFIED",
      ipAddress: "49.37.112.98",
      status: "SUCCESS",
      details: "OTP 123456 verified. Consent reaffirmed.",
    },
  });

  await prisma.accessLog.create({
    data: {
      orderId: o3.id,
      actorPhone: "+91 866 248900",
      actorRole: "FRONT_DESK",
      action: "CALLBACK_TASK_TRIGGERED",
      ipAddress: "10.0.1.25",
      status: "SUCCESS",
      details: "Urgent callback created for Farzana Begum (Potassium 6.8 mmol/L).",
    },
  });

  console.log("Seeding complete! Successfully seeded 5 orders, doctors, patients, clinical parameters, and audit logs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
