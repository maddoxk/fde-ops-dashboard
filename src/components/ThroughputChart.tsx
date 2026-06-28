import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyPoint } from "../types";
import { shortDate } from "../format";

export default function ThroughputChart({ daily }: { daily: DailyPoint[] }) {
  const data = daily.map((d) => ({
    date: d.date,
    inflow: d.inflow,
    resolved: d.resolved,
    capacity: d.capacity,
  }));
  const tick = (v: string) => shortDate(v);
  return (
    <div className="card span-8" data-testid="throughput-chart">
      <h3>Throughput — Inflow vs. Resolved</h3>
      <p className="hint">New tickets vs. resolved per day, with team capacity overlay. Weekly seasonality is visible.</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 6, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={tick} minTickGap={48} stroke="var(--muted)" fontSize={11} />
          <YAxis stroke="var(--muted)" fontSize={11} />
          <Tooltip labelFormatter={tick} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="inflow" name="Inflow" fill="rgba(79,140,255,0.55)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="resolved" name="Resolved" fill="rgba(52,211,153,0.6)" radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="capacity" name="Capacity" stroke="var(--amber)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
