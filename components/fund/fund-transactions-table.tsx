"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import { listMarketFundTransactions, type MarketFundTransaction } from "@/lib/api/services/market";
import type { PaginatedData } from "@/lib/api/types/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FundTransactionsTableProps = {
  fundId: number;
  pageSize?: number;
  showPagination?: boolean;
};

function formatAddress(value: string): string {
  if (value.length <= 10) {
    return value;
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatUtcDateTime(value: string): string {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

function getTransactionTypeBadgeVariant(type: string): "success" | "warning" | "default" {
  if (type === "DEPOSIT") {
    return "success";
  }
  if (type === "REDEEM") {
    return "warning";
  }
  return "default";
}

function getTransactionStatusBadgeVariant(
  status: string,
): "success" | "warning" | "destructive" | "default" {
  if (status === "SETTLED") {
    return "success";
  }
  if (status === "PENDING") {
    return "warning";
  }
  if (status === "CANCELED") {
    return "destructive";
  }
  return "default";
}

export function FundTransactionsTable({
  fundId,
  pageSize = 10,
  showPagination = true,
}: FundTransactionsTableProps) {
  const locale = useLocale();
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MarketFundTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedData<MarketFundTransaction>["pagination"]>({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [numberLocale],
  );

  const sharesFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [numberLocale],
  );

  useEffect(() => {
    setPage(1);
  }, [fundId, showPagination]);

  useEffect(() => {
    let active = true;

    const fetchTransactions = async () => {
      setLoading(true);
      setLoadError(null);
      const requestPage = showPagination ? page : 1;

      try {
        const data = await listMarketFundTransactions(fundId, {
          page: requestPage,
          pageSize,
        });
        if (!active) {
          return;
        }

        setItems(data.items);
        setPagination(data.pagination);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to fetch transactions";
        setLoadError(message);
        setItems([]);
        setPagination((prev) => ({ ...prev, page: requestPage }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchTransactions();

    return () => {
      active = false;
    };
  }, [fundId, page, pageSize, showPagination]);

  const canPreviousPage = page > 1 && !loading;
  const canNextPage = page < pagination.totalPages && !loading;

  return (
    <div className="space-y-4">
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">Failed to load transactions: {loadError}</p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Investor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--text-muted)]">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatUtcDateTime(item.date)}</TableCell>
                <TableCell>
                  <Badge variant={getTransactionTypeBadgeVariant(item.type)}>{item.type}</Badge>
                </TableCell>
                <TableCell className="font-mono" title={item.investor}>
                  {formatAddress(item.investor)}
                </TableCell>
                <TableCell>
                  {item.amount === null ? "—" : amountFormatter.format(item.amount)}
                </TableCell>
                <TableCell>
                  {item.shares === null ? "—" : sharesFormatter.format(item.shares)}
                </TableCell>
                <TableCell>
                  <Badge variant={getTransactionStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--text-muted)]">
                No transactions
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)} | Total{" "}
            {pagination.totalItems}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={!canPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(current + 1, Math.max(pagination.totalPages, 1)))
              }
              disabled={!canNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
