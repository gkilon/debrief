
import { GoogleGenAI, Type } from "@google/genai";
import { WhatHappenedStructured } from "../types";

/**
 * פונקציה פנימית ליצירת המופע של ה-AI.
 * תמיד משתמש במפתח מהסביבה לפי ההנחיות.
 */
const getAiInstance = () => {
  // Use process.env.API_KEY exclusively for getting the API key
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  
  return new GoogleGenAI({ apiKey });
};

const formatActualData = (actual: string | WhatHappenedStructured): string => {
  if (typeof actual === 'string') return actual;
  return `
    תהליך: ${actual.process}
    תוצאה: ${actual.result}
    אווירה/מורל: ${actual.atmosphere}
    משאבים: ${actual.resources}
    בטיחות: ${actual.safety}
    אחר: ${actual.other}
  `.trim();
};

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string | WhatHappenedStructured) => {
  try {
    const ai = getAiInstance();
    const actualText = formatActualData(actual);
    
    const prompt = `אתה מומחה לתחקירים מבצעיים (AAR). זהה 3-4 פערים עיקריים בין התכנון לביצוע.
    חשוב מאוד: התשובות חייבות להיות בעברית בלבד!
    
    תכנון: ${planned}
    ביצוע בפועל (בחלוקה לקטגוריות):
    ${actualText}
    
    החזר JSON עם מערך בשם gaps המכיל מחרוזות בעברית.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

    // Access the extracted string output directly via .text property
    return response.text ? JSON.parse(response.text).gaps : null;
  } catch (error: any) {
    console.error("Identify Gaps Error:", error);
    if (error.message === "MISSING_API_KEY" || error.message?.includes("API Key")) {
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
    const ai = getAiInstance();
    const prompt = `נתח את הפערים הבאים ומצא גורמי שורש ומסקנות לשיפור.
    חשוב מאוד: כל התוכן חייב להיות בעברית בלבד!
    
    הפערים: ${gaps.join(", ")}
    
    החזר JSON עם מערכי rootCauses ו-conclusions בעברית.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

    // Access text property directly
    return response.text ? JSON.parse(response.text) : { rootCauses: [], conclusions: [] };
  } catch (error: any) {
    console.error("Analyze Conclusions Error:", error);
    if (error.message === "MISSING_API_KEY" || error.message?.includes("API Key")) {
      throw new Error("MISSING_API_KEY");
    }
    return { rootCauses: [], conclusions: [] };
  }
};

/**
 * ניתוח RCA מעמיק עבור הסוכן החכם (AIAgent)
 */
export const analyzeRootCause = async (data: { whatWasPlanned: string, whatHappened: string | WhatHappenedStructured, gaps: string[] }) => {
  try {
    const ai = getAiInstance();
    const actualText = formatActualData(data.whatHappened);
    
    const prompt = `בצע ניתוח שורש (Root Cause Analysis) מעמיק לאירוע הבא.
      חשוב מאוד: כל הניתוח וההמלצות חייבים להיות בעברית בלבד!
      
      מה תוכנן: ${data.whatWasPlanned}
      מה קרה בפועל: ${actualText}
      פערים שזוהו: ${data.gaps.join(", ")}
      החזר JSON הכולל rootCauses (מערך), analysis (טקסט), ו-recommendations (מערך), הכל בעברית.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
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

    // Access text property directly
    return response.text ? JSON.parse(response.text) : { rootCauses: [], analysis: '', recommendations: [] };
  } catch (error: any) {
    console.error("Analyze Root Cause Error:", error);
    if (error.message === "MISSING_API_KEY" || error.message?.includes("API Key")) {
      throw new Error("MISSING_API_KEY");
    }
    return { rootCauses: [], analysis: 'שגיאה בניתוח הנתונים.', recommendations: [] };
  }
};

/**
 * צ'אט אינטראקטיבי עם הסוכן
 */
export const chatWithAgent = async (history: {role: string, content: string}[], message: string) => {
  try {
    const ai = getAiInstance();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה עוזר מומחה לתחקירים מבצעיים (AAR). ענה תמיד בעברית בלבד. עזור למשתמש להבין את הפערים ולשפר ביצועים.',
      },
    });
    const response = await chat.sendMessage({ message });
    // Access text property directly
    return response.text;
  } catch (error: any) {
    console.error("Chat Error:", error);
    if (error.message === "MISSING_API_KEY" || error.message?.includes("API Key")) {
      return "נראה שחסר מפתח API. נא לחץ על 'התחברות' בתפריט או וודא שביצעת Deploy ב-Netlify.";
    }
    return "חלה שגיאה בתקשורת.";
  }
};
