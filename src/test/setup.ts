import "@testing-library/jest-dom";

// Recharts' ResponsiveContainer uses ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// attach stub to global for jsdom
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
  globalThis.ResizeObserver || ResizeObserverStub;

// Recharts' ResponsiveContainer needs element dimensions; jsdom reports 0.
// Stub a fixed size so charts render in tests without warnings.
if (typeof window !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 300,
  });
}
