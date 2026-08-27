import { AuthorizationError, authorize, can } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import { PERMISSIONS } from "../../authorization/permissions";
import {
  BootcampConflictError,
  BootcampDateRangeError,
  BootcampLifecycleError,
  BootcampMediaNotFoundError,
  BootcampNotFoundError,
  BootcampSessionNotFoundError,
  BootcampSessionOrderError,
  InvalidBootcampTransitionError,
} from "./bootcamp.errors";
import type { BootcampRepository } from "./bootcamp.repository";
import {
  BOOTCAMP_STATUSES,
  type BootcampDetail,
  type BootcampListInput,
  type BootcampSessionDetail,
  type BootcampSummary,
  type CreateBootcampInput,
  type CreateBootcampSessionInput,
  type PublicBootcampDetail,
  type PublicBootcampSession,
  type PublicBootcampSummary,
  type UpdateBootcampInput,
  type UpdateBootcampSessionInput,
} from "./bootcamp.types";

function toPublicSummary(bootcamp: BootcampSummary): PublicBootcampSummary {
  if (
    bootcamp.status !== BOOTCAMP_STATUSES.PUBLISHED &&
    bootcamp.status !== BOOTCAMP_STATUSES.COMPLETED
  ) {
    throw new BootcampNotFoundError();
  }
  return {
    id: bootcamp.id,
    title: bootcamp.title,
    slug: bootcamp.slug,
    whatYouGet: bootcamp.whatYouGet,
    startDate: bootcamp.startDate,
    endDate: bootcamp.endDate,
    registrationDeadline: bootcamp.registrationDeadline,
    cover: bootcamp.cover,
    status: bootcamp.status,
  };
}

function toPublicDetail(bootcamp: BootcampDetail): PublicBootcampDetail {
  return { ...toPublicSummary(bootcamp), description: bootcamp.description };
}

function toPublicSession(session: BootcampSessionDetail): PublicBootcampSession {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    speakerName: session.speakerName,
    scheduledAt: session.scheduledAt,
    sessionType: session.sessionType,
    cover: session.cover,
    sortOrder: session.sortOrder,
  };
}

export class BootcampService {
  constructor(
    private readonly repository: BootcampRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(actor: AuthorizationActor, input: CreateBootcampInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_CREATE);
    this.assertDateRange(input.startDate, input.endDate, input.registrationDeadline ?? null);
    if (input.coverAssetId) {
      await this.assertCoverExists(input.coverAssetId);
    }
    await this.assertSlugAvailable(input.slug);
    return this.repository.create({ ...input, createdById: actor.userId });
  }

  async update(actor: AuthorizationActor, id: string, input: UpdateBootcampInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_UPDATE);
    const current = await this.getRequired(id);
    this.assertMutable(actor, current);

    const startDate = input.startDate ?? current.startDate;
    const endDate = input.endDate ?? current.endDate;
    const registrationDeadline =
      input.registrationDeadline === undefined
        ? current.registrationDeadline
        : input.registrationDeadline;
    this.assertDateRange(startDate, endDate, registrationDeadline);

    if (input.coverAssetId !== undefined && input.coverAssetId !== null) {
      await this.assertCoverExists(input.coverAssetId);
    }
    if (input.slug && input.slug !== current.slug) {
      await this.assertSlugAvailable(input.slug, id);
    }
    if (input.startDate || input.endDate) {
      const sessions = await this.repository.listSessions(id);
      if (
        sessions.some((session) => session.scheduledAt < startDate || session.scheduledAt > endDate)
      ) {
        throw new BootcampDateRangeError(
          "Existing sessions must remain within the Bootcamp date range",
        );
      }
    }

