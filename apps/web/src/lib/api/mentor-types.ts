import type { ContentType, PublicCover, SessionType } from "./public-types";

export type BootcampStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "COMPLETED" | "ARCHIVED";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type WebinarStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "ARCHIVED";

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

interface Person {
  id: string;
  name: string;
}

export interface ManagedBootcampSummary {
  cover: PublicCover | null;
  coverAssetId: string | null;
  createdAt: string;
  createdBy: Person;
  createdById: string;
  endDate: string;
  id: string;
  publishedAt: string | null;
  publishedBy: Person | null;
  publishedById: string | null;
  registrationDeadline: string | null;
  slug: string;
  startDate: string;
  status: BootcampStatus;
  title: string;
  updatedAt: string;
  whatYouGet: string | null;
}

export interface ManagedBootcampDetail extends ManagedBootcampSummary {
  description: string;
}

export interface ManagedBootcampSession {
  bootcampId: string;
  cover: PublicCover | null;
  coverAssetId: string | null;
  createdAt: string;
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
  updatedAt: string;
  venue: string | null;
}

export interface BootcampMentorAssignment {
  assignedAt: string;
  assignedBy: Person | null;
  assignedById: string | null;
  assignmentSource: "CREATOR" | "SELF_ENROLLED" | "STAFF_ASSIGNED";
  bootcampId: string;
  enrollmentKeyId: string | null;
  id: string;
  mentor: Person & { email: string };
  mentorId: string;
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
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

export interface EnrollmentKeyDetail {
  audience: "MENTEE" | "MENTOR";
  bootcampId: string;
  createdAt: string;
  createdBy: Person;
  createdById: string;
  expiresAt: string | null;
  id: string;
  keyHint: string | null;
  maxUses: number | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "EXHAUSTED";
  usageCount: number;
}

export interface CreatedEnrollmentKey {
  key: EnrollmentKeyDetail;
  rawKey: string;
}

export interface Participant {
  bootcampId: string;
  enrolledAt: string;
  enrollmentKeyId: string;
  id: string;
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
  menteeId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface ManagedContentSummary {
  author: Person;
  authorId: string;
  cover: PublicCover | null;
  coverAssetId: string | null;
  createdAt: string;
  excerpt: string | null;
  id: string;
  publishedAt: string | null;
  publishedBy: Person | null;
  publishedById: string | null;
  slug: string;
  status: ContentStatus;
  title: string;
  type: ContentType;
  updatedAt: string;
}

export interface ManagedContentDetail extends ManagedContentSummary {
  content: string;
}

export interface ManagedWebinarSummary {
  cover: PublicCover | null;
  coverAssetId: string | null;
  createdAt: string;
  createdBy: Person;
  createdById: string;
  id: string;
  meetingUrl: string | null;
  publishedAt: string | null;
  publishedBy: Person | null;
  publishedById: string | null;
  registrationUrl: string | null;
  scheduledAt: string;
  sessionType: SessionType;
  slug: string;
  speakerName: string | null;
  status: WebinarStatus;
  title: string;
  updatedAt: string;
  venue: string | null;
}

export interface ManagedWebinarDetail extends ManagedWebinarSummary {
  description: string;
}

export interface BootcampInput {
  coverAssetId?: string | null;
  description: string;
  endDate: string;
  registrationDeadline?: string | null;
  slug: string;
  startDate: string;
  title: string;
  whatYouGet?: string | null;
}

export interface BootcampSessionInput {
  coverAssetId?: string | null;
  description?: string | null;
  feedbackUrl?: string | null;
  moduleUrl?: string | null;
  postTestUrl?: string | null;
  preTestUrl?: string | null;
  recordingUrl?: string | null;
  scheduledAt: string;
  sessionType: SessionType;
  sortOrder: number;
  speakerName?: string | null;
  title: string;
  venue?: string | null;
}

export interface ContentInput {
  content: string;
  coverAssetId?: string | null;
  excerpt?: string | null;
  slug: string;
  title: string;
  type: ContentType;
}

export interface WebinarInput {
  coverAssetId?: string | null;
  description: string;
  meetingUrl?: string | null;
  registrationUrl?: string | null;
  scheduledAt: string;
  sessionType: SessionType;
  slug: string;
  speakerName?: string | null;
  title: string;
  venue?: string | null;
}
