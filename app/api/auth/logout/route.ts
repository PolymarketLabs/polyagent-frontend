import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getAuthCookieBaseOptions } from "@/lib/auth/cookie";
import { buildUpstreamUrl } from "@/app/api/_lib/upstream-url";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const upstreamResponse = await fetch(buildUpstreamUrl("/auth/logout"), {
    method: "POST",
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const responseText = await upstreamResponse.text();
  let responseBody: unknown;
  try {
    responseBody = JSON.parse(responseText) as unknown;
  } catch {
    responseBody = {
      code: upstreamResponse.ok ? 0 : -1,
      message: upstreamResponse.ok ? "success" : "logout failed",
      data: {},
    };
  }

  const response = NextResponse.json(responseBody, {
    status: upstreamResponse.status,
  });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    ...getAuthCookieBaseOptions(),
    maxAge: 0,
  });

  return response;
}
