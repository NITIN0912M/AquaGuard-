export type ZoneId = 'main' | 'kitchen' | 'bathroom' | 'utility' | 'garden';

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved';

export interface ZoneData {
  id: ZoneId;
  name: string;
  location: string;
  flowRate: number; // L/min
  pressure: number; // PSI
  todayUsage: number; // Litres
  targetUsage: number; // Litres
  status: 'normal' | 'abnormal' | 'critical' | 'shutoff';
  valveOpen: boolean;
  lastUpdated: string;
  sensorHealth: number; // 0 - 100%
  icon: string;
}

export interface LeakIncident {
  id: string;
  zoneId: ZoneId;
  zoneName: string;
  type: 'burst' | 'micro_leak' | 'running_toilet' | 'dripping_faucet' | 'irrigation_jam';
  title: string;
  description: string;
  severity: AlertSeverity;
  estimatedWastageRate: number; // L/hour
  totalWastedLitres: number;
  estimatedCostWasted: number; // Currency
  detectedAt: string;
  status: 'active' | 'mitigated' | 'resolved';
  autoShutoffTriggered: boolean;
  aiDiagnostic?: {
    rootCause: string;
    actionSteps: string[];
    urgency: string;
    diyPossible: boolean;
  };
}

export interface TelemetryState {
  totalFlowRate: number; // L/min
  systemPressure: number; // PSI
  todayCumulativeLiters: number;
  dailyBudgetLiters: number;
  monthlyCumulativeLiters: number;
  monthlyBudgetLiters: number;
  mainValveState: 'open' | 'closed' | 'auto_locked';
  tankLevelPercent: number;
  tankCapacityLiters: number;
  tankCurrentLiters: number;
  pumpStatus: 'off' | 'pumping' | 'standby';
  ecoScore: number; // 0 - 100
  leakDetected: boolean;
  activeLeaks: LeakIncident[];
  zones: ZoneData[];
  liveFlowHistory: { time: string; flow: number; pressure: number }[];
  hourlyUsage: { hour: string; usage: number; baseline: number }[];
  categoryBreakdown: { category: string; usage: number; percentage: number; color: string }[];
}

export interface ConservationChallenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  litersSavedGoal: number;
  currentLitersSaved: number;
  status: 'available' | 'in_progress' | 'completed';
  category: 'daily' | 'weekly' | 'lifestyle';
  icon: string;
}

export interface CommunityLeaderboardEntry {
  rank: number;
  name: string;
  type: 'Household' | 'Dorm' | 'School' | 'Apartment';
  savedLitresThisMonth: number;
  ecoScore: number;
  badge: string;
  isCurrentUser?: boolean;
}
