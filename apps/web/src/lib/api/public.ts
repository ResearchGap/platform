import { cache } from "react";

import { publicApiGet } from "./client";
import type {
  BootcampTiming,
  ContentType,
  CursorPage,
  PublicBootcampDetail,
  PublicBootcampSession,
  PublicBootcampSummary,
  PublicContentDetail,
  PublicContentSummary,
  PublicWebinarDetail,
  PublicWebinarSummary,
  WebinarTiming,
} from "./public-types";

interface ListInput<TFilter> {
  cursor?: string;
  filter?: TFilter;
  limit?: number;
}

export function listPublicContent(input: ListInput<ContentType> = {}) {
  return publicApiGet<CursorPage<PublicContentSummary>>("/api/public/content", {
    cursor: input.cursor,
    limit: input.limit ?? 9,
    type: input.filter,
  });
}

export const getPublicContent = cache((slug: string) =>
  publicApiGet<PublicContentDetail>(`/api/public/content/${encodeURIComponent(slug)}`),
);

export function listPublicWebinars(input: ListInput<WebinarTiming> = {}) {
  return publicApiGet<CursorPage<PublicWebinarSummary>>("/api/public/webinars", {
    cursor: input.cursor,
    limit: input.limit ?? 9,
    timing: input.filter,
  });
}

export const getPublicWebinar = cache((slug: string) =>
  publicApiGet<PublicWebinarDetail>(`/api/public/webinars/${encodeURIComponent(slug)}`),
);

export function listPublicBootcamps(input: ListInput<BootcampTiming> = {}) {
  return publicApiGet<CursorPage<PublicBootcampSummary>>("/api/public/bootcamps", {
    cursor: input.cursor,
    limit: input.limit ?? 9,
    timing: input.filter,
  });
}

export const getPublicBootcamp = cache((slug: string) =>
  publicApiGet<PublicBootcampDetail>(`/api/public/bootcamps/${encodeURIComponent(slug)}`),
);

export const listPublicBootcampSessions = cache((slug: string) =>
  publicApiGet<PublicBootcampSession[]>(
    `/api/public/bootcamps/${encodeURIComponent(slug)}/sessions`,
  ),
);
