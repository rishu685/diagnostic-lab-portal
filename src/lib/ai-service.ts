import { GoogleGenAI } from "@google/genai";
import { evaluateTestParameters } from "./clinical-rules";

interface ParameterInput {
  parameterName: string;
  resultValue: number;
  refRangeMin: number;
  refRangeMax: number;
  unit: string;
}

export interface SummaryOutput {
  summaryEn: string;
  summaryTe: string;
  summaryHi: string;
  isTemplate: boolean;
  isCritical: boolean;
  criticalReason?: string;
}

export async function generateReportSummary(
  patientName: string,
  age: number,
  gender: string,
  parameters: ParameterInput[]
): Promise<SummaryOutput | null> {
  // Step 1: Run deterministic clinical evaluator
  const evalResult = evaluateTestParameters(parameters);

  // Safety Killswitch: CRITICAL results get NO AI summary and trigger emergency callback!
  if (evalResult.isCritical) {
    return {
      summaryEn: "",
      summaryTe: "",
      summaryHi: "",
      isTemplate: true,
      isCritical: true,
      criticalReason: evalResult.criticalReason || "Critical life-threatening parameter detected",
    };
  }

  // If no out of range, return standard normal summary
  if (evalResult.overallFlag === "NORMAL") {
    return {
      summaryEn: evalResult.summaryEn || "All test parameters are within normal reference ranges.",
      summaryTe: evalResult.summaryTe || "అన్ని పరీక్షల ఫలితాలు సాధారణ పరిమితుల్లోనే ఉన్నాయి.",
      summaryHi: evalResult.summaryHi || "सभी जांच परिणाम सामान्य सीमा के भीतर हैं।",
      isTemplate: true,
      isCritical: false,
    };
  }

  // Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_api_key_here") {
    // Return pre-vetted locked clinical templates (Brief compliance)
    return {
      summaryEn: evalResult.summaryEn || "Certain parameters are outside typical reference ranges. Please consult your physician.",
      summaryTe: evalResult.summaryTe || "కొన్ని ఫలితాలు సాధారణ పరిమితుల కంటే భిన్నంగా ఉన్నాయి. దయచేసి మీ డాక్టర్‌ను సంప్రదించండి.",
      summaryHi: evalResult.summaryHi || "कुछ परिणाम सामान्य सीमा से बाहर हैं। कृपया अपने डॉक्टर से परामर्श लें।",
      isTemplate: true,
      isCritical: false,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert diagnostic clinical communicator for a diagnostic lab chain in Vijayawada, Andhra Pradesh.
A patient has received their lab report with out-of-range values.
Write a calm, reassuring, plain-language explanation of what these out-of-range parameters mean in daily life.
STRICT SAFETY RULES:
1. NEVER diagnose a disease (e.g. do not say "You have kidney disease" or "You have diabetes").
2. NEVER prescribe medication or dosages.
3. Keep it simple, elderly-friendly, and non-alarmist.
4. Always advise consulting the referring doctor with the full signed report.
5. Provide the output in exactly 3 languages: English, Telugu (తెలుగు), and Hindi (हिंदी).

Patient Context:
Name: ${patientName}
Age: ${age}, Gender: ${gender}

Abnormal Parameters:
${evalResult.evaluatedParams
  .filter((p) => p.flag === "OUT_OF_RANGE")
  .map((p) => `- ${p.parameterName}: ${p.resultValue} ${p.unit} (Ref: ${p.refRangeMin} - ${p.refRangeMax} ${p.unit})`)
  .join("\n")}

Format your response as valid JSON with keys:
{
  "summaryEn": "2-3 sentences in simple English",
  "summaryTe": "2-3 sentences in simple Telugu script",
  "summaryHi": "2-3 sentences in simple Hindi script"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);

    return {
      summaryEn: parsed.summaryEn || evalResult.summaryEn || "",
      summaryTe: parsed.summaryTe || evalResult.summaryTe || "",
      summaryHi: parsed.summaryHi || evalResult.summaryHi || "",
      isTemplate: false,
      isCritical: false,
    };
  } catch (err) {
    console.warn("Gemini API call failed or timed out. Falling back to locked clinical templates.", err);
    // Graceful fallback to locked templates
    return {
      summaryEn: evalResult.summaryEn || "",
      summaryTe: evalResult.summaryTe || "",
      summaryHi: evalResult.summaryHi || "",
      isTemplate: true,
      isCritical: false,
    };
  }
}