    return this.repository.update(id, input);
  }

  async getById(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_READ);
    const bootcamp = await this.getRequired(id);
    if (!this.isPublic(bootcamp) && !this.canManage(actor, bootcamp)) {
      throw new AuthorizationError();
    }
    return bootcamp;
  }

  async getPublicBySlug(slug: string) {
    const bootcamp = await this.repository.findPublicBySlug(slug);
    if (!bootcamp) {
      throw new BootcampNotFoundError();
    }
    return toPublicDetail(bootcamp);
  }

  async list(actor: AuthorizationActor, input: BootcampListInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_READ);
    return this.repository.list({
      ...input,
      createdById: can(actor, PERMISSIONS.BOOTCAMP_MANAGE_ALL) ? undefined : actor.userId,
    });
  }

  async listPublic(input: Omit<BootcampListInput, "status">) {
    const page = await this.repository.listPublic(input);
    return { ...page, items: page.items.map(toPublicSummary) };
  }

  async submit(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_UPDATE);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status !== BOOTCAMP_STATUSES.DRAFT) {
      throw new InvalidBootcampTransitionError(current.status, BOOTCAMP_STATUSES.REVIEW);
    }
    return this.transition(current, BOOTCAMP_STATUSES.REVIEW);
  }

  async publish(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status !== BOOTCAMP_STATUSES.REVIEW) {
      throw new InvalidBootcampTransitionError(current.status, BOOTCAMP_STATUSES.PUBLISHED);
    }

    const published = await this.repository.transitionStatus({
      id,
      expectedStatus: BOOTCAMP_STATUSES.REVIEW,
      status: BOOTCAMP_STATUSES.PUBLISHED,
      publishedById: actor.userId,
      publishedAt: this.now(),
    });
    if (!published) {
      throw new InvalidBootcampTransitionError(
        BOOTCAMP_STATUSES.REVIEW,
        BOOTCAMP_STATUSES.PUBLISHED,
      );
    }
    return published;
  }

  async complete(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status !== BOOTCAMP_STATUSES.PUBLISHED) {
      throw new InvalidBootcampTransitionError(current.status, BOOTCAMP_STATUSES.COMPLETED);
    }
    if (current.endDate > this.now()) {
      throw new BootcampLifecycleError("A Bootcamp cannot be completed before its end date");
    }
    return this.transition(current, BOOTCAMP_STATUSES.COMPLETED);
  }

  async archive(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status === BOOTCAMP_STATUSES.ARCHIVED) {
      throw new InvalidBootcampTransitionError(current.status, BOOTCAMP_STATUSES.ARCHIVED);
    }
    return this.transition(current, BOOTCAMP_STATUSES.ARCHIVED);
  }

  async createSession(
    actor: AuthorizationActor,
    bootcampId: string,
    input: CreateBootcampSessionInput,
  ) {
    const bootcamp = await this.getSessionMutableBootcamp(actor, bootcampId);
    this.assertSessionDate(bootcamp, input.scheduledAt);
    if (input.coverAssetId) {
      await this.assertCoverExists(input.coverAssetId);
    }
    return this.repository.createSession(bootcampId, input);
  }

  async updateSession(
    actor: AuthorizationActor,
    bootcampId: string,
    sessionId: string,
    input: UpdateBootcampSessionInput,
  ) {
    const bootcamp = await this.getSessionMutableBootcamp(actor, bootcampId);
    await this.getRequiredSession(bootcampId, sessionId);
    if (input.scheduledAt) {
      this.assertSessionDate(bootcamp, input.scheduledAt);
    }
    if (input.coverAssetId !== undefined && input.coverAssetId !== null) {
      await this.assertCoverExists(input.coverAssetId);
    }
    return this.repository.updateSession(bootcampId, sessionId, input);
  }

  async getSession(actor: AuthorizationActor, bootcampId: string, sessionId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS);
    const bootcamp = await this.getRequired(bootcampId);
    this.assertCanManage(actor, bootcamp);
    return this.getRequiredSession(bootcampId, sessionId);
  }

  async listSessions(actor: AuthorizationActor, bootcampId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS);
    const bootcamp = await this.getRequired(bootcampId);
    this.assertCanManage(actor, bootcamp);
    return this.repository.listSessions(bootcampId);
  }

  async listPublicSessions(slug: string) {
    const bootcamp = await this.repository.findPublicBySlug(slug);
    if (!bootcamp) {
      throw new BootcampNotFoundError();
    }
    return (await this.repository.listSessions(bootcamp.id)).map(toPublicSession);
  }

  async reorderSessions(actor: AuthorizationActor, bootcampId: string, sessionIds: string[]) {
    await this.getSessionMutableBootcamp(actor, bootcampId);
    const sessions = await this.repository.listSessions(bootcampId);
    const uniqueIds = new Set(sessionIds);
    if (
      uniqueIds.size !== sessionIds.length ||
      sessions.length !== sessionIds.length ||
      sessions.some((session) => !uniqueIds.has(session.id))
    ) {
      throw new BootcampSessionOrderError(
        "Session order must contain every Bootcamp session exactly once",
      );
    }
    return this.repository.reorderSessions(bootcampId, sessionIds);
  }

  async deleteSession(actor: AuthorizationActor, bootcampId: string, sessionId: string) {
    await this.getSessionMutableBootcamp(actor, bootcampId);
    if (!(await this.repository.deleteSession(bootcampId, sessionId))) {
      throw new BootcampSessionNotFoundError();
    }
  }

  private async getRequired(id: string) {
    const bootcamp = await this.repository.findById(id);
    if (!bootcamp) {
      throw new BootcampNotFoundError();
    }
    return bootcamp;
  }

  private async getRequiredSession(bootcampId: string, sessionId: string) {
    const session = await this.repository.findSession(bootcampId, sessionId);
    if (!session) {
      throw new BootcampSessionNotFoundError();
    }
    return session;
  }

  private async getSessionMutableBootcamp(actor: AuthorizationActor, bootcampId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS);
    const bootcamp = await this.getRequired(bootcampId);
    this.assertMutable(actor, bootcamp);
    return bootcamp;
  }

  private isPublic(bootcamp: BootcampDetail) {
    return (
      bootcamp.status === BOOTCAMP_STATUSES.PUBLISHED ||
      bootcamp.status === BOOTCAMP_STATUSES.COMPLETED
    );
  }

  private canManage(actor: AuthorizationActor, bootcamp: BootcampDetail) {
    return bootcamp.createdById === actor.userId || can(actor, PERMISSIONS.BOOTCAMP_MANAGE_ALL);
  }

  private assertCanManage(actor: AuthorizationActor, bootcamp: BootcampDetail) {
    if (!this.canManage(actor, bootcamp)) {
      throw new AuthorizationError();
    }
  }

  private assertMutable(actor: AuthorizationActor, bootcamp: BootcampDetail) {
    this.assertCanManage(actor, bootcamp);
    if (
      bootcamp.status === BOOTCAMP_STATUSES.COMPLETED ||
      bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED
    ) {
      throw new BootcampLifecycleError(`${bootcamp.status} Bootcamps cannot be changed`);
    }
    if (
      bootcamp.status !== BOOTCAMP_STATUSES.DRAFT &&
      !can(actor, PERMISSIONS.BOOTCAMP_MANAGE_ALL)
    ) {
      throw new AuthorizationError("Only operational management can change a submitted Bootcamp");
    }
  }

  private assertDateRange(startDate: Date, endDate: Date, registrationDeadline: Date | null) {
    if (endDate <= startDate) {
      throw new BootcampDateRangeError("Bootcamp end date must be after its start date");
    }
    if (registrationDeadline && registrationDeadline > startDate) {
      throw new BootcampDateRangeError(
        "Bootcamp registration deadline must not be after its start date",
      );
    }
  }

  private assertSessionDate(bootcamp: BootcampDetail, scheduledAt: Date) {
    if (scheduledAt < bootcamp.startDate || scheduledAt > bootcamp.endDate) {
      throw new BootcampDateRangeError("Session schedule must be within the Bootcamp date range");
    }
  }

  private async assertCoverExists(coverAssetId: string) {
    if (!(await this.repository.coverAssetExists(coverAssetId))) {
      throw new BootcampMediaNotFoundError();
    }
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    const existing = await this.repository.findBySlug(slug);
    if (existing && existing.id !== currentId) {
      throw new BootcampConflictError("Bootcamp slug is already in use");
    }
  }

  private async transition(current: BootcampDetail, status: BootcampDetail["status"]) {
    const transitioned = await this.repository.transitionStatus({
      id: current.id,
      expectedStatus: current.status,
      status,
    });
    if (!transitioned) {
      throw new InvalidBootcampTransitionError(current.status, status);
    }
    return transitioned;
  }
}
