import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import KpiCards from "../components/KpiCards";
import { dataset } from "../data";

describe("Dataset integrity", () => {
  it("has the expected synthetic data shape", () => {
    expect(dataset.meta.vertical).toMatch(/Support Operations/i);
    expect(dataset.daily.length).toBeGreaterThan(150);
    expect(dataset.heatmap.length).toBe(7 * 24);
    expect(dataset.cohorts.length).toBeGreaterThan(0);
    expect(dataset.alerts.length).toBeGreaterThan(0);
  });

  it("computes SLA compliance within 0-100", () => {
    expect(dataset.kpis.slaCompliancePct).toBeGreaterThan(0);
    expect(dataset.kpis.slaCompliancePct).toBeLessThanOrEqual(100);
  });
});

describe("App", () => {
  it("renders the header and all dashboard panels", () => {
    render(<App />);
    expect(screen.getByText(/SaaS Support Ops/i)).toBeInTheDocument();
    expect(screen.getByTestId("kpi-grid")).toBeInTheDocument();
    expect(screen.getByTestId("sla-chart")).toBeInTheDocument();
    expect(screen.getByTestId("throughput-chart")).toBeInTheDocument();
    expect(screen.getByTestId("backlog-chart")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap")).toBeInTheDocument();
    expect(screen.getByTestId("cohort-table")).toBeInTheDocument();
    expect(screen.getByTestId("alerts-panel")).toBeInTheDocument();
  });
});

describe("KpiCards", () => {
  it("renders six KPI labels", () => {
    render(<KpiCards kpis={dataset.kpis} />);
    expect(screen.getByText(/SLA Compliance \(30d\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Throughput/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Alerts/i)).toBeInTheDocument();
  });
});
