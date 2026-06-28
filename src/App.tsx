import { dataset } from "./data";
import KpiCards from "./components/KpiCards";
import SlaChart from "./components/SlaChart";
import ThroughputChart from "./components/ThroughputChart";
import BacklogChart from "./components/BacklogChart";
import PriorityBreakdown from "./components/PriorityBreakdown";
import Heatmap from "./components/Heatmap";
import CohortTable from "./components/CohortTable";
import AlertsPanel from "./components/AlertsPanel";
import { shortDate } from "./format";

export default function App() {
  const { meta, kpis, daily, heatmap, cohorts, alerts } = dataset;
  const records = Object.values(meta.recordCounts).reduce((s, n) => s + n, 0);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>SaaS Support Ops — Operational Analytics</h1>
          <div className="sub">
            <span className="pill">{meta.vertical}</span>
            {shortDate(meta.windowStart)} – {shortDate(meta.windowEnd)} · {meta.days}-day window
          </div>
        </div>
        <div className="meta-right">
          Synthetic enterprise dataset · seed {meta.seed}
          <br />
          {records.toLocaleString()} records · {kpis.totalTickets.toLocaleString()} tickets · {kpis.totalAccounts} accounts
        </div>
      </header>

      <KpiCards kpis={kpis} />

      <div className="grid">
        <SlaChart daily={daily} />
        <PriorityBreakdown daily={daily} priorities={meta.priorities} />

        <ThroughputChart daily={daily} />
        <BacklogChart daily={daily} />

        <Heatmap cells={heatmap} />
        <CohortTable cohorts={cohorts} />

        <AlertsPanel alerts={alerts} />
        <div className="card span-8" data-testid="about">
          <h3>About this dashboard</h3>
          <p className="hint" style={{ lineHeight: 1.7 }}>
            A customer-facing operational analytics view for a SaaS support organization. Everything renders over a{" "}
            <strong>bundled synthetic dataset</strong> generated deterministically (seeded PRNG) by{" "}
            <code>scripts/generate-data.mjs</code> and committed to the repo for reproducible builds. The generator
            models believable patterns: weekly seasonality (weekday surge / weekend lull), per-priority SLA targets with
            load-driven breaches, a mid-period staffing crunch that grows backlog before a hiring wave recovers it, and
            customer cohorts whose onboarding ticket intensity decays with account age. KPIs, charts, the day×hour
            heatmap, the cohort matrix, and threshold-based alerts are all derived from the same{" "}
            {records.toLocaleString()} records. Built with React + Vite + TypeScript and Recharts; shipped as a static
            site and deployable at a customer via the bundled Dockerfile, docker-compose, and Terraform (S3 +
            CloudFront) stub.
          </p>
        </div>
      </div>

      <footer className="foot">
        FDE Ops Dashboard ·{" "}
        <a href="https://github.com/maddoxk/fde-ops-dashboard" target="_blank" rel="noreferrer">
          github.com/maddoxk/fde-ops-dashboard
        </a>{" "}
        · synthetic data, no real customers
      </footer>
    </div>
  );
}
