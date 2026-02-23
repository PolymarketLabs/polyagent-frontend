"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { PaginatedData } from "@/lib/api/types/pagination";
import { listManagerFunds, type ManagerFundItem } from "@/lib/api/services/manager";
import Link from "@/components/navigation/ref-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

type ManagerFundRow = {
  fundId: number;
  fundName: string;
  status: "RUNNING" | "STOPPED";
  currentNav: number;
  cumulativeReturnPct: number;
  aum: number;
  investorCount: number;
};

const PAGE_SIZE = 5;
const DEFAULT_PAGINATION: PaginatedData<ManagerFundItem>["pagination"] = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
};

function formatReturn(value: number): string {
  const percentValue = value * 100;
  return `${percentValue > 0 ? "+" : ""}${percentValue.toFixed(1)}%`;
}

function formatStatus(status: ManagerFundRow["status"]): string {
  if (status === "RUNNING") {
    return "Running";
  }
  return "Stopped";
}

export function ManagerFundsTable() {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ManagerFundRow[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedData<ManagerFundItem>["pagination"]>(DEFAULT_PAGINATION);
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

  useEffect(() => {
    let active = true;

    const fetchManagerFunds = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await listManagerFunds({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
        });
        if (!active) {
          return;
        }

        const mappedItems: ManagerFundRow[] = data.items.map((item) => ({
          fundId: item.fundId,
          fundName: item.fundName,
          status: item.status,
          currentNav: item.currentNav,
          cumulativeReturnPct: item.cumulativeReturnPct,
          aum: item.aum,
          investorCount: item.investorCount,
        }));

        setItems(mappedItems);
        setPagination(data.pagination);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to fetch managed funds";
        setLoadError(message);
        setItems([]);
        setPagination((prev) => ({ ...prev, page }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchManagerFunds();

    return () => {
      active = false;
    };
  }, [keyword, page]);

  const columns = useMemo<ColumnDef<ManagerFundRow>[]>(
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
        accessorKey: "currentNav",
        header: "Current NAV",
        cell: ({ row }) =>
          new Intl.NumberFormat(numberLocale, {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }).format(row.getValue<number>("currentNav")),
      },
      {
        accessorKey: "cumulativeReturnPct",
        header: "Cumulative Return",
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
          const status = row.getValue<ManagerFundRow["status"]>("status");
          const variant = status === "RUNNING" ? "success" : "destructive";
          return <Badge variant={variant}>{formatStatus(status)}</Badge>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={`/manager/${row.original.fundId}`}>Manage</Link>
          </Button>
        ),
      },
    ],
    [compactUsdFormatter, numberLocale],
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
          placeholder="Search by fund name or fund ID"
          className="w-full max-w-sm"
        />
        <Button type="button" size="sm" onClick={triggerSearch} disabled={loading}>
          Search
        </Button>
      </div>
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">Failed to load managed funds: {loadError}</p>
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
