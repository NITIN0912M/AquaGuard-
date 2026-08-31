import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory simulation state for real-time telemetry
let telemetryState = {
  mainValveState: 'open' as 'open' | 'closed' | 'auto_locked',
  activeSimulation: null as string | null,
  simulatedWastageAccumulator: 0,
};

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Valve control endpoint
app.post('/api/valve/toggle', (req: Request, res: Response) => {
  const { action, zoneId } = req.body;
  if (action === 'close' || action === 'open' || action === 'auto_locked') {
    telemetryState.mainValveState = action;
  }
  res.json({
    success: true,
    mainValveState: telemetryState.mainValveState,
    zoneId: zoneId || 'all',
    timestamp: new Date().toISOString(),
  });
});

// AI Leak Root Cause Diagnostic Endpoint
app.post('/api/gemini/diagnose-leak', async (req: Request, res: Response) => {
  try {
    const { leakType, zoneName, flowRate, durationMinutes, systemPressure } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // High-quality fallback rule-based response when API key is not yet configured
      const fallbackAnalysis = generateFallbackDiagnostic(leakType, zoneName, flowRate, durationMinutes);
      return res.json(fallbackAnalysis);
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
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/gemini/diagnose-leak:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate diagnostic report',
      fallback: generateFallbackDiagnostic(req.body.leakType, req.body.zoneName, req.body.flowRate, req.body.durationMinutes),
    });
  }
});

// AI Water Conservation Audit & Roadmap Endpoint
app.post('/api/gemini/water-audit', async (req: Request, res: Response) => {
  try {
    const { householdSize, propertyType, dailyUsageLiters, topConsumerZone, budgetLiters } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateFallbackAudit(householdSize, dailyUsageLiters, budgetLiters, topConsumerZone));
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
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/water-audit:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: generateFallbackAudit(req.body.householdSize, req.body.dailyUsageLiters, req.body.budgetLiters, req.body.topConsumerZone),
    });
  }
});

// AI Water Assistant Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
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

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({ error: error.message || 'Chat error' });
  }
});

// Helper Fallback Diagnostics
function generateFallbackDiagnostic(leakType: string, zoneName: string, flowRate: number, duration: number) {
  return {
    success: true,
    data: {
      rootCause: leakType === 'running_toilet' 
        ? 'Worn-out flapper seal or misaligned fill valve inside toilet tank causing constant overflow into bowl.'
        : leakType === 'burst'
        ? 'High-pressure pipe rupture or catastrophic fitting separation on supply line.'
        : 'Continuous baseline micro-drip from worn faucet cartridge or faulty appliance solenoid valve.',
      riskLevel: leakType === 'burst' ? 'Critical' : leakType === 'running_toilet' ? 'Medium' : 'Low',
      urgency: leakType === 'burst' ? 'Immediate Valve Shutoff Required' : 'Repair within 24-48 hours',
      diyPossible: leakType !== 'burst',
      diyDifficulty: leakType === 'running_toilet' ? 'Easy' : 'Moderate',
      actionSteps: [
        'Isolate the local angle-stop valve underneath the fixture or turn off main HydroSense smart valve.',
        'Perform food coloring test (for toilet) or inspect braided stainless steel supply lines for moisture.',
        'Replace defective flapper gasket ($5-$10 hardware part) or re-tighten compression fittings.',
        'Verify zero flow on HydroSense telemetry meter after replacement.',
      ],
      estimatedDailyWastageLitres: Math.round((flowRate || 3.5) * 60 * 24),
      financialImpactMonthly: '$42 - $115 wasted on water utility bills',
      preventionRecommendation: 'Enable automated smart flow shutoff rule for continuous flow exceeding 25 minutes without user activity.',
      technicalExplanation: 'The acoustic pressure and volumetric flow meter registered an unbroken flat-line baseline during expected zero-demand hours.',
    },
  };
}

function generateFallbackAudit(householdSize = 4, dailyUsage = 420, budget = 320, topZone = 'Bathrooms') {
  return {
    success: true,
    data: {
      efficiencyScore: 74,
      currentStatus: '18% Higher than Regional Water Benchmark',
      benchmarkComparison: `Similar ${householdSize}-person homes consume ~310 L/day. Current rate is ${dailyUsage} L/day.`,
      potentialMonthlySavingsLitres: 4800,
      potentialAnnualCostSavings: '$280 - $450/year',
      carbonFootprintOffsetKg: 85,
      actionPlan: [
        {
          title: 'Install High-Efficiency 1.5 GPM Shower Aerators',
          impact: 'High',
          litersSavedPerDay: 45,
          paybackPeriod: '< 2 months',
          difficulty: 'Easy',
          description: 'Standard showerheads consume 9.5-12 L/min. Upgrading to pulse-aerated heads cuts consumption by 40% with no loss in water comfort.',
        },
        {
          title: 'Implement Smart Irrigation Moisture Sensing',
          impact: 'High',
          litersSavedPerDay: 70,
          paybackPeriod: '4 months',
          difficulty: 'Moderate',
          description: 'Sync garden watering with local precipitation telemetry and switch to drip irrigation in garden flowerbeds.',
        },
        {
          title: 'Cold-Wash Full-Load Laundry Strategy',
          impact: 'Medium',
          litersSavedPerDay: 25,
          paybackPeriod: 'Immediate',
          difficulty: 'Easy',
          description: 'Run washing machine on Eco mode with full loads to maximize liters-per-garment efficiency.',
        },
        {
          title: 'Dual-Flush Cistern Converter Gasket',
          impact: 'Medium',
          litersSavedPerDay: 20,
          paybackPeriod: '1 month',
          difficulty: 'Easy',
          description: 'Convert standard single-flush toilets to dual-action 3L/6L mechanisms.',
        },
      ],
      smartRecommendation: 'Activate HydroSense Vacation Guard mode which auto-closes main intake if uncharacteristic 0.5 L/min flow occurs between 2:00 AM - 5:00 AM.',
    },
  };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HydroSense Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
