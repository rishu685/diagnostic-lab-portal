import { describe, it, expect } from "vitest";
import { evaluateTestParameters } from "../clinical-rules";
import { generateReportSummary } from "../ai-service";

describe("Sample Data & Brief Specific Cases", () => {
  it("Case 1 (ORD-71204): Lakshmi Prasanna K - Mild Anaemia", async () => {
    const params = [
      { parameterName: "Haemoglobin", resultValue: 10.2, unit: "g/dL", refRangeMin: 12.0, refRangeMax: 15.5 },
    ];
    const outcome = await generateReportSummary("Lakshmi Prasanna K", 48, "Female", params);
    expect(outcome).not.toBeNull();
    expect(outcome?.isCritical).toBe(false);
    expect(outcome?.summaryEn).toContain("mild anaemia");
    expect(outcome?.summaryTe).toContain("హిమోగ్లోబిన్");
  });

  it("Case 2 (ORD-71219): Venkata Rao M - Elevated LDL Cholesterol", async () => {
    const params = [
      { parameterName: "LDL cholesterol", resultValue: 142.0, unit: "mg/dL", refRangeMin: 0.0, refRangeMax: 100.0 },
    ];
    const outcome = await generateReportSummary("Venkata Rao M", 62, "Male", params);
    expect(outcome).not.toBeNull();
    expect(outcome?.isCritical).toBe(false);
    expect(outcome?.summaryEn).toContain("LDL");
    expect(outcome?.summaryTe).toContain("కొలెస్ట్రాల్");
  });

  it("Case 3 (ORD-71233): Farzana Begum - Critical Potassium (Safety Killswitch)", async () => {
    const params = [
      { parameterName: "Potassium", resultValue: 6.8, unit: "mmol/L", refRangeMin: 3.5, refRangeMax: 5.1 },
    ];
    const outcome = await generateReportSummary("Farzana Begum", 55, "Female", params);
    expect(outcome).not.toBeNull();
    // Safety requirement: AI summary must be blocked/empty for critical cases
    expect(outcome?.isCritical).toBe(true);
    expect(outcome?.summaryEn).toBe("");
    expect(outcome?.summaryTe).toBe("");
    expect(outcome?.criticalReason).toContain("Potassium");
  });
});
