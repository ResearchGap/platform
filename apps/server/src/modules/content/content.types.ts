export const RESEARCH_CONTENT_TYPES = {
  NEWS: "NEWS",
  ARTICLE: "ARTICLE",
  ANNOUNCEMENT: "ANNOUNCEMENT",
} as const;

export type ResearchContentType =
  (typeof RESEARCH_CONTENT_TYPES)[keyof typeof RESEARCH_CONTENT_TYPES];

export const RESEARCH_CONTENT_STATUSES = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ResearchContentStatus =
  (typeof RESEARCH_CONTENT_STATUSES)[keyof typeof RESEARCH_CONTENT_STATUSES];

export interface ContentPerson {
  id: string;
  name: string;
}

export interface ContentCover {
  externalUrl: string | null;
  id: string;
  mimeType: string | null;
  originalName: string | null;
}

export interface ResearchContentSummary {
  author: ContentPerson;
  authorId: string;
  cover: ContentCover | null;
  coverAssetId: string | null;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  publishedAt: Date | null;
  publishedBy: ContentPerson | null;
  publishedById: string | null;
  slug: string;
  status: ResearchContentStatus;
  title: string;
  type: ResearchContentType;
  updatedAt: Date;
}

export interface ResearchContentDetail extends ResearchContentSummary {
  content: string;
}

export interface ContentPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreateResearchContentInput {
  content: string;
  coverAssetId?: string;
  excerpt?: string;
  slug: string;
  title: string;
  type: ResearchContentType;
}

export interface UpdateResearchContentInput {
  content?: string;
  coverAssetId?: string | null;
  excerpt?: string | null;
  slug?: string;
  title?: string;
  type?: ResearchContentType;
}

export interface ContentListInput {
  cursor?: string;
  limit: number;
  status?: ResearchContentStatus;
  type?: ResearchContentType;
}
