#!/usr/bin/env node
/**
 * Synthetic dataset generator for the FDE Ops Dashboard.
 *
 * Vertical: SaaS Customer Support Operations.
 *
 * Produces a believable enterprise support-ops dataset with:
 *  - weekly seasonality (weekday surge, weekend lull)
 *  - SLA targets per priority, with realistic breach patterns that worsen
 *    when daily inflow exceeds agent capacity
 *  - backlog that accumulates over time during a staffing crunch then recovers
 *  - customer cohorts (by signup month) with differing ticket intensity
 *  - alert events derived from threshold breaches
 *
 * Deterministic: uses a seeded PRNG so the committed JSON is reproducible.
 *
 * Output: ../src/data/dataset.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Seeded PRNG (mulberry32) ----------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260626);
const randn = () => {
  // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ---- Config ----------------------------------------------------------------
const DAYS = 180; // ~6 months of daily history
const END = new Date("2026-06-25T00:00:00Z");
const START = new Date(END.getTime() - (DAYS - 1) * 86400000);

const PRIORITIES = [
  // name, share of volume, SLA first-response target (hours)
  { name: "P1", share: 0.08, slaHours: 1 },
  { name: "P2", share: 0.22, slaHours: 4 },
  { name: "P3", share: 0.45, slaHours: 24 },
  { name: "P4", share: 0.25, slaHours: 72 },
];

const CHANNELS = ["Email", "Chat", "Phone", "Portal", "API"];
const TEAMS = ["Billing", "Onboarding", "Platform", "Integrations", "Security"];
const REGIONS = ["NA", "EMEA", "APAC", "LATAM"];

// Customer cohorts by signup month (older cohorts churn-aware, larger base)
const COHORTS = [];
for (let m = 0; m < 12; m++) {
  const d = new Date("2025-07-01T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + m);
  const label = d.toISOString().slice(0, 7);
  COHORTS.push({
    label,
    // newer cohorts are bigger (growing company) but file more tickets (onboarding pain)
    accounts: Math.round(40 + m * 6 + randn() * 5),
    intensity: clamp(1.6 - m * 0.08 + randn() * 0.1, 0.4, 1.8), // tickets/account/month factor
  });
}

const ymd = (date) => date.toISOString().slice(0, 10);

// Agent capacity: a staffing crunch mid-period drives backlog growth then a hire wave recovers it.
function agentCapacityForDay(i) {
  // base capacity in tickets/day the team can resolve
  let base = 230;
  const t = i / DAYS;
  // dip between day 55 and day 110 (attrition), recovery after hiring at ~day 120
  if (i >= 55 && i < 110) base -= 70 * Math.sin(((i - 55) / 55) * Math.PI);
  if (i >= 120) base += 60 * clamp((i - 120) / 40, 0, 1);
  return Math.max(120, Math.round(base + randn() * 8));
}

// ---- Generate daily series -------------------------------------------------
const daily = [];
let backlog = 80; // open tickets carried over at start

for (let i = 0; i < DAYS; i++) {
  const date = new Date(START.getTime() + i * 86400000);
  const dow = date.getUTCDay(); // 0 Sun .. 6 Sat

  // weekly seasonality: weekdays heavy, weekends light
  const weekday = dow >= 1 && dow <= 5;
  const seasonal = weekday ? 1.0 : 0.45;
  // slow growth in volume over the period (company growing)
  const growth = 1 + 0.0018 * i;
  // occasional incident spike
  const spike = rand() < 0.04 ? 1.6 + rand() * 0.8 : 1.0;

  const baseInflow = 200 * seasonal * growth * spike;
  const inflow = Math.max(20, Math.round(baseInflow + randn() * 18));

  const capacity = agentCapacityForDay(i);
  // resolved is limited by capacity AND available work (backlog + inflow)
  const available = backlog + inflow;
  const resolved = Math.min(available, Math.round(capacity * (weekday ? 1 : 0.5)));

  const newBacklog = Math.max(0, backlog + inflow - resolved);

  // SLA: breach probability rises as load (inflow/capacity) exceeds 1
  const load = inflow / Math.max(1, capacity);
  // per-priority breakdown
  const byPriority = {};
  let breached = 0;
  let met = 0;
  for (const p of PRIORITIES) {
    const pCount = Math.round(inflow * p.share);
    // tighter SLAs breach more under load; P1 most sensitive
    const tightness = { P1: 0.9, P2: 0.6, P3: 0.35, P4: 0.18 }[p.name];
    let breachProb = clamp((load - 0.85) * tightness + 0.04, 0.01, 0.8);
    const pBreached = Math.round(
      pCount * clamp(breachProb + randn() * 0.03, 0, 0.9)
    );
    const pMet = Math.max(0, pCount - pBreached);
    byPriority[p.name] = { count: pCount, met: pMet, breached: pBreached };
    breached += pBreached;
    met += pMet;
  }

  // first response & resolution times (hours), worse under load
  const frtMedian = clamp(2.5 + (load - 0.9) * 6 + randn() * 0.4, 0.5, 14);
  const resolutionMedian = clamp(18 + (load - 0.9) * 22 + randn() * 2, 6, 72);
  const csat = clamp(4.6 - (load - 0.9) * 1.1 + randn() * 0.08, 2.8, 5.0);

  daily.push({
    date: ymd(date),
    dow,
    weekday,
    inflow,
    resolved,
    backlog: newBacklog,
    capacity,
    slaMet: met,
    slaBreached: breached,
    slaCompliancePct: +(100 * met / Math.max(1, met + breached)).toFixed(1),
    frtMedianHrs: +frtMedian.toFixed(2),
    resolutionMedianHrs: +resolutionMedian.toFixed(1),
    csat: +csat.toFixed(2),
    byPriority,
  });

  backlog = newBacklog;
}

// ---- Heatmap: ticket volume by day-of-week x hour-of-day -------------------
// Believable intraday pattern (business hours) modulated by weekday strength.
const heatmap = [];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
for (let d = 0; d < 7; d++) {
  const weekdayFactor = d >= 1 && d <= 5 ? 1.0 : 0.4;
  for (let h = 0; h < 24; h++) {
    // gaussian-ish around 10am and 2pm business peaks
    const peak =
      Math.exp(-Math.pow(h - 10, 2) / 10) + 0.8 * Math.exp(-Math.pow(h - 14, 2) / 12);
    const v = Math.round((6 + peak * 60) * weekdayFactor * (0.9 + rand() * 0.2));
    heatmap.push({ day: d, dayName: dayNames[d], hour: h, value: v });
  }
}

// ---- Cohort retention/ticket matrix ----------------------------------------
// For each signup cohort, tickets-per-account over the following months (decay).
const cohortMatrix = COHORTS.map((c, idx) => {
  const months = [];
  const maxAge = 12 - idx; // older cohorts have more observed months
  for (let age = 0; age < Math.min(maxAge, 7); age++) {
    // onboarding spike in month 0-1, then decay toward steady-state
    const base = c.intensity * (age === 0 ? 1.5 : age === 1 ? 1.1 : 0.7);
    const decay = Math.exp(-age * 0.18);
    months.push({
      age,
      ticketsPerAccount: +clamp(base * decay + randn() * 0.05, 0.05, 3).toFixed(2),
    });
  }
  return { cohort: c.label, accounts: c.accounts, months };
});

// ---- Individual ticket records (sample, for tables / drill-down) -----------
const SUBJECTS = [
  "Login failure after SSO update",
  "Invoice discrepancy on latest charge",
  "Webhook retries flooding endpoint",
  "Data export stuck in pending",
  "Rate limit hit on bulk import",
  "Onboarding wizard blank screen",
  "Permission denied for admin role",
  "Latency spike on dashboard load",
  "API key rotation broke integration",
  "Two-factor reset request",
];
const tickets = [];
let ticketId = 100000;
const breachedDays = daily.filter((d) => d.slaBreached > 0);
for (let n = 0; n < 600; n++) {
  const day = pick(daily);
  const prio = pick(PRIORITIES);
  const slaTarget = prio.slaHours;
  const frt = clamp(day.frtMedianHrs * (0.4 + rand() * 1.6), 0.1, 96);
  const breachedFlag = frt > slaTarget;
  const cohort = pick(COHORTS);
  tickets.push({
    id: `TKT-${ticketId++}`,
    date: day.date,
    priority: prio.name,
    channel: pick(CHANNELS),
    team: pick(TEAMS),
    region: pick(REGIONS),
    cohort: cohort.label,
    subject: pick(SUBJECTS),
    slaTargetHrs: slaTarget,
    firstResponseHrs: +frt.toFixed(2),
    slaBreached: breachedFlag,
    status: rand() < 0.82 ? "Resolved" : "Open",
    csat: rand() < 0.7 ? +clamp(day.csat + randn() * 0.3, 1, 5).toFixed(1) : null,
  });
}

// ---- Alerts: derived from threshold breaches -------------------------------
const alerts = [];
let alertId = 5000;
for (const d of daily) {
  if (d.slaCompliancePct < 80) {
    alerts.push({
      id: `ALRT-${alertId++}`,
      date: d.date,
      severity: d.slaCompliancePct < 65 ? "critical" : "warning",
      type: "SLA_COMPLIANCE",
      message: `SLA compliance dropped to ${d.slaCompliancePct}% (target 90%)`,
      value: d.slaCompliancePct,
      threshold: 90,
    });
  }
  if (d.backlog > 400) {
    alerts.push({
      id: `ALRT-${alertId++}`,
      date: d.date,
      severity: d.backlog > 600 ? "critical" : "warning",
      type: "BACKLOG_GROWTH",
      message: `Open backlog reached ${d.backlog} tickets (threshold 400)`,
      value: d.backlog,
      threshold: 400,
    });
  }
  if (d.frtMedianHrs > 6) {
    alerts.push({
      id: `ALRT-${alertId++}`,
      date: d.date,
      severity: d.frtMedianHrs > 9 ? "critical" : "warning",
      type: "SLOW_FIRST_RESPONSE",
      message: `Median first response time ${d.frtMedianHrs}h (threshold 6h)`,
      value: d.frtMedianHrs,
      threshold: 6,
    });
  }
}
// most recent first
alerts.sort((a, b) => (a.date < b.date ? 1 : -1));

// ---- Headline KPIs (whole period) ------------------------------------------
const totalInflow = daily.reduce((s, d) => s + d.inflow, 0);
const totalResolved = daily.reduce((s, d) => s + d.resolved, 0);
const totalMet = daily.reduce((s, d) => s + d.slaMet, 0);
const totalBreached = daily.reduce((s, d) => s + d.slaBreached, 0);
const last30 = daily.slice(-30);
const prev30 = daily.slice(-60, -30);
const avg = (arr, k) => arr.reduce((s, d) => s + d[k], 0) / arr.length;

const kpis = {
  windowDays: DAYS,
  totalTickets: totalInflow,
  totalResolved,
  currentBacklog: daily[daily.length - 1].backlog,
  slaCompliancePct: +(100 * totalMet / (totalMet + totalBreached)).toFixed(1),
  slaCompliancePctLast30: +(
    100 *
    last30.reduce((s, d) => s + d.slaMet, 0) /
    last30.reduce((s, d) => s + d.slaMet + d.slaBreached, 0)
  ).toFixed(1),
  avgCsatLast30: +avg(last30, "csat").toFixed(2),
  avgFrtLast30Hrs: +avg(last30, "frtMedianHrs").toFixed(2),
  throughputLast30: last30.reduce((s, d) => s + d.resolved, 0),
  throughputDeltaPct: +(
    100 *
    (last30.reduce((s, d) => s + d.resolved, 0) /
      prev30.reduce((s, d) => s + d.resolved, 0) -
      1)
  ).toFixed(1),
  totalAccounts: COHORTS.reduce((s, c) => s + c.accounts, 0),
  alertsOpen: alerts.filter((a) => a.severity === "critical").length,
};

const dataset = {
  meta: {
    vertical: "SaaS Customer Support Operations",
    generatedAt: new Date().toISOString(),
    seed: 20260626,
    windowStart: ymd(START),
    windowEnd: ymd(END),
    days: DAYS,
    priorities: PRIORITIES,
    channels: CHANNELS,
    teams: TEAMS,
    regions: REGIONS,
    recordCounts: {
      dailyPoints: daily.length,
      heatmapCells: heatmap.length,
      cohorts: cohortMatrix.length,
      sampleTickets: tickets.length,
      alerts: alerts.length,
    },
  },
  kpis,
  daily,
  heatmap,
  cohorts: cohortMatrix,
  tickets,
  alerts,
};

const outDir = resolve(__dirname, "..", "src", "data");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, "dataset.json");
writeFileSync(outFile, JSON.stringify(dataset, null, 2));

const totalRecords =
  daily.length + heatmap.length + cohortMatrix.length + tickets.length + alerts.length;
console.log(`Wrote ${outFile}`);
console.log(
  `Records: ${daily.length} daily, ${heatmap.length} heatmap, ${cohortMatrix.length} cohorts, ${tickets.length} tickets, ${alerts.length} alerts (total ${totalRecords})`
);
console.log(`Headline: ${kpis.totalTickets} tickets, SLA ${kpis.slaCompliancePct}%, backlog ${kpis.currentBacklog}`);
