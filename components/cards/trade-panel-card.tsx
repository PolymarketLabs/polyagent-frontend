"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress, type Address, zeroAddress } from "viem";

import { useVaultTrade } from "@/lib/web3/hooks/use-vault-trade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TradeMode = "DEPOSIT" | "REDEEM";

type TradePanelCardProps = {
  vaultAddress: string;
  minimumDeposit: number;
  minimumRedeem: number;
  currentNav?: number;
};

function formatUsd(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatAddress(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTxnHash(value: string): string {
  if (value.length <= 14) {
    return value;
  }
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function resolveReferrer(value: string | null | undefined): Address {
  if (value && isAddress(value)) {
    return value;
  }

  return zeroAddress;
}

export function TradePanelCard({
  vaultAddress,
  minimumDeposit,
  minimumRedeem,
  currentNav,
}: TradePanelCardProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<TradeMode>("DEPOSIT");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const referrer = resolveReferrer(searchParams.get("ref"));

  const {
    isConnected,
    canTransact,
    isWritePending,
    baseAssetAddress,
    baseAssetSymbol,
    allowance,
    shareBalance,
    parseDepositAmount,
    parseRedeemShares,
    formatBaseAssetAmount,
    formatShareAmount,
    approve,
    requestDeposit,
    requestRedeem,
  } = useVaultTrade({ vaultAddress });

  const parsedDepositAmount = useMemo(
    () => (mode === "DEPOSIT" ? parseDepositAmount(inputValue) : null),
    [inputValue, mode, parseDepositAmount],
  );
  const parsedRedeemShares = useMemo(
    () => (mode === "REDEEM" ? parseRedeemShares(inputValue) : null),
    [inputValue, mode, parseRedeemShares],
  );

  const hasPositiveInput =
    mode === "DEPOSIT"
      ? Boolean(parsedDepositAmount && parsedDepositAmount > BigInt(0))
      : Boolean(parsedRedeemShares && parsedRedeemShares > BigInt(0));

  const inputAsNumber = Number(inputValue);
  const meetsMinimumDeposit =
    mode === "DEPOSIT" ? Number.isFinite(inputAsNumber) && inputAsNumber >= minimumDeposit : true;

  const requiresApproval =
    mode === "DEPOSIT" &&
    Boolean(
      parsedDepositAmount && parsedDepositAmount > BigInt(0) && allowance < parsedDepositAmount,
    );

  const isActionDisabled =
    isSubmitting ||
    isWritePending ||
    !canTransact ||
    !hasPositiveInput ||
    (mode === "DEPOSIT" && !meetsMinimumDeposit);

  const primaryActionLabel = requiresApproval
    ? `Approve ${baseAssetSymbol}`
    : mode === "DEPOSIT"
      ? "Request Deposit"
      : "Request Redeem";

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setLastTxHash(null);

    if (!isConnected) {
      setSubmitError("Connect wallet first.");
      return;
    }
    if (!canTransact) {
      setSubmitError("Trade config is not ready.");
      return;
    }
    if (!hasPositiveInput) {
      setSubmitError(mode === "DEPOSIT" ? "Enter a valid deposit amount." : "Enter valid shares.");
      return;
    }
    if (mode === "DEPOSIT" && !meetsMinimumDeposit) {
      setSubmitError(`Minimum deposit is ${formatUsd(minimumDeposit)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "DEPOSIT") {
        if (!parsedDepositAmount) {
          throw new Error("Invalid deposit amount.");
        }
        if (requiresApproval) {
          const approveTxHash = await approve(parsedDepositAmount);
          setLastTxHash(approveTxHash);
          setSubmitSuccess("Approve confirmed. Submit deposit request next.");
        } else {
          const requestTxHash = await requestDeposit(parsedDepositAmount, referrer);
          setLastTxHash(requestTxHash);
          setSubmitSuccess("Deposit request submitted.");
          setInputValue("");
        }
        return;
      }

      if (!parsedRedeemShares) {
        throw new Error("Invalid redeem shares.");
      }

      const requestTxHash = await requestRedeem(parsedRedeemShares);
      setLastTxHash(requestTxHash);
      setSubmitSuccess("Redeem request submitted.");
      setInputValue("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trade Panel</CardTitle>
        <CardDescription>Submit deposit or redeem requests to vault contract.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "DEPOSIT" ? "default" : "outline"}
            onClick={() => setMode("DEPOSIT")}
          >
            Deposit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "REDEEM" ? "default" : "outline"}
            onClick={() => setMode("REDEEM")}
          >
            Redeem
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-muted)]">
            {mode === "DEPOSIT" ? `Amount (${baseAssetSymbol})` : "Shares"}
          </label>
          <Input
            type="number"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={mode === "DEPOSIT" ? String(minimumDeposit) : "1000"}
          />
        </div>

        <div className="space-y-1 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text-muted)]">
          <p>
            Vault:{" "}
            <span className="font-mono text-[var(--text)]">{formatAddress(vaultAddress)}</span>
          </p>
          <p>
            Base Asset:{" "}
            <span className="font-mono text-[var(--text)]">
              {baseAssetAddress ? formatAddress(baseAssetAddress) : "--"} ({baseAssetSymbol})
            </span>
          </p>
          <p>Minimum Deposit: {formatUsd(minimumDeposit)}</p>
          <p>Minimum Redeem: {formatUsd(minimumRedeem)}</p>
          {typeof currentNav === "number" ? <p>Current NAV: {formatUsd(currentNav, 3)}</p> : null}
          {mode === "DEPOSIT" ? (
            <p>
              Allowance:{" "}
              <span className="text-[var(--text)]">
                {formatBaseAssetAmount(allowance)} {baseAssetSymbol}
              </span>
            </p>
          ) : (
            <p>
              Shares: <span className="text-[var(--text)]">{formatShareAmount(shareBalance)}</span>
            </p>
          )}
          {parsedRedeemShares ? (
            <p>
              Requested Shares:{" "}
              <span className="text-[var(--text)]">{formatShareAmount(parsedRedeemShares)}</span>
            </p>
          ) : null}
          <p>
            Referrer:{" "}
            <span className="font-mono text-[var(--text)]">{formatAddress(referrer)}</span>
          </p>
        </div>

        {submitError ? (
          <p className="text-xs text-[var(--danger)]">{submitError}</p>
        ) : submitSuccess ? (
          <p className="text-xs text-[var(--deposit)]">{submitSuccess}</p>
        ) : null}

        {lastTxHash ? (
          <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-xs">
            <span className="text-[var(--text-muted)]">Tx</span>
            <Badge className="font-mono">{formatTxnHash(lastTxHash)}</Badge>
          </div>
        ) : null}

        <Button type="button" className="w-full" onClick={handleSubmit} disabled={isActionDisabled}>
          {isSubmitting || isWritePending ? "Submitting..." : primaryActionLabel}
        </Button>

        {!isConnected ? (
          <p className="text-xs text-[var(--text-muted)]">
            Connect wallet in the top nav to continue.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
