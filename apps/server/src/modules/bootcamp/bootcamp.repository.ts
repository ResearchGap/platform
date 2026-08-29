import type {
  BootcampDetail,
  BootcampListInput,
  BootcampPage,
  BootcampSessionDetail,
  BootcampStatus,
  BootcampSummary,
  CreateBootcampInput,
  CreateBootcampSessionInput,
  UpdateBootcampInput,
  UpdateBootcampSessionInput,
} from "./bootcamp.types.js";
import type { ResourceScope } from "../../authorization/access-profiles.js";

export interface BootcampRepository {
  coverAssetExists(id: string): Promise<boolean>;
  create(
    input: CreateBootcampInput & { assignCreatorAsMentor: boolean; createdById: string },
  ): Promise<BootcampDetail>;
  createSession(
    bootcampId: string,
    input: CreateBootcampSessionInput,
  ): Promise<BootcampSessionDetail>;
  deleteSession(bootcampId: string, sessionId: string): Promise<boolean>;
  findById(id: string): Promise<BootcampDetail | null>;
  findBySlug(slug: string): Promise<BootcampDetail | null>;
  findPublicBySlug(slug: string): Promise<BootcampDetail | null>;
  findSession(bootcampId: string, sessionId: string): Promise<BootcampSessionDetail | null>;
  isActiveMentor(bootcampId: string, userId: string): Promise<boolean>;
  isActiveEnrollment(bootcampId: string, userId: string): Promise<boolean>;
  list(
    input: BootcampListInput & { actorUserId?: string; resourceScope?: ResourceScope },
  ): Promise<BootcampPage<BootcampSummary>>;
  listPublic(input: Omit<BootcampListInput, "status">): Promise<BootcampPage<BootcampSummary>>;
  listSessions(bootcampId: string): Promise<BootcampSessionDetail[]>;
  reorderSessions(bootcampId: string, sessionIds: string[]): Promise<BootcampSessionDetail[]>;
  transitionStatus(input: {
    expectedStatus: BootcampStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: BootcampStatus;
  }): Promise<BootcampDetail | null>;
  update(id: string, input: UpdateBootcampInput): Promise<BootcampDetail>;
  updateSession(
    bootcampId: string,
    sessionId: string,
    input: UpdateBootcampSessionInput,
  ): Promise<BootcampSessionDetail>;
}
