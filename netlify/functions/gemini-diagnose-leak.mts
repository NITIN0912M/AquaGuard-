import type { Config } from '@netlify/functions';
import { getGeminiClient, generateFallbackDiagnostic } from './utils/gemini-fallbacks.mts';

export default async (req: Request) => {
  const body = await req.json();
  const { leakType, zoneName, flowRate, durationMinutes, systemPressure } = body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return Response.json(generateFallbackDiagnostic(leakType, zoneName, flowRate, durationMinutes));
    }

    const prompt = `You are a certified master plumbing engineer & water conservation specialist for smart home and municipal water systems.
Analyze this detected leak anomaly:
- Leak Pattern: ${leakType || 'Continuous low-level night flow'}
- Affected Zone: ${zoneName || 'Bathroom Zone'}
- Sensor Flow Rate: ${flowRate || 4.2} Litres/min
- Ongoing Duration: ${durationMinutes || 35} minutes
- System Pressure: ${systemPressure || 48} PSI

Provide a structured diagnostic report with:
1. Root Cause Analysis (likely failing component e.g. toilet flapper seal, cartridge seal, pipe joint burst, hairline solder crack, PRV failure)
2. Risk Level (Low, Medium, High, Extreme Catastrophic)
3. Immediate Steps for the homeowner/facility manager
4. DIY repair possibility (true/false) and instructions
5. Water Wastage Impact (litres wasted/day & estimated monthly financial impact)
6. Recommended permanent conservation upgrade

Return ONLY valid JSON formatted as:
{
  "rootCause": "string",
  "riskLevel": "High" | "Medium" | "Low" | "Critical",
  "urgency": "string",
  "diyPossible": boolean,
  "diyDifficulty": "Easy" | "Moderate" | "Professional Plumber Required",
  "actionSteps": ["step 1", "step 2", "step 3", "step 4"],
  "estimatedDailyWastageLitres": number,
  "financialImpactMonthly": string,
  "preventionRecommendation": "string",
  "technicalExplanation": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);
    return Response.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/gemini/diagnose-leak:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to generate diagnostic report',
        fallback: generateFallbackDiagnostic(leakType, zoneName, flowRate, durationMinutes),
      },
      { status: 500 },
    );
  }
};

export const config: Config = {
  path: '/api/gemini/diagnose-leak',
  method: 'POST',
};
