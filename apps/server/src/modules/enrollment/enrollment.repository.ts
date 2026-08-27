import type { BootcampDetail, BootcampSummary } from "../bootcamp/bootcamp.types";
import type {
  BootcampEnrollmentDetail,
  BootcampMentorDetail,
  CreateEnrollmentKeyInput,
  EligibleMentor,
  EligibleMentorListInput,
  EnrollmentKeyDetail,
  EnrollmentKeyPageInput,
  EnrollmentPage,
  LearningBootcampAccess,
  MyBootcampEnrollment,
  MyBootcampListInput,
  ParticipantDetail,
  ParticipantListInput,
} from "./enrollment.types";

export interface EnrollmentRepository {
  assignMentor(input: {
    assignedAt: Date;
    assignedById: string;
    bootcampId: string;
    mentorId: string;
  }): Promise<BootcampMentorDetail>;
  createKey(
    input: CreateEnrollmentKeyInput & {
      bootcampId: string;
      codeHash: string;
      createdById: string;
      keyHint: string;
    },
  ): Promise<EnrollmentKeyDetail>;
  deactivateKey(bootcampId: string, keyId: string): Promise<EnrollmentKeyDetail | null>;
  enrollMentee(input: {
    bootcampId: string;
    codeHash: string;
    menteeId: string;
    now: Date;
  }): Promise<BootcampEnrollmentDetail>;
  findBootcamp(bootcampId: string): Promise<BootcampDetail | null>;
  getLearningAccess(menteeId: string, bootcampId: string): Promise<LearningBootcampAccess | null>;
  isActiveMentor(bootcampId: string, userId: string): Promise<boolean>;
  joinMentor(input: {
    bootcampId: string;
    codeHash: string;
    mentorId: string;
    now: Date;
  }): Promise<BootcampMentorDetail>;
  listEligibleMentors(input: EligibleMentorListInput): Promise<EnrollmentPage<EligibleMentor>>;
  listKeys(
    bootcampId: string,
    input: EnrollmentKeyPageInput,
    now: Date,
  ): Promise<EnrollmentPage<EnrollmentKeyDetail>>;
  listMentorBootcamps(
    mentorId: string,
    input: { cursor?: string; limit: number },
  ): Promise<EnrollmentPage<BootcampSummary>>;
  listMentors(
    bootcampId: string,
    input: { cursor?: string; limit: number },
  ): Promise<EnrollmentPage<BootcampMentorDetail>>;
  listMyBootcamps(
    menteeId: string,
    input: MyBootcampListInput,
  ): Promise<EnrollmentPage<MyBootcampEnrollment>>;
  listParticipants(
    bootcampId: string,
    input: ParticipantListInput,
  ): Promise<EnrollmentPage<ParticipantDetail>>;
  removeMentor(input: { bootcampId: string; mentorId: string; removedAt: Date }): Promise<boolean>;
}
