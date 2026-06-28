import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyPoint, PriorityDef } from "../types";

export default function PriorityBreakdown({
  daily,
  priorities,
}: {
  daily: DailyPoint[];
  priorities: PriorityDef[];
}) {
  const data = priorities.map((p) => {
    let met = 0;
    let breached = 0;
    for (const d of daily) {
      const b = d.byPriority[p.name];
      if (b) {
        met += b.met;
        breached += b.breached;
      }
    }
    const total = met + breached;
    return {
      priority: `${p.name} (≤${p.slaHours}h)`,
      met,
      breached,
      compliance: total ? +((100 * met) / total).toFixed(1) : 0,
    };
  });
  return (
    <div className="card span-4" data-testid="priority-breakdown">
      <h3>SLA by Priority</h3>
      <p className="hint">Met vs. breached first-response volume per priority tier. Tighter SLAs breach more under load.</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 16, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
          <XAxis type="number" stroke="var(--muted)" fontSize={11} />
          <YAxis type="category" dataKey="priority" width={78} stroke="var(--muted)" fontSize={11} />
          <Tooltip
            formatter={(v: number, n: string, p: any) =>
              n === "Met" ? [`${v} (${p.payload.compliance}% SLA)`, n] : [v, n]
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="met" name="Met" stackId="a" fill="var(--green)" radius={[3, 0, 0, 3]} />
          <Bar dataKey="breached" name="Breached" stackId="a" fill="var(--red)" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
