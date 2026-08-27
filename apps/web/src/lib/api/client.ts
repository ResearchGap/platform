import { env } from "@platform/env/web";

interface ApiErrorBody {
  error?: unknown;
}

export class PublicApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super("The requested public information could not be loaded.");
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

export async function publicApiGet<T>(
  path: `/api/public/${string}`,
  query: Readonly<Record<string, string | number | undefined>> = {},
): Promise<T> {
  const url = new URL(path, env.NEXT_PUBLIC_SERVER_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new PublicApiError(response.status, errorCode(body));
  }

  return (await response.json()) as T;
}
