import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";

import { publicEnv } from "@/config/env";

const APP_NAME = "Polyagent";
const APP_DESCRIPTION = "Prediction market-driven digital fund custody platform.";

const polygonRpcHeaders: Record<string, string> = {};
if (publicEnv.rpcAuthToken) {
  polygonRpcHeaders.Authorization = `Bearer ${publicEnv.rpcAuthToken}`;
}
if (publicEnv.rpcApiKey) {
  polygonRpcHeaders["x-api-key"] = publicEnv.rpcApiKey;
}

const supportedChains = [polygon, polygonAmoy] as const;
const activeChain = supportedChains.find((chain) => chain.id === publicEnv.chainId);

if (!activeChain) {
  throw new Error(`Unsupported NEXT_PUBLIC_CHAIN_ID: ${publicEnv.chainId}`);
}

export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  appDescription: APP_DESCRIPTION,
  appUrl: publicEnv.appUrl,
  projectId: publicEnv.walletConnectProjectId,
  wallets: [
    {
      groupName: "Installed",
      wallets: [injectedWallet],
    },
  ],
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(
      publicEnv.rpcUrl,
      Object.keys(polygonRpcHeaders).length
        ? {
            fetchOptions: {
              headers: polygonRpcHeaders,
            },
          }
        : undefined,
    ),
  },
  ssr: true,
});
