import { NextRequest, NextResponse } from "next/server";

import { buildUpstreamUrl } from "@/app/api/_lib/upstream-url";
import { AUTH_COOKIE_NAME, getAuthCookieBaseOptions } from "@/lib/auth/cookie";

type UserRole = "INVESTOR" | "MANAGER";

type UpstreamUserProfileResponse = {
  code?: number;
  message?: string;
  data?: {
    address?: string;
    role?: UserRole;
  };
};

function unauthenticatedResponse(): NextResponse {
  return NextResponse.json({
    code: 0,
    message: "success",
    data: {
      authenticated: false,
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return unauthenticatedResponse();
  }

  const upstreamResponse = await fetch(buildUpstreamUrl("/user/profile"), {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const responseText = await upstreamResponse.text();
  let upstreamPayload: UpstreamUserProfileResponse | null = null;
  try {
    upstreamPayload = JSON.parse(responseText) as UpstreamUserProfileResponse;
  } catch {
    upstreamPayload = null;
  }

  if (!upstreamResponse.ok) {
    const response = unauthenticatedResponse();
    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        ...getAuthCookieBaseOptions(),
        maxAge: 0,
      });
    }
    return response;
  }

  const address = upstreamPayload?.data?.address;
  const role = upstreamPayload?.data?.role;
  if (!address || (role !== undefined && role !== "INVESTOR" && role !== "MANAGER")) {
    return NextResponse.json(
      {
        code: -1,
        message: "Invalid upstream session response",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    code: upstreamPayload?.code ?? 0,
    message: upstreamPayload?.message ?? "success",
    data: {
      authenticated: true,
      address,
      role,
    },
  });
}
