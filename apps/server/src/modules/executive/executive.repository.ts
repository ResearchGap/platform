import type { ExecutiveSummary } from "./executive.types";

export interface ExecutiveSummaryRepository {
  getSummary(now: Date): Promise<ExecutiveSummary>;
}
