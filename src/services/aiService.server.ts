import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.length < 10) {
      console.warn("GEMINI_API_KEY missing or invalid. AI features will fail.");
      throw new Error("Clé API Gemini manquante. Veuillez ajouter 'GEMINI_API_KEY' dans les Secrets (Settings) de AI Studio pour activer les fonctionnalités IA.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function processAIOperationsServer(text: string, operation: 'analyze' | 'translate' | 'caption') {
  const promptMap = {
    analyze: `Analyse le sentiment de cette citation: "${text}". Réponds par un seul mot: joyful, sad, neutral, ou inspirational.`,
    translate: `Traduis cette citation en 3 langues (English, Spanish, German) au format JSON: "${text}".`,
    caption: `Génère une légende de réseau social captivante pour cette citation: "${text}".`
  };

  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [{ role: 'user', parts: [{ text: promptMap[operation] || promptMap.analyze }] }]
  });

  return response.text || '';
}

export async function generateThemedQuoteServer(theme: string) {
  const ai = getGenAI();
  const prompt = `Génère une citation sur le thème : ${theme}. 
      Réponds AU FORMAT JSON STRICT UNIQUEMENT avec les champs: { "text": "...", "author": "...", "tags": [...], "category": "${theme}" }. Ne mets pas de balises markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json"
    }
  });
  
  try {
    const rawText = response.text || '{}';
    // Remove markdown code blocks if the model ignores the instruction
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse AI JSON:', response.text);
    return {
      text: "La persévérance est la clé du succès.",
      author: "Quoto AI",
      tags: ["motivation"],
      category: theme
    };
  }
}
