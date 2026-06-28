import type { Alert } from "../types";
import { shortDate } from "../format";

const TYPE_LABEL: Record<string, string> = {
  SLA_COMPLIANCE: "SLA Compliance",
  BACKLOG_GROWTH: "Backlog Growth",
  SLOW_FIRST_RESPONSE: "Slow First Response",
};

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const shown = alerts.slice(0, 40);
  return (
    <div className="card span-4" data-testid="alerts-panel">
      <h3>
        Alerts{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>
          {alerts.length} total · {critical} critical
        </span>
      </h3>
      <p className="hint">Threshold-based operational alerts, most recent first.</p>
      <div className="alerts">
        {shown.map((a) => (
          <div key={a.id} className={`alert ${a.severity}`}>
            <div className="dot" />
            <div className="body">
              {a.message}
              <div className="meta">
                {shortDate(a.date)} · {TYPE_LABEL[a.type] ?? a.type} · {a.id}
              </div>
            </div>
            <div className="sev">{a.severity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
