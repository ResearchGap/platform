import type {
  BootcampDetail,
  BootcampPage,
  BootcampSessionDetail,
  BootcampSummary,
} from "../bootcamp/bootcamp.types";

export const ENROLLMENT_KEY_AUDIENCES = {
  MENTEE: "MENTEE",
  MENTOR: "MENTOR",
} as const;

export type EnrollmentKeyAudience =
  (typeof ENROLLMENT_KEY_AUDIENCES)[keyof typeof ENROLLMENT_KEY_AUDIENCES];

export const ENROLLMENT_KEY_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  EXPIRED: "EXPIRED",
  EXHAUSTED: "EXHAUSTED",
} as const;

export type EnrollmentKeyStatus =
  (typeof ENROLLMENT_KEY_STATUSES)[keyof typeof ENROLLMENT_KEY_STATUSES];

export const PERSISTED_ENROLLMENT_KEY_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type PersistedEnrollmentKeyStatus =
  (typeof PERSISTED_ENROLLMENT_KEY_STATUSES)[keyof typeof PERSISTED_ENROLLMENT_KEY_STATUSES];

export const BOOTCAMP_ENROLLMENT_STATUSES = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BootcampEnrollmentStatus =
  (typeof BOOTCAMP_ENROLLMENT_STATUSES)[keyof typeof BOOTCAMP_ENROLLMENT_STATUSES];

export const BOOTCAMP_MENTOR_SOURCES = {
  CREATOR: "CREATOR",
  SELF_ENROLLED: "SELF_ENROLLED",
  STAFF_ASSIGNED: "STAFF_ASSIGNED",
} as const;

export type BootcampMentorSource =
  (typeof BOOTCAMP_MENTOR_SOURCES)[keyof typeof BOOTCAMP_MENTOR_SOURCES];

export const BOOTCAMP_MENTOR_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type BootcampMentorStatus =
  (typeof BOOTCAMP_MENTOR_STATUSES)[keyof typeof BOOTCAMP_MENTOR_STATUSES];

export interface EnrollmentPerson {
  id: string;
  name: string;
}

export interface EnrollmentKeyDetail {
  audience: EnrollmentKeyAudience;
  bootcampId: string;
  createdAt: Date;
  createdBy: EnrollmentPerson;
  createdById: string;
  expiresAt: Date | null;
  id: string;
  keyHint: string | null;
  maxUses: number | null;
  status: EnrollmentKeyStatus;
  usageCount: number;
}

export interface CreateEnrollmentKeyInput {
  audience: EnrollmentKeyAudience;
  expiresAt?: Date;
  maxUses?: number;
}

export interface EnrollmentKeyPageInput {
  audience?: EnrollmentKeyAudience;
  cursor?: string;
  limit: number;
  status?: EnrollmentKeyStatus;
}

export interface CreatedEnrollmentKey {
  key: EnrollmentKeyDetail;
  rawKey: string;
}

export interface BootcampEnrollmentDetail {
  bootcampId: string;
  enrolledAt: Date;
  enrollmentKeyId: string;
  id: string;
  menteeId: string;
  status: BootcampEnrollmentStatus;
}

export interface ParticipantDetail extends BootcampEnrollmentDetail {
  mentee: {
    email: string;
    id: string;
    name: string;
    profile: {
      institution: string | null;
      nickname: string | null;
      researchField: string | null;
    } | null;
  };
}

export interface ParticipantListInput {
  cursor?: string;
  limit: number;
  status?: BootcampEnrollmentStatus;
}

export interface MyBootcampEnrollment extends BootcampEnrollmentDetail {
  bootcamp: BootcampSummary;
}

export interface MyBootcampListInput {
  cursor?: string;
  limit: number;
  status?:
    | typeof BOOTCAMP_ENROLLMENT_STATUSES.ACTIVE
    | typeof BOOTCAMP_ENROLLMENT_STATUSES.COMPLETED;
}

export interface LearningBootcampAccess {
  bootcamp: BootcampDetail;
  enrollment: BootcampEnrollmentDetail;
  sessions: BootcampSessionDetail[];
}

export interface BootcampMentorDetail {
  assignedAt: Date;
  assignedBy: EnrollmentPerson | null;
  assignedById: string | null;
  assignmentSource: BootcampMentorSource;
  bootcampId: string;
  enrollmentKeyId: string | null;
  id: string;
  mentor: EnrollmentPerson & { email: string };
  mentorId: string;
  status: BootcampMentorStatus;
  updatedAt: Date;
}

export interface EligibleMentor {
  email: string;
  id: string;
  name: string;
  profile: {
    affiliation: string | null;
    expertise: string | null;
    researchField: string | null;
  } | null;
}

export interface CursorListInput {
  cursor?: string;
  limit: number;
}

export interface EligibleMentorListInput extends CursorListInput {
  search?: string;
}

export type EnrollmentPage<T> = BootcampPage<T>;
