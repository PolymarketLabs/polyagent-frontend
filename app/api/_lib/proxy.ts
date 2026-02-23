import { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import { buildUpstreamUrl } from "@/app/api/_lib/upstream-url";

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (accept) {
    headers.set("Accept", accept);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function proxyBackendRequest(
  request: NextRequest,
  upstreamPath: string,
): Promise<Response> {
  const upstreamResponse = await fetch(buildUpstreamUrl(upstreamPath, request.nextUrl.search), {
    method: request.method,
    cache: "no-store",
    headers: buildUpstreamHeaders(request),
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
  });

  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("Content-Type", contentType);
  }

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
