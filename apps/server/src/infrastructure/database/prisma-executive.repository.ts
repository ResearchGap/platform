import prisma from "@platform/db";

import {
  ACCOUNT_STATUSES,
  ROLES,
  type AccountStatus,
  type RoleCode,
} from "../../authorization/authorization.types.js";
import { BOOTCAMP_STATUSES, type BootcampStatus } from "../../modules/bootcamp/bootcamp.types.js";
import {
  RESEARCH_CONTENT_STATUSES,
  RESEARCH_CONTENT_TYPES,
  type ResearchContentStatus,
  type ResearchContentType,
} from "../../modules/content/content.types.js";
import {
  BOOTCAMP_ENROLLMENT_STATUSES,
  type BootcampEnrollmentStatus,
} from "../../modules/enrollment/enrollment.types.js";
import type { ExecutiveSummaryRepository } from "../../modules/executive/executive.repository.js";
import type { ExecutiveSummary } from "../../modules/executive/executive.types.js";
import { WEBINAR_STATUSES, type WebinarStatus } from "../../modules/webinar/webinar.types.js";

function countFor<T extends string>(
  groups: ReadonlyArray<{ count: number; key: T }>,
  key: T,
): number {
  return groups.find((group) => group.key === key)?.count ?? 0;
}

function total(groups: ReadonlyArray<{ count: number }>): number {
  return groups.reduce((sum, group) => sum + group.count, 0);
}

