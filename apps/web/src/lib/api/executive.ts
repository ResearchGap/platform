import { apiRequest } from "./client";
import type { ExecutiveSummary } from "./executive-types";

export function getExecutiveSummary(init: RequestInit = {}) {
  return apiRequest<ExecutiveSummary>("/api/executive/summary", {
    cache: "no-store",
    ...init,
  });
}
