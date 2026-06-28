import type { Cohort } from "../types";
import { heatColor } from "../format";

export default function CohortTable({ cohorts }: { cohorts: Cohort[] }) {
  const maxAge = Math.max(...cohorts.map((c) => c.months.length));
  let max = 0;
  for (const c of cohorts) for (const m of c.months) max = Math.max(max, m.ticketsPerAccount);

  return (
    <div className="card span-4" data-testid="cohort-table">
      <h3>Cohort Support Intensity</h3>
      <p className="hint">Tickets per account by signup cohort (rows) across account age in months (cols). Onboarding spikes, then decays.</p>
      <table className="cohort">
        <thead>
          <tr>
            <th className="label">Cohort</th>
            {Array.from({ length: maxAge }, (_, i) => (
              <th key={i}>M{i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.cohort}>
              <td className="label">
                {c.cohort}
                <span style={{ color: "var(--muted)", marginLeft: 6 }}>({c.accounts})</span>
              </td>
              {Array.from({ length: maxAge }, (_, i) => {
                const m = c.months[i];
                if (!m) return <td key={i} />;
                const t = m.ticketsPerAccount / max;
                return (
                  <td key={i}>
                    <div
                      className="cohort-cell"
                      style={{
                        background: heatColor(t),
                        color: t > 0.55 ? "#0b1020" : "var(--text)",
                      }}
                      title={`${c.cohort} · month ${i}: ${m.ticketsPerAccount} tickets/account`}
                    >
                      {m.ticketsPerAccount.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
