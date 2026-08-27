import type { PublicCover, SessionType } from "./public-types";

export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DISABLED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RoleCode = "MENTEE" | "MENTOR" | "CEO" | "COO" | "CMO" | "SUPERADMIN";
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface UserProfile {
  affiliation: string | null;
  biography: string | null;
  expertise: string | null;
  institution: string | null;
  nickname: string | null;
  researchField: string | null;
  updatedAt: string;
  whatsapp: string | null;
}

export interface CurrentAccount {
  access: {
    accessProfileCode: string;
    accountStatus: AccountStatus;
    roleCode: RoleCode;
  };
  approval: {
    requestedRoleCode: RoleCode;
    reviewNote: string | null;
    status: ApprovalStatus;
  } | null;
  profile: UserProfile;
  user: {
    email: string;
    id: string;
    image: string | null;
    name: string;
  };
}

export interface RegistrationInput {
  email: string;
  kind: "MENTEE" | "MENTOR" | "STAFF";
  name: string;
  password: string;
  requestedRoleCode?: "CEO" | "COO" | "CMO";
}

export interface RegistrationResult {
  access: {
    accountStatus: AccountStatus;
    roleCode: RoleCode;
  };
  user: {
    email: string;
    id: string;
    name: string;
  };
}

export interface EnrolledBootcampSummary {
  cover: PublicCover | null;
  endDate: string;
  id: string;
  registrationDeadline: string | null;
  slug: string;
  startDate: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "COMPLETED" | "ARCHIVED";
  title: string;
  whatYouGet: string | null;
}

export interface MyBootcampEnrollment {
  bootcamp: EnrolledBootcampSummary;
  bootcampId: string;
  enrolledAt: string;
  enrollmentKeyId: string;
  id: string;
  menteeId: string;
  status: EnrollmentStatus;
}

export interface MenteePage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface LearningSession {
  cover: PublicCover | null;
  description: string | null;
  feedbackUrl: string | null;
  id: string;
  moduleUrl: string | null;
  postTestUrl: string | null;
  preTestUrl: string | null;
  recordingUrl: string | null;
  scheduledAt: string;
  sessionType: SessionType;
  sortOrder: number;
  speakerName: string | null;
  title: string;
  venue: string | null;
}

export interface LearningBootcampAccess {
  bootcamp: EnrolledBootcampSummary & { description: string };
  enrollment: Omit<MyBootcampEnrollment, "bootcamp">;
  sessions: LearningSession[];
}

export type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | "affiliation"
    | "biography"
    | "expertise"
    | "institution"
    | "nickname"
    | "researchField"
    | "whatsapp"
  >
>;
