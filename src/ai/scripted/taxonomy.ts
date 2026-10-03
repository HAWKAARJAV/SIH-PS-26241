export const OBJECTION_CODES = [
  "INCOME_POTENTIAL",
  "JOB_SECURITY",
  "SOCIAL_STATUS",
  "WORK_SAFETY",
  "GIRLS_SAFETY_TRAVEL",
  "DEGREE_PREFERENCE",
  "GOVT_JOB_PREFERENCE",
  "COST_FEES",
  "DISTANCE_HOSTEL",
  "LOST_ACADEMIC_YEAR",
  "MARRIAGE_PROSPECTS",
  "MIGRATION_AWAY",
  "PROVIDER_TRUST_FRAUD",
  "CERTIFICATE_RECOGNITION",
  "AUTOMATION_FUTURE",
  "PHYSICAL_LABOUR_STIGMA",
  "LANGUAGE_LITERACY_BARRIER",
  "ELDER_VETO",
  "LEARNER_UNSURE",
  "OTHER",
] as const;

export type ObjectionCode = (typeof OBJECTION_CODES)[number];

export const SENSITIVE =
  /\b(suicid|kill myself|self-harm|abuse|harass|rape|violence|beat me|legal case|court|disability|disabled|fraud complaint)\b|आत्महत्या|मार|पीट|उत्पीड़न|வன்புணர்வு|துன்புறுத்தல்/i;

export const ESCALATION_ASK =
  /\b(talk to (a )?(person|human|counsellor)|call (a )?counsellor|insaan se|counsellor se|ஆலோசகர்|सलाहकार)\b/i;

export const GUARANTEE =
  /\b(guarantee|100%|pakka job|sure job|promise (me )?(a )?job|नौकरी पक्की|உத்தரவாதம்)\b/i;

export type Lexicon = { code: ObjectionCode; patterns: RegExp[] };

export const LEXICON: Lexicon[] = [
  { code: "INCOME_POTENTIAL", patterns: [/earn|income|salary|kamai|kamaai|कमाई|पैसा|சம்பளம்|ஊதியம்|पगार/i] },
  { code: "JOB_SECURITY", patterns: [/job secur|naukri pakki|placement|नौकरी|பணி|नोकरी पक्की|secure job/i] },
  { code: "SOCIAL_STATUS", patterns: [/log kya|izzat|status|samaj|சமூக|मान|काय म्हणतील|what will people/i] },
  { code: "GIRLS_SAFETY_TRAVEL", patterns: [/beti|daughter|girl|ladki|travel|distance|பெண்|மகள|मुलगी|बेटि|hostel for girl/i] },
  { code: "WORK_SAFETY", patterns: [/unsafe|accident|safety|surakshit|பாதுகாப்பு|सुरक्ष|धोका/i] },
  { code: "DEGREE_PREFERENCE", patterns: [/degree|b\.?a|b\.?com|college first|डिग्री|பட்டம்|पदवी/i] },
  { code: "GOVT_JOB_PREFERENCE", patterns: [/govt job|government job|sarkari|அரசு வேலை|सरकारी/i] },
  { code: "COST_FEES", patterns: [/fee|fees|kharcha|afford|फीस|கட்டணம்|शुल्क/i] },
  { code: "DISTANCE_HOSTEL", patterns: [/hostel|door|far away|stay away|தூரம்|छात्रावास/i] },
  { code: "LOST_ACADEMIC_YEAR", patterns: [/drop year|waste year|saal barbaad|ஆண்டு வீண்|वर्ष खराब/i] },
  { code: "MARRIAGE_PROSPECTS", patterns: [/shaadi|marriage|rishta|திருமணம்|लग्न/i] },
  { code: "MIGRATION_AWAY", patterns: [/migrate|another city|bahut door|வேறு ஊர்|स्थलांतर/i] },
  { code: "PROVIDER_TRUST_FRAUD", patterns: [/fraud|fake college|cheat|धोखा|மோசடி|फसवणूक/i] },
  { code: "CERTIFICATE_RECOGNITION", patterns: [/certificate|recognition|valid|प्रमाणपत्र|சான்றிதழ்/i] },
  { code: "AUTOMATION_FUTURE", patterns: [/automation|robot|future of|ai will replace|यंत्र/i] },
  { code: "PHYSICAL_LABOUR_STIGMA", patterns: [/labour|labor|mehnat|dirty work|உடல் உழைப்பு|मजदूरी/i] },
  { code: "LANGUAGE_LITERACY_BARRIER", patterns: [/can't read|padh nahi|low literacy|படிக்க தெரியாது|अक्षर/i] },
  { code: "ELDER_VETO", patterns: [/grandfather|elder|papa mana|family will not|மூத்தவர்|दादा/i] },
  { code: "LEARNER_UNSURE", patterns: [/not sure|confused|samajh nahi|தெரியவில்லை|गोंधळ/i] },
];

export function detectLanguage(text: string): "en" | "hi" | "mr" | "ta" | "hinglish" {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0900-\u097F]/.test(text)) {
    if (/काय|आहे|नाही|मुलगी|पगार/.test(text)) return "mr";
    return "hi";
  }
  if (/\b(hai|kya|nahi|nahin|kaise|kitna|beti|papa)\b/i.test(text)) return "hinglish";
  return "en";
}

export function classifyObjections(text: string): ObjectionCode[] {
  const hits = LEXICON.filter((item) => item.patterns.some((p) => p.test(text))).map((item) => item.code);
  return hits.length ? hits : ["OTHER"];
}
