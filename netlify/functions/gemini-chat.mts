import type { Config } from '@netlify/functions';
import { getGeminiClient } from './utils/gemini-fallbacks.mts';

export default async (req: Request) => {
  try {
    const { message, context } = await req.json();
    const ai = getGeminiClient();

    if (!ai) {
      return Response.json({
        reply: `Here are expert recommendations for water conservation:\n\n• For leak prevention: Inspect toilet flapper valves every 6 months using food coloring in the cistern. If color seeps into the bowl within 15 minutes, the seal needs replacement, saving up to 300L/day.\n• For fixture efficiency: Aerators on kitchen and bathroom taps can reduce flow from 9L/min to 4.5L/min without pressure loss.\n• For garden irrigation: Water early morning (before 7 AM) or install drip emitters to eliminate 40% evaporation losses.`,
      });
    }

    const systemInstruction = `You are "HydroSense AI", an expert water conservation engineer and leak diagnostic specialist.
Answer user questions regarding water telemetry, acoustic leak detection, greywater recycling, rainwater harvesting, smart water meters, pipe burst prevention, and municipal conservation standards.
Keep your answers practical, clear, encouraging, and focused on sustainable water management.
Current telemetry context: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return Response.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return Response.json({ error: error.message || 'Chat error' }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/gemini/chat',
  method: 'POST',
};
