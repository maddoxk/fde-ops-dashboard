import type { Kpis } from "../types";
import { fmtInt, fmtPct, fmtHrs } from "../format";

function Delta({ value, goodWhenUp = true, suffix = "%" }: { value: number; goodWhenUp?: boolean; suffix?: string }) {
  if (Math.abs(value) < 0.05) return <div className="delta neutral">no change</div>;
  const up = value > 0;
  const good = up === goodWhenUp;
  const arrow = up ? "▲" : "▼";
  return (
    <div className={`delta ${good ? "up" : "down"}`}>
      {arrow} {Math.abs(value).toFixed(1)}
      {suffix} vs prior 30d
    </div>
  );
}

export default function KpiCards({ kpis }: { kpis: Kpis }) {
  const slaGood = kpis.slaCompliancePctLast30 >= 90;
  return (
    <div className="kpi-grid" data-testid="kpi-grid">
      <div className="kpi">
        <div className="label">SLA Compliance (30d)</div>
        <div className="value" style={{ color: slaGood ? "var(--green)" : "var(--amber)" }}>
          {fmtPct(kpis.slaCompliancePctLast30)}
        </div>
        <div className="delta neutral">target 90% · lifetime {fmtPct(kpis.slaCompliancePct)}</div>
      </div>

      <div className="kpi">
        <div className="label">Throughput (30d resolved)</div>
        <div className="value">{fmtInt(kpis.throughputLast30)}</div>
        <Delta value={kpis.throughputDeltaPct} goodWhenUp />
      </div>

      <div className="kpi">
        <div className="label">Open Backlog</div>
        <div className="value">{fmtInt(kpis.currentBacklog)}</div>
        <div className="delta neutral">tickets awaiting resolution</div>
      </div>

      <div className="kpi">
        <div className="label">Median First Response (30d)</div>
        <div className="value">{fmtHrs(kpis.avgFrtLast30Hrs)}</div>
        <div className="delta neutral">across all priorities</div>
      </div>

      <div className="kpi">
        <div className="label">CSAT (30d)</div>
        <div className="value">{kpis.avgCsatLast30.toFixed(2)}</div>
        <div className="delta neutral">out of 5.00</div>
      </div>

      <div className="kpi">
        <div className="label">Critical Alerts</div>
        <div className="value" style={{ color: kpis.alertsOpen > 0 ? "var(--red)" : "var(--green)" }}>
          {fmtInt(kpis.alertsOpen)}
        </div>
        <div className="delta neutral">{fmtInt(kpis.totalTickets)} tickets · {fmtInt(kpis.totalAccounts)} accounts</div>
      </div>
    </div>
  );
}
