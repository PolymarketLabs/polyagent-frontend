import { NextRequest } from "next/server";

import { proxyBackendRequest } from "@/app/api/_lib/proxy";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<Response>;

async function resolveUpstreamPath(
  basePath: string,
  paramsPromise: RouteContext["params"],
): Promise<string> {
  const { path = [] } = await paramsPromise;
  if (path.length === 0) {
    return basePath;
  }

  return `${basePath}/${path.join("/")}`;
}

export function createProxyHandlers(basePath: string): {
  GET: RouteHandler;
  POST: RouteHandler;
  PUT: RouteHandler;
  PATCH: RouteHandler;
  DELETE: RouteHandler;
} {
  const handler: RouteHandler = async (request, context) => {
    const upstreamPath = await resolveUpstreamPath(basePath, context.params);
    return proxyBackendRequest(request, upstreamPath);
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}
