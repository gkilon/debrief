
import { GoogleGenAI, Type } from "@google/genai";
import { WhatHappenedStructured, Message } from "../types";

// Helper function to format structured data for the model
const formatActualData = (actual: string | WhatHappenedStructured): string => {
  if (typeof actual === 'string') return actual;
  return `
    תהליך: ${actual.process}
    תוצאה: ${actual.result}
    אווירה ומורל: ${actual.atmosphere}
    משאבים: ${actual.resources}
    בטיחות: ${actual.safety}
    אחר: ${actual.other}
  `.trim();
};

// Identify gaps between planned and actual events
export const identifyGaps = async (planned: string, actual: string | WhatHappenedStructured) => {
  try {
    // Ensuring instance is created right before use with current process.env.API_KEY
    if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const actualText = formatActualData(actual);
    
    const prompt = `אתה מומחה לתחקירים מבצעיים (AAR). זהה 3 פערים עיקריים בין התכנון לביצוע.
    חובה להשיב בעברית בלבד!
    תכנון: ${planned}
    ביצוע בפועל: ${actualText}
    החזר JSON עם מערך 'gaps' של מחרוזות בעברית.`;

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
    if (error.message === "MISSING_API_KEY") throw error;
    return null;
  }
};

// Analyze gaps to find root causes and conclusions
export const analyzeConclusions = async (gaps: string[]) => {
  try {
    if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `נתח את הפערים הבאים ומצא גורמי שורש ומסקנות לשיפור.
    חובה להשיב בעברית בלבד!
    פערים: ${gaps.join(", ")}
    החזר JSON עם מערכי 'rootCauses' ו-'conclusions' בעברית.`;

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
    if (error.message === "MISSING_API_KEY") throw error;
    return { rootCauses: [], conclusions: [] };
  }
};

// Analyze root causes with deeper reasoning using Pro model
// Added missing export required by AIAgent.tsx
export const analyzeRootCause = async (data: { 
  whatHappened: string | WhatHappenedStructured, 
  whatWasPlanned: string, 
  gaps: string[] 
}) => {
  try {
    if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const actualText = formatActualData(data.whatHappened);
    
    const prompt = `בצע ניתוח מעמיק של גורמי שורש (Root Cause Analysis) עבור התחקיר הבא:
    תכנון: ${data.whatWasPlanned}
    ביצוע: ${actualText}
    פערים שזוהו: ${data.gaps.join(", ")}
    
    עליך להחזיר JSON עם המבנה הבא:
    - rootCauses: מערך של מחרוזות (גורמי שורש)
    - analysis: מחרוזת טקסט חופשי המנתחת את הסיבות וההקשרים
    - recommendations: מערך של המלצות אופרטיביות
    
    חובה להשיב בעברית בלבד!`;

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
    if (error.message === "MISSING_API_KEY") throw error;
    return null;
  }
};

// Chat with the agent about the debrief
// Added missing export required by AIAgent.tsx
export const chatWithAgent = async (history: Message[], message: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה מומחה לניתוח תחקירים והפקת לקחים. עזור למשתמש להבין טוב יותר את האירוע שלו ולמצוא פתרונות. ענה בעברית.',
      },
    });
    
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") throw error;
    return "מצטער, חלה שגיאה בתקשורת עם הסוכן.";
  }
};
