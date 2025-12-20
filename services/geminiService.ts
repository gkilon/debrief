import { GoogleGenAI, Type } from "@google/genai";
import { WhatHappenedStructured, Message } from "../types";

/**
 * פונקציה פנימית לקבלת מפתח API בצורה גמישה.
 * בודקת את כל המשתנים האפשריים בסביבות פריסה שונות (Netlify, Vite וכו').
 */
const getApiKey = () => {
  return (
    process.env.API_KEY || 
    (import.meta as any).env?.VITE_API_KEY || 
    (import.meta as any).env?.VITE_GOOGLE_API_KEY ||
    (process.env as any).VITE_API_KEY
  );
};

// Helper function to format structured data for the model
const formatActualData = (actual: string | WhatHappenedStructured): string => {
  if (typeof actual === 'string') return actual;
  return `
    - תהליך: ${actual.process || 'לא הוזן'}
    - תוצאה: ${actual.result || 'לא הוזן'}
    - אווירה ומורל: ${actual.atmosphere || 'לא הוזן'}
    - משאבים: ${actual.resources || 'לא הוזן'}
    - בטיחות: ${actual.safety || 'לא הוזן'}
    - אחר: ${actual.other || 'לא הוזן'}
  `.trim();
};

// Identify gaps between planned and actual events
export const identifyGaps = async (planned: string, actual: string | WhatHappenedStructured) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");
    
    const ai = new GoogleGenAI({ apiKey });
    const actualText = formatActualData(actual);
    
    const prompt = `אתה מומחה לתחקירים מבצעיים (AAR). עליך לזהות 3-4 פערים עיקריים בין התכנון לביצוע.
    חובה להשיב בעברית בלבד! כל תשובה באנגלית תיפסל.
    
    תכנון: ${planned}
    ביצוע בפועל (בחלוקה לקטגוריות):
    ${actualText}
    
    החזר JSON עם מערך 'gaps' של מחרוזות בעברית בלבד.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["gaps"],
        },
      },
    });

    return response.text ? JSON.parse(response.text).gaps : null;
  } catch (error: any) {
    console.error("Identify Gaps Error:", error);
    if (error.message === "MISSING_API_KEY") throw error;
    return null;
  }
};

// Analyze gaps to find root causes and conclusions
export const analyzeConclusions = async (gaps: string[]) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `נתח את הפערים הבאים ומצא גורמי שורש ומסקנות לשיפור.
    חשוב מאוד: כל התוכן חייב להיות בעברית בלבד!
    
    הפערים: ${gaps.join(", ")}
    
    החזר JSON עם מערכי 'rootCauses' ו-'conclusions' בעברית בלבד.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
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
    if (error.message === "MISSING_API_KEY") throw error;
    return { rootCauses: [], conclusions: [] };
  }
};

// Analyze root causes with deeper reasoning using Pro model
export const analyzeRootCause = async (data: { 
  whatHappened: string | WhatHappenedStructured, 
  whatWasPlanned: string, 
  gaps: string[] 
}) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");
    
    const ai = new GoogleGenAI({ apiKey });
    const actualText = formatActualData(data.whatHappened);
    
    const prompt = `בצע ניתוח מעמיק של גורמי שורש (Root Cause Analysis) עבור התחקיר הבא.
    חובה להשיב בעברית בלבד!
    
    תכנון: ${data.whatWasPlanned}
    ביצוע: ${actualText}
    פערים שזוהו: ${data.gaps.join(", ")}
    
    החזר JSON עם:
    - rootCauses: מערך גורמי שורש (עברית)
    - analysis: ניתוח טקסטואלי חופשי (עברית)
    - recommendations: המלצות אופרטיביות (עברית)`;

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

    return response.text ? JSON.parse(response.text) : null;
  } catch (error: any) {
    console.error("RCA Error:", error);
    if (error.message === "MISSING_API_KEY") throw error;
    return null;
  }
};

// Chat with the agent about the debrief
export const chatWithAgent = async (history: Message[], message: string) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");
    
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה מומחה לניתוח תחקירים והפקת לקחים. עזור למשתמש להבין טוב יותר את האירוע שלו ולמצוא פתרונות. ענה בעברית בלבד.',
      },
    });
    
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error: any) {
    console.error("Chat Error:", error);
    return "מצטער, חלה שגיאה בתקשורת עם הסוכן.";
  }
};