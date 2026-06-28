export const nf = new Intl.NumberFormat("en-US");

export function fmtInt(n: number): string {
  return nf.format(Math.round(n));
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function fmtHrs(n: number): string {
  return `${n.toFixed(1)}h`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// blue->green color scale for heatmap given normalized t in [0,1]
export function heatColor(t: number): string {
  const stops = [
    [20, 30, 60],
    [37, 84, 150],
    [56, 142, 200],
    [52, 211, 153],
    [250, 215, 90],
  ];
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
