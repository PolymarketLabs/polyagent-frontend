export type ApiSuccessResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type QueryValue = string | number | boolean | undefined;

type BaseRequestOptions = {
  cache?: RequestCache;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

type RequestJsonOptions = {
  method: "GET" | "POST";
  searchParams?: Record<string, QueryValue>;
  body?: unknown;
} & BaseRequestOptions;

async function getApiBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (!origin) {
      throw new Error("Invalid runtime origin: window.location.origin is empty");
    }
    return `${origin.replace(/\/+$/, "")}/api`;
  }

  const { headers } = await import("next/headers");
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");

  if (!host) {
    throw new Error("Unable to resolve API base URL: missing request host header on server");
  }

  const forwardedProto = incomingHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}/api`;
}

async function getServerCookieHeader(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const { headers } = await import("next/headers");
    const incomingHeaders = await headers();
    return incomingHeaders.get("cookie");
  } catch {
    return null;
  }
}

async function buildUrl(path: string, searchParams?: Record<string, QueryValue>): Promise<string> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(await getApiBaseUrl());
  const basePath = url.pathname.replace(/\/+$/, "");
  const requestPath = normalizedPath.replace(/^\/+/, "");
  url.pathname = `${basePath}/${requestPath}`.replace(/\/{2,}/g, "/");

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function requestJson<T>(path: string, options: RequestJsonOptions): Promise<T> {
  const headers = new Headers(options.headers);
  const isServer = typeof window === "undefined";

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (
      typeof options.body === "string" ||
      options.body instanceof FormData ||
      options.body instanceof URLSearchParams ||
      options.body instanceof Blob ||
      options.body instanceof ArrayBuffer
    ) {
      body = options.body;
    } else {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      body = JSON.stringify(options.body);
    }
  }

  if (isServer) {
    const cookieHeader = await getServerCookieHeader();
    if (cookieHeader && !headers.has("cookie")) {
      headers.set("cookie", cookieHeader);
    }
  }

  const response = await fetch(await buildUrl(path, options.searchParams), {
    method: options.method,
    cache: options.cache ?? "no-store",
    credentials: options.credentials ?? "include",
    signal: options.signal,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Request failed, path=${path}, status=${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(
  path: string,
  searchParams?: Record<string, QueryValue>,
  options: BaseRequestOptions = {},
): Promise<T> {
  return requestJson<T>(path, {
    ...options,
    method: "GET",
    searchParams,
  });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options: BaseRequestOptions = {},
): Promise<T> {
  return requestJson<T>(path, {
    ...options,
    method: "POST",
    body,
  });
}
