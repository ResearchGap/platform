import prisma from "@platform/db";

import { ACCOUNT_STATUSES, ROLES } from "../../authorization/authorization.types.js";
import {
  BOOTCAMP_STATUSES,
  type BootcampDetail,
  type BootcampSessionDetail,
  type BootcampSummary,
} from "../../modules/bootcamp/bootcamp.types.js";
import {
  BootcampNotEnrollableError,
  EnrollmentConflictError,
  EnrollmentEligibilityError,
  EnrollmentKeyInvalidError,
  EnrollmentKeyUnavailableError,
} from "../../modules/enrollment/enrollment.errors.js";
import { evaluateEnrollmentKeyStatus } from "../../modules/enrollment/enrollment-key-status.js";
import type { EnrollmentRepository } from "../../modules/enrollment/enrollment.repository.js";
import {
  BOOTCAMP_ENROLLMENT_STATUSES,
  BOOTCAMP_MENTOR_SOURCES,
  BOOTCAMP_MENTOR_STATUSES,
  ENROLLMENT_KEY_AUDIENCES,
  ENROLLMENT_KEY_STATUSES,
  PERSISTED_ENROLLMENT_KEY_STATUSES,
  type BootcampEnrollmentDetail,
  type BootcampMentorDetail,
  type CreateEnrollmentKeyInput,
  type EligibleMentor,
  type EligibleMentorListInput,
  type EnrollmentKeyDetail,
  type EnrollmentKeyPageInput,
  type EnrollmentPage,
  type LearningBootcampAccess,
  type MyBootcampEnrollment,
  type MyBootcampListInput,
  type ParticipantDetail,
  type ParticipantListInput,
  type PersistedEnrollmentKeyStatus,
} from "../../modules/enrollment/enrollment.types.js";

const personSelect = { id: true, name: true } as const;
const personWithEmailSelect = { id: true, name: true, email: true } as const;
const coverSelect = {
  id: true,
  externalUrl: true,
  mimeType: true,
  originalName: true,
} as const;
const bootcampSummarySelect = {
  id: true,
  title: true,
  slug: true,
  whatYouGet: true,
  startDate: true,
  endDate: true,
  registrationDeadline: true,
  coverAssetId: true,
  status: true,
  createdById: true,
  publishedById: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: personSelect },
  publishedBy: { select: personSelect },
  coverAsset: { select: coverSelect },
} as const;
const bootcampDetailSelect = { ...bootcampSummarySelect, description: true } as const;
const sessionSelect = {
  id: true,
  bootcampId: true,
  title: true,
  description: true,
  speakerName: true,
  scheduledAt: true,
  sessionType: true,
  venue: true,
  moduleUrl: true,
  preTestUrl: true,
  postTestUrl: true,
  feedbackUrl: true,
  recordingUrl: true,
  coverAssetId: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  coverAsset: { select: coverSelect },
} as const;
const keySelect = {
  id: true,
  bootcampId: true,
  keyHint: true,
  audience: true,
  status: true,
  expiresAt: true,
  maxUses: true,
  usageCount: true,
  createdById: true,
  createdAt: true,
  createdBy: { select: personSelect },
} as const;
const enrollmentSelect = {
  id: true,
  bootcampId: true,
  menteeId: true,
  enrollmentKeyId: true,
  status: true,
  enrolledAt: true,
} as const;
const mentorSelect = {
  id: true,
  bootcampId: true,
  mentorId: true,
  assignmentSource: true,
  enrollmentKeyId: true,
  assignedById: true,
  status: true,
  assignedAt: true,
  updatedAt: true,
  mentor: { select: personWithEmailSelect },
  assignedBy: { select: personSelect },
} as const;

interface PersistedBootcampSummary {
  coverAsset: BootcampSummary["cover"];
  coverAssetId: string | null;
  createdAt: Date;
  createdBy: BootcampSummary["createdBy"];
  createdById: string;
  endDate: Date;
  id: string;
  publishedAt: Date | null;
  publishedBy: BootcampSummary["publishedBy"];
  publishedById: string | null;
  registrationDeadline: Date | null;
  slug: string;
  startDate: Date;
  status: BootcampSummary["status"];
  title: string;
  updatedAt: Date;
  whatYouGet: string | null;
}

interface PersistedBootcampDetail extends PersistedBootcampSummary {
  description: string;
}