export class PrismaExecutiveSummaryRepository implements ExecutiveSummaryRepository {
  async getSummary(now: Date): Promise<ExecutiveSummary> {
    const [
      roleResult,
      accountStatusResult,
      bootcampStatusResult,
      webinarStatusResult,
      contentStatusResult,
      contentTypeResult,
      enrollmentStatusResult,
      upcomingBootcamps,
      ongoingBootcamps,
      upcomingWebinarsCount,
      topBootcamps,
      upcomingWebinars,
      recentlyPublishedContent,
    ] = await Promise.all([
      prisma.userAccess.groupBy({ by: ["roleCode"], _count: { _all: true } }),
      prisma.userAccess.groupBy({ by: ["accountStatus"], _count: { _all: true } }),
      prisma.bootcamp.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.webinar.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.researchContent.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.researchContent.groupBy({ by: ["contentType"], _count: { _all: true } }),
      prisma.bootcampEnrollment.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.bootcamp.count({
        where: { status: BOOTCAMP_STATUSES.PUBLISHED, startDate: { gt: now } },
      }),
      prisma.bootcamp.count({
        where: {
          status: BOOTCAMP_STATUSES.PUBLISHED,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.webinar.count({
        where: { status: WEBINAR_STATUSES.PUBLISHED, scheduledAt: { gte: now } },
      }),
      prisma.bootcamp.findMany({
        where: {
          status: { in: [BOOTCAMP_STATUSES.PUBLISHED, BOOTCAMP_STATUSES.COMPLETED] },
        },
        orderBy: [{ enrollments: { _count: "desc" } }, { title: "asc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          startDate: true,
          endDate: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.webinar.findMany({
        where: { status: WEBINAR_STATUSES.PUBLISHED, scheduledAt: { gte: now } },
        orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          scheduledAt: true,
          sessionType: true,
        },
      }),
      prisma.researchContent.findMany({
        where: {
          status: RESEARCH_CONTENT_STATUSES.PUBLISHED,
          publishedAt: { not: null, lte: now },
        },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          contentType: true,
          publishedAt: true,
        },
      }),
    ]);

    const roles = roleResult.map((group) => ({ key: group.roleCode, count: group._count._all }));
    const accountStatuses = accountStatusResult.map((group) => ({
      key: group.accountStatus,
      count: group._count._all,
    }));
    const bootcampStatuses = bootcampStatusResult.map((group) => ({
      key: group.status,
      count: group._count._all,
    }));
    const webinarStatuses = webinarStatusResult.map((group) => ({
      key: group.status,
      count: group._count._all,
    }));
    const contentStatuses = contentStatusResult.map((group) => ({
      key: group.status,
      count: group._count._all,
    }));
    const contentTypes = contentTypeResult.map((group) => ({
      key: group.contentType,
      count: group._count._all,
    }));
    const enrollmentStatuses = enrollmentStatusResult.map((group) => ({
      key: group.status,
      count: group._count._all,
    }));

    const byRole: Record<RoleCode, number> = {
      MENTEE: countFor(roles, ROLES.MENTEE),
      MENTOR: countFor(roles, ROLES.MENTOR),
      CEO: countFor(roles, ROLES.CEO),
      COO: countFor(roles, ROLES.COO),
      CMO: countFor(roles, ROLES.CMO),
      SUPERADMIN: countFor(roles, ROLES.SUPERADMIN),
    };
    const byAccountStatus: Record<AccountStatus, number> = {
      PENDING: countFor(accountStatuses, ACCOUNT_STATUSES.PENDING),
      ACTIVE: countFor(accountStatuses, ACCOUNT_STATUSES.ACTIVE),
      SUSPENDED: countFor(accountStatuses, ACCOUNT_STATUSES.SUSPENDED),
      DISABLED: countFor(accountStatuses, ACCOUNT_STATUSES.DISABLED),
    };
    const byBootcampStatus: Record<BootcampStatus, number> = {
      DRAFT: countFor(bootcampStatuses, BOOTCAMP_STATUSES.DRAFT),
      REVIEW: countFor(bootcampStatuses, BOOTCAMP_STATUSES.REVIEW),
      PUBLISHED: countFor(bootcampStatuses, BOOTCAMP_STATUSES.PUBLISHED),
      COMPLETED: countFor(bootcampStatuses, BOOTCAMP_STATUSES.COMPLETED),
      ARCHIVED: countFor(bootcampStatuses, BOOTCAMP_STATUSES.ARCHIVED),
    };
    const byWebinarStatus: Record<WebinarStatus, number> = {
      DRAFT: countFor(webinarStatuses, WEBINAR_STATUSES.DRAFT),
      PUBLISHED: countFor(webinarStatuses, WEBINAR_STATUSES.PUBLISHED),
      COMPLETED: countFor(webinarStatuses, WEBINAR_STATUSES.COMPLETED),
      ARCHIVED: countFor(webinarStatuses, WEBINAR_STATUSES.ARCHIVED),
    };
    const byContentStatus: Record<ResearchContentStatus, number> = {
      DRAFT: countFor(contentStatuses, RESEARCH_CONTENT_STATUSES.DRAFT),
      PUBLISHED: countFor(contentStatuses, RESEARCH_CONTENT_STATUSES.PUBLISHED),
      ARCHIVED: countFor(contentStatuses, RESEARCH_CONTENT_STATUSES.ARCHIVED),
    };
    const byContentType: Record<ResearchContentType, number> = {
      NEWS: countFor(contentTypes, RESEARCH_CONTENT_TYPES.NEWS),
      ARTICLE: countFor(contentTypes, RESEARCH_CONTENT_TYPES.ARTICLE),
      ANNOUNCEMENT: countFor(contentTypes, RESEARCH_CONTENT_TYPES.ANNOUNCEMENT),
    };
    const byEnrollmentStatus: Record<BootcampEnrollmentStatus, number> = {
      ACTIVE: countFor(enrollmentStatuses, BOOTCAMP_ENROLLMENT_STATUSES.ACTIVE),
      COMPLETED: countFor(enrollmentStatuses, BOOTCAMP_ENROLLMENT_STATUSES.COMPLETED),
      CANCELLED: countFor(enrollmentStatuses, BOOTCAMP_ENROLLMENT_STATUSES.CANCELLED),
    };

    return {
      generatedAt: now,
      users: {
        total: total(roles),
        mentees: byRole.MENTEE,
        mentors: byRole.MENTOR,
        staff: byRole.CEO + byRole.COO + byRole.CMO + byRole.SUPERADMIN,
        byRole,
        byAccountStatus,
      },
      bootcamps: {
        total: total(bootcampStatuses),
        upcoming: upcomingBootcamps,
        ongoing: ongoingBootcamps,
        byStatus: byBootcampStatus,
      },
      webinars: {
        total: total(webinarStatuses),
        upcoming: upcomingWebinarsCount,
        byStatus: byWebinarStatus,
      },
      content: {
        total: total(contentStatuses),
        byStatus: byContentStatus,
        byType: byContentType,
      },
      enrollments: {
        total: total(enrollmentStatuses),
        byStatus: byEnrollmentStatus,
        topBootcamps: topBootcamps.map((bootcamp) => ({
          id: bootcamp.id,
          title: bootcamp.title,
          slug: bootcamp.slug,
          status: bootcamp.status,
          startDate: bootcamp.startDate,
          endDate: bootcamp.endDate,
          participantCount: bootcamp._count.enrollments,
        })),
      },
      activity: {
        upcomingWebinars,
        recentlyPublishedContent: recentlyPublishedContent.flatMap((content) =>
          content.publishedAt
            ? [
                {
                  id: content.id,
                  title: content.title,
                  slug: content.slug,
                  type: content.contentType,
                  publishedAt: content.publishedAt,
                },
              ]
            : [],
        ),
      },
    };
  }
}
