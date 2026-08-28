import { apiRequest } from "./client";
import type {
  BootcampInput,
  BootcampMentorAssignment,
  BootcampSessionInput,
  BootcampStatus,
  CreatedEnrollmentKey,
  ContentInput,
  ContentStatus,
  CursorPage,
  EligibleMentor,
  EnrollmentKeyDetail,
  ManagedBootcampDetail,
  ManagedBootcampSession,
  ManagedBootcampSummary,
  ManagedContentDetail,
  ManagedContentSummary,
  ManagedWebinarDetail,
  ManagedWebinarSummary,
  Participant,
  WebinarInput,
  WebinarStatus,
} from "./mentor-types";
import type { ContentType } from "./public-types";

const encoded = encodeURIComponent;

export function listManagedBootcamps(
  input: {
    cursor?: string;
    limit?: number;
    status?: BootcampStatus;
    timing?: "UPCOMING" | "ONGOING" | "COMPLETED";
  } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<ManagedBootcampSummary>>(
    "/api/bootcamps",
    { cache: "no-store", ...init },
    {
      cursor: input.cursor,
      limit: input.limit ?? 20,
      status: input.status,
      timing: input.timing,
    },
  );
}

export function getManagedBootcamp(id: string, init: RequestInit = {}) {
  return apiRequest<ManagedBootcampDetail>(`/api/bootcamps/${encoded(id)}`, {
    cache: "no-store",
    ...init,
  });
}

