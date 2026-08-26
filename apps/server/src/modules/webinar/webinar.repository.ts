import type {
  CreateWebinarInput,
  UpdateWebinarInput,
  WebinarDetail,
  WebinarListInput,
  WebinarPage,
  WebinarStatus,
  WebinarSummary,
} from "./webinar.types";

export interface WebinarRepository {
  coverAssetExists(id: string): Promise<boolean>;
  create(input: CreateWebinarInput & { createdById: string }): Promise<WebinarDetail>;
  findById(id: string): Promise<WebinarDetail | null>;
  findBySlug(slug: string): Promise<WebinarDetail | null>;
  findPublicBySlug(slug: string): Promise<WebinarDetail | null>;
  list(input: WebinarListInput & { createdById?: string }): Promise<WebinarPage<WebinarSummary>>;
  listPublic(input: Omit<WebinarListInput, "status">): Promise<WebinarPage<WebinarSummary>>;
  transitionStatus(input: {
    expectedStatus: WebinarStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: WebinarStatus;
  }): Promise<WebinarDetail | null>;
  update(id: string, input: UpdateWebinarInput): Promise<WebinarDetail>;
}
