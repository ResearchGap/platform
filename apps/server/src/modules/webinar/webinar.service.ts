import { AuthorizationError, authorize, can } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import { PERMISSIONS } from "../../authorization/permissions";
import {
  InvalidWebinarTransitionError,
  WebinarConflictError,
  WebinarLifecycleError,
  WebinarMediaNotFoundError,
  WebinarNotFoundError,
} from "./webinar.errors";
import type { WebinarRepository } from "./webinar.repository";
import {
  WEBINAR_STATUSES,
  type CreateWebinarInput,
  type UpdateWebinarInput,
  type WebinarDetail,
  type WebinarListInput,
} from "./webinar.types";

export class WebinarService {
  constructor(
    private readonly repository: WebinarRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(actor: AuthorizationActor, input: CreateWebinarInput) {
    authorize(actor, PERMISSIONS.WEBINAR_CREATE);
    if (input.coverAssetId) {
      await this.assertCoverExists(input.coverAssetId);
    }
    await this.assertSlugAvailable(input.slug);

    return this.repository.create({ ...input, createdById: actor.userId });
  }

  async update(actor: AuthorizationActor, id: string, input: UpdateWebinarInput) {
    authorize(actor, PERMISSIONS.WEBINAR_UPDATE);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (
      current.status === WEBINAR_STATUSES.COMPLETED ||
      current.status === WEBINAR_STATUSES.ARCHIVED
    ) {
      throw new WebinarLifecycleError(`${current.status} webinars cannot be updated`);
    }
    if (input.coverAssetId !== undefined && input.coverAssetId !== null) {
      await this.assertCoverExists(input.coverAssetId);
    }
    if (input.slug && input.slug !== current.slug) {
      await this.assertSlugAvailable(input.slug, id);
    }

    return this.repository.update(id, input);
  }

  async getById(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.WEBINAR_READ);
    const webinar = await this.getRequired(id);
    if (!this.isPublic(webinar) && !this.canManage(actor, webinar)) {
      throw new AuthorizationError();
    }
    return webinar;
  }

  async getPublicBySlug(slug: string) {
    const webinar = await this.repository.findPublicBySlug(slug);
    if (!webinar) {
      throw new WebinarNotFoundError();
    }
    return webinar;
  }

  async list(actor: AuthorizationActor, input: WebinarListInput) {
    authorize(actor, PERMISSIONS.WEBINAR_READ);
    return this.repository.list({
      ...input,
      createdById: can(actor, PERMISSIONS.WEBINAR_MANAGE_ALL) ? undefined : actor.userId,
    });
  }

  async listPublic(input: Omit<WebinarListInput, "status">) {
    return this.repository.listPublic(input);
  }

  async publish(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.WEBINAR_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status !== WEBINAR_STATUSES.DRAFT) {
      throw new InvalidWebinarTransitionError(current.status, WEBINAR_STATUSES.PUBLISHED);
    }

    const published = await this.repository.transitionStatus({
      id,
      expectedStatus: WEBINAR_STATUSES.DRAFT,
      status: WEBINAR_STATUSES.PUBLISHED,
      publishedById: actor.userId,
      publishedAt: this.now(),
    });
    if (!published) {
      throw new InvalidWebinarTransitionError(WEBINAR_STATUSES.DRAFT, WEBINAR_STATUSES.PUBLISHED);
    }
    return published;
  }

  async complete(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.WEBINAR_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status !== WEBINAR_STATUSES.PUBLISHED) {
      throw new InvalidWebinarTransitionError(current.status, WEBINAR_STATUSES.COMPLETED);
    }
    if (current.scheduledAt > this.now()) {
      throw new WebinarLifecycleError("A future webinar cannot be marked completed");
    }

    const completed = await this.repository.transitionStatus({
      id,
      expectedStatus: WEBINAR_STATUSES.PUBLISHED,
      status: WEBINAR_STATUSES.COMPLETED,
    });
    if (!completed) {
      throw new InvalidWebinarTransitionError(
        WEBINAR_STATUSES.PUBLISHED,
        WEBINAR_STATUSES.COMPLETED,
      );
    }
    return completed;
  }

  async archive(actor: AuthorizationActor, id: string) {
    authorize(actor, PERMISSIONS.WEBINAR_PUBLISH);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current);
    if (current.status === WEBINAR_STATUSES.ARCHIVED) {
      throw new InvalidWebinarTransitionError(current.status, WEBINAR_STATUSES.ARCHIVED);
    }

    const archived = await this.repository.transitionStatus({
      id,
      expectedStatus: current.status,
      status: WEBINAR_STATUSES.ARCHIVED,
    });
    if (!archived) {
      throw new InvalidWebinarTransitionError(current.status, WEBINAR_STATUSES.ARCHIVED);
    }
    return archived;
  }

  private async getRequired(id: string) {
    const webinar = await this.repository.findById(id);
    if (!webinar) {
      throw new WebinarNotFoundError();
    }
    return webinar;
  }

  private isPublic(webinar: WebinarDetail) {
    return (
      webinar.status === WEBINAR_STATUSES.PUBLISHED || webinar.status === WEBINAR_STATUSES.COMPLETED
    );
  }

  private canManage(actor: AuthorizationActor, webinar: WebinarDetail) {
    return webinar.createdById === actor.userId || can(actor, PERMISSIONS.WEBINAR_MANAGE_ALL);
  }

  private assertCanManage(actor: AuthorizationActor, webinar: WebinarDetail) {
    if (!this.canManage(actor, webinar)) {
      throw new AuthorizationError();
    }
  }

  private async assertCoverExists(coverAssetId: string) {
    if (!(await this.repository.coverAssetExists(coverAssetId))) {
      throw new WebinarMediaNotFoundError();
    }
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    const existing = await this.repository.findBySlug(slug);
    if (existing && existing.id !== currentId) {
      throw new WebinarConflictError("Webinar slug is already in use");
    }
  }
}
