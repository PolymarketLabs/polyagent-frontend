import { z } from "zod";

const parsedEnv = z
  .object({
    appUrl: z.url({ error: "NEXT_PUBLIC_APP_URL must be a valid URL" }),
    walletConnectProjectId: z.string().min(1, "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required"),
    chainId: z.enum(["137", "80002"], {
      error: "NEXT_PUBLIC_CHAIN_ID must be one of: 137 (Polygon), 80002 (Polygon Amoy)",
    }),
    rpcUrl: z.url({ error: "NEXT_PUBLIC_RPC_URL must be a valid URL" }),
    rpcAuthToken: z.string().optional(),
    rpcApiKey: z.string().optional(),
  })
  .transform((value) => ({
    appUrl: value.appUrl,
    walletConnectProjectId: value.walletConnectProjectId,
    chainId: Number(value.chainId) as 137 | 80002,
    rpcUrl: value.rpcUrl,
    rpcAuthToken: value.rpcAuthToken,
    rpcApiKey: value.rpcApiKey,
  }))
  .safeParse({
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim(),
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim(),
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID?.trim(),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL?.trim(),
    rpcAuthToken: process.env.NEXT_PUBLIC_RPC_AUTH_TOKEN?.trim() || undefined,
    rpcApiKey: process.env.NEXT_PUBLIC_RPC_API_KEY?.trim() || undefined,
  });

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${details}`);
}

export const publicEnv = parsedEnv.data;
