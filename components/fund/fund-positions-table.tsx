"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import {
  getMarketFundCashReserve,
  listMarketFundPositions,
  type MarketFundCashReserve,
  type MarketFundPosition,
} from "@/lib/api/services/market";
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

type FundPositionsTableProps = {
  fundId: number;
  pageSize?: number;
  showPagination?: boolean;
};

export function FundPositionsTable({
  fundId,
  pageSize = 10,
  showPagination = true,
}: FundPositionsTableProps) {
  const locale = useLocale();
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";

  const [page, setPage] = useState(1);
  const [positions, setPositions] = useState<MarketFundPosition[]>([]);
  const [cashReserve, setCashReserve] = useState<MarketFundCashReserve | null>(null);
  const [pagination, setPagination] = useState<PaginatedData<MarketFundPosition>["pagination"]>({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  });
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [cashReserveLoading, setCashReserveLoading] = useState(true);
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

    const fetchPositions = async () => {
      setPositionsLoading(true);
      setLoadError(null);
      const requestPage = showPagination ? page : 1;

      try {
        const data = await listMarketFundPositions(fundId, {
          page: requestPage,
          pageSize,
        });
        if (!active) {
          return;
        }

        setPositions(data.items);
        setPagination(data.pagination);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to fetch positions";
        setLoadError(message);
        setPositions([]);
        setPagination((prev) => ({ ...prev, page: requestPage }));
      } finally {
        if (active) {
          setPositionsLoading(false);
        }
      }
    };

    void fetchPositions();

    return () => {
      active = false;
    };
  }, [fundId, page, pageSize, showPagination]);

  useEffect(() => {
    let active = true;

    const fetchCashReserve = async () => {
      setCashReserveLoading(true);
      try {
        const data = await getMarketFundCashReserve(fundId);
        if (!active) {
          return;
        }
        setCashReserve(data);
      } catch (error) {
        if (!active) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to fetch cash reserve";
        setLoadError(message);
        setCashReserve(null);
      } finally {
        if (active) {
          setCashReserveLoading(false);
        }
      }
    };

    void fetchCashReserve();

    return () => {
      active = false;
    };
  }, [fundId]);

  const canPreviousPage = page > 1 && !positionsLoading;
  const canNextPage = page < pagination.totalPages && !positionsLoading;

  return (
    <div className="space-y-4">
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">Failed to load positions: {loadError}</p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Current Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positionsLoading && positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--text-muted)]">
                Loading positions...
              </TableCell>
            </TableRow>
          ) : positions.length > 0 ? (
            positions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-[var(--text)]">{item.marketName}</TableCell>
                <TableCell>
                  <Badge variant={item.outcome === "YES" ? "success" : "destructive"}>
                    {item.outcome}
                  </Badge>
                </TableCell>
                <TableCell>{`${item.allocationPct >= 0 ? "+" : ""}${(item.allocationPct * 100).toFixed(1)}%`}</TableCell>
                <TableCell>{sharesFormatter.format(item.shares)}</TableCell>
                <TableCell>{amountFormatter.format(item.currentValue)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--text-muted)]">
                No positions
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell className="font-medium text-[var(--text)]">Cash Reserve</TableCell>
            <TableCell>—</TableCell>
            <TableCell>
              {cashReserveLoading || cashReserve === null
                ? "—"
                : `${cashReserve.allocationPct >= 0 ? "+" : ""}${(cashReserve.allocationPct * 100).toFixed(1)}%`}
            </TableCell>
            <TableCell>—</TableCell>
            <TableCell>
              {cashReserveLoading || cashReserve === null
                ? "—"
                : amountFormatter.format(cashReserve.currentValue)}
            </TableCell>
          </TableRow>
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
