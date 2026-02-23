"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SiweMessage } from "siwe";
import { useEffect, useRef, useState } from "react";
import { useConnection, useConnectionEffect, useSignMessage } from "wagmi";

import type { AuthSession } from "@/lib/api/services/auth";
import { postAuthLogin, postAuthLogout, postAuthNonce } from "@/lib/api/services/auth";
import { Button } from "@/components/ui/button";

const SIWE_STATEMENT = "Sign in to Polyagent";
const enforceAddressMatch = process.env.NODE_ENV === "production";

type ConnectWalletButtonProps = {
  initialSession: AuthSession | null;
};

export function ConnectWalletButton({ initialSession }: ConnectWalletButtonProps) {
  const t = useTranslations("wallet");
  const router = useRouter();
  const { mutateAsync: signMessageMutateAsync } = useSignMessage();
  const { address, isConnected } = useConnection();
  // TODO(production): Re-enable useDisconnect when SIWE address mismatch handling is restored.
  // const { mutateAsync: disconnectMutateAsync } = useDisconnect();
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const lastMismatchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const invalidateSessionOnServer = () => {
    void postAuthLogout().catch((error) => {
      console.error("Logout request failed:", error);
    });
  };

  useEffect(() => {
    if (!isConnected || !address) {
      lastMismatchKeyRef.current = null;
      return;
    }

    const currentSession = session;
    if (!currentSession) {
      return;
    }

    const connectedAddress = address.toLowerCase();
    const sessionAddress = currentSession.address.toLowerCase();

    if (sessionAddress === connectedAddress) {
      lastMismatchKeyRef.current = null;
      return;
    }

    if (!enforceAddressMatch) {
      return;
    }

    const mismatchKey = `${sessionAddress}->${connectedAddress}`;
    if (lastMismatchKeyRef.current === mismatchKey) {
      return;
    }
    lastMismatchKeyRef.current = mismatchKey;

    invalidateSessionOnServer();
    setSession(null);
    router.refresh();
  }, [address, isConnected, router, session]);

  useConnectionEffect({
    onDisconnect() {
      const currentSession = session;
      if (currentSession) {
        invalidateSessionOnServer();
      }
      setSession(null);
      router.refresh();
    },
    onConnect(data) {
      const connectedAddress = data.address.toLowerCase();
      const currentSession = session;
      if (!currentSession) {
        return;
      }
      if (!enforceAddressMatch) {
        return;
      }
      if (currentSession.address.toLowerCase() !== connectedAddress) {
        invalidateSessionOnServer();
        setSession(null);
        router.refresh();
      }
    },
  });

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const signIn = async () => {
          const walletAddress = account?.address as `0x${string}` | undefined;
          if (!walletAddress || !chain || chain.unsupported || isSigningIn) {
            return;
          }

          setIsSigningIn(true);
          try {
            const domain = window.location.host;
            const uri = window.location.origin;
            const { nonce } = await postAuthNonce({
              address: walletAddress,
              chainId: chain.id,
              domain,
            });

            const message = new SiweMessage({
              domain,
              address: walletAddress,
              statement: SIWE_STATEMENT,
              uri,
              version: "1",
              chainId: chain.id,
              nonce,
            }).prepareMessage();

            const signature = await signMessageMutateAsync({
              account: walletAddress,
              message,
            });
            const { user } = await postAuthLogin({
              message,
              signature,
            });
            setSession({ address: user.address, role: user.role });
            router.refresh();
          } catch (error) {
            // Keep this visible in DevTools so signature/login failures are diagnosable.
            console.error("SIWE sign-in failed:", error);
            setSession(null);
          } finally {
            setIsSigningIn(false);
          }
        };

        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        const walletAddress = account?.address?.toLowerCase();
        const sessionAddress = session?.address?.toLowerCase();
        const isSignedIn = enforceAddressMatch
          ? Boolean(walletAddress) && Boolean(sessionAddress) && walletAddress === sessionAddress
          : Boolean(sessionAddress);

        if (!connected) {
          return (
            <Button type="button" size="sm" variant="outline" onClick={openConnectModal}>
              {t("connectWallet")}
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button type="button" size="sm" variant="outline" onClick={openChainModal}>
              {t("wrongNetwork")}
            </Button>
          );
        }

        if (!isSignedIn) {
          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={signIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? t("signingIn") : t("signIn")}
            </Button>
          );
        }

        return (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={openAccountModal}
            className="text-[var(--success)]"
          >
            {account.displayName}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
