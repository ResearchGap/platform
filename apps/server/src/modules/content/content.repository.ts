import type {
  ContentListInput,
  ContentPage,
  CreateResearchContentInput,
  ResearchContentDetail,
  ResearchContentStatus,
  ResearchContentSummary,
  UpdateResearchContentInput,
} from "./content.types.js";

export interface ResearchContentRepository {
  coverAssetExists(id: string): Promise<boolean>;
  create(input: CreateResearchContentInput & { authorId: string }): Promise<ResearchContentDetail>;
  findById(id: string): Promise<ResearchContentDetail | null>;
  findBySlug(slug: string): Promise<ResearchContentDetail | null>;
  findPublishedBySlug(slug: string): Promise<ResearchContentDetail | null>;
  list(
    input: ContentListInput & { authorId?: string },
  ): Promise<ContentPage<ResearchContentSummary>>;
  listPublished(
    input: Omit<ContentListInput, "status">,
  ): Promise<ContentPage<ResearchContentSummary>>;
  transitionStatus(input: {
    expectedStatus: ResearchContentStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: ResearchContentStatus;
  }): Promise<ResearchContentDetail | null>;
  update(id: string, input: UpdateResearchContentInput): Promise<ResearchContentDetail>;
}
