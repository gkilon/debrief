
import { GoogleGenAI, Type } from "@google/genai";

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string) => {
  try {
    // אתחול המופע ממש לפני השימוש כדי להבטיח קבלת המפתח המעודכן ביותר
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `אתה מומחה לתחקירים מבצעיים (AAR). זהה 3 פערים עיקריים בין התכנון לביצוע הבאים:
    תכנון: ${planned}
    ביצוע: ${actual}
    החזר JSON עם מערך בשם gaps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
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
  } catch (error: any) {
    console.error("Identify Gaps Error:", error);
    // אם השגיאה נובעת מחוסר מפתח, נזרוק אותה כדי שה-UI ידע להציג בחירת מפתח
    if (error.message?.includes("API Key")) {
      throw new Error("MISSING_API_KEY");
    }
    return null;
  }
};

/**
 * שלב 2: ניתוח גורמי שורש ומסקנות בסיסיות לטופס
 */
export const analyzeConclusions = async (gaps: string[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  } catch (error: any) {
    console.error("Analyze Conclusions Error:", error);
    if (error.message?.includes("API Key")) throw new Error("MISSING_API_KEY");
    return { rootCauses: [], conclusions: [] };
  }
};

/**
 * ניתוח RCA מעמיק עבור הסוכן החכם (AIAgent)
 */
export const analyzeRootCause = async (data: { whatWasPlanned: string, whatHappened: string, gaps: string[] }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `בצע ניתוח שורש (Root Cause Analysis) מעמיק לאירוע הבא:
      מה תוכנן: ${data.whatWasPlanned}
      מה קרה בפועל: ${data.whatHappened}
      פערים שזוהו: ${data.gaps.join(", ")}
      החזר JSON הכולל rootCauses (מערך), analysis (טקסט), ו-recommendations (מערך).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
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
  } catch (error: any) {
    console.error("Analyze Root Cause Error:", error);
    if (error.message?.includes("API Key")) throw new Error("MISSING_API_KEY");
    return { rootCauses: [], analysis: 'שגיאה בניתוח הנתונים.', recommendations: [] };
  }
};

/**
 * צ'אט אינטראקטיבי עם הסוכן
 */
export const chatWithAgent = async (history: {role: string, content: string}[], message: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה עוזר מומחה לתחקירים מבצעיים (AAR). עזור למשתמש להבין את הפערים ולשפר ביצועים.',
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error: any) {
    console.error("Chat Error:", error);
    if (error.message?.includes("API Key")) return "נראה שחסר מפתח API. נא לחץ על 'התחברות' בתפריט.";
    return "חלה שגיאה בתקשורת.";
  }
};
