import { serverEnv } from "@/config/env.server";

export function buildUpstreamUrl(path: string, search = ""): string {
  const base = serverEnv.apiBaseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${base}/${normalizedPath}${search}`;
}