function toBootcampSummary(record: PersistedBootcampSummary): BootcampSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    whatYouGet: record.whatYouGet,
    startDate: record.startDate,
    endDate: record.endDate,
    registrationDeadline: record.registrationDeadline,
    coverAssetId: record.coverAssetId,
    cover: record.coverAsset,
    status: record.status,
    createdById: record.createdById,
    createdBy: record.createdBy,
    publishedById: record.publishedById,
    publishedBy: record.publishedBy,
    publishedAt: record.publishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toBootcampDetail(record: PersistedBootcampDetail): BootcampDetail {
  return { ...toBootcampSummary(record), description: record.description };
}

function toSession(record: {
  bootcampId: string;
  coverAsset: BootcampSessionDetail["cover"];
  coverAssetId: string | null;
  createdAt: Date;
  description: string | null;
  feedbackUrl: string | null;
  id: string;
  moduleUrl: string | null;
  postTestUrl: string | null;
  preTestUrl: string | null;
  recordingUrl: string | null;
  scheduledAt: Date;
  sessionType: BootcampSessionDetail["sessionType"];
  sortOrder: number;
  speakerName: string | null;
  title: string;
  updatedAt: Date;
  venue: string | null;
}): BootcampSessionDetail {
  const { coverAsset, ...session } = record;
  return { ...session, cover: coverAsset };
}

function toKey(
  record: {
    audience: EnrollmentKeyDetail["audience"];
    bootcampId: string;
    createdAt: Date;
    createdBy: EnrollmentKeyDetail["createdBy"];
    createdById: string;
    expiresAt: Date | null;
    id: string;
    keyHint: string | null;
    maxUses: number | null;
    status: PersistedEnrollmentKeyStatus;
    usageCount: number;
  },
  now = new Date(),
): EnrollmentKeyDetail {
  return { ...record, status: evaluateEnrollmentKeyStatus(record, now) };
}

function toEnrollment(record: BootcampEnrollmentDetail): BootcampEnrollmentDetail {
  return record;
}

function toMentor(record: BootcampMentorDetail): BootcampMentorDetail {
  return record;
}

