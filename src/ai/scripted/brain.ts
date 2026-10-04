import { BRAND } from "@/config/brand";
import { detectLanguage, classifyObjections, ESCALATION_ASK, GUARANTEE, SENSITIVE, type ObjectionCode } from "./taxonomy";

export type ScriptInput = {
  text: string;
  locale: string;
  speaker: "PARENT" | "LEARNER" | "TOGETHER";
  parentSilentTurns: number;
  tradeSlug?: string;
  girl?: boolean;
  attemptCount: number;
  hasVerifiedFact: boolean;
};

export type ScriptBlock =
  | { type: "text"; text: string }
  | { type: "evidence"; factIds: string[] }
  | { type: "ladder"; tradeSlug: string }
  | { type: "question"; text: string };

export const PLAYBOOK_OPENERS: Record<string, Record<ObjectionCode, string>> = {
  en: {
    INCOME_POTENTIAL: "That's a fair worry. A family needs to know what trainees nearby actually earned.",
    JOB_SECURITY: "Wanting a steady job is reasonable. Placement is never a promise.",
    SOCIAL_STATUS: "What neighbours say can weigh on a family. The work itself is skilled.",
    WORK_SAFETY: "Safety comes before pride in a trade. Ask about workshops and gear.",
    GIRLS_SAFETY_TRAVEL: "A daughter's travel and safety should be settled before any course.",
    DEGREE_PREFERENCE: "A degree can still be the right road. Skills can also count toward further study.",
    GOVT_JOB_PREFERENCE: "A government job is a separate path. A trade can also be a step toward exams.",
    COST_FEES: "Fees should be clear before anyone pays. We will not guess a number.",
    DISTANCE_HOSTEL: "Staying away from home is a real family decision.",
    LOST_ACADEMIC_YEAR: "A year should not feel wasted. Check how credits can carry forward.",
    MARRIAGE_PROSPECTS: "Marriage plans and training can be talked about without shame.",
    MIGRATION_AWAY: "Moving for work is a cost, not only an income.",
    PROVIDER_TRUST_FRAUD: "Pay only after you can check the centre. We list questions to ask.",
    CERTIFICATE_RECOGNITION: "A certificate helps only if the qualification is recognised.",
    AUTOMATION_FUTURE: "Tools change. Hands-on repair and install work is still needed.",
    PHYSICAL_LABOUR_STIGMA: "Skilled work is not a lesser life. It is a craft with a ladder.",
    LANGUAGE_LITERACY_BARRIER: "You can hear this in your language. Reading is not required.",
    ELDER_VETO: "Elders carry the household. Their worry belongs in this room.",
    LEARNER_UNSURE: "Not knowing yet is allowed. We can look at a single trade at a time.",
    OTHER: "I am listening. Tell me the worry in your own words.",
  },
  hi: {
    INCOME_POTENTIAL: "यह चिंता जायज़ है। पास के प्रशिक्षणार्थियों की कमाई हम स्रोत के साथ दिखाते हैं।",
    JOB_SECURITY: "पक्की नौकरी की चाहत समझ में आती है। प्लेसमेंट का वादा नहीं किया जा सकता।",
    SOCIAL_STATUS: "लोग क्या कहेंगे, यह घर की चिंता है। यह काम एक हुनर है।",
    WORK_SAFETY: "सुरक्षा पहले। वर्कशॉप और उपकरण के बारे में पूछें।",
    GIRLS_SAFETY_TRAVEL: "बेटी की आवाजाही और सुरक्षा पहले तय होनी चाहिए।",
    DEGREE_PREFERENCE: "डिग्री भी सही रास्ता हो सकती है। कौशल क्रेडिट आगे जुड़ सकते हैं।",
    GOVT_JOB_PREFERENCE: "सरकारी नौकरी एक रास्ता है। ट्रेड उसकी तैयारी भी हो सकता है।",
    COST_FEES: "फीस पहले साफ होनी चाहिए। हम अंदाज़ा नहीं लगाएँगे।",
    DISTANCE_HOSTEL: "घर से दूर रहना परिवार का फैसला है।",
    LOST_ACADEMIC_YEAR: "साल बर्बाद नहीं होना चाहिए। क्रेडिट कैसे जुड़ते हैं, यह देखें।",
    MARRIAGE_PROSPECTS: "शादी और ट्रेनिंग दोनों की बात शांति से हो सकती है।",
    MIGRATION_AWAY: "काम के लिए जाना सिर्फ कमाई नहीं, एक कीमत भी है।",
    PROVIDER_TRUST_FRAUD: "भुगतान से पहले केंद्र जाँचें। पूछने वाले सवाल तैयार हैं।",
    CERTIFICATE_RECOGNITION: "प्रमाणपत्र तभी काम का है जब योग्यता मान्य हो।",
    AUTOMATION_FUTURE: "औज़ार बदलते हैं। मरम्मत और लगाने का काम रहता है।",
    PHYSICAL_LABOUR_STIGMA: "हुनर छोटा काम नहीं है। इसमें आगे बढ़ने की सीढ़ी है।",
    LANGUAGE_LITERACY_BARRIER: "आप यह अपनी भाषा में सुन सकते हैं। पढ़ना ज़रूरी नहीं।",
    ELDER_VETO: "बड़ों की चिंता इस बातचीत में शामिल है।",
    LEARNER_UNSURE: "अभी साफ न होना ठीक है। एक ट्रेड से शुरू करें।",
    OTHER: "मैं सुन रही हूँ। अपनी चिंता अपने शब्दों में बताइए।",
  },
  mr: {
    INCOME_POTENTIAL: "ही काळजी रास्त आहे. जवळच्या प्रशिक्षणार्थ्यांची कमाई स्रोतसह दाखवतो.",
    JOB_SECURITY: "पक्की नोकरीची इच्छा समजते. प्लेसमेंटचे वचन नाही.",
    SOCIAL_STATUS: "लोक काय म्हणतील ही घरची काळजी आहे. हे कुशल काम आहे.",
    WORK_SAFETY: "सुरक्षा आधी. कार्यशाळा आणि साधनं विचारा.",
    GIRLS_SAFETY_TRAVEL: "मुलीचा प्रवास आणि सुरक्षा आधी ठरवावी.",
    DEGREE_PREFERENCE: "पदवीही योग्य रस्ता असू शकते. कौशल्य क्रेडिट पुढे जोडता येतात.",
    GOVT_JOB_PREFERENCE: "सरकारी नोकरी एक मार्ग आहे. ट्रेड तयारीही होऊ शकते.",
    COST_FEES: "फीस आधी स्पष्ट हवी. आम्ही अंदाज लावणार नाही.",
    DISTANCE_HOSTEL: "घरापासून दूर राहणे हा कौटुंबिक निर्णय आहे.",
    LOST_ACADEMIC_YEAR: "वर्ष वाया जाऊ नये. क्रेडिट कसे जोडतात ते पहा.",
    MARRIAGE_PROSPECTS: "लग्न आणि प्रशिक्षण शांतपणे बोलता येते.",
    MIGRATION_AWAY: "कामासाठी जाणे ही केवळ कमाई नाही, किंमतही आहे.",
    PROVIDER_TRUST_FRAUD: "पैसे देण्यापूर्वी केंद्र तपासा. प्रश्न तयार आहेत.",
    CERTIFICATE_RECOGNITION: "प्रमाणपत्र तेव्हा उपयोगी जेव्हा अर्हता मान्य असेल.",
    AUTOMATION_FUTURE: "साधने बदलतात. दुरुस्तीचे काम राहते.",
    PHYSICAL_LABOUR_STIGMA: "हुनर कमी काम नाही. पुढे जाण्याची शिडी आहे.",
    LANGUAGE_LITERACY_BARRIER: "हे तुमच्या भाषेत ऐकता येते. वाचन गरजेचे नाही.",
    ELDER_VETO: "थोरांची काळजी या खोलीत आहे.",
    LEARNER_UNSURE: "अजून स्पष्ट नसणे ठीक आहे. एक ट्रेड पाहू.",
    OTHER: "मी ऐकते आहे. काळजी तुमच्या शब्दांत सांगा.",
  },
  ta: {
    INCOME_POTENTIAL: "இந்த கவலை நியாயம். அருகிலுள்ள பயிற்சியாளர்களின் வருமானத்தை மூலத்துடன் காட்டுகிறோம்.",
    JOB_SECURITY: "நிலையான வேலை விருப்பம் புரியும். வேலைவாய்ப்பு உறுதி அல்ல.",
    SOCIAL_STATUS: "மக்கள் என்ன சொல்வார்கள் என்பது வீட்டு கவலை. இது திறமையான வேலை.",
    WORK_SAFETY: "பாதுகாப்பு முதலில். பட்டறை மற்றும் கருவிகளைக் கேளுங்கள்.",
    GIRLS_SAFETY_TRAVEL: "மகளின் பயணமும் பாதுகாப்பும் முதலில் முடிய வேண்டும்.",
    DEGREE_PREFERENCE: "பட்டமும் சரியான பாதையாக இருக்கலாம். திறன் கடன் சேரலாம்.",
    GOVT_JOB_PREFERENCE: "அரசு வேலை ஒரு வழி. தொழில் அதற்கான படியாகவும் இருக்கலாம்.",
    COST_FEES: "கட்டணம் முதலில் தெளிவாக இருக்க வேண்டும். யூகிக்க மாட்டோம்.",
    DISTANCE_HOSTEL: "வீட்டை விட்டு தங்குவது குடும்ப முடிவு.",
    LOST_ACADEMIC_YEAR: "ஒரு ஆண்டு வீணாகக்கூடாது. கடன் எப்படி சேரும் என்று பாருங்கள்.",
    MARRIAGE_PROSPECTS: "திருமணமும் பயிற்சியும் அமைதியாக பேசலாம்.",
    MIGRATION_AWAY: "வேலைக்கு செல்வது வருமானம் மட்டும் அல்ல, விலையும் கூட.",
    PROVIDER_TRUST_FRAUD: "பணம் செலுத்தும் முன் மையத்தை சரிபாருங்கள்.",
    CERTIFICATE_RECOGNITION: "சான்றிதழ் அங்கீகரிக்கப்பட்ட தகுதியில் மட்டுமே பயன்தரும்.",
    AUTOMATION_FUTURE: "கருவிகள் மாறும். பழுதுபார்ப்பு வேலை இருக்கும்.",
    PHYSICAL_LABOUR_STIGMA: "திறன் சிறிய வேலை அல்ல. ஏறும் ஏணி உண்டு.",
    LANGUAGE_LITERACY_BARRIER: "இதை உங்கள் மொழியில் கேட்கலாம். படிப்பு கட்டாயம் அல்ல.",
    ELDER_VETO: "மூத்தோர் கவலை இந்த அறையில் இருக்கிறது.",
    LEARNER_UNSURE: "இன்னும் தெரியாமல் இருப்பது சரி. ஒரு தொழிலைப் பார்ப்போம்.",
    OTHER: "கேட்டுக் கொண்டிருக்கிறேன். கவலையை உங்கள் சொற்களில் சொல்லுங்கள்.",
  },
};

