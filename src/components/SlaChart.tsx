import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import type { DailyPoint } from "../types";
import { shortDate } from "../format";

export default function SlaChart({ daily }: { daily: DailyPoint[] }) {
  const data = daily.map((d) => ({
    date: d.date,
    compliance: d.slaCompliancePct,
    breached: d.slaBreached,
  }));
  const tick = (v: string) => shortDate(v);
  return (
    <div className="card span-8" data-testid="sla-chart">
      <h3>SLA Compliance &amp; Breaches</h3>
      <p className="hint">Daily first-response SLA compliance (%) vs. breached-ticket count. Target line at 90%.</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 6, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={tick} minTickGap={48} stroke="var(--muted)" fontSize={11} />
          <YAxis yAxisId="l" domain={[40, 100]} stroke="var(--muted)" fontSize={11} unit="%" />
          <YAxis yAxisId="r" orientation="right" stroke="var(--muted)" fontSize={11} />
          <Tooltip labelFormatter={tick} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine yAxisId="l" y={90} stroke="var(--amber)" strokeDasharray="5 4" />
          <Area
            yAxisId="r"
            type="monotone"
            dataKey="breached"
            name="Breached tickets"
            stroke="var(--red)"
            fill="rgba(248,113,113,0.18)"
          />
          <Line
            yAxisId="l"
            type="monotone"
            dataKey="compliance"
            name="SLA compliance %"
            stroke="var(--green)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
