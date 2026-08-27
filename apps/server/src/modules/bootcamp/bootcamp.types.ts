export const BOOTCAMP_STATUSES = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type BootcampStatus = (typeof BOOTCAMP_STATUSES)[keyof typeof BOOTCAMP_STATUSES];

export const BOOTCAMP_SESSION_TYPES = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  HYBRID: "HYBRID",
} as const;

export type BootcampSessionType =
  (typeof BOOTCAMP_SESSION_TYPES)[keyof typeof BOOTCAMP_SESSION_TYPES];

export const BOOTCAMP_TIMINGS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
} as const;

export type BootcampTiming = (typeof BOOTCAMP_TIMINGS)[keyof typeof BOOTCAMP_TIMINGS];

export interface BootcampPerson {
  id: string;
  name: string;
}

export interface BootcampCover {
  externalUrl: string | null;
  id: string;
  mimeType: string | null;
  originalName: string | null;
}

export interface BootcampSummary {
  cover: BootcampCover | null;
  coverAssetId: string | null;
  createdAt: Date;
  createdBy: BootcampPerson;
  createdById: string;
  endDate: Date;
  id: string;
  publishedAt: Date | null;
  publishedBy: BootcampPerson | null;
  publishedById: string | null;
  registrationDeadline: Date | null;
  slug: string;
  startDate: Date;
  status: BootcampStatus;
  title: string;
  updatedAt: Date;
  whatYouGet: string | null;
}

export interface BootcampDetail extends BootcampSummary {
  description: string;
}

export interface PublicBootcampSummary {
  cover: BootcampCover | null;
  endDate: Date;
  id: string;
  registrationDeadline: Date | null;
  slug: string;
  startDate: Date;
  status: typeof BOOTCAMP_STATUSES.PUBLISHED | typeof BOOTCAMP_STATUSES.COMPLETED;
  title: string;
  whatYouGet: string | null;
}

export interface PublicBootcampDetail extends PublicBootcampSummary {
  description: string;
}

export interface BootcampSessionDetail {
  bootcampId: string;
  cover: BootcampCover | null;
  coverAssetId: string | null;
  createdAt: Date;
  description: string | null;
  feedbackUrl: string | null;
  id: string;
  moduleUrl: string | null;
  postTestUrl: string | null;
  preTestUrl: string | null;
  recordingUrl: string | null;
  scheduledAt: Date;
  sessionType: BootcampSessionType;
  sortOrder: number;
  speakerName: string | null;
  title: string;
  updatedAt: Date;
  venue: string | null;
}

export interface PublicBootcampSession {
  cover: BootcampCover | null;
  description: string | null;
  id: string;
  scheduledAt: Date;
  sessionType: BootcampSessionType;
  sortOrder: number;
  speakerName: string | null;
  title: string;
}

export interface BootcampPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreateBootcampInput {
  coverAssetId?: string;
  description: string;
  endDate: Date;
  registrationDeadline?: Date;
  slug: string;
  startDate: Date;
  title: string;
  whatYouGet?: string;
}

export interface UpdateBootcampInput {
  coverAssetId?: string | null;
  description?: string;
  endDate?: Date;
  registrationDeadline?: Date | null;
  slug?: string;
  startDate?: Date;
  title?: string;
  whatYouGet?: string | null;
}

export interface BootcampListInput {
  cursor?: string;
  limit: number;
  status?: BootcampStatus;
  timing?: BootcampTiming;
}

export interface CreateBootcampSessionInput {
  coverAssetId?: string;
  description?: string;
  feedbackUrl?: string;
  moduleUrl?: string;
  postTestUrl?: string;
  preTestUrl?: string;
  recordingUrl?: string;
  scheduledAt: Date;
  sessionType: BootcampSessionType;
  sortOrder: number;
  speakerName?: string;
  title: string;
  venue?: string;
}

export interface UpdateBootcampSessionInput {
  coverAssetId?: string | null;
  description?: string | null;
  feedbackUrl?: string | null;
  moduleUrl?: string | null;
  postTestUrl?: string | null;
  preTestUrl?: string | null;
  recordingUrl?: string | null;
  scheduledAt?: Date;
  sessionType?: BootcampSessionType;
  sortOrder?: number;
  speakerName?: string | null;
  title?: string;
  venue?: string | null;
}
