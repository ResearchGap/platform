export const PERMISSIONS = {
  BOOTCAMP_READ: "bootcamp.read",
  BOOTCAMP_CREATE: "bootcamp.create",
  BOOTCAMP_UPDATE: "bootcamp.update",
  BOOTCAMP_PUBLISH: "bootcamp.publish",
  BOOTCAMP_MANAGE_ALL: "bootcamp.manage-all",
  BOOTCAMP_MANAGE_SESSIONS: "bootcamp.session.manage",
  BOOTCAMP_MANAGE_ENROLLMENT: "bootcamp.enrollment.manage",
  BOOTCAMP_ENROLL: "bootcamp.enroll",
  BOOTCAMP_ENROLLMENT_KEY_MANAGE: "bootcamp.enrollment-key.manage",
  BOOTCAMP_PARTICIPANT_READ: "bootcamp.participant.read",
  BOOTCAMP_MENTOR_JOIN: "bootcamp.mentor.join",
  BOOTCAMP_MENTOR_ASSIGN: "bootcamp.mentor.assign",
  WEBINAR_READ: "webinar.read",
  WEBINAR_CREATE: "webinar.create",
  WEBINAR_UPDATE: "webinar.update",
  WEBINAR_PUBLISH: "webinar.publish",
  WEBINAR_MANAGE_ALL: "webinar.manage-all",
  CONTENT_READ: "content.read",
  CONTENT_CREATE: "content.create",
  CONTENT_UPDATE: "content.update",
  CONTENT_PUBLISH: "content.publish",
  CONTENT_MANAGE_VISUAL: "content.visual.manage",
  CONTENT_MANAGE_ALL: "content.manage-all",
  ENROLLMENT_CREATE: "enrollment.create",
  ENROLLMENT_READ_OWN: "enrollment.read-own",
  ENROLLMENT_MANAGE: "enrollment.manage",
  USER_READ: "user.read",
  USER_APPROVE: "user.approve",
  USER_UPDATE: "user.update",
  USER_ASSIGN_ROLE: "user.assign-role",
  ANALYTICS_READ_EXECUTIVE: "analytics.executive.read",
  SYSTEM_MANAGE: "system.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const permissionCatalog = new Set<string>(Object.values(PERMISSIONS));

export function isPermission(value: string): value is Permission {
  return permissionCatalog.has(value);
}
