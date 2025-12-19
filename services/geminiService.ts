
import { GoogleGenAI, Type } from "@google/genai";

/**
 * שלב 1: זיהוי פערים על בסיס תכנון מול ביצוע
 */
export const identifyGaps = async (planned: string, actual: string) => {
  // Initialize AI client with API key from environment directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    נתון תכנון מול ביצוע של אירוע.
    תכנון: ${planned}
    ביצוע בפועל: ${actual}

    זהה את 3-5 הפערים המשמעותיים ביותר בין התכנון לביצוע.
    החזר את התשובה בפורמט JSON בלבד.
  `;

  try {
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
              description: "רשימת פערים שזוהו",
            },
          },
          required: ["gaps"],
        },
      },
    });
    // Extracting text output from response using the .text property
    const text = response.text;
    return text ? JSON.parse(text).gaps : [];
  } catch (error) {
    console.error("Identify Gaps Error:", error);
    return [];
  }
};

/**
 * שלב 2: ניתוח גורמי שורש ומסקנות על בסיס פערים נבחרים
 */
export const analyzeConclusions = async (gaps: string[]) => {
  // Initialize AI client with API key from environment directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    על בסיס הפערים הבאים שזוהו בתחקיר:
    ${gaps.join(", ")}

    בצע ניתוח גורמי שורש (שיטת 5 הלמה) והצע מסקנות אופרטיביות לשיפור.
    החזר את התשובה בפורמט JSON בלבד.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "גורמי שורש לכל פער",
            },
            conclusions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "מסקנות אופרטיביות ליישום",
            },
          },
          required: ["rootCauses", "conclusions"],
        },
      },
    });
    // Extracting text output from response using the .text property
    const text = response.text;
    return text ? JSON.parse(text) : { rootCauses: [], conclusions: [] };
  } catch (error) {
    console.error("Analyze Conclusions Error:", error);
    return { rootCauses: [], conclusions: [] };
  }
};

/**
 * ניתוח גורמי שורש ומסקנות מעמיק עבור סוכן ה-AI (RCA)
 */
export const analyzeRootCause = async (data: { whatHappened: string, whatWasPlanned: string, gaps: string[] }) => {
  // Initialize AI client with API key from environment directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    נתח גורמי שורש (RCA) לאירוע הבא:
    תכנון: ${data.whatWasPlanned}
    ביצוע: ${data.whatHappened}
    פערים שזוהו: ${data.gaps.join(", ")}

    החזר ניתוח מעמיק בפורמט JSON הכולל:
    1. rootCauses: רשימת גורמי שורש (מערך מחרוזות).
    2. analysis: טקסט חופשי המנתח את המצב (מחרוזת).
    3. recommendations: המלצות אופרטיביות (מערך מחרוזות).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex reasoning task
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
    // Extracting text output from response using the .text property
    const text = response.text;
    return text ? JSON.parse(text) : { rootCauses: [], analysis: "", recommendations: [] };
  } catch (error) {
    console.error("Analyze Root Cause Error:", error);
    return { rootCauses: [], analysis: "שגיאה בניתוח המערכת", recommendations: [] };
  }
};

/**
 * צ'אט אינטראקטיבי עם סוכן התחקירים
 */
export const chatWithAgent = async (history: {role: string, content: string}[], message: string) => {
  // Initialize AI client with API key from environment directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'אתה עוזר וירטואלי מומחה לביצוע תחקירים מבצעיים והפקת לקחים (AAR). עזור למשתמש להבין פערים, לזהות גורמי שורש ולהציע שיפורים.',
    },
  });

  try {
    const response = await chat.sendMessage({ message });
    // Extracting text output from response using the .text property
    return response.text;
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return "מצטער, חלה שגיאה בתקשורת עם שירות הבינה המלאכותית.";
  }
};