function toPage<T extends { id: string }, R>(
  records: T[],
  limit: number,
  map: (record: T) => R,
): EnrollmentPage<R> {
  const hasNextPage = records.length > limit;
  const pageRecords = hasNextPage ? records.slice(0, limit) : records;
  return {
    items: pageRecords.map(map),
    nextCursor: hasNextPage ? (pageRecords.at(-1)?.id ?? null) : null,
  };
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

async function retrySerializable<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!hasPrismaCode(error, "P2034") || attempt === 2) {
        throw error;
      }
    }
  }
  throw new EnrollmentConflictError("Concurrent enrollment could not be completed");
}

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  async findBootcamp(bootcampId: string): Promise<BootcampDetail | null> {
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
      select: bootcampDetailSelect,
    });
    return bootcamp ? toBootcampDetail(bootcamp) : null;
  }

  async isActiveMentor(bootcampId: string, userId: string): Promise<boolean> {
    return (
      (await prisma.bootcampMentor.count({
        where: { bootcampId, mentorId: userId, status: BOOTCAMP_MENTOR_STATUSES.ACTIVE },
      })) === 1
    );
  }

  async createKey(
    input: CreateEnrollmentKeyInput & {
      bootcampId: string;
      codeHash: string;
      createdById: string;
      keyHint: string;
    },
  ): Promise<EnrollmentKeyDetail> {
    const record = await prisma.enrollmentKey.create({
      data: {
        bootcampId: input.bootcampId,
        codeHash: input.codeHash,
        keyHint: input.keyHint,
        audience: input.audience,
        expiresAt: input.expiresAt,
        maxUses: input.maxUses,
        createdById: input.createdById,
      },
      select: keySelect,
    });
    return toKey(record);
  }

  async listKeys(
    bootcampId: string,
    input: EnrollmentKeyPageInput,
    now: Date,
  ): Promise<EnrollmentPage<EnrollmentKeyDetail>> {
    const statusFilter =
      input.status === ENROLLMENT_KEY_STATUSES.EXPIRED
        ? {
            status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
            expiresAt: { lte: now },
          }
        : input.status === ENROLLMENT_KEY_STATUSES.EXHAUSTED
          ? {
              status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
              maxUses: { not: null },
              usageCount: { gte: prisma.enrollmentKey.fields.maxUses },
            }
          : input.status === ENROLLMENT_KEY_STATUSES.ACTIVE
            ? {
                status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
                AND: [
                  { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
                  {
                    OR: [
                      { maxUses: null },
                      { usageCount: { lt: prisma.enrollmentKey.fields.maxUses } },
                    ],
                  },
                ],
              }
            : input.status
              ? { status: input.status }
              : {};
    const records = await prisma.enrollmentKey.findMany({
      where: {
        bootcampId,
        ...(input.audience ? { audience: input.audience } : {}),
        ...statusFilter,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: keySelect,
    });
    return toPage(records, input.limit, (record) => toKey(record, now));
  }

  async deactivateKey(bootcampId: string, keyId: string): Promise<EnrollmentKeyDetail | null> {
    const updated = await prisma.enrollmentKey.updateMany({
      where: { id: keyId, bootcampId },
      data: { status: PERSISTED_ENROLLMENT_KEY_STATUSES.INACTIVE },
    });
    if (updated.count !== 1) {
      return null;
    }
    const record = await prisma.enrollmentKey.findUnique({
      where: { id: keyId },
      select: keySelect,
    });
    return record ? toKey(record) : null;
  }

  async enrollMentee(input: {
    bootcampId: string;
    codeHash: string;
    menteeId: string;
    now: Date;
  }): Promise<BootcampEnrollmentDetail> {
    try {
      return await retrySerializable(() =>
        prisma.$transaction(
          async (transaction) => {
            const key = await transaction.enrollmentKey.findUnique({
              where: { codeHash: input.codeHash },
              include: {
                bootcamp: {
                  select: { id: true, status: true, registrationDeadline: true },
                },
              },
            });
            const access = await transaction.userAccess.findUnique({
              where: { userId: input.menteeId },
              select: { roleCode: true, accountStatus: true },
            });

            if (
              !access ||
              access.accountStatus !== ACCOUNT_STATUSES.ACTIVE ||
              access.roleCode !== ROLES.MENTEE
            ) {
              throw new EnrollmentEligibilityError("Only an active Mentee may enroll");
            }
            this.assertUsableKey(key, input.bootcampId, ENROLLMENT_KEY_AUDIENCES.MENTEE, input.now);
            if (key.bootcamp.status !== BOOTCAMP_STATUSES.PUBLISHED) {
              throw new BootcampNotEnrollableError();
            }
            if (
              key.bootcamp.registrationDeadline &&
              key.bootcamp.registrationDeadline < input.now
            ) {
              throw new BootcampNotEnrollableError("Bootcamp registration deadline has passed");
            }

            const enrollment = await transaction.bootcampEnrollment.create({
              data: {
                bootcampId: input.bootcampId,
                menteeId: input.menteeId,
                enrollmentKeyId: key.id,
                enrolledAt: input.now,
              },
              select: enrollmentSelect,
            });
            await transaction.enrollmentKey.update({
              where: { id: key.id },
              data: { usageCount: { increment: 1 } },
            });
            return toEnrollment(enrollment);
          },
          { isolationLevel: "Serializable" },
        ),
      );
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new EnrollmentConflictError("Mentee is already enrolled in this Bootcamp");
      }
      if (hasPrismaCode(error, "P2034")) {
        throw new EnrollmentConflictError("Concurrent enrollment could not be completed; retry");
      }
      throw error;
    }
  }

  async joinMentor(input: {
    bootcampId: string;
    codeHash: string;
    mentorId: string;
    now: Date;
  }): Promise<BootcampMentorDetail> {
    try {
      return await retrySerializable(() =>
        prisma.$transaction(
          async (transaction) => {
            const key = await transaction.enrollmentKey.findUnique({
              where: { codeHash: input.codeHash },
              include: { bootcamp: { select: { id: true, status: true } } },
            });
            const access = await transaction.userAccess.findUnique({
              where: { userId: input.mentorId },
              select: { roleCode: true, accountStatus: true },
            });
            const existing = await transaction.bootcampMentor.findUnique({
              where: {
                bootcampId_mentorId: {
                  bootcampId: input.bootcampId,
                  mentorId: input.mentorId,
                },
              },
            });

            if (
              !access ||
              access.accountStatus !== ACCOUNT_STATUSES.ACTIVE ||
              access.roleCode !== ROLES.MENTOR
            ) {
              throw new EnrollmentEligibilityError("Only an active Mentor may join a Bootcamp");
            }
            this.assertUsableKey(key, input.bootcampId, ENROLLMENT_KEY_AUDIENCES.MENTOR, input.now);
            if (
              key.bootcamp.status === BOOTCAMP_STATUSES.COMPLETED ||
              key.bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED
            ) {
              throw new BootcampNotEnrollableError("Bootcamp no longer accepts Mentor assignments");
            }
            if (existing?.status === BOOTCAMP_MENTOR_STATUSES.ACTIVE) {
              throw new EnrollmentConflictError("Mentor is already assigned to this Bootcamp");
            }

            const mentor = existing
              ? await transaction.bootcampMentor.update({
                  where: { id: existing.id },
                  data: {
                    assignmentSource: BOOTCAMP_MENTOR_SOURCES.SELF_ENROLLED,
                    enrollmentKeyId: key.id,
                    assignedById: null,
                    status: BOOTCAMP_MENTOR_STATUSES.ACTIVE,
                    assignedAt: input.now,
                  },
                  select: mentorSelect,
                })
              : await transaction.bootcampMentor.create({
                  data: {
                    bootcampId: input.bootcampId,
                    mentorId: input.mentorId,
                    assignmentSource: BOOTCAMP_MENTOR_SOURCES.SELF_ENROLLED,
                    enrollmentKeyId: key.id,
                    assignedAt: input.now,
                  },
                  select: mentorSelect,
                });
            await transaction.enrollmentKey.update({
              where: { id: key.id },
              data: { usageCount: { increment: 1 } },
            });
            return toMentor(mentor);
          },
          { isolationLevel: "Serializable" },
        ),
      );
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new EnrollmentConflictError("Mentor is already assigned to this Bootcamp");
      }
      if (hasPrismaCode(error, "P2034")) {
        throw new EnrollmentConflictError("Concurrent Mentor join could not be completed; retry");
      }
      throw error;
    }
  }

  async assignMentor(input: {
    assignedAt: Date;
    assignedById: string;
    bootcampId: string;
    mentorId: string;
  }): Promise<BootcampMentorDetail> {
    try {
      return await prisma.$transaction(async (transaction) => {
        const access = await transaction.userAccess.findUnique({
          where: { userId: input.mentorId },
          select: { roleCode: true, accountStatus: true },
        });
        const existing = await transaction.bootcampMentor.findUnique({
          where: {
            bootcampId_mentorId: {
              bootcampId: input.bootcampId,
              mentorId: input.mentorId,
            },
          },
        });
        if (
          !access ||
          access.accountStatus !== ACCOUNT_STATUSES.ACTIVE ||
          access.roleCode !== ROLES.MENTOR
        ) {
          throw new EnrollmentEligibilityError("Selected user is not an active Mentor");
        }
        if (existing?.status === BOOTCAMP_MENTOR_STATUSES.ACTIVE) {
          throw new EnrollmentConflictError("Mentor is already assigned to this Bootcamp");
        }
        const data = {
          assignmentSource: BOOTCAMP_MENTOR_SOURCES.STAFF_ASSIGNED,
          enrollmentKeyId: null,
          assignedById: input.assignedById,
          status: BOOTCAMP_MENTOR_STATUSES.ACTIVE,
          assignedAt: input.assignedAt,
        } as const;
        const mentor = existing
          ? await transaction.bootcampMentor.update({
              where: { id: existing.id },
              data,
              select: mentorSelect,
            })
          : await transaction.bootcampMentor.create({
              data: {
                ...data,
                bootcampId: input.bootcampId,
                mentorId: input.mentorId,
              },
              select: mentorSelect,
            });
        return toMentor(mentor);
      });
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new EnrollmentConflictError("Mentor is already assigned to this Bootcamp");
      }
      throw error;
    }
  }

  async removeMentor(input: {
    bootcampId: string;
    mentorId: string;
    removedAt: Date;
  }): Promise<boolean> {
    const result = await prisma.bootcampMentor.updateMany({
      where: {
        bootcampId: input.bootcampId,
        mentorId: input.mentorId,
        status: BOOTCAMP_MENTOR_STATUSES.ACTIVE,
        assignmentSource: { not: BOOTCAMP_MENTOR_SOURCES.CREATOR },
      },
      data: {
        status: BOOTCAMP_MENTOR_STATUSES.INACTIVE,
        updatedAt: input.removedAt,
      },
    });
    return result.count === 1;
  }

  async listMentors(
    bootcampId: string,
    input: { cursor?: string; limit: number },
  ): Promise<EnrollmentPage<BootcampMentorDetail>> {
    const records = await prisma.bootcampMentor.findMany({
      where: { bootcampId, status: BOOTCAMP_MENTOR_STATUSES.ACTIVE },
      orderBy: [{ assignedAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: mentorSelect,
    });
    return toPage(records, input.limit, toMentor);
  }

  async listEligibleMentors(
    input: EligibleMentorListInput,
  ): Promise<EnrollmentPage<EligibleMentor>> {
    const records = await prisma.user.findMany({
      where: {
        access: { is: { roleCode: ROLES.MENTOR, accountStatus: ACCOUNT_STATUSES.ACTIVE } },
        ...(input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: "insensitive" as const } },
                { email: { contains: input.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        name: true,
        email: true,
        profile: { select: { affiliation: true, expertise: true, researchField: true } },
      },
    });
    return toPage(records, input.limit, (record) => record);
  }

  async listParticipants(
    bootcampId: string,
    input: ParticipantListInput,
  ): Promise<EnrollmentPage<ParticipantDetail>> {
    const records = await prisma.bootcampEnrollment.findMany({
      where: {
        bootcampId,
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: {
        ...enrollmentSelect,
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { institution: true, nickname: true, researchField: true } },
          },
        },
      },
    });
    return toPage(records, input.limit, (record) => record);
  }

  async listMyBootcamps(
    menteeId: string,
    input: MyBootcampListInput,
  ): Promise<EnrollmentPage<MyBootcampEnrollment>> {
    const records = await prisma.bootcampEnrollment.findMany({
      where: {
        menteeId,
        status: input.status ?? {
          in: [BOOTCAMP_ENROLLMENT_STATUSES.ACTIVE, BOOTCAMP_ENROLLMENT_STATUSES.COMPLETED],
        },
      },
      orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: { ...enrollmentSelect, bootcamp: { select: bootcampSummarySelect } },
    });
    return toPage(records, input.limit, (record) => ({
      ...toEnrollment(record),
      bootcamp: toBootcampSummary(record.bootcamp),
    }));
  }

  async getLearningAccess(
    menteeId: string,
    bootcampId: string,
  ): Promise<LearningBootcampAccess | null> {
    const enrollment = await prisma.bootcampEnrollment.findFirst({
      where: {
        bootcampId,
        menteeId,
        status: BOOTCAMP_ENROLLMENT_STATUSES.ACTIVE,
        bootcamp: {
          status: { in: [BOOTCAMP_STATUSES.PUBLISHED, BOOTCAMP_STATUSES.COMPLETED] },
        },
      },
      select: {
        ...enrollmentSelect,
        bootcamp: {
          select: {
            ...bootcampDetailSelect,
            sessions: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
              select: sessionSelect,
            },
          },
        },
      },
    });
    if (!enrollment) {
      return null;
    }
    return {
      enrollment: toEnrollment(enrollment),
      bootcamp: toBootcampDetail(enrollment.bootcamp),
      sessions: enrollment.bootcamp.sessions.map(toSession),
    };
  }

  async listMentorBootcamps(
    mentorId: string,
    input: { cursor?: string; limit: number },
  ): Promise<EnrollmentPage<BootcampSummary>> {
    const records = await prisma.bootcampMentor.findMany({
      where: { mentorId, status: BOOTCAMP_MENTOR_STATUSES.ACTIVE },
      orderBy: [{ assignedAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: { id: true, bootcamp: { select: bootcampSummarySelect } },
    });
    return toPage(records, input.limit, (record) => toBootcampSummary(record.bootcamp));
  }

  private assertUsableKey(
    key: {
      audience: "MENTEE" | "MENTOR";
      bootcampId: string;
      expiresAt: Date | null;
      maxUses: number | null;
      status: PersistedEnrollmentKeyStatus;
      usageCount: number;
    } | null,
    bootcampId: string,
    audience: "MENTEE" | "MENTOR",
    now: Date,
  ): asserts key is {
    audience: "MENTEE" | "MENTOR";
    bootcampId: string;
    expiresAt: Date | null;
    id: string;
    maxUses: number | null;
    status: PersistedEnrollmentKeyStatus;
    usageCount: number;
    bootcamp: { id: string; status: BootcampSummary["status"]; registrationDeadline?: Date | null };
  } {
    if (!key || key.bootcampId !== bootcampId) {
      throw new EnrollmentKeyInvalidError();
    }
    if (key.audience !== audience) {
      throw new EnrollmentKeyInvalidError(`Enrollment key is not valid for ${audience}`);
    }
    const effectiveStatus = evaluateEnrollmentKeyStatus(key, now);
    if (effectiveStatus === ENROLLMENT_KEY_STATUSES.INACTIVE) {
      throw new EnrollmentKeyUnavailableError("Enrollment key is inactive");
    }
    if (effectiveStatus === ENROLLMENT_KEY_STATUSES.EXPIRED) {
      throw new EnrollmentKeyUnavailableError("Enrollment key has expired");
    }
    if (effectiveStatus === ENROLLMENT_KEY_STATUSES.EXHAUSTED) {
      throw new EnrollmentKeyUnavailableError("Enrollment key usage limit has been reached");
    }
  }
}
