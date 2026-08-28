import {
  RESOURCE_SCOPES,
  RESOURCE_TYPES,
  type ResourceScope,
} from "../../authorization/access-profiles";
import { AuthorizationError, authorizeResource } from "../../authorization/authorize";
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
  type PublicWebinarDetail,
  type PublicWebinarSummary,
  type UpdateWebinarInput,
  type WebinarDetail,
  type WebinarListInput,
  type WebinarSummary,
} from "./webinar.types";

function toPublicSummary(webinar: WebinarSummary): PublicWebinarSummary {
  if (
    webinar.status !== WEBINAR_STATUSES.PUBLISHED &&
    webinar.status !== WEBINAR_STATUSES.COMPLETED
  ) {
    throw new WebinarNotFoundError();
  }

  return {
    cover: webinar.cover,
    id: webinar.id,
    publishedAt: webinar.publishedAt,
    registrationUrl: webinar.registrationUrl,
    scheduledAt: webinar.scheduledAt,
    sessionType: webinar.sessionType,
    slug: webinar.slug,
    speakerName: webinar.speakerName,
    status: webinar.status,
    title: webinar.title,
    venue: webinar.venue,
  };
}

function toPublicDetail(webinar: WebinarDetail): PublicWebinarDetail {
  return { ...toPublicSummary(webinar), description: webinar.description };
}

function toVisualSummary(webinar: WebinarSummary) {
  return {
    cover: webinar.cover,
    coverAssetId: webinar.coverAssetId,
    id: webinar.id,
    scheduledAt: webinar.scheduledAt,
    sessionType: webinar.sessionType,
    status: webinar.status,
    title: webinar.title,
  };
}

export class WebinarService {
  constructor(
    private readonly repository: WebinarRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(actor: AuthorizationActor, input: CreateWebinarInput) {
    authorizeResource(actor, PERMISSIONS.WEBINAR_CREATE, RESOURCE_TYPES.WEBINAR);
    if (input.coverAssetId) {
      await this.assertCoverExists(input.coverAssetId);
    }
    await this.assertSlugAvailable(input.slug);

    return this.repository.create({ ...input, createdById: actor.userId });
  }

  async update(actor: AuthorizationActor, id: string, input: UpdateWebinarInput) {
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_UPDATE, RESOURCE_TYPES.WEBINAR);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
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

  async updateCover(actor: AuthorizationActor, id: string, coverAssetId: string | null) {
    const scope = authorizeResource(
      actor,
      PERMISSIONS.WEBINAR_MANAGE_VISUAL,
      RESOURCE_TYPES.WEBINAR,
    );
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
    if (coverAssetId !== null) {
      await this.assertCoverExists(coverAssetId);
    }
    return toVisualSummary(await this.repository.update(id, { coverAssetId }));
  }

  async getVisual(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(
      actor,
      PERMISSIONS.WEBINAR_MANAGE_VISUAL,
      RESOURCE_TYPES.WEBINAR,
    );
    const webinar = await this.getRequired(id);
    this.assertCanManage(actor, webinar, scope);
    return toVisualSummary(webinar);
  }

  async listVisuals(actor: AuthorizationActor, input: WebinarListInput) {
    const scope = authorizeResource(
      actor,
      PERMISSIONS.WEBINAR_MANAGE_VISUAL,
      RESOURCE_TYPES.WEBINAR,
    );
    const page = await this.repository.list({
      ...input,
      createdById: scope === RESOURCE_SCOPES.ALL ? undefined : actor.userId,
    });
    return { ...page, items: page.items.map(toVisualSummary) };
  }

  async getById(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_READ, RESOURCE_TYPES.WEBINAR);
    const webinar = await this.getRequired(id);
    if (!this.isPublic(webinar) && !this.canManage(actor, webinar, scope)) {
      throw new AuthorizationError();
    }
    return webinar;
  }

  async getPublicBySlug(slug: string) {
    const webinar = await this.repository.findPublicBySlug(slug);
    if (!webinar) {
      throw new WebinarNotFoundError();
    }
    return toPublicDetail(webinar);
  }

  async list(actor: AuthorizationActor, input: WebinarListInput) {
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_READ, RESOURCE_TYPES.WEBINAR);
    return this.repository.list({
      ...input,
      createdById: scope === RESOURCE_SCOPES.ALL ? undefined : actor.userId,
    });
  }

  async listPublic(input: Omit<WebinarListInput, "status">) {
    const page = await this.repository.listPublic(input);
    return {
      ...page,
      items: page.items.map(toPublicSummary),
    };
  }

  async publish(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_PUBLISH, RESOURCE_TYPES.WEBINAR);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
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
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_PUBLISH, RESOURCE_TYPES.WEBINAR);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
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
    const scope = authorizeResource(actor, PERMISSIONS.WEBINAR_PUBLISH, RESOURCE_TYPES.WEBINAR);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
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

  private canManage(actor: AuthorizationActor, webinar: WebinarDetail, scope: ResourceScope) {
    return (
      scope === RESOURCE_SCOPES.ALL ||
      (scope === RESOURCE_SCOPES.OWNED && webinar.createdById === actor.userId)
    );
  }

  private assertCanManage(actor: AuthorizationActor, webinar: WebinarDetail, scope: ResourceScope) {
    if (!this.canManage(actor, webinar, scope)) {
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
