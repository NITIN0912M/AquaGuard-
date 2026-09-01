import type { Config } from '@netlify/functions';
import { getGeminiClient, generateFallbackAudit } from './utils/gemini-fallbacks.mts';

export default async (req: Request) => {
  const body = await req.json();
  const { householdSize, propertyType, dailyUsageLiters, topConsumerZone, budgetLiters } = body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return Response.json(generateFallbackAudit(householdSize, dailyUsageLiters, budgetLiters, topConsumerZone));
    }

    const prompt = `You are an environmental water efficiency expert conducting an automated smart water audit.
Household Profile:
- Property Type: ${propertyType || 'Residential 3-Bedroom Home'}
- Occupants: ${householdSize || 4} persons
- Current Daily Usage: ${dailyUsageLiters || 420} Litres
- Daily Target Budget: ${budgetLiters || 320} Litres
- Highest Consuming Zone: ${topConsumerZone || 'Bathrooms (Showers & Toilets)'}

Generate a comprehensive, actionable Water Conservation & Efficiency Audit with 4 tailored reduction strategies, potential monthly liters saved, cost savings, and smart fixture recommendations.

Return ONLY valid JSON matching this schema:
{
  "efficiencyScore": number (0-100),
  "currentStatus": "string (e.g. 28% Above Benchmark)",
  "benchmarkComparison": "string",
  "potentialMonthlySavingsLitres": number,
  "potentialAnnualCostSavings": string,
  "carbonFootprintOffsetKg": number,
  "actionPlan": [
    {
      "title": "string",
      "impact": "High" | "Medium" | "Low",
      "litersSavedPerDay": number,
      "paybackPeriod": "string",
      "difficulty": "Easy" | "Moderate" | "Hardware Upgrade",
      "description": "string"
    }
  ],
  "smartRecommendation": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return Response.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/water-audit:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        fallback: generateFallbackAudit(householdSize, dailyUsageLiters, budgetLiters, topConsumerZone),
      },
      { status: 500 },
    );
  }
};

export const config: Config = {
  path: '/api/gemini/water-audit',
  method: 'POST',
};
