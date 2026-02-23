import "server-only";

import { z } from "zod";

const parsedServerEnv = z
  .object({
    apiBaseUrl: z.url({ error: "API_BASE_URL must be a valid URL" }),
  })
  .safeParse({
    apiBaseUrl: process.env.API_BASE_URL?.trim(),
  });

if (!parsedServerEnv.success) {
  const details = parsedServerEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid server environment variables: ${details}`);
}

export const serverEnv = parsedServerEnv.data;
