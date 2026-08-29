import { authorize } from "../../authorization/authorize.js";
import type { AuthorizationActor } from "../../authorization/authorization.types.js";
import { PERMISSIONS } from "../../authorization/permissions.js";
import type { ExecutiveSummaryRepository } from "./executive.repository.js";

export class ExecutiveService {
  constructor(private readonly repository: ExecutiveSummaryRepository) {}

  getSummary(actor: AuthorizationActor, now = new Date()) {
    authorize(actor, PERMISSIONS.ANALYTICS_READ_EXECUTIVE);
    return this.repository.getSummary(now);
  }
}
