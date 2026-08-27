import type { AuthorizationActor, RoleCode } from "../../authorization/authorization.types";
import type {
  ApprovalDecision,
  ApprovalReviewResult,
  CurrentAccountDetail,
  UpdateUserProfileInput,
  UserProfileDetail,
} from "./identity.types";

export interface IdentityAccessRepository {
  bootstrapSuperadmin(email: string): Promise<{ email: string; userId: string }>;
  findActor(userId: string): Promise<AuthorizationActor | null>;
  initializeMentee(userId: string): Promise<void>;
  initializePendingRegistration(userId: string, roleCode: RoleCode): Promise<void>;
  reviewApproval(input: {
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult>;
}

export interface CurrentAccountRepository {
  findCurrentAccount(userId: string): Promise<CurrentAccountDetail | null>;
  updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfileDetail>;
}
