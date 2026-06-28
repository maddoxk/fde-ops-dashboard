import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { DailyPoint } from "../types";
import { shortDate } from "../format";

export default function BacklogChart({ daily }: { daily: DailyPoint[] }) {
  const data = daily.map((d) => ({ date: d.date, backlog: d.backlog }));
  const tick = (v: string) => shortDate(v);
  return (
    <div className="card span-4" data-testid="backlog-chart">
      <h3>Backlog Over Time</h3>
      <p className="hint">Open-ticket backlog. The mid-period staffing crunch drives growth; a hiring wave recovers it.</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 6, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={tick} minTickGap={48} stroke="var(--muted)" fontSize={11} />
          <YAxis stroke="var(--muted)" fontSize={11} />
          <Tooltip labelFormatter={tick} />
          <ReferenceLine y={400} stroke="var(--amber)" strokeDasharray="5 4" label={{ value: "alert 400", fill: "var(--amber)", fontSize: 10, position: "insideTopRight" }} />
          <Area type="monotone" dataKey="backlog" name="Backlog" stroke="var(--accent)" strokeWidth={2} fill="url(#bgrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
