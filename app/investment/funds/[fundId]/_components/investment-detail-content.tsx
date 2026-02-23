"use client";

import { useCallback, useEffect, useState } from "react";

import { type FundTransactionStatus, type FundTransactionType } from "@/lib/api/types/fund";
import {
  cancelInvestmentTransaction,
  getInvestmentDetail,
  getInvestmentValueTrend,
  listInvestmentTransactions,
  type InvestmentFundDetail,
  type InvestmentFundTransaction,
  type InvestmentValueTrendPoint,
} from "@/lib/api/services/investment";
import type { PaginatedData } from "@/lib/api/types/pagination";
import { formatUsd, formatUtcDateTime } from "@/lib/format/fund";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { TradePanelCard } from "@/components/cards/trade-panel-card";
import {
  FundOverviewGrid,
  FundRulesGrid,
  FundStrategyGrid,
} from "@/components/fund/fund-detail-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvestmentDetailContentProps = {
  fundId: number;
};

const TRANSACTION_PAGE_SIZE = 10;

function formatShares(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPct(value: number): string {
  const pct = value * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function getFundStatusVariant(status: "RUNNING" | "STOPPED"): "success" | "destructive" {
  return status === "RUNNING" ? "success" : "destructive";
}

function getTransactionTypeVariant(type: FundTransactionType): "success" | "warning" {
  return type === "DEPOSIT" ? "success" : "warning";
}

function getTransactionStatusVariant(
  status: FundTransactionStatus,
): "success" | "warning" | "destructive" {
  if (status === "SETTLED") {
    return "success";
  }
  if (status === "PENDING") {
    return "warning";
  }
  return "destructive";
}

export function InvestmentDetailContent({ fundId }: InvestmentDetailContentProps) {
  const [detail, setDetail] = useState<InvestmentFundDetail | null>(null);
  const [valueTrend, setValueTrend] = useState<InvestmentValueTrendPoint[]>([]);
  const [transactions, setTransactions] = useState<InvestmentFundTransaction[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPagination, setTransactionPagination] = useState<
    PaginatedData<InvestmentFundTransaction>["pagination"]
  >({
    page: 1,
    pageSize: TRANSACTION_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelingTransactionId, setCancelingTransactionId] = useState<number | null>(null);

  const loadTransactions = useCallback(
    async (
      page: number,
      options: {
        withLoading?: boolean;
        isActive?: () => boolean;
      } = {},
    ) => {
      const { withLoading = true, isActive } = options;
      const canUpdate = () => (isActive ? isActive() : true);

      if (withLoading && canUpdate()) {
        setTransactionsLoading(true);
      }
      if (canUpdate()) {
        setTransactionsError(null);
      }

      try {
        const transactionData = await listInvestmentTransactions(fundId, {
          page,
          pageSize: TRANSACTION_PAGE_SIZE,
        });

        if (canUpdate()) {
          setTransactions(transactionData.items);
          setTransactionPagination(transactionData.pagination);
        }

        return transactionData;
      } catch (error) {
        if (canUpdate()) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch investment transactions";
          setTransactionsError(message);
        }
        throw error;
      } finally {
        if (withLoading && canUpdate()) {
          setTransactionsLoading(false);
        }
      }
    },
    [fundId],
  );

  useEffect(() => {
    let active = true;

    const loadInvestmentDetail = async () => {
      setLoading(true);
      setLoadError(null);
      setTransactionsError(null);
      setCancelError(null);

      try {
        const [detailData, valueTrendData] = await Promise.all([
          getInvestmentDetail(fundId),
          getInvestmentValueTrend(fundId),
        ]);

        if (!active) {
          return;
        }

        setDetail(detailData);
        setValueTrend(valueTrendData);
        setTransactionPage(1);
        await loadTransactions(1, { withLoading: false, isActive: () => active });
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch investment detail";
        setLoadError(message);
        setDetail(null);
        setValueTrend([]);
        setTransactions([]);
        setTransactionPagination((prev) => ({ ...prev, page: 1, pageSize: TRANSACTION_PAGE_SIZE }));
        setTransactionPage(1);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInvestmentDetail();

    return () => {
      active = false;
    };
  }, [fundId, loadTransactions]);

  useEffect(() => {
    setTransactionPage(1);
  }, [fundId]);

  useEffect(() => {
    let active = true;

    const handlePageChange = async () => {
      if (!detail) {
        return;
      }
      if (transactionPage === transactionPagination.page) {
        return;
      }

      try {
        await loadTransactions(transactionPage, { isActive: () => active });
      } catch (error) {
        if (!active) {
          return;
        }
        setTransactionPage(transactionPagination.page);
      }
    };

    void handlePageChange();

    return () => {
      active = false;
    };
  }, [detail, loadTransactions, transactionPage, transactionPagination.page]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading investment detail...</CardTitle>
          <CardDescription>Please wait while we fetch the latest data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadError || !detail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failed to load investment detail</CardTitle>
          <CardDescription>{loadError ?? "Unknown error"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartPoints = valueTrend.map((item) => ({ date: item.date, value: item.value }));

  const investmentOverviewKpis = [
    { label: "Holding Shares", value: formatShares(detail.holdingShares) },
    { label: "Total Deposits", value: formatUsd(detail.totalDeposits) },
    { label: "Total Redeems", value: formatUsd(detail.totalRedeems) },
    { label: "Net Invested", value: formatUsd(detail.netInvested) },
    { label: "Current Value", value: formatUsd(detail.currentValue) },
    {
      label: "Total PnL",
      value: `${detail.totalPnl >= 0 ? "+" : "-"}${formatUsd(Math.abs(detail.totalPnl))} (${formatPct(detail.totalPnlPct)})`,
      tone: detail.totalPnl >= 0 ? "text-[var(--deposit)]" : "text-[var(--danger)]",
    },
    {
      label: "Unrealized PnL",
      value: `${detail.unrealizedPnl >= 0 ? "+" : "-"}${formatUsd(Math.abs(detail.unrealizedPnl))} (${formatPct(detail.unrealizedPnlPct)})`,
      tone: detail.unrealizedPnl >= 0 ? "text-[var(--deposit)]" : "text-[var(--danger)]",
    },
    {
      label: "Realized PnL",
      value: `${detail.realizedPnl >= 0 ? "+" : "-"}${formatUsd(Math.abs(detail.realizedPnl))} (${formatPct(detail.realizedPnlPct)})`,
      tone: detail.realizedPnl >= 0 ? "text-[var(--deposit)]" : "text-[var(--danger)]",
    },
  ];

  const rulesKpis = [
    { label: "Minimum Deposit", value: formatUsd(detail.minimumDeposit) },
    { label: "Minimum Redeem", value: formatUsd(detail.minimumRedeem) },
    { label: "Management Fee", value: `${(detail.managementFeeRate * 100).toFixed(1)}%` },
    { label: "Performance Fee", value: `${(detail.performanceFeeRate * 100).toFixed(1)}%` },
    {
      label: "Auto Stop-Loss",
      value: `${(detail.autoStopLossPct * 100).toFixed(1)}%`,
      fullRow: true,
    },
  ];
  const canPreviousPage = transactionPage > 1 && !transactionsLoading;
  const canNextPage = transactionPage < transactionPagination.totalPages && !transactionsLoading;

  const handleCancelTransaction = async (transactionId: number) => {
    setCancelError(null);
    setCancelingTransactionId(transactionId);

    try {
      await cancelInvestmentTransaction(fundId, transactionId);
      await loadTransactions(transactionPage, { withLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel transaction";
      setCancelError(message);
    } finally {
      setCancelingTransactionId((current) => (current === transactionId ? null : current));
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Investment Detail
                </p>
                <Badge variant={getFundStatusVariant(detail.status)}>{detail.status}</Badge>
                <Badge>Fund #{detail.fundId}</Badge>
              </div>
            </div>
            <CardTitle>{detail.fundName}</CardTitle>
            <CardDescription>{detail.fundDescription}</CardDescription>
            <div className="space-y-1 pt-1 text-xs text-[var(--text-muted)]">
              <div>
                Vault: <span className="font-mono">{detail.vaultAddress}</span>
              </div>
              <div>
                Manager: <span className="font-mono">{detail.manager}</span>
              </div>
              <div>Created At: {formatUtcDateTime(detail.createdAt)}</div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment Overview</CardTitle>
            <CardDescription>Core investment indicators for this fund position.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundOverviewGrid items={investmentOverviewKpis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategy</CardTitle>
            <CardDescription>Target markets and portfolio construction approach.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundStrategyGrid
              riskProfile={detail.riskProfile}
              marketUniverse={detail.marketUniverse}
              rebalanceRule={detail.rebalanceRule}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules</CardTitle>
            <CardDescription>Investment thresholds and fee settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <FundRulesGrid items={rulesKpis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Value Trend</CardTitle>
            <CardDescription>Daily portfolio value trend.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart points={chartPoints} fractionDigits={0} yAxisWidth={72} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions</CardTitle>
            <CardDescription>Deposit and redeem records for your position.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionsError ? (
                <p className="text-sm text-[var(--danger)]">
                  Failed to load transactions: {transactionsError}
                </p>
              ) : null}
              {cancelError ? (
                <p className="text-sm text-[var(--danger)]">
                  Failed to cancel transaction: {cancelError}
                </p>
              ) : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Executed NAV</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading && transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-20 text-center text-sm text-[var(--text-muted)]"
                      >
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length > 0 ? (
                    transactions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatUtcDateTime(item.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={getTransactionTypeVariant(item.type)}>{item.type}</Badge>
                        </TableCell>
                        <TableCell>{item.amount === null ? "—" : formatUsd(item.amount)}</TableCell>
                        <TableCell>
                          {item.shares === null ? "—" : formatShares(item.shares)}
                        </TableCell>
                        <TableCell>
                          {item.executedNav === null ? "—" : formatUsd(item.executedNav, 3)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTransactionStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === "PENDING" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleCancelTransaction(item.id)}
                              disabled={cancelingTransactionId === item.id}
                            >
                              {cancelingTransactionId === item.id ? "Canceling..." : "Cancel"}
                            </Button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-20 text-center text-sm text-[var(--text-muted)]"
                      >
                        No transactions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)]">
                  Page {transactionPagination.page} of{" "}
                  {Math.max(transactionPagination.totalPages, 1)} | Total{" "}
                  {transactionPagination.totalItems}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransactionPage((current) => Math.max(current - 1, 1))}
                    disabled={!canPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTransactionPage((current) =>
                        Math.min(current + 1, Math.max(transactionPagination.totalPages, 1)),
                      )
                    }
                    disabled={!canNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
        <TradePanelCard
          vaultAddress={detail.vaultAddress}
          minimumDeposit={detail.minimumDeposit}
          minimumRedeem={detail.minimumRedeem}
          currentNav={detail.currentNav}
        />
      </aside>
    </section>
  );
}
