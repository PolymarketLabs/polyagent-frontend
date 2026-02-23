"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  SummaryStatsCardGrid,
  type SummaryStatItem,
} from "@/components/cards/summary-stats-card-grid";
import { type InvestmentSummary, getInvestmentSummary } from "@/lib/api/services/investment";

export function InvestmentSummaryCards() {
  const locale = useLocale();
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";

  const integerFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        maximumFractionDigits: 0,
      }),
    [numberLocale],
  );

  const compactUsdFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency: "USD",
        notation: "compact",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [numberLocale],
  );

  const pctFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [numberLocale],
  );

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await getInvestmentSummary();
        if (!active) {
          return;
        }
        setSummary(data);
      } catch {
        if (!active) {
          return;
        }
        setSummary(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      active = false;
    };
  }, []);

  const cards: SummaryStatItem[] = useMemo(
    () => [
      {
        label: "Invested Fund Count",
        value: summary ? integerFormatter.format(summary.investedFundCount) : "—",
      },
      {
        label: "Total Invested",
        value: summary ? compactUsdFormatter.format(summary.totalInvested) : "—",
      },
      {
        label: "Total Value",
        value: summary ? compactUsdFormatter.format(summary.currentTotalValue) : "—",
      },
      {
        label: "Cumulative PnL",
        value: summary
          ? `${summary.cumulativePnl >= 0 ? "+" : "-"}${compactUsdFormatter.format(Math.abs(summary.cumulativePnl))} (${summary.cumulativePnlPct >= 0 ? "+" : "-"}${pctFormatter.format(Math.abs(summary.cumulativePnlPct))})`
          : "—",
        valueClassName:
          summary && summary.cumulativePnl !== 0
            ? summary.cumulativePnl > 0
              ? "text-[var(--deposit)]"
              : "text-[var(--danger)]"
            : undefined,
      },
    ],
    [compactUsdFormatter, integerFormatter, pctFormatter, summary],
  );

  return <SummaryStatsCardGrid items={cards} loading={loading} />;
}
