import { env } from "@platform/env/web";

interface ApiErrorBody {
  error?: unknown;
  message?: unknown;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message = "The request could not be completed.",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class PublicApiError extends ApiError {
  constructor(status: number, code: string | null) {
    super(status, code, "The requested public information could not be loaded.");
    this.name = "PublicApiError";
  }
}

function errorCode(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return null;
  }
  const error = (body as ApiErrorBody).error;
  return typeof error === "string" ? error : null;
}

function errorMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("message" in body)) {
    return null;
  }
  const message = (body as ApiErrorBody).message;
  return typeof message === "string" ? message : null;
}

function apiUrl(
  path: `/api/${string}`,
  query: Readonly<Record<string, string | number | undefined>>,
) {
  const url = new URL(path, env.NEXT_PUBLIC_SERVER_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function apiRequest<T>(
  path: `/api/${string}`,
  init: RequestInit = {},
  query: Readonly<Record<string, string | number | undefined>> = {},
): Promise<T> {
  const response = await fetch(apiUrl(path, query), {
    ...init,
    credentials: "include",
    headers: {
      accept: "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorCode(body),
      errorMessage(body) ?? "The request could not be completed. Please try again.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function publicApiGet<T>(
  path: `/api/public/${string}`,
  query: Readonly<Record<string, string | number | undefined>> = {},
): Promise<T> {
  const response = await fetch(apiUrl(path, query), {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new PublicApiError(response.status, errorCode(body));
  }

  return (await response.json()) as T;
}