export function createBootcamp(input: BootcampInput) {
  return apiRequest<ManagedBootcampDetail>("/api/bootcamps", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateBootcamp(id: string, input: BootcampInput) {
  return apiRequest<ManagedBootcampDetail>(`/api/bootcamps/${encoded(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function submitBootcamp(id: string) {
  return apiRequest<ManagedBootcampDetail>(`/api/bootcamps/${encoded(id)}/submit`, {
    method: "POST",
  });
}

export function listBootcampSessions(id: string, init: RequestInit = {}) {
  return apiRequest<ManagedBootcampSession[]>(`/api/bootcamps/${encoded(id)}/sessions`, {
    cache: "no-store",
    ...init,
  });
}

export function getBootcampSession(bootcampId: string, sessionId: string, init: RequestInit = {}) {
  return apiRequest<ManagedBootcampSession>(
    `/api/bootcamps/${encoded(bootcampId)}/sessions/${encoded(sessionId)}`,
    { cache: "no-store", ...init },
  );
}

export function createBootcampSession(bootcampId: string, input: BootcampSessionInput) {
  return apiRequest<ManagedBootcampSession>(`/api/bootcamps/${encoded(bootcampId)}/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateBootcampSession(
  bootcampId: string,
  sessionId: string,
  input: BootcampSessionInput,
) {
  return apiRequest<ManagedBootcampSession>(
    `/api/bootcamps/${encoded(bootcampId)}/sessions/${encoded(sessionId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function reorderBootcampSessions(bootcampId: string, sessionIds: string[]) {
  return apiRequest<ManagedBootcampSession[]>(
    `/api/bootcamps/${encoded(bootcampId)}/sessions/reorder`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionIds }),
    },
  );
}

export function deleteBootcampSession(bootcampId: string, sessionId: string) {
  return apiRequest<void>(`/api/bootcamps/${encoded(bootcampId)}/sessions/${encoded(sessionId)}`, {
    method: "DELETE",
  });
}

export function joinBootcampAsMentor(bootcampId: string, key: string) {
  return apiRequest<BootcampMentorAssignment>(
    `/api/bootcamps/${encoded(bootcampId)}/mentors/join`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    },
  );
}

export function listBootcampMentors(
  bootcampId: string,
  input: { cursor?: string; limit?: number } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<BootcampMentorAssignment>>(
    `/api/bootcamps/${encoded(bootcampId)}/mentors`,
    { cache: "no-store", ...init },
    { cursor: input.cursor, limit: input.limit ?? 50 },
  );
}

export function listEligibleMentors(
  input: { cursor?: string; limit?: number; search?: string } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<EligibleMentor>>(
    "/api/mentors/eligible",
    { cache: "no-store", ...init },
    { cursor: input.cursor, limit: input.limit ?? 25, search: input.search },
  );
}

export function assignBootcampMentor(bootcampId: string, mentorId: string) {
  return apiRequest<BootcampMentorAssignment>(`/api/bootcamps/${encoded(bootcampId)}/mentors`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mentorId }),
  });
}

export function removeBootcampMentor(bootcampId: string, mentorId: string) {
  return apiRequest<void>(`/api/bootcamps/${encoded(bootcampId)}/mentors/${encoded(mentorId)}`, {
    method: "DELETE",
  });
}

export function listEnrollmentKeys(
  bootcampId: string,
  input: {
    audience?: EnrollmentKeyDetail["audience"];
    cursor?: string;
    limit?: number;
    status?: EnrollmentKeyDetail["status"];
  } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<EnrollmentKeyDetail>>(
    `/api/bootcamps/${encoded(bootcampId)}/enrollment-keys`,
    { cache: "no-store", ...init },
    { ...input, limit: input.limit ?? 25 },
  );
}

export function createEnrollmentKey(
  bootcampId: string,
  input: { audience: EnrollmentKeyDetail["audience"]; expiresAt?: string; maxUses?: number },
) {
  return apiRequest<CreatedEnrollmentKey>(`/api/bootcamps/${encoded(bootcampId)}/enrollment-keys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deactivateEnrollmentKey(bootcampId: string, keyId: string) {
  return apiRequest<EnrollmentKeyDetail>(
    `/api/bootcamps/${encoded(bootcampId)}/enrollment-keys/${encoded(keyId)}/deactivate`,
    { method: "POST" },
  );
}

export function publishBootcamp(id: string) {
  return bootcampLifecycle(id, "publish");
}

export function completeBootcamp(id: string) {
  return bootcampLifecycle(id, "complete");
}

export function archiveBootcamp(id: string) {
  return bootcampLifecycle(id, "archive");
}

function bootcampLifecycle(id: string, action: "publish" | "complete" | "archive") {
  return apiRequest<ManagedBootcampDetail>(`/api/bootcamps/${encoded(id)}/${action}`, {
    method: "POST",
  });
}

export function listBootcampParticipants(
  bootcampId: string,
  input: { cursor?: string; limit?: number; status?: Participant["status"] } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<Participant>>(
    `/api/bootcamps/${encoded(bootcampId)}/participants`,
    { cache: "no-store", ...init },
    { cursor: input.cursor, limit: input.limit ?? 25, status: input.status },
  );
}

export function listManagedContent(
  input: { cursor?: string; limit?: number; status?: ContentStatus; type?: ContentType } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<ManagedContentSummary>>(
    "/api/content",
    { cache: "no-store", ...init },
    { cursor: input.cursor, limit: input.limit ?? 20, status: input.status, type: input.type },
  );
}

export function getManagedContent(id: string, init: RequestInit = {}) {
  return apiRequest<ManagedContentDetail>(`/api/content/${encoded(id)}`, {
    cache: "no-store",
    ...init,
  });
}

export function createContent(input: ContentInput) {
  return apiRequest<ManagedContentDetail>("/api/content", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateContent(id: string, input: ContentInput) {
  return apiRequest<ManagedContentDetail>(`/api/content/${encoded(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listManagedWebinars(
  input: {
    cursor?: string;
    limit?: number;
    status?: WebinarStatus;
    timing?: "UPCOMING" | "PAST";
  } = {},
  init: RequestInit = {},
) {
  return apiRequest<CursorPage<ManagedWebinarSummary>>(
    "/api/webinars",
    { cache: "no-store", ...init },
    {
      cursor: input.cursor,
      limit: input.limit ?? 20,
      status: input.status,
      timing: input.timing,
    },
  );
}

export function getManagedWebinar(id: string, init: RequestInit = {}) {
  return apiRequest<ManagedWebinarDetail>(`/api/webinars/${encoded(id)}`, {
    cache: "no-store",
    ...init,
  });
}

export function createWebinar(input: WebinarInput) {
  return apiRequest<ManagedWebinarDetail>("/api/webinars", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateWebinar(id: string, input: WebinarInput) {
  return apiRequest<ManagedWebinarDetail>(`/api/webinars/${encoded(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function publishWebinar(id: string) {
  return webinarLifecycle(id, "publish");
}

export function completeWebinar(id: string) {
  return webinarLifecycle(id, "complete");
}

export function archiveWebinar(id: string) {
  return webinarLifecycle(id, "archive");
}

function webinarLifecycle(id: string, action: "publish" | "complete" | "archive") {
  return apiRequest<ManagedWebinarDetail>(`/api/webinars/${encoded(id)}/${action}`, {
    method: "POST",
  });
}
