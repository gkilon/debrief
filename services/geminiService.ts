import { GoogleGenAI, Type } from "@google/genai";

/**
 * פונקציה פנימית לקבלת המפתח בצורה בטוחה
 */
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API_KEY is not defined in process.env");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `אתה מומחה לתחקירים מבצעיים. זהה 3 פערים עיקריים בין התכנון לביצוע הבאים.
    תכנון: ${planned}
    ביצוע: ${actual}
    החזר JSON עם מערך בשם gaps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // מהירות מקסימלית למשימה פשוטה
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["gaps"],
        },
      },
    });

    return response.text ? JSON.parse(response.text).gaps : null;
  } catch (error) {
    console.error("Identify Gaps Error:", error);
    return null;
  }
};

/**
 * שלב 2: ניתוח גורמי שורש ומסקנות בסיסיות לטופס
 */
export const analyzeConclusions = async (gaps: string[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return { rootCauses: [], conclusions: [] };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `נתח את הפערים הבאים ומצא גורמי שורש ומסקנות לשיפור: ${gaps.join(", ")}. החזר JSON עם מערכי rootCauses ו-conclusions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["rootCauses", "conclusions"],
        },
      },
    });

    return response.text ? JSON.parse(response.text) : { rootCauses: [], conclusions: [] };
  } catch (error) {
    console.error("Analyze Conclusions Error:", error);
    return { rootCauses: [], conclusions: [] };
  }
};

/**
 * ניתוח RCA מעמיק עבור הסוכן החכם (AIAgent)
 */
export const analyzeRootCause = async (data: { whatWasPlanned: string, whatHappened: string, gaps: string[] }) => {
  const apiKey = getApiKey();
  if (!apiKey) return { rootCauses: [], analysis: 'חסר מפתח API.', recommendations: [] };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `בצע ניתוח שורש (Root Cause Analysis) מעמיק לאירוע הבא:
      מה תוכנן: ${data.whatWasPlanned}
      מה קרה בפועל: ${data.whatHappened}
      פערים שזוהו: ${data.gaps.join(", ")}
      החזר JSON הכולל rootCauses (מערך), analysis (טקסט), ו-recommendations (מערך).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // שימוש במודל Pro למשימה מורכבת של RCA
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        // מודל Pro מקבל תקציב חשיבה גבוה יותר כברירת מחדל לניתוח מעמיק
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["rootCauses", "analysis", "recommendations"],
        },
      },
    });

    return response.text ? JSON.parse(response.text) : { rootCauses: [], analysis: '', recommendations: [] };
  } catch (error) {
    console.error("Analyze Root Cause Error:", error);
    return { rootCauses: [], analysis: 'שגיאה בניתוח הנתונים.', recommendations: [] };
  }
};

/**
 * צ'אט אינטראקטיבי עם הסוכן
 */
export const chatWithAgent = async (history: {role: string, content: string}[], message: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "שגיאה: חסר מפתח API.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה עוזר מומחה לתחקירים מבצעיים (AAR). עזור למשתמש להבין את הפערים ולשפר ביצועים.',
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "חלה שגיאה בתקשורת.";
  }
};