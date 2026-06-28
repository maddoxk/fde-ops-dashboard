export type WindowOpt = 30 | 90 | 180;

const OPTIONS: { value: WindowOpt; label: string }[] = [
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: 180, label: "All" },
];

export default function FilterBar({
  window,
  onWindow,
  rangeStart,
  rangeEnd,
  points,
}: {
  window: WindowOpt;
  onWindow: (w: WindowOpt) => void;
  rangeStart: string;
  rangeEnd: string;
  points: number;
}) {
  return (
    <div className="filterbar" data-testid="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Window</span>
        <div className="seg" role="group" aria-label="Time window">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`seg-btn ${window === o.value ? "active" : ""}`}
              aria-pressed={window === o.value}
              onClick={() => onWindow(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-meta">
        {rangeStart} → {rangeEnd} · {points} day{points === 1 ? "" : "s"} · KPIs &amp; charts
        recompute live
      </div>
    </div>
  );
}
