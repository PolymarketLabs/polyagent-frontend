import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getAuthCookieBaseOptions } from "@/lib/auth/cookie";
import { buildUpstreamUrl } from "@/app/api/_lib/upstream-url";

type UserRole = "INVESTOR" | "MANAGER";

type UpstreamAuthLoginResponse = {
  code: number;
  message: string;
  data?: {
    token?: string;
    user?: {
      address?: string;
      role?: UserRole;
      createdAt?: string;
      managerApplicationStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
    };
  };
};

function isUserRole(value: unknown): value is UserRole {
  return value === "INVESTOR" || value === "MANAGER";
}

export async function POST(request: Request) {
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";

  const upstreamResponse = await fetch(buildUpstreamUrl("/auth/login"), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  const responseText = await upstreamResponse.text();
  let upstreamPayload: UpstreamAuthLoginResponse | null = null;
  try {
    upstreamPayload = JSON.parse(responseText) as UpstreamAuthLoginResponse;
  } catch {
    upstreamPayload = null;
  }

  if (!upstreamResponse.ok) {
    if (upstreamPayload) {
      return NextResponse.json(upstreamPayload, { status: upstreamResponse.status });
    }
    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    });
  }

  const token = upstreamPayload?.data?.token;
  const user = upstreamPayload?.data?.user;
  const address = user?.address;
  const role = user?.role;
  if (!token || !user || !address || !isUserRole(role)) {
    return NextResponse.json(
      {
        code: -1,
        message: "Invalid upstream login response",
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json(
    {
      code: upstreamPayload?.code ?? 0,
      message: upstreamPayload?.message ?? "success",
      data: {
        user,
      },
    },
    { status: upstreamResponse.status },
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    ...getAuthCookieBaseOptions(),
  });

  return response;
}
