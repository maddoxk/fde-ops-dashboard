import type { HeatmapCell } from "../types";
import { heatColor } from "../format";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

export default function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(...cells.map((c) => c.value), 1);
  const byKey = new Map<string, number>();
  for (const c of cells) byKey.set(`${c.day}-${c.hour}`, c.value);

  return (
    <div className="card span-8" data-testid="heatmap">
      <h3>Ticket Volume Heatmap — Day × Hour</h3>
      <p className="hint">Inbound volume by weekday and hour of day (UTC). Business-hour peaks and the weekend lull stand out.</p>
      <div className="heatmap">
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={`h${h}`} className="hhour">
            {h % 3 === 0 ? h : ""}
          </div>
        ))}
        {ORDER.map((d, ri) => (
          <Row key={d} label={DAYS[ri]} day={d} byKey={byKey} max={max} />
        ))}
      </div>
      <div className="heat-legend">
        <span>low</span>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <span key={t} className="swatch" style={{ background: heatColor(t) }} />
        ))}
        <span>high (max {max} tickets/hr)</span>
      </div>
    </div>
  );
}

function Row({
  label,
  day,
  byKey,
  max,
}: {
  label: string;
  day: number;
  byKey: Map<string, number>;
  max: number;
}) {
  return (
    <>
      <div className="hlabel">{label}</div>
      {Array.from({ length: 24 }, (_, h) => {
        const v = byKey.get(`${day}-${h}`) ?? 0;
        return (
          <div
            key={`${day}-${h}`}
            className="hcell"
            title={`${label} ${h}:00 — ${v} tickets`}
            style={{ background: heatColor(v / max) }}
          />
        );
      })}
    </>
  );
}
