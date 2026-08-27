export const WEBINAR_SESSION_TYPES = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  HYBRID: "HYBRID",
} as const;

export type WebinarSessionType = (typeof WEBINAR_SESSION_TYPES)[keyof typeof WEBINAR_SESSION_TYPES];

export const WEBINAR_STATUSES = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type WebinarStatus = (typeof WEBINAR_STATUSES)[keyof typeof WEBINAR_STATUSES];

export const WEBINAR_TIMINGS = {
  UPCOMING: "UPCOMING",
  PAST: "PAST",
} as const;

export type WebinarTiming = (typeof WEBINAR_TIMINGS)[keyof typeof WEBINAR_TIMINGS];

export interface WebinarPerson {
  id: string;
  name: string;
}

export interface WebinarCover {
  externalUrl: string | null;
  id: string;
  mimeType: string | null;
  originalName: string | null;
}

export interface WebinarSummary {
  cover: WebinarCover | null;
  coverAssetId: string | null;
  createdAt: Date;
  createdBy: WebinarPerson;
  createdById: string;
  id: string;
  meetingUrl: string | null;
  publishedAt: Date | null;
  publishedBy: WebinarPerson | null;
  publishedById: string | null;
  registrationUrl: string | null;
  scheduledAt: Date;
  sessionType: WebinarSessionType;
  slug: string;
  speakerName: string | null;
  status: WebinarStatus;
  title: string;
  updatedAt: Date;
  venue: string | null;
}

export interface WebinarDetail extends WebinarSummary {
  description: string;
}

export interface PublicWebinarSummary {
  cover: WebinarCover | null;
  id: string;
  publishedAt: Date | null;
  registrationUrl: string | null;
  scheduledAt: Date;
  sessionType: WebinarSessionType;
  slug: string;
  speakerName: string | null;
  status: typeof WEBINAR_STATUSES.PUBLISHED | typeof WEBINAR_STATUSES.COMPLETED;
  title: string;
  venue: string | null;
}

export interface PublicWebinarDetail extends PublicWebinarSummary {
  description: string;
}

export interface WebinarPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreateWebinarInput {
  coverAssetId?: string;
  description: string;
  meetingUrl?: string;
  registrationUrl?: string;
  scheduledAt: Date;
  sessionType: WebinarSessionType;
  slug: string;
  speakerName?: string;
  title: string;
  venue?: string;
}

export interface UpdateWebinarInput {
  coverAssetId?: string | null;
  description?: string;
  meetingUrl?: string | null;
  registrationUrl?: string | null;
  scheduledAt?: Date;
  sessionType?: WebinarSessionType;
  slug?: string;
  speakerName?: string | null;
  title?: string;
  venue?: string | null;
}

export interface WebinarListInput {
  cursor?: string;
  limit: number;
  status?: WebinarStatus;
  timing?: WebinarTiming;
}
