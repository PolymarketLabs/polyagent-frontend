import { NextRequest } from "next/server";

import { proxyBackendRequest } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest): Promise<Response> {
  return proxyBackendRequest(request, "/auth/nonce");
}
