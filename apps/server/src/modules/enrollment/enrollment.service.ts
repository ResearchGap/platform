import { createHash, randomBytes } from "node:crypto";

import { AuthorizationError, authorize, can } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import { PERMISSIONS } from "../../authorization/permissions";
import { BOOTCAMP_STATUSES, type BootcampDetail } from "../bootcamp/bootcamp.types";
import { BootcampNotEnrollableError, EnrollmentNotFoundError } from "./enrollment.errors";
import type { EnrollmentRepository } from "./enrollment.repository";
import type {
  CreateEnrollmentKeyInput,
  EligibleMentorListInput,
  EnrollmentKeyPageInput,
  MyBootcampListInput,
  ParticipantListInput,
} from "./enrollment.types";

function hashEnrollmentKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

function generateEnrollmentKey(): { codeHash: string; keyHint: string; rawKey: string } {
  const rawKey = `RG-${randomBytes(32).toString("base64url")}`;
  return {
    rawKey,
    codeHash: hashEnrollmentKey(rawKey),
    keyHint: rawKey.slice(-6),
  };
}

export class EnrollmentService {
  constructor(
    private readonly repository: EnrollmentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async createKey(actor: AuthorizationActor, bootcampId: string, input: CreateEnrollmentKeyInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE);
    const bootcamp = await this.assertManagedBootcamp(actor, bootcampId);
    if (
      bootcamp.status === BOOTCAMP_STATUSES.COMPLETED ||
      bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED
    ) {
      throw new BootcampNotEnrollableError("Bootcamp no longer accepts enrollment keys");
    }
    const now = this.now();
    if (input.expiresAt && input.expiresAt <= now) {
      throw new BootcampNotEnrollableError("Enrollment key expiration must be in the future");
    }
    const generated = generateEnrollmentKey();
    const key = await this.repository.createKey({
      ...input,
      bootcampId,
      codeHash: generated.codeHash,
      keyHint: generated.keyHint,
      createdById: actor.userId,
    });
    return { key, rawKey: generated.rawKey };
  }

  async listKeys(actor: AuthorizationActor, bootcampId: string, input: EnrollmentKeyPageInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE);
    await this.assertManagedBootcamp(actor, bootcampId);
    return this.repository.listKeys(bootcampId, input, this.now());
  }

  async deactivateKey(actor: AuthorizationActor, bootcampId: string, keyId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE);
    await this.assertManagedBootcamp(actor, bootcampId);
    const key = await this.repository.deactivateKey(bootcampId, keyId);
    if (!key) {
      throw new EnrollmentNotFoundError("Enrollment key was not found");
    }
    return key;
  }

  async enrollMentee(actor: AuthorizationActor, bootcampId: string, rawKey: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_ENROLL);
    return this.repository.enrollMentee({
      bootcampId,
      menteeId: actor.userId,
      codeHash: hashEnrollmentKey(rawKey),
      now: this.now(),
    });
  }

  async joinAsMentor(actor: AuthorizationActor, bootcampId: string, rawKey: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MENTOR_JOIN);
    return this.repository.joinMentor({
      bootcampId,
      mentorId: actor.userId,
      codeHash: hashEnrollmentKey(rawKey),
      now: this.now(),
    });
  }

  async listEligibleMentors(actor: AuthorizationActor, input: EligibleMentorListInput) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN);
    return this.repository.listEligibleMentors(input);
  }

  async assignMentor(actor: AuthorizationActor, bootcampId: string, mentorId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN);
    const bootcamp = await this.getBootcamp(bootcampId);
    if (
      bootcamp.status === BOOTCAMP_STATUSES.COMPLETED ||
      bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED
    ) {
      throw new BootcampNotEnrollableError("Bootcamp no longer accepts Mentor assignments");
    }
    return this.repository.assignMentor({
      bootcampId,
      mentorId,
      assignedById: actor.userId,
      assignedAt: this.now(),
    });
  }

  async removeMentor(actor: AuthorizationActor, bootcampId: string, mentorId: string) {
    authorize(actor, PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN);
    await this.getBootcamp(bootcampId);
    if (!(await this.repository.removeMentor({ bootcampId, mentorId, removedAt: this.now() }))) {
      throw new EnrollmentNotFoundError("Active Mentor assignment was not found");
    }
  }

  async listMentors(
    actor: AuthorizationActor,
    bootcampId: string,
    input: { cursor?: string; limit: number },
  ) {
    authorize(actor, PERMISSIONS.BOOTCAMP_PARTICIPANT_READ);
    await this.assertManagedBootcamp(actor, bootcampId);
    return this.repository.listMentors(bootcampId, input);
  }

  async listParticipants(
    actor: AuthorizationActor,
    bootcampId: string,
    input: ParticipantListInput,
  ) {
    authorize(actor, PERMISSIONS.BOOTCAMP_PARTICIPANT_READ);
    await this.assertManagedBootcamp(actor, bootcampId);
    return this.repository.listParticipants(bootcampId, input);
  }

  async listMyBootcamps(actor: AuthorizationActor, input: MyBootcampListInput) {
    authorize(actor, PERMISSIONS.ENROLLMENT_READ_OWN);
    return this.repository.listMyBootcamps(actor.userId, input);
  }

  async getMyLearningAccess(actor: AuthorizationActor, bootcampId: string) {
    authorize(actor, PERMISSIONS.ENROLLMENT_READ_OWN);
    const access = await this.repository.getLearningAccess(actor.userId, bootcampId);
    if (!access) {
      throw new EnrollmentNotFoundError("Enrolled Bootcamp access was not found");
    }
    return access;
  }

  async listMyMentorBootcamps(
    actor: AuthorizationActor,
    input: { cursor?: string; limit: number },
  ) {
    authorize(actor, PERMISSIONS.BOOTCAMP_READ);
    return this.repository.listMentorBootcamps(actor.userId, input);
  }

  private async getBootcamp(bootcampId: string): Promise<BootcampDetail> {
    const bootcamp = await this.repository.findBootcamp(bootcampId);
    if (!bootcamp) {
      throw new EnrollmentNotFoundError("Bootcamp was not found");
    }
    return bootcamp;
  }

  private async assertManagedBootcamp(actor: AuthorizationActor, bootcampId: string) {
    const bootcamp = await this.getBootcamp(bootcampId);
    if (bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED) {
      throw new BootcampNotEnrollableError("Archived Bootcamps cannot be managed for enrollment");
    }
    if (
      bootcamp.createdById !== actor.userId &&
      !can(actor, PERMISSIONS.BOOTCAMP_MANAGE_ALL) &&
      !(await this.repository.isActiveMentor(bootcampId, actor.userId))
    ) {
      throw new AuthorizationError();
    }
    return bootcamp;
  }
}
