import { createProxyHandlers } from "@/app/api/_lib/proxy-handler-factory";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers("/investment");
