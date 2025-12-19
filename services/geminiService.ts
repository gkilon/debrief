
import { GoogleGenAI, Type } from "@google/genai";

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string) => {
  try {
    // Always create a new GoogleGenAI instance right before the API call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      אתה מומחה לתחקירים מבצעיים. נתון תכנון מול ביצוע.
      תכנון: ${planned}
      ביצוע: ${actual}
      זהה 3 פערים עיקריים בין התכנון לביצוע. החזר JSON עם מערך בשם gaps.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
  } catch (error: any) {
    console.error("Identify Gaps Error:", error);
    // Return null to trigger the error UI in the component
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
      contents: prompt,
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

/**
 * ניתוח RCA מעמיק עבור הסוכן החכם (AIAgent)
 */
export const analyzeRootCause = async (data: { whatWasPlanned: string, whatHappened: string, gaps: string[] }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      בצע ניתוח שורש (Root Cause Analysis) מעמיק לאירוע הבא:
      מה תוכנן: ${data.whatWasPlanned}
      מה קרה בפועל: ${data.whatHappened}
      פערים שזוהו: ${data.gaps.join(", ")}
      
      החזר JSON הכולל:
      1. rootCauses: מערך של גורמי שורש שזוהו.
      2. analysis: טקסט חופשי המנתח את המצב בצורה מעמיקה.
      3. recommendations: מערך של המלצות אופרטיביות לביצוע.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex task uses Pro
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
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'אתה עוזר מומחה לתחקירים מבצעיים (AAR). עזור למשתמש להבין את הפערים ולשפר ביצועים.',
      },
    });
    // Message corresponds to user input in chat session
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "חלה שגיאה בתקשורת עם ה-AI. אנא נסה שוב מאוחר יותר.";
  }
};
