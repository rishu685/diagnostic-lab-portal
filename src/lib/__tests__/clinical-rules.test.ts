import { describe, it, expect } from "vitest";
import { evaluateTestParameters, normalizeParamKey } from "../clinical-rules";
import { generateExpiringToken, verifyExpiringToken, verifyOtp } from "../security";

describe("Clinical Evaluator & Safety Rules", () => {
  it("correctly identifies normal parameters", () => {
    const params = [
      { parameterName: "Haemoglobin", resultValue: 14.0, unit: "g/dL", refRangeMin: 12.0, refRangeMax: 15.5 },
      { parameterName: "Fasting Blood Sugar", resultValue: 85.0, unit: "mg/dL", refRangeMin: 70.0, refRangeMax: 100.0 },
    ];
    const result = evaluateTestParameters(params);
    expect(result.overallFlag).toBe("NORMAL");
    expect(result.isCritical).toBe(false);
    expect(result.summaryEn).toContain("normal reference ranges");
    expect(result.summaryTe).toBeTruthy();
  });

  it("flags out-of-range parameters (e.g. sample ORD-71204: Haemoglobin 10.2)", () => {
    const params = [
      { parameterName: "Haemoglobin", resultValue: 10.2, unit: "g/dL", refRangeMin: 12.0, refRangeMax: 15.5 },
    ];
    const result = evaluateTestParameters(params);
    expect(result.overallFlag).toBe("OUT_OF_RANGE");
    expect(result.isCritical).toBe(false);
    expect(result.summaryEn).toContain("mild anaemia");
    expect(result.summaryTe).toContain("హిమోగ్లోబిన్");
  });

  it("enforces safety killswitch on critical values (e.g. sample ORD-71233: Potassium 6.8)", () => {
    const params = [
      { parameterName: "Potassium", resultValue: 6.8, unit: "mmol/L", refRangeMin: 3.5, refRangeMax: 5.1 },
    ];
    const result = evaluateTestParameters(params);
    expect(result.overallFlag).toBe("CRITICAL");
    expect(result.isCritical).toBe(true);
    // Crucial brief requirement: Critical values get NO summary and must trigger callback!
    expect(result.summaryEn).toBeUndefined();
    expect(result.summaryTe).toBeUndefined();
    expect(result.criticalReason).toContain("Critical high Potassium");
  });

  it("normalizes diverse parameter naming variations", () => {
    expect(normalizeParamKey("Hemoglobin (Hb)")).toBe("haemoglobin");
    expect(normalizeParamKey("Serum Potassium (K+)")).toBe("potassium");
    expect(normalizeParamKey("LDL-C (Direct)")).toBe("ldl_cholesterol");
    expect(normalizeParamKey("Fasting Plasma Glucose (FBS)")).toBe("fasting_blood_sugar");
  });
});

describe("Expiring Links & DPDP Security", () => {
  it("generates a valid 72-hour signed expiring token", () => {
    const token = generateExpiringToken("ORD-71204", "9848011111", 72);
    expect(token).toBeTruthy();

    const verification = verifyExpiringToken(token);
    expect(verification.valid).toBe(true);
    expect(verification.expired).toBe(false);
    expect(verification.payload?.orderId).toBe("ORD-71204");
    expect(verification.payload?.phone).toBe("9848011111");
  });

  it("rejects expired tokens (>72h)", () => {
    // Generate token with negative TTL (already expired)
    const expiredToken = generateExpiringToken("ORD-71204", "9848011111", -1);
    const verification = verifyExpiringToken(expiredToken);
    expect(verification.valid).toBe(false);
    expect(verification.expired).toBe(true);
  });

  it("rejects tampered tokens", () => {
    const validToken = generateExpiringToken("ORD-71204", "9848011111", 72);
    const tampered = validToken.slice(0, -6) + "xxxxxx";
    const verification = verifyExpiringToken(tampered);
    expect(verification.valid).toBe(false);
  });

  it("verifies universal demo OTP code 123456", () => {
    const result = verifyOtp("9848011111", "123456");
    expect(result.success).toBe(true);
  });
});
