import { authorize } from "../../authorization/authorize.js";
import { PERMISSIONS } from "../../authorization/permissions.js";
import type { IdentityAccessRepository } from "./identity.repository.js";
import type { ApprovalDecision, ApprovalReviewResult } from "./identity.types.js";

export class ApprovalService {
  constructor(private readonly accessRepository: IdentityAccessRepository) {}

  async review(input: {
    actorId: string;
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
  }): Promise<ApprovalReviewResult> {
    const actor = await this.accessRepository.findActor(input.actorId);
    authorize(actor, PERMISSIONS.USER_APPROVE);

    return this.accessRepository.reviewApproval({
      approvalId: input.approvalId,
      decision: input.decision,
      reviewNote: input.reviewNote,
      reviewerId: actor.userId,
    });
  }
}