function pack(locale: string): Record<ObjectionCode, string> {
  if (locale === "hi" || locale === "mr" || locale === "ta") return PLAYBOOK_OPENERS[locale]!;
  return PLAYBOOK_OPENERS.en!;
}

export function scriptedTurn(input: ScriptInput): {
  language: string;
  blocks: ScriptBlock[];
  objections: { tag: ObjectionCode; speaker: string; intensity: 1 | 2 | 3 }[];
  sentiment: { parent?: number; learner?: number };
  stance: { parent?: "OPEN" | "HESITANT" | "RESISTANT" | "VETO"; learner?: "OPEN" | "HESITANT" | "RESISTANT" | "VETO" };
  usedFactIds: string[];
  needsHuman: { flag: boolean; reason?: string };
  suggestedChips: string[];
  scripted: true;
} {
  const detected = detectLanguage(input.text);
  const language = detected === "hinglish" ? input.locale || "hi" : detected === "en" ? input.locale || "en" : detected;
  const tags = classifyObjections(input.text);
  const primary = tags[0] ?? "OTHER";
  const voice = input.speaker === "LEARNER" ? "learner" : "parent";
  const sensitive = SENSITIVE.test(input.text);
  if (sensitive) {
    return {
      language,
      blocks: [{ type: "text", text: "I am stopping here. Please talk to a person now. The helplines on this screen are for this moment. I will not continue the counselling." }],
      objections: [],
      sentiment: voice === "parent" ? { parent: -1 } : { learner: -1 },
      stance: voice === "parent" ? { parent: "VETO" } : { learner: "VETO" },
      usedFactIds: [],
      needsHuman: { flag: true, reason: "sensitive_topic" },
      suggestedChips: [],
      scripted: true,
    };
  }
  const asked = ESCALATION_ASK.test(input.text);
  const guarantee = GUARANTEE.test(input.text);
  const intensity: 1 | 2 | 3 = sensitive ? 3 : guarantee ? 2 : 2;
  const lines = pack(language.startsWith("hi") ? "hi" : language);
  const opener = lines[primary] ?? lines.OTHER;
  const blocks: ScriptBlock[] = [{ type: "text", text: opener }];
  const factIds: string[] = [];
  if (input.tradeSlug && input.hasVerifiedFact && (primary === "INCOME_POTENTIAL" || primary === "JOB_SECURITY" || primary === "COST_FEES")) {
    factIds.push(`outcome:${input.tradeSlug}`);
    blocks.push({ type: "evidence", factIds });
    blocks.push({
      type: "text",
      text:
        language === "hi"
          ? "ये आँकड़े डेमो डेटा से हैं। असली दावा तभी जब डेटा स्टीवर्ड सत्यापित करे।"
          : "These figures are from demo data. A real claim waits until a data steward verifies the source.",
    });
  } else if (primary === "INCOME_POTENTIAL" || primary === "JOB_SECURITY") {
    blocks.push({
      type: "text",
      text:
        language === "hi"
          ? "इस जगह और ट्रेड के लिए सत्यापित आँकड़ा अभी नहीं है। सलाहकार से बात कर सकते हैं। अंदाज़ा नहीं लगाऊँगी।"
          : "There is no verified figure for this place and trade yet. A counsellor can help. I will not guess.",
    });
  }
  if (primary === "DEGREE_PREFERENCE" && input.tradeSlug) {
    blocks.push({ type: "ladder", tradeSlug: input.tradeSlug });
    blocks.push({
      type: "text",
      text: "NSQF means skill ladder level. NCrF means a credit bank: training hours can count toward a diploma or degree. Confirm the mapping on the National Qualifications Register.",
    });
  }
  if (guarantee) {
    blocks.push({
      type: "text",
      text: "I cannot guarantee a job or a salary. Anyone who promises that should be checked carefully.",
    });
  }
  if (input.girl && (primary === "GIRLS_SAFETY_TRAVEL" || primary === "WORK_SAFETY")) {
    blocks.push({
      type: "text",
      text: "Look for hostel, transport, and girls-only centres where the dataset lists them. Visit in daylight with a family member.",
    });
  }
  if (input.parentSilentTurns >= 3 && input.speaker !== "PARENT") {
    blocks.push({ type: "question", text: "Parent, what worry do you want answered first?" });
  } else if (!sensitive) {
    blocks.push({ type: "question", text: "Which part should we look at next: earnings, safety, or the path to a diploma?" });
  }
  blocks.push({
    type: "text",
    text: `I am ${BRAND.persona}, an AI guide. A human counsellor can go further.`,
  });
  const needsHuman = sensitive || asked || (input.attemptCount >= 2 && primary !== "OTHER");
  const sentiment = voice === "parent" ? { parent: sensitive ? -0.8 : -0.2 } : { learner: 0.2 };
  const stance = voice === "parent"
    ? { parent: sensitive ? ("VETO" as const) : ("HESITANT" as const) }
    : { learner: "OPEN" as const };
  return {
    language,
    blocks,
    objections: tags.map((tag) => ({ tag, speaker: input.speaker === "TOGETHER" ? "PARENT" : input.speaker, intensity })),
    sentiment,
    stance,
    usedFactIds: factIds,
    needsHuman: {
      flag: needsHuman,
      reason: sensitive ? "sensitive_topic" : asked ? "explicit_request" : needsHuman ? "repeat_objection" : undefined,
    },
    suggestedChips: ["कमाई कितनी होगी?", "क्या नौकरी पक्की है?", "लोग क्या कहेंगे?", "क्या बेटियों के लिए सुरक्षित है?"],
    scripted: true,
  };
}
