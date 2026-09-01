import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = Netlify.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function generateFallbackDiagnostic(leakType: string, zoneName: string, flowRate: number, duration: number) {
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

export function generateFallbackAudit(householdSize = 4, dailyUsage = 420, budget = 320, topZone = 'Bathrooms') {
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
