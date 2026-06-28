export interface PriorityBucket {
  count: number;
  met: number;
  breached: number;
}

export interface DailyPoint {
  date: string;
  dow: number;
  weekday: boolean;
  inflow: number;
  resolved: number;
  backlog: number;
  capacity: number;
  slaMet: number;
  slaBreached: number;
  slaCompliancePct: number;
  frtMedianHrs: number;
  resolutionMedianHrs: number;
  csat: number;
  byPriority: Record<string, PriorityBucket>;
}

export interface HeatmapCell {
  day: number;
  dayName: string;
  hour: number;
  value: number;
}

export interface CohortMonth {
  age: number;
  ticketsPerAccount: number;
}

export interface Cohort {
  cohort: string;
  accounts: number;
  months: CohortMonth[];
}

export interface Ticket {
  id: string;
  date: string;
  priority: string;
  channel: string;
  team: string;
  region: string;
  cohort: string;
  subject: string;
  slaTargetHrs: number;
  firstResponseHrs: number;
  slaBreached: boolean;
  status: string;
  csat: number | null;
}

export interface Alert {
  id: string;
  date: string;
  severity: "critical" | "warning";
  type: string;
  message: string;
  value: number;
  threshold: number;
}

export interface Kpis {
  windowDays: number;
  totalTickets: number;
  totalResolved: number;
  currentBacklog: number;
  slaCompliancePct: number;
  slaCompliancePctLast30: number;
  avgCsatLast30: number;
  avgFrtLast30Hrs: number;
  throughputLast30: number;
  throughputDeltaPct: number;
  totalAccounts: number;
  alertsOpen: number;
}

export interface PriorityDef {
  name: string;
  share: number;
  slaHours: number;
}

export interface Dataset {
  meta: {
    vertical: string;
    generatedAt: string;
    seed: number;
    windowStart: string;
    windowEnd: string;
    days: number;
    priorities: PriorityDef[];
    channels: string[];
    teams: string[];
    regions: string[];
    recordCounts: Record<string, number>;
  };
  kpis: Kpis;
  daily: DailyPoint[];
  heatmap: HeatmapCell[];
  cohorts: Cohort[];
  tickets: Ticket[];
  alerts: Alert[];
}
