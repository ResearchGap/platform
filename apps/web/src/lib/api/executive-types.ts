import type { AccountStatus, RoleCode } from "./mentee-types";
import type { BootcampStatus, ContentStatus, WebinarStatus } from "./mentor-types";
import type { ContentType, SessionType } from "./public-types";

export interface ExecutiveSummary {
  generatedAt: string;
  users: {
    total: number;
    mentees: number;
    mentors: number;
    staff: number;
    byRole: Record<RoleCode, number>;
    byAccountStatus: Record<AccountStatus, number>;
  };
  bootcamps: {
    total: number;
    upcoming: number;
    ongoing: number;
    byStatus: Record<BootcampStatus, number>;
  };
  webinars: {
    total: number;
    upcoming: number;
    byStatus: Record<WebinarStatus, number>;
  };
  content: {
    total: number;
    byStatus: Record<ContentStatus, number>;
    byType: Record<ContentType, number>;
  };
  enrollments: {
    total: number;
    byStatus: Record<"ACTIVE" | "COMPLETED" | "CANCELLED", number>;
    topBootcamps: Array<{
      id: string;
      title: string;
      slug: string;
      status: BootcampStatus;
      startDate: string;
      endDate: string;
      participantCount: number;
    }>;
  };
  activity: {
    upcomingWebinars: Array<{
      id: string;
      title: string;
      slug: string;
      scheduledAt: string;
      sessionType: SessionType;
    }>;
    recentlyPublishedContent: Array<{
      id: string;
      title: string;
      slug: string;
      type: ContentType;
      publishedAt: string;
    }>;
  };
}
