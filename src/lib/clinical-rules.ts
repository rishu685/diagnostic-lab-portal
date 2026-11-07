export interface LocalizedTemplate {
  en: string;
  te: string;
  hi: string;
}

export interface ReferenceDefinition {
  category: string;
  parameterName: string;
  unit: string;
  refMin: number;
  refMax: number;
  criticalLow?: number;
  criticalHigh?: number;
  descriptionEn: string;
  lowTemplate: LocalizedTemplate;
  highTemplate: LocalizedTemplate;
}

const t = (en: string, te: string, hi: string): LocalizedTemplate => ({ en, te, hi });

export const CLINICAL_DEFINITIONS: Record<string, ReferenceDefinition> = {
  haemoglobin: {
    category: "Complete Blood Count",
    parameterName: "Haemoglobin",
    unit: "g/dL",
    refMin: 12.0,
    refMax: 15.5,
    criticalLow: 6.5,
    criticalHigh: 20.0,
    descriptionEn: "Measures oxygen-carrying protein in red blood cells.",
    lowTemplate: t(
      "Your haemoglobin is slightly below the reference range (mild anaemia). You may experience mild fatigue. Please consult your referring doctor for dietary iron or supplement advice.",
      "మీ హిమోగ్లోబిన్ సాధారణం కంటే కొద్దిగా తక్కువగా ఉంది (స్వల్ప రక్తహీనత). మీకు కొంచెం నీరసంగా అనిపించవచ్చు. ఐరన్ ఆహారాలు లేదా మందుల కొరకు మీ వైద్యుడిని సంప్రదించండి.",
      "आपका हीमोग्लोबिन सामान्य स्तर से थोड़ा कम है (हल्का एनीमिया)। आपको थोड़ी थकान महसूस हो सकती है। कृपया खान-पान या सप्लीमेंट के लिए अपने डॉक्टर से सलाह लें।"
    ),
    highTemplate: t(
      "Your haemoglobin is above the normal range. High values can be due to dehydration or high red blood cell counts. Please discuss with your doctor.",
      "మీ హిమోగ్లోబిన్ సాధారణ పరిమితి కంటే ఎక్కువగా ఉంది. శరీరంలో నీటిశాతం తగ్గడం వల్ల ఇలా రావచ్చు. దయచేసి మీ డాక్టర్‌తో చర్చించండి.",
      "आपका हीमोग्लोबिन सामान्य स्तर से अधिक है। शरीर में पानी की कमी के कारण ऐसा हो सकता है। कृपया अपने डॉक्टर से परामर्श लें।"
    ),
  },
  ldl_cholesterol: {
    category: "Lipid Profile",
    parameterName: "LDL cholesterol",
    unit: "mg/dL",
    refMin: 0.0,
    refMax: 100.0,
    criticalHigh: 220.0,
    descriptionEn: "Bad cholesterol that can build up in arterial walls.",
    lowTemplate: t(
      "Your LDL cholesterol is within a very low range, which is generally protective against cardiovascular disease.",
      "మీ ఎల్‌డిఎల్ కొలెస్ట్రాల్ తక్కువగా ఉంది, ఇది గుండె ఆరోగ్యానికి చాలా మంచిది.",
      "आपका एलडीएल कोलेस्ट्रॉल काफी कम है, जो दिल के स्वास्थ्य के लिए अच्छा माना जाता है।"
    ),
    highTemplate: t(
      "Your LDL ('bad') cholesterol is elevated above recommended levels. Managing diet, reducing fried foods, and regular exercise are recommended along with clinical consultation.",
      "మీ శరీరంలో ఎల్‌డిఎల్ ('చెడు') కొలెస్ట్రాల్ స్థాయిలు ఎక్కువగా ఉన్నాయి. నూనె పదార్థాలు తగ్గించడం, వ్యాయామం చేయడం మరియు వైద్యుడిని సంప్రదించడం మంచిది.",
      "आपका एलडीएल ('खराब') कोलेस्ट्रॉल सामान्य से अधिक है। तैलीय भोजन कम करने, व्यायाम करने और डॉक्टर से परामर्श लेने की सलाह दी जाती है।"
    ),
  },
  potassium: {
    category: "Electrolytes",
    parameterName: "Potassium",
    unit: "mmol/L",
    refMin: 3.5,
    refMax: 5.1,
    criticalLow: 2.8,
    criticalHigh: 6.2,
    descriptionEn: "Crucial electrolyte for heart and nerve function.",
    lowTemplate: t(
      "Your potassium level is lower than normal (hypokalemia), which may affect muscle and heart rhythm. Contact your physician promptly.",
      "మీ పొటాషియం స్థాయి తక్కువగా ఉంది (హైపోకలేమియా), ఇది కండరాలు మరియు గుండె లయపై ప్రభావం చూపవచ్చు. వెంటనే వైద్యుడిని సంప్రదించండి.",
      "आपका पोटेशियम स्तर सामान्य से कम है। यह मांसपेशियों और दिल की धड़कन को प्रभावित कर सकता है। तुरंत डॉक्टर से संपर्क करें।"
    ),
    highTemplate: t(
      "Your potassium is significantly elevated. Potassium directly affects cardiac rhythm. Immediate doctor consultation is required.",
      "మీ పొటాషియం స్థాయి ప్రమాదకరంగా ఎక్కువగా ఉంది. ఇది గుండె పనితీరుపై తీవ్ర ప్రభావం చూపుతుంది. వెంటనే అత్యవసరంగా వైద్యుడిని సంప్రదించండి.",
      "आपका पोटेशियम स्तर काफी अधिक है। यह हृदय गति को गंभीर रूप से प्रभावित कर सकता है। तुरंत अपने चिकित्सक से संपर्क करें।"
    ),
  },
  fasting_blood_sugar: {
    category: "Diabetic Profile",
    parameterName: "Fasting Blood Sugar",
    unit: "mg/dL",
    refMin: 70.0,
    refMax: 100.0,
    criticalLow: 50.0,
    criticalHigh: 400.0,
    descriptionEn: "Glucose level in blood after overnight fast.",
    lowTemplate: t(
      "Your fasting blood sugar is low (hypoglycemia). If you feel shaky, dizzy, or lightheaded, consume fast-acting sugars and consult your doctor.",
      "మీ రక్తంలో చక్కెర స్థాయి తక్కువగా ఉంది (హైపోగ్లైసీమియా). కళ్లు తిరగడం వంటివి ఉంటే వెంటనే గ్లూకోజ్ లేదా తీపి పదార్థాలు తీసుకుని డాక్టర్‌ని కలవండి.",
      "आपका फास्टिंग ब्लड शुगर कम है। चक्कर आने या कमजोरी लगने पर तुरंत मीठा लें और डॉक्टर से परामर्श लें।"
    ),
    highTemplate: t(
      "Your fasting glucose is above normal. This indicates impaired glucose tolerance or diabetes. Follow up with your doctor for HbA1c testing and dietary guidance.",
      "మీ ఉదయపు రక్తంలో చక్కెర స్థాయి సాధారణం కంటే ఎక్కువగా ఉంది. ఆహార నియమాలు మరియు మందుల మార్పుల కోసం మీ డాక్టర్‌ను సంప్రదించండి.",
      "आपका फास्टिंग ब्लड शुगर सामान्य से अधिक है। यह प्रीडायबिटीज या डायबिटीज का संकेत हो सकता है। डॉक्टर से सलाह लें।"
    ),
  },
  hba1c: {
    category: "Diabetic Profile",
    parameterName: "HbA1c (Glycated Haemoglobin)",
    unit: "%",
    refMin: 4.0,
    refMax: 5.7,
    criticalHigh: 12.0,
    descriptionEn: "Average blood sugar levels over past 3 months.",
    lowTemplate: t(
      "Your HbA1c is below usual limits. Discuss with your physician if you are on glucose-lowering therapy.",
      "మీ గత 3 నెలల సగటు చక్కెర స్థాయి (HbA1c) తక్కువగా ఉంది. మీ వైద్యుడితో చర్చించండి.",
      "आपका 3 महीने का औसत शुगर (HbA1c) सामान्य से कम है। डॉक्टर से परामर्श करें।"
    ),
    highTemplate: t(
      "Your HbA1c indicates higher average blood glucose over the past 90 days. Ongoing medication review and lifestyle modifications are recommended by your doctor.",
      "మీ గత 3 నెలల రక్తంలో చక్కెర సగటు (HbA1c) ఎక్కువగా ఉంది. షుగర్ నియంత్రణ మరియు మందుల సమీక్ష కోసం మీ వైద్యుడిని కలవండి.",
      "आपका पिछले 3 महीनों का औसत शुगर स्तर (HbA1c) अधिक है। उचित इलाज और आहार नियंत्रण के लिए डॉक्टर से संपर्क करें।"
    ),
  },
  serum_creatinine: {
    category: "Renal Function",
    parameterName: "Serum Creatinine",
    unit: "mg/dL",
    refMin: 0.6,
    refMax: 1.2,
    criticalHigh: 4.5,
    descriptionEn: "Waste product filtered by kidneys to assess renal health.",
    lowTemplate: t(
      "Your creatinine is below average, often related to low muscle mass or high fluid intake.",
      "మీ సీరమ్ క్రియాటినిన్ సాధారణం కంటే తక్కువగా ఉంది, ఇది సాధారణంగా హానికరం కాదు.",
      "आपका सीरम क्रिएटिनिन कम है, जो आमतौर पर चिंता का विषय नहीं है।"
    ),
    highTemplate: t(
      "Your creatinine level is elevated, indicating that your kidneys may be filtering less efficiently. Stay hydrated and consult a physician promptly for renal function assessment.",
      "మీ క్రియాటినిన్ స్థాయి ఎక్కువగా ఉంది, ఇది మూత్రపిండాల (కిడ్నీ) పనితీరుపై ప్రభావం చూపిస్తుంది. దయచేసి వెంటనే మీ డాక్టర్‌ని సంప్రదించండి.",
      "आपका क्रिएटिनिन स्तर अधिक है, जो गुर्दे (किडनी) के कार्य में रुकावट का संकेत हो सकता है। तुरंत डॉक्टर से सलाह लें।"
    ),
  },
  platelet_count: {
    category: "Complete Blood Count",
    parameterName: "Platelet Count",
    unit: "x10^3/µL",
    refMin: 150.0,
    refMax: 450.0,
    criticalLow: 30.0,
    criticalHigh: 1000.0,
    descriptionEn: "Cell fragments essential for proper blood clotting.",
    lowTemplate: t(
      "Your platelet count is reduced (thrombocytopenia). Watch for unusual bruising or bleeding and consult your doctor for evaluation (e.g., post-viral or dengue screening).",
      "మీ రక్తంలో ప్లేట్‌లెట్ల సంఖ్య తగ్గింది. ఒంటిపై రక్తపు చారలు లేదా రక్తస్రావం పట్ల జాగ్రత్తగా ఉండండి మరియు వెంటనే డాక్టర్‌ని కలవండి.",
      "आपकी प्लेटलेट्स की संख्या सामान्य से कम है। त्वचा पर नीले निशान या खून बहने पर तुरंत डॉक्टर से संपर्क करें।"
    ),
    highTemplate: t(
      "Your platelet count is higher than standard reference limits. Infection or inflammation may cause transient increases; discuss with your physician.",
      "మీ ప్లేట్‌లెట్ల సంఖ్య సాధారణం కంటే ఎక్కువగా ఉంది. ఇన్ఫెక్షన్ లేదా మంట వల్ల ఇలా జరగవచ్చు; డాక్టర్‌తో చర్చించండి.",
      "आपकी प्लेटलेट्स की संख्या सामान्य से अधिक है। किसी संक्रमण के कारण ऐसा हो सकता है; डॉक्टर से परामर्श लें।"
    ),
  },
  sgpt_alt: {
    category: "Liver Function Test",
    parameterName: "SGPT (ALT)",
    unit: "U/L",
    refMin: 7.0,
    refMax: 56.0,
    criticalHigh: 400.0,
    descriptionEn: "Liver enzyme released into blood upon hepatic strain or injury.",
    lowTemplate: t(
      "Your SGPT level is within the normal low range with no clinical concern.",
      "మీ SGPT స్థాయి సాధారణంగా ఉంది.",
      "आपका SGPT स्तर सामान्य है।"
    ),
    highTemplate: t(
      "Your liver enzyme (SGPT/ALT) is elevated. This can be caused by fatty liver, viral infections, or medications. Avoid alcohol and consult your physician.",
      "మీ కాలేయ ఎంజైమ్ (SGPT) స్థాయి పెరిగింది. ఇది ఫ్యాటీ లివర్ లేదా మందుల ప్రభావం వల్ల కావచ్చు. ఆల్కహాల్ నివారించి డాక్టర్‌ని సంప్రదించండి.",
      "आपका लिवर एंजाइम (SGPT) बढ़ा हुआ है। यह फैटी लिवर या दवाओं के प्रभाव से हो सकता है। डॉक्टर से परामर्श लें।"
    ),
  },
  tsh: {
    category: "Thyroid Profile",
    parameterName: "TSH (Thyroid Stimulating Hormone)",
    unit: "µIU/mL",
    refMin: 0.4,
    refMax: 4.5,
    criticalHigh: 20.0,
    descriptionEn: "Pituitary hormone regulating thyroid activity.",
    lowTemplate: t(
      "Your TSH is low, suggesting an overactive thyroid (hyperthyroidism). Symptoms like palpitations or weight loss should be reported to your endocrinologist.",
      "మీ TSH తక్కువగా ఉంది, ఇది థైరాయిడ్ గ్రంధి మితిమీరిన పనితీరును (హైపర్‌థైరాయిడిజం) సూచిస్తుంది. మీ డాక్టర్‌ను సంప్రదించండి.",
      "आपका टीएसएच कम है, जो ओवरएक्टिव थायरॉयड (हाइपरथायरायडिज्म) का संकेत हो सकता है। डॉक्टर से मिलें।"
    ),
    highTemplate: t(
      "Your TSH is elevated, indicating underactive thyroid function (hypothyroidism). A physician can advise if thyroid hormone supplementation is required.",
      "మీ TSH ఎక్కువగా ఉంది, ఇది థైరాయిడ్ పనితీరు మందగించడాన్ని (హైపోథైరాయిడిజం) సూచిస్తుంది. మందుల కొరకు డాక్టర్‌ను కలవండి.",
      "आपका टीएसएच अधिक है, जो अंडरएक्टिव थायरॉयड (हाइपोथायरायडिज्म) का संकेत है। थायरॉयड सप्लीमेंट के लिए डॉक्टर से सलाह लें।"
    ),
  },
  total_bilirubin: {
    category: "Liver Function Test",
    parameterName: "Total Bilirubin",
    unit: "mg/dL",
    refMin: 0.2,
    refMax: 1.2,
    criticalHigh: 12.0,
    descriptionEn: "Yellow pigment produced during the breakdown of red blood cells.",
    lowTemplate: t(
      "Your total bilirubin is normal.",
      "మీ బిలిరుబిన్ స్థాయి సాధారణంగా ఉంది.",
      "आपका बिलीरुबिन स्तर सामान्य है।"
    ),
    highTemplate: t(
      "Your bilirubin is elevated, which can cause yellowish tint in eyes/skin (jaundice). Consult your doctor promptly for liver/biliary evaluation.",
      "మీ బిలిరుబిన్ స్థాయి ఎక్కువగా ఉంది (కామెర్ల లక్షణం కావచ్చు). దయచేసి వెంటనే కాలేయ పరీక్షల కోసం వైద్యుడిని సంప్రదించండి.",
      "आपका बिलीरुबिन बढ़ा हुआ है, जो पीलिया (जॉन्डिस) का लक्षण हो सकता है। तुरंत डॉक्टर से संपर्क करें।"
    ),
  },
};

