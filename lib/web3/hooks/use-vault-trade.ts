"use client";

import { useMemo } from "react";
import { formatUnits, isAddress, parseUnits, type Address } from "viem";
import { useConnection, usePublicClient, useReadContract, useWriteContract } from "wagmi";

import { erc20Abi } from "@/lib/web3/contracts/erc20";
import { vaultAbi } from "@/lib/web3/contracts/vault";

type UseVaultTradeOptions = {
  vaultAddress: string;
};

export function useVaultTrade({ vaultAddress }: UseVaultTradeOptions) {
  const { address: walletAddress, isConnected } = useConnection();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContractAsync, isPending: isWritePending } = useWriteContract();

  const isValidVaultAddress = isAddress(vaultAddress);
  const normalizedVaultAddress = isValidVaultAddress ? (vaultAddress as Address) : undefined;

  const { data: baseAssetAddress } = useReadContract({
    abi: vaultAbi,
    address: normalizedVaultAddress,
    functionName: "baseAsset",
    query: { enabled: Boolean(normalizedVaultAddress) },
  });

  const { data: baseAssetDecimalsData } = useReadContract({
    abi: erc20Abi,
    address: baseAssetAddress,
    functionName: "decimals",
    query: { enabled: Boolean(baseAssetAddress) },
  });

  const { data: baseAssetSymbolData } = useReadContract({
    abi: erc20Abi,
    address: baseAssetAddress,
    functionName: "symbol",
    query: { enabled: Boolean(baseAssetAddress) },
  });

  const { data: shareDecimalsData } = useReadContract({
    abi: erc20Abi,
    address: normalizedVaultAddress,
    functionName: "decimals",
    query: { enabled: Boolean(normalizedVaultAddress) },
  });

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: baseAssetAddress,
    functionName: "allowance",
    args:
      walletAddress && normalizedVaultAddress ? [walletAddress, normalizedVaultAddress] : undefined,
    query: { enabled: Boolean(baseAssetAddress && walletAddress && normalizedVaultAddress) },
  });
  const { data: shareBalanceData } = useReadContract({
    abi: erc20Abi,
    address: normalizedVaultAddress,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(normalizedVaultAddress && walletAddress) },
  });

  const baseAssetDecimals = Number(baseAssetDecimalsData ?? 6);
  const shareDecimals = Number(shareDecimalsData ?? 18);
  const baseAssetSymbol = baseAssetSymbolData ?? "USDC";
  const allowance = allowanceData ?? BigInt(0);
  const shareBalance = shareBalanceData ?? BigInt(0);

  const parseDepositAmount = (value: string): bigint | null => {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    try {
      return parseUnits(normalized, baseAssetDecimals);
    } catch {
      return null;
    }
  };

  const parseRedeemShares = (value: string): bigint | null => {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    try {
      return parseUnits(normalized, shareDecimals);
    } catch {
      return null;
    }
  };

  const formatBaseAssetAmount = (value: bigint): string => formatUnits(value, baseAssetDecimals);
  const formatShareAmount = (value: bigint): string => formatUnits(value, shareDecimals);

  const canTransact = useMemo(
    () => Boolean(isConnected && walletAddress && normalizedVaultAddress && publicClient),
    [isConnected, normalizedVaultAddress, publicClient, walletAddress],
  );

  const approve = async (amount: bigint) => {
    if (!baseAssetAddress || !normalizedVaultAddress || !publicClient) {
      throw new Error("Trade config is not ready");
    }

    const hash = await writeContractAsync({
      abi: erc20Abi,
      address: baseAssetAddress,
      functionName: "approve",
      args: [normalizedVaultAddress, amount],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    await refetchAllowance();
    return hash;
  };

  const requestDeposit = async (amount: bigint, referrer: Address) => {
    if (!normalizedVaultAddress || !publicClient) {
      throw new Error("Trade config is not ready");
    }

    const hash = await writeContractAsync({
      abi: vaultAbi,
      address: normalizedVaultAddress,
      functionName: "requestDeposit",
      args: [amount, referrer],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    await refetchAllowance();
    return hash;
  };

  const requestRedeem = async (shares: bigint) => {
    if (!normalizedVaultAddress || !publicClient) {
      throw new Error("Trade config is not ready");
    }

    const hash = await writeContractAsync({
      abi: vaultAbi,
      address: normalizedVaultAddress,
      functionName: "requestRedeem",
      args: [shares],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  return {
    walletAddress,
    isConnected,
    isWritePending,
    canTransact,
    vaultAddress: normalizedVaultAddress,
    baseAssetAddress,
    baseAssetSymbol,
    baseAssetDecimals,
    shareDecimals,
    allowance,
    shareBalance,
    parseDepositAmount,
    parseRedeemShares,
    formatBaseAssetAmount,
    formatShareAmount,
    approve,
    requestDeposit,
    requestRedeem,
  };
}
