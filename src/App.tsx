import { useMemo, useState } from "react";
import { dataset } from "./data";
import KpiCards from "./components/KpiCards";
import FilterBar, { type WindowOpt } from "./components/FilterBar";
import SlaChart from "./components/SlaChart";
import ThroughputChart from "./components/ThroughputChart";
import BacklogChart from "./components/BacklogChart";
import PriorityBreakdown from "./components/PriorityBreakdown";
import Heatmap from "./components/Heatmap";
import CohortTable from "./components/CohortTable";
import AlertsPanel from "./components/AlertsPanel";
import { deriveKpis } from "./derive";
import { shortDate } from "./format";

export default function App() {
  const { meta, daily, heatmap, cohorts, alerts } = dataset;
  const records = Object.values(meta.recordCounts).reduce((s, n) => s + n, 0);
  const totalAccounts = useMemo(() => cohorts.reduce((s, c) => s + c.accounts, 0), [cohorts]);

  const [windowDays, setWindowDays] = useState<WindowOpt>(180);

  // Slice the daily series to the selected window; everything downstream derives
  // from this slice so the filter is genuinely interactive (not cosmetic).
  const view = useMemo(() => {
    const windowDaily = daily.slice(Math.max(0, daily.length - windowDays));
    const start = windowDaily[0]?.date ?? meta.windowStart;
    const end = windowDaily[windowDaily.length - 1]?.date ?? meta.windowEnd;
    const windowAlerts = alerts.filter((a) => a.date >= start && a.date <= end);
    const kpis = deriveKpis(windowDaily, daily, totalAccounts, windowAlerts);
    return { windowDaily, windowAlerts, kpis, start, end };
  }, [windowDays, daily, alerts, meta.windowStart, meta.windowEnd, totalAccounts]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>SaaS Support Ops — Operational Analytics</h1>
          <div className="sub">
            <span className="pill">{meta.vertical}</span>
            {shortDate(meta.windowStart)} – {shortDate(meta.windowEnd)} · {meta.days}-day dataset
          </div>
        </div>
        <div className="meta-right">
          Synthetic enterprise dataset · seed {meta.seed}
          <br />
          {records.toLocaleString()} records · {totalAccounts} accounts
        </div>
      </header>

      <FilterBar
        window={windowDays}
        onWindow={setWindowDays}
        rangeStart={shortDate(view.start)}
        rangeEnd={shortDate(view.end)}
        points={view.windowDaily.length}
      />

      <KpiCards kpis={view.kpis} />

      <div className="grid">
        <SlaChart daily={view.windowDaily} />
        <PriorityBreakdown daily={view.windowDaily} priorities={meta.priorities} />

        <ThroughputChart daily={view.windowDaily} />
        <BacklogChart daily={view.windowDaily} />

        <Heatmap cells={heatmap} />
        <CohortTable cohorts={cohorts} />

        <AlertsPanel alerts={view.windowAlerts} />
        <div className="card span-8" data-testid="about">
          <h3>About this dashboard</h3>
          <p className="hint" style={{ lineHeight: 1.7 }}>
            A customer-facing operational analytics view for a SaaS support organization. Everything renders over a{" "}
            <strong>bundled synthetic dataset</strong> generated deterministically (seeded PRNG) by{" "}
            <code>scripts/generate-data.mjs</code> and committed to the repo for reproducible builds. The generator
            models believable patterns: weekly seasonality (weekday surge / weekend lull), per-priority SLA targets with
            load-driven breaches, a mid-period staffing crunch that grows backlog before a hiring wave recovers it, and
            customer cohorts whose onboarding ticket intensity decays with account age. The window filter above slices
            the daily series and recomputes the KPI strip, SLA, throughput, backlog, priority, and alerts views from the
            same {records.toLocaleString()} records. Built with React + Vite + TypeScript and Recharts; shipped as a
            static site and deployable at a customer via the bundled Dockerfile, docker-compose, and Terraform (S3 +
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
