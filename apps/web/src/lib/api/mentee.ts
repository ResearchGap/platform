import { apiRequest } from "./client";
import type {
  EnrollmentStatus,
  LearningBootcampAccess,
  MenteePage,
  MyBootcampEnrollment,
} from "./mentee-types";

export function listMyBootcamps(
  input: {
    cursor?: string;
    limit?: number;
    status?: Extract<EnrollmentStatus, "ACTIVE" | "COMPLETED">;
  } = {},
  init: RequestInit = {},
) {
  return apiRequest<MenteePage<MyBootcampEnrollment>>(
    "/api/me/bootcamps",
    { cache: "no-store", ...init },
    { cursor: input.cursor, limit: input.limit ?? 20, status: input.status },
  );
}

export function getMyLearningAccess(bootcampId: string, init: RequestInit = {}) {
  return apiRequest<LearningBootcampAccess>(`/api/me/bootcamps/${encodeURIComponent(bootcampId)}`, {
    cache: "no-store",
    ...init,
  });
}

export function enrollInBootcamp(bootcampId: string, key: string) {
  return apiRequest<Omit<MyBootcampEnrollment, "bootcamp">>(
    `/api/bootcamps/${encodeURIComponent(bootcampId)}/enroll`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    },
  );
}
