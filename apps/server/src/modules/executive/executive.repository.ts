import type { ExecutiveSummary } from "./executive.types.js";

export interface ExecutiveSummaryRepository {
  getSummary(now: Date): Promise<ExecutiveSummary>;
}
