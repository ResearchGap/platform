import type { AccountStatus, RoleCode } from "../../authorization/authorization.types";
import type { BootcampStatus } from "../bootcamp/bootcamp.types";
import type { BootcampEnrollmentStatus } from "../enrollment/enrollment.types";
import type { ResearchContentStatus, ResearchContentType } from "../content/content.types";
import type { WebinarSessionType, WebinarStatus } from "../webinar/webinar.types";

export interface ExecutiveSummary {
  generatedAt: Date;
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
    byStatus: Record<ResearchContentStatus, number>;
    byType: Record<ResearchContentType, number>;
  };
  enrollments: {
    total: number;
    byStatus: Record<BootcampEnrollmentStatus, number>;
    topBootcamps: Array<{
      id: string;
      title: string;
      slug: string;
      status: BootcampStatus;
      startDate: Date;
      endDate: Date;
      participantCount: number;
    }>;
  };
  activity: {
    upcomingWebinars: Array<{
      id: string;
      title: string;
      slug: string;
      scheduledAt: Date;
      sessionType: WebinarSessionType;
    }>;
    recentlyPublishedContent: Array<{
      id: string;
      title: string;
      slug: string;
      type: ResearchContentType;
      publishedAt: Date;
    }>;
  };
}
