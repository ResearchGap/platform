import { authorize } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import { PERMISSIONS } from "../../authorization/permissions";
import type { ExecutiveSummaryRepository } from "./executive.repository";

export class ExecutiveService {
  constructor(private readonly repository: ExecutiveSummaryRepository) {}

  getSummary(actor: AuthorizationActor, now = new Date()) {
    authorize(actor, PERMISSIONS.ANALYTICS_READ_EXECUTIVE);
    return this.repository.getSummary(now);
  }
}
