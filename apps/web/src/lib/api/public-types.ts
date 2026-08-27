export type ContentType = "NEWS" | "ARTICLE" | "ANNOUNCEMENT";
export type WebinarTiming = "UPCOMING" | "PAST";
export type BootcampTiming = "UPCOMING" | "ONGOING" | "COMPLETED";
export type SessionType = "ONLINE" | "OFFLINE" | "HYBRID";

export interface PublicCover {
  externalUrl: string | null;
  id: string;
  mimeType: string | null;
  originalName: string | null;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PublicContentSummary {
  cover: PublicCover | null;
  excerpt: string | null;
  id: string;
  publishedAt: string | null;
  slug: string;
  title: string;
  type: ContentType;
}

export interface PublicContentDetail extends PublicContentSummary {
  content: string;
}

export interface PublicWebinarSummary {
  cover: PublicCover | null;
  id: string;
  publishedAt: string | null;
  registrationUrl: string | null;
  scheduledAt: string;
  sessionType: SessionType;
  slug: string;
  speakerName: string | null;
  status: "PUBLISHED" | "COMPLETED";
  title: string;
  venue: string | null;
}

export interface PublicWebinarDetail extends PublicWebinarSummary {
  description: string;
}

export interface PublicBootcampSummary {
  cover: PublicCover | null;
  endDate: string;
  id: string;
  registrationDeadline: string | null;
  slug: string;
  startDate: string;
  status: "PUBLISHED" | "COMPLETED";
  title: string;
  whatYouGet: string | null;
}

export interface PublicBootcampDetail extends PublicBootcampSummary {
  description: string;
}

export interface PublicBootcampSession {
  cover: PublicCover | null;
  description: string | null;
  id: string;
  scheduledAt: string;
  sessionType: SessionType;
  sortOrder: number;
  speakerName: string | null;
  title: string;
}
