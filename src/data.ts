import raw from "./data/dataset.json";
import type { Dataset } from "./types";

// The dataset is generated at build/gen time by scripts/generate-data.mjs and
// committed to the repo so the build is fully reproducible.
export const dataset = raw as unknown as Dataset;
