import {
  RESOURCE_SCOPES,
  RESOURCE_TYPES,
  type ResourceScope,
} from "../../authorization/access-profiles.js";
import { AuthorizationError, authorize, authorizeResource } from "../../authorization/authorize.js";
import type { AuthorizationActor } from "../../authorization/authorization.types.js";
import { PERMISSIONS } from "../../authorization/permissions.js";
import {
  ContentConflictError,
  ContentLifecycleError,
  ContentMediaNotFoundError,
  ContentNotFoundError,
  InvalidContentTransitionError,
} from "./content.errors.js";
import type { ResearchContentRepository } from "./content.repository.js";
import {
  RESEARCH_CONTENT_STATUSES,
  type ContentListInput,
  type CreateResearchContentInput,
  type ResearchContentDetail,
  type UpdateResearchContentInput,
} from "./content.types.js";

export class ResearchContentService {
  constructor(
    private readonly repository: ResearchContentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(actor: AuthorizationActor, input: CreateResearchContentInput) {
    authorizeResource(actor, PERMISSIONS.CONTENT_CREATE, RESOURCE_TYPES.CONTENT);
    if (input.coverAssetId) {
      authorize(actor, PERMISSIONS.CONTENT_MANAGE_VISUAL);
      await this.assertCoverExists(input.coverAssetId);
    }
    await this.assertSlugAvailable(input.slug);

    return this.repository.create({ ...input, authorId: actor.userId });
  }

  async update(actor: AuthorizationActor, id: string, input: UpdateResearchContentInput) {
    const scope = authorizeResource(actor, PERMISSIONS.CONTENT_UPDATE, RESOURCE_TYPES.CONTENT);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
    if (current.status === RESEARCH_CONTENT_STATUSES.ARCHIVED) {
      throw new ContentLifecycleError("Archived research content cannot be updated");
    }
    if (input.coverAssetId !== undefined) {
      authorize(actor, PERMISSIONS.CONTENT_MANAGE_VISUAL);
      if (input.coverAssetId !== null) {
        await this.assertCoverExists(input.coverAssetId);
      }
    }
    if (input.slug && input.slug !== current.slug) {
      await this.assertSlugAvailable(input.slug, id);
    }

    return this.repository.update(id, input);
  }

  async getById(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(actor, PERMISSIONS.CONTENT_READ, RESOURCE_TYPES.CONTENT);
    const content = await this.getRequired(id);
    if (
      content.status !== RESEARCH_CONTENT_STATUSES.PUBLISHED &&
      content.authorId !== actor.userId &&
      !this.canManage(actor, content, scope)
    ) {
      throw new AuthorizationError();
    }
    return content;
  }

  async getPublishedBySlug(slug: string) {
    const content = await this.repository.findPublishedBySlug(slug);
    if (!content) {
      throw new ContentNotFoundError();
    }
    return content;
  }

  async list(actor: AuthorizationActor, input: ContentListInput) {
    const scope = authorizeResource(actor, PERMISSIONS.CONTENT_READ, RESOURCE_TYPES.CONTENT);
    return this.repository.list({
      ...input,
      authorId: scope === RESOURCE_SCOPES.ALL ? undefined : actor.userId,
    });
  }

  async listPublished(input: Omit<ContentListInput, "status">) {
    return this.repository.listPublished(input);
  }

  async publish(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(actor, PERMISSIONS.CONTENT_PUBLISH, RESOURCE_TYPES.CONTENT);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
    if (current.status !== RESEARCH_CONTENT_STATUSES.DRAFT) {
      throw new InvalidContentTransitionError(current.status, RESEARCH_CONTENT_STATUSES.PUBLISHED);
    }

    const published = await this.repository.transitionStatus({
      id,
      expectedStatus: RESEARCH_CONTENT_STATUSES.DRAFT,
      status: RESEARCH_CONTENT_STATUSES.PUBLISHED,
      publishedById: actor.userId,
      publishedAt: this.now(),
    });
    if (!published) {
      throw new InvalidContentTransitionError(
        RESEARCH_CONTENT_STATUSES.DRAFT,
        RESEARCH_CONTENT_STATUSES.PUBLISHED,
      );
    }
    return published;
  }

  async archive(actor: AuthorizationActor, id: string) {
    const scope = authorizeResource(actor, PERMISSIONS.CONTENT_PUBLISH, RESOURCE_TYPES.CONTENT);
    const current = await this.getRequired(id);
    this.assertCanManage(actor, current, scope);
    if (current.status === RESEARCH_CONTENT_STATUSES.ARCHIVED) {
      throw new InvalidContentTransitionError(current.status, RESEARCH_CONTENT_STATUSES.ARCHIVED);
    }

    const archived = await this.repository.transitionStatus({
      id,
      expectedStatus: current.status,
      status: RESEARCH_CONTENT_STATUSES.ARCHIVED,
    });
    if (!archived) {
      throw new InvalidContentTransitionError(current.status, RESEARCH_CONTENT_STATUSES.ARCHIVED);
    }
    return archived;
  }

  private async getRequired(id: string) {
    const content = await this.repository.findById(id);
    if (!content) {
      throw new ContentNotFoundError();
    }
    return content;
  }

  private canManage(
    actor: AuthorizationActor,
    content: ResearchContentDetail,
    scope: ResourceScope,
  ) {
    return (
      scope === RESOURCE_SCOPES.ALL ||
      (scope === RESOURCE_SCOPES.OWNED && content.authorId === actor.userId)
    );
  }

  private assertCanManage(
    actor: AuthorizationActor,
    content: ResearchContentDetail,
    scope: ResourceScope,
  ) {
    if (!this.canManage(actor, content, scope)) {
      throw new AuthorizationError();
    }
  }

  private async assertCoverExists(coverAssetId: string) {
    if (!(await this.repository.coverAssetExists(coverAssetId))) {
      throw new ContentMediaNotFoundError();
    }
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    const existing = await this.repository.findBySlug(slug);
    if (existing && existing.id !== currentId) {
      throw new ContentConflictError("Research content slug is already in use");
    }
  }
}
