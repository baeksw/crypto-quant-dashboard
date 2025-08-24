
import { GoogleGenAI } from "@google/genai";
import type { Signal } from '../types';

// IMPORTANT: This key is managed externally and must not be configured in the UI.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeSignalsWithGemini = async (signals: Signal[]): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key is not configured. Analysis is unavailable.";
  }
  
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are a senior quantitative analyst for a crypto trading desk.
    Analyze the following active trading signals and provide a brief, insightful market summary.
    Focus on potential opportunities and risks. Keep the summary concise (2-3 paragraphs).

    Active Signals:
    ${signals.map(s => `- ${s.symbol} (${s.timeframe}): ${s.rule} (RSI: ${s.details.rsi}, VWAP Gap: ${s.details.vwap_gap_percent}%)`).join('\n')}

    Your analysis:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate analysis from Gemini API.");
  }
};