export function normalizeParamKey(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (clean.includes("haemo") || clean.includes("hemo") || clean.includes("hb")) return "haemoglobin";
  if (clean.includes("ldl") || clean.includes("cholesterol")) return "ldl_cholesterol";
  if (clean.includes("potassium") || clean === "k") return "potassium";
  if (clean.includes("fasting") || clean.includes("fbs") || clean.includes("glucose")) return "fasting_blood_sugar";
  if (clean.includes("hba1c") || clean.includes("glycated")) return "hba1c";
  if (clean.includes("creatinine")) return "serum_creatinine";
  if (clean.includes("platelet")) return "platelet_count";
  if (clean.includes("sgpt") || clean.includes("alt")) return "sgpt_alt";
  if (clean.includes("tsh") || clean.includes("thyroid")) return "tsh";
  if (clean.includes("bilirubin")) return "total_bilirubin";
  return clean;
}

export interface EvaluationResult {
  flag: "NORMAL" | "OUT_OF_RANGE" | "CRITICAL";
  isCritical: boolean;
  criticalReason?: string;
  summaryEn?: string;
  summaryTe?: string;
  summaryHi?: string;
  isTemplate: boolean;
}

export function evaluateTestParameters(
  parameters: Array<{
    parameterName: string;
    resultValue: number;
    refRangeMin: number;
    refRangeMax: number;
    unit: string;
  }>
) {
  let hasCritical = false;
  let hasOutOfRange = false;
  let criticalReason: string | undefined = undefined;

  const summariesEn: string[] = [];
  const summariesTe: string[] = [];
  const summariesHi: string[] = [];

  const evaluatedParams = parameters.map((param) => {
    const key = normalizeParamKey(param.parameterName);
    const def = CLINICAL_DEFINITIONS[key];
    let flag: "NORMAL" | "OUT_OF_RANGE" | "CRITICAL" = "NORMAL";

    if (def?.criticalLow !== undefined && param.resultValue <= def.criticalLow) {
      flag = "CRITICAL";
      hasCritical = true;
      criticalReason = `Critical low ${param.parameterName}: ${param.resultValue} ${param.unit} (Critical threshold <= ${def.criticalLow})`;
    } else if (def?.criticalHigh !== undefined && param.resultValue >= def.criticalHigh) {
      flag = "CRITICAL";
      hasCritical = true;
      criticalReason = `Critical high ${param.parameterName}: ${param.resultValue} ${param.unit} (Critical threshold >= ${def.criticalHigh})`;
    } else if (param.resultValue < param.refRangeMin) {
      flag = "OUT_OF_RANGE";
      hasOutOfRange = true;
      const tpl = def?.lowTemplate ?? t(
        `${param.parameterName} is below reference range (${param.refRangeMin}-${param.refRangeMax} ${param.unit}).`,
        `${param.parameterName} సాధారణ పరిమితి కంటే తక్కువగా ఉంది.`,
        `${param.parameterName} सामान्य स्तर से कम है।`
      );
      summariesEn.push(tpl.en);
      summariesTe.push(tpl.te);
      summariesHi.push(tpl.hi);
    } else if (param.resultValue > param.refRangeMax) {
      flag = "OUT_OF_RANGE";
      hasOutOfRange = true;
      const tpl = def?.highTemplate ?? t(
        `${param.parameterName} is above reference range (${param.refRangeMin}-${param.refRangeMax} ${param.unit}).`,
        `${param.parameterName} సాధారణ పరిమితి కంటే ఎక్కువగా ఉంది.`,
        `${param.parameterName} सामान्य स्तर से अधिक है।`
      );
      summariesEn.push(tpl.en);
      summariesTe.push(tpl.te);
      summariesHi.push(tpl.hi);
    }

    return { ...param, flag };
  });

  const overallFlag: "NORMAL" | "OUT_OF_RANGE" | "CRITICAL" = hasCritical
    ? "CRITICAL"
    : hasOutOfRange
    ? "OUT_OF_RANGE"
    : "NORMAL";

  if (hasCritical) {
    return {
      evaluatedParams,
      overallFlag: "CRITICAL" as const,
      isCritical: true,
      criticalReason,
      summaryEn: undefined,
      summaryTe: undefined,
      summaryHi: undefined,
    };
  }

  if (overallFlag === "NORMAL") {
    return {
      evaluatedParams,
      overallFlag: "NORMAL" as const,
      isCritical: false,
      summaryEn: "All tested parameters fall within normal reference ranges. Maintain healthy nutrition, active lifestyle, and review with your doctor as scheduled.",
      summaryTe: "పరీక్షించబడిన అన్ని ఫలితాలు సాధారణ పరిమితుల్లోనే ఉన్నాయి. మీ సాధారణ ఆరోగ్యాన్ని కాపాడుకోండి మరియు డాక్టర్‌ని సమయానికి కలవండి.",
      summaryHi: "जांच किए गए सभी परिणाम सामान्य सीमा के भीतर हैं। अपना सामान्य स्वास्थ्य बनाए रखें और नियमित जांच कराते रहें।",
    };
  }

  return {
    evaluatedParams,
    overallFlag: "OUT_OF_RANGE" as const,
    isCritical: false,
    summaryEn: summariesEn.join(" ") + " Please note: This is an informational summary, not a medical diagnosis. Always consult your referring doctor.",
    summaryTe: summariesTe.join(" ") + " గమనిక: ఇది కేవలం సమాచారం కొరకు మాత్రమే, వ్యాధి నిర్ధారణ కాదు. దయచేసి మీ డాక్టర్‌ను సంప్రదించండి.",
    summaryHi: summariesHi.join(" ") + " ध्यान दें: यह केवल जानकारी के लिए है, चिकित्सीय सलाह नहीं। कृपया अपने डॉक्टर से परामर्श अवश्य लें।",
  };
}
