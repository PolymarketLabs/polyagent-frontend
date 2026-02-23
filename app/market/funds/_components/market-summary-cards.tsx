"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  SummaryStatsCardGrid,
  type SummaryStatItem,
} from "@/components/cards/summary-stats-card-grid";
import { type MarketSummary, getMarketSummary } from "@/lib/api/services/market";

export function MarketSummaryCards() {
  const locale = useLocale();
  const [summary, setSummary] = useState<MarketSummary | null>(null);
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

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await getMarketSummary();
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
        label: "Fund Count",
        value: summary ? integerFormatter.format(summary.fundCount) : "—",
      },
      {
        label: "Total Investors",
        value: summary ? integerFormatter.format(summary.totalInvestorCount) : "—",
      },
      {
        label: "Total Invested",
        value: summary ? compactUsdFormatter.format(summary.totalInvested) : "—",
      },
      {
        label: "Total Value",
        value: summary ? compactUsdFormatter.format(summary.totalValue) : "—",
      },
    ],
    [compactUsdFormatter, integerFormatter, summary],
  );

  return <SummaryStatsCardGrid items={cards} loading={loading} />;
}
