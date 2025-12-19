
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string) => {
  try {
    const ai = getAI();
    const prompt = `
      אתה מומחה לתחקירים מבצעיים. נתון תכנון מול ביצוע.
      תכנון: ${planned}
      ביצוע: ${actual}
      זהה 3 פערים עיקריים. החזר JSON עם מערך בשם gaps.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
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

    return response.text ? JSON.parse(response.text).gaps : [];
  } catch (error) {
    console.error("Identify Gaps Detailed Error:", error);
    return null; // Return null to indicate error vs empty array
  }
};

/**
 * שלב 2: ניתוח גורמי שורש ומסקנות
 */
export const analyzeConclusions = async (gaps: string[]) => {
  try {
    const ai = getAI();
    const prompt = `נתח את הפערים: ${gaps.join(", ")}. החזר JSON עם rootCauses ו-conclusions (מערכי מחרוזות).`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
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
  } catch (error) {
    console.error("Analyze Conclusions Error:", error);
    return { rootCauses: [], conclusions: [] };
  }
};

export const analyzeRootCause = async (data: { whatHappened: string, whatWasPlanned: string, gaps: string[] }) => {
  try {
    const ai = getAI();
    const prompt = `בצע RCA עמוק: תכנון: ${data.whatWasPlanned}, ביצוע: ${data.whatHappened}, פערים: ${data.gaps.join(", ")}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    return response.text ? JSON.parse(response.text) : { rootCauses: [], analysis: "", recommendations: [] };
  } catch (error) {
    console.error("RCA Error:", error);
    return { rootCauses: [], analysis: "שגיאה בחיבור לשרת ה-AI", recommendations: [] };
  }
};

export const chatWithAgent = async (history: {role: string, content: string}[], message: string) => {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה עוזר מומחה לתחקירים מבצעיים (AAR).',
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "חלה שגיאה בתקשורת עם ה-AI. וודא שה-API KEY הוגדר כהלכה ב-Netlify.";
  }
};
