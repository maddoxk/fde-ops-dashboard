import type { DailyPoint, Kpis, Alert } from "./types";

/**
 * Recompute the headline KPIs from an arbitrary slice of the daily series so the
 * KPI strip stays consistent with whatever window the user has selected in the
 * filter bar. `totalAccounts` is a dataset-level constant passed through.
 */
export function deriveKpis(
  windowDaily: DailyPoint[],
  fullDaily: DailyPoint[],
  totalAccounts: number,
  alertsInWindow: Alert[]
): Kpis {
  const sum = (arr: DailyPoint[], k: keyof DailyPoint) =>
    arr.reduce((s, d) => s + (d[k] as number), 0);
  const avg = (arr: DailyPoint[], k: keyof DailyPoint) =>
    arr.length ? sum(arr, k) / arr.length : 0;

  // "last 30" and "prior 30" relative to the selected window (clamped).
  const n = windowDaily.length;
  const lastN = Math.min(30, n);
  const last = windowDaily.slice(n - lastN);
  const prev = windowDaily.slice(Math.max(0, n - 2 * lastN), n - lastN);

  const lastMet = sum(last, "slaMet");
  const lastBreached = sum(last, "slaBreached");
  const lastThroughput = sum(last, "resolved");
  const prevThroughput = sum(prev, "resolved");

  // lifetime compliance always reflects the full dataset for a stable reference.
  const lifeMet = sum(fullDaily, "slaMet");
  const lifeBreached = sum(fullDaily, "slaBreached");

  return {
    windowDays: n,
    totalTickets: sum(windowDaily, "inflow"),
    totalResolved: sum(windowDaily, "resolved"),
    currentBacklog: windowDaily.length ? windowDaily[windowDaily.length - 1].backlog : 0,
    slaCompliancePct: +(100 * lifeMet / Math.max(1, lifeMet + lifeBreached)).toFixed(1),
    slaCompliancePctLast30: +(100 * lastMet / Math.max(1, lastMet + lastBreached)).toFixed(1),
    avgCsatLast30: +avg(last, "csat").toFixed(2),
    avgFrtLast30Hrs: +avg(last, "frtMedianHrs").toFixed(2),
    throughputLast30: lastThroughput,
    throughputDeltaPct: prevThroughput
      ? +(100 * (lastThroughput / prevThroughput - 1)).toFixed(1)
      : 0,
    totalAccounts,
    alertsOpen: alertsInWindow.filter((a) => a.severity === "critical").length,
  };
}
