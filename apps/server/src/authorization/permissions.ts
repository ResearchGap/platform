export const PERMISSIONS = {
  BOOTCAMP_READ: "bootcamp.read",
  BOOTCAMP_CREATE: "bootcamp.create",
  BOOTCAMP_UPDATE: "bootcamp.update",
  BOOTCAMP_PUBLISH: "bootcamp.publish",
  BOOTCAMP_MANAGE_SESSIONS: "bootcamp.session.manage",
  BOOTCAMP_MANAGE_ENROLLMENT: "bootcamp.enrollment.manage",
  BOOTCAMP_ENROLL: "bootcamp.enroll",
  BOOTCAMP_ENROLLMENT_KEY_MANAGE: "bootcamp.enrollment-key.manage",
  BOOTCAMP_PARTICIPANT_READ: "bootcamp.participant.read",
  BOOTCAMP_MENTOR_JOIN: "bootcamp.mentor.join",
  BOOTCAMP_MENTOR_ASSIGN: "bootcamp.mentor.assign",
  BOOTCAMP_LEARNING_ACCESS: "bootcamp.learning.access",
  BOOTCAMP_MANAGE_VISUAL: "bootcamp.visual.manage",
  WEBINAR_READ: "webinar.read",
  WEBINAR_CREATE: "webinar.create",
  WEBINAR_UPDATE: "webinar.update",
  WEBINAR_PUBLISH: "webinar.publish",
  WEBINAR_MANAGE_VISUAL: "webinar.visual.manage",
  CONTENT_READ: "content.read",
  CONTENT_CREATE: "content.create",
  CONTENT_UPDATE: "content.update",
  CONTENT_PUBLISH: "content.publish",
  CONTENT_MANAGE_VISUAL: "content.visual.manage",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",
  ENROLLMENT_CREATE: "enrollment.create",
  ENROLLMENT_MANAGE: "enrollment.manage",
  USER_READ: "user.read",
  USER_APPROVE: "user.approve",
  USER_UPDATE: "user.update",
  USER_ASSIGN_ROLE: "user.assign-role",
  USER_MANAGE_PERMISSION_OVERRIDES: "user.permission-override.manage",
  ANALYTICS_READ_EXECUTIVE: "analytics.executive.read",
  SYSTEM_MANAGE: "system.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const permissionCatalog = new Set<string>(Object.values(PERMISSIONS));

export function isPermission(value: string): value is Permission {
  return permissionCatalog.has(value);
}
