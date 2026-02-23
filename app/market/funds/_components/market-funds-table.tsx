"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { type FundStatus } from "@/lib/api/types/fund";
import type { PaginatedData } from "@/lib/api/types/pagination";
import { listMarketFunds, type MarketFundDetail } from "@/lib/api/services/market";
import Link from "@/components/navigation/ref-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";

const PAGE_SIZE = 5;
const DEFAULT_PAGINATION: PaginatedData<MarketFundDetail>["pagination"] = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
};

function formatManagerAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatReturn(value: number): string {
  const percentValue = value * 100;
  return `${percentValue > 0 ? "+" : ""}${percentValue.toFixed(1)}%`;
}

function formatStatus(status: FundStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function MarketFundsTable() {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MarketFundDetail[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedData<MarketFundDetail>["pagination"]>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";

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

  const navUsdFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    [numberLocale],
  );

  useEffect(() => {
    let active = true;

    const fetchFunds = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await listMarketFunds({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
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

        const message = error instanceof Error ? error.message : "Failed to fetch funds";
        setLoadError(message);
        setItems([]);
        setPagination((prev) => ({ ...prev, page }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchFunds();

    return () => {
      active = false;
    };
  }, [keyword, page]);

  const columns = useMemo<ColumnDef<MarketFundDetail>[]>(
    () => [
      {
        accessorKey: "fundId",
        header: "Fund ID",
      },
      {
        accessorKey: "fundName",
        header: "Fund Name",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--text)]">{row.getValue("fundName")}</div>
        ),
      },
      {
        accessorKey: "manager",
        header: "Manager",
        cell: ({ row }) => (
          <span
            className="font-mono text-xs text-[var(--text-muted)]"
            title={row.getValue("manager")}
          >
            {formatManagerAddress(row.getValue("manager"))}
          </span>
        ),
      },
      {
        accessorKey: "currentNav",
        header: "Current NAV",
        cell: ({ row }) => (
          <span>{navUsdFormatter.format(row.getValue<number>("currentNav"))}</span>
        ),
      },
      {
        accessorKey: "cumulativeReturnPct",
        header: "Return",
        cell: ({ row }) => {
          const value = row.getValue<number>("cumulativeReturnPct");
          return (
            <span className={value >= 0 ? "text-[var(--deposit)]" : "text-[var(--danger)]"}>
              {formatReturn(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "aum",
        header: "AUM",
        cell: ({ row }) => compactUsdFormatter.format(row.getValue<number>("aum")),
      },
      {
        accessorKey: "investorCount",
        header: "Investors",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue<FundStatus>("status");
          const variant = status === "RUNNING" ? "success" : "destructive";
          return <Badge variant={variant}>{formatStatus(status)}</Badge>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={`/market/funds/${row.original.fundId}`}>View</Link>
          </Button>
        ),
      },
    ],
    [compactUsdFormatter, navUsdFormatter],
  );

  const canPreviousPage = page > 1 && !loading;
  const canNextPage = page < pagination.totalPages && !loading;

  const triggerSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              triggerSearch();
            }
          }}
          placeholder="Search by fund name or manager address"
          className="w-full max-w-sm"
        />
        <Button type="button" size="sm" onClick={triggerSearch} disabled={loading}>
          Search
        </Button>
      </div>
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">Failed to load funds: {loadError}</p>
      ) : null}
      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        onPreviousPage={() => setPage((current) => Math.max(current - 1, 1))}
        onNextPage={() =>
          setPage((current) => Math.min(current + 1, Math.max(pagination.totalPages, 1)))
        }
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
      />
    </div>
  );
}
