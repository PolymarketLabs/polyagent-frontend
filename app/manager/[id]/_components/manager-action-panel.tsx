"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ManagerActionPanelProps = {
  fundId: number;
};

const MOCK_PARSED_MARKET = {
  title: "Ethereum above ___ on February 22?",
  options: [
    { id: "1500", label: "1500", yesPriceCents: 18 },
    { id: "1600", label: "1600", yesPriceCents: 24 },
    { id: "1700", label: "1700", yesPriceCents: 31 },
    { id: "1800", label: "1800", yesPriceCents: 39 },
  ],
};

export function ManagerActionPanel({ fundId }: ManagerActionPanelProps) {
  const [marketUrl, setMarketUrl] = useState(
    "https://polymarket.com/event/us-debt-ceiling-bill-pass-before-may-2026",
  );
  const [parsed, setParsed] = useState(false);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderMode, setOrderMode] = useState<"MARKET" | "LIMIT">("MARKET");
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [selectedOptionId, setSelectedOptionId] = useState(
    MOCK_PARSED_MARKET.options[1]?.id ?? "1600",
  );
  const [price, setPrice] = useState(
    (
      (MOCK_PARSED_MARKET.options[1]?.yesPriceCents ??
        MOCK_PARSED_MARKET.options[0]?.yesPriceCents ??
        20) / 100
    ).toFixed(2),
  );
  const [amount, setAmount] = useState("100");
  const [shares, setShares] = useState("100");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationPreset, setExpirationPreset] = useState("5m");

  const numericPrice = useMemo(() => {
    const priceValue = Number(price);
    return Number.isFinite(priceValue) ? Math.max(priceValue, 0) : 0;
  }, [price]);

  const numericAmount = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }, [amount]);

  const numericShares = useMemo(() => {
    const value = Number(shares);
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }, [shares]);

  const total = useMemo(() => {
    if (orderMode === "MARKET" && side === "BUY") {
      return numericAmount;
    }
    return numericShares * numericPrice;
  }, [numericAmount, numericPrice, numericShares, orderMode, side]);

  const estimatedToWin = useMemo(() => {
    if (orderMode === "MARKET" && side === "BUY") {
      if (numericPrice <= 0) {
        return 0;
      }
      return numericAmount / numericPrice;
    }
    return numericShares;
  }, [numericAmount, numericPrice, numericShares, orderMode, side]);

  const availableCash = 2000;
  const maxOrderNotional = 500;
  const slippagePct = 1.0;

  const checks = [
    {
      label: "Minimum order size",
      passed: orderMode === "MARKET" && side === "BUY" ? numericAmount >= 5 : numericShares >= 5,
      detail: orderMode === "MARKET" && side === "BUY" ? "Amount >= $5" : "Shares >= 5",
    },
    {
      label: "Cash and notional limit",
      passed: total <= availableCash && total <= maxOrderNotional,
      detail: `Total <= $${availableCash} and <= Max Order`,
    },
    {
      label: "Slippage threshold",
      passed: slippagePct > 0 && slippagePct <= 5,
      detail: "0% < Slippage <= 5%",
    },
    {
      label: "Expiration validity",
      passed: orderMode === "MARKET" || !expirationEnabled || expirationPreset.length > 0,
      detail: "Required for limit orders when enabled",
    },
  ];

  const allChecksPassed = checks.every((item) => item.passed);
  const selectedOption =
    MOCK_PARSED_MARKET.options.find((item) => item.id === selectedOptionId) ??
    MOCK_PARSED_MARKET.options[0];
  const yesPriceCents = selectedOption?.yesPriceCents ?? 0;
  const noPriceCents = Math.max(100 - yesPriceCents, 0);
  const submitLabel = `${orderMode === "MARKET" ? "Submit Market" : "Submit Limit"} ${side} ${selectedOption.label} Intent`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Management Action Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Parse Market
          </p>
          <div className="space-y-2">
            <Input
              value={marketUrl}
              onChange={(event) => {
                setMarketUrl(event.target.value);
                setParsed(false);
              }}
              placeholder="Paste Polymarket market URL"
            />
            <Button size="sm" className="w-full" onClick={() => setParsed(true)}>
              Parse Market URL
            </Button>
          </div>
        </div>

        {parsed ? (
          <>
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5">
                <p className="text-sm font-medium text-[var(--text)]">{MOCK_PARSED_MARKET.title}</p>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                  <img
                    src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2FBTC%2Bfullsize.png&w=96&q=75"
                    alt="Market"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-auto w-28 space-y-1 text-right">
                  <p className="text-xs text-[var(--text-muted)]">Market Options</p>
                  <Select
                    value={selectedOptionId}
                    onValueChange={(value) => {
                      setSelectedOptionId(value);
                      const option = MOCK_PARSED_MARKET.options.find((item) => item.id === value);
                      if (!option) {
                        return;
                      }
                      if (outcome === "YES") {
                        setPrice((option.yesPriceCents / 100).toFixed(2));
                        return;
                      }
                      setPrice(((100 - option.yesPriceCents) / 100).toFixed(2));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PARSED_MARKET.options.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={side === "BUY" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSide("BUY")}
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={side === "SELL" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSide("SELL")}
                  >
                    Sell
                  </Button>
                </div>
                <Select
                  value={orderMode}
                  onValueChange={(value: "MARKET" | "LIMIT") => setOrderMode(value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={outcome === "YES" ? "default" : "secondary"}
                  className={
                    outcome === "YES" ? "bg-[var(--deposit)] hover:bg-[var(--deposit)]/90" : ""
                  }
                  onClick={() => {
                    setOutcome("YES");
                    setPrice((yesPriceCents / 100).toFixed(2));
                  }}
                >
                  Yes {yesPriceCents}c
                </Button>
                <Button
                  type="button"
                  variant={outcome === "NO" ? "default" : "secondary"}
                  className={
                    outcome === "NO" ? "bg-[var(--danger)] hover:bg-[var(--danger)]/90" : ""
                  }
                  onClick={() => {
                    setOutcome("NO");
                    setPrice((noPriceCents / 100).toFixed(2));
                  }}
                >
                  No {noPriceCents}c
                </Button>
              </div>

              <div className="space-y-2">
                {orderMode === "LIMIT" ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="shrink-0 text-xs text-[var(--text-muted)]">Limit Price</p>
                    <div className="flex w-40 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5"
                        onClick={() =>
                          setPrice((current) =>
                            Math.max((Number(current) || 0) - 0.01, 0.01).toFixed(2),
                          )
                        }
                      >
                        -
                      </Button>
                      <Input
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        className="h-6 min-w-0 flex-1 border-0 bg-transparent px-0 text-right text-sm shadow-none focus-visible:ring-0"
                      />
                      <span className="text-xs text-[var(--text-muted)]">USD</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5"
                        onClick={() =>
                          setPrice((current) =>
                            Math.min((Number(current) || 0) + 0.01, 0.99).toFixed(2),
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ) : null}

                {orderMode === "MARKET" && side === "BUY" ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="shrink-0 text-xs text-[var(--text-muted)]">Amount</p>
                    <Input
                      className="w-40"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="shrink-0 text-xs text-[var(--text-muted)]">Shares</p>
                    <Input
                      className="w-40"
                      value={shares}
                      onChange={(event) => setShares(event.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-1.5">
                  {["-100", "-10", "+10", "+100"].map((step) => (
                    <Button
                      key={step}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-1.5 text-[11px]"
                    >
                      {step}
                    </Button>
                  ))}
                </div>

                <p className="text-right text-xs text-[var(--deposit)]">
                  {estimatedToWin.toFixed(2)} matching
                </p>
              </div>

              {orderMode === "LIMIT" ? (
                <div className="space-y-2 border-t border-[var(--border)] pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">Set Expiration</p>
                    <Button
                      type="button"
                      variant={expirationEnabled ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setExpirationEnabled((current) => !current)}
                    >
                      {expirationEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                  {expirationEnabled ? (
                    <Select value={expirationPreset} onValueChange={setExpirationPreset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5m">5m</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="12h">12h</SelectItem>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="eod">End of day</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-1 border-t border-[var(--border)] pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Total</span>
                  <span className="font-semibold text-[var(--text)]">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">To Win</span>
                  <span className="font-semibold text-[var(--deposit)]">
                    ${estimatedToWin.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button className="w-full" disabled={!allChecksPassed}>
                {submitLabel}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
