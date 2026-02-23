"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { PaginatedData } from "@/lib/api/types/pagination";
import { listInvestmentFunds, type InvestmentFundItem } from "@/lib/api/services/investment";
import Link from "@/components/navigation/ref-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";

type InvestmentRow = {
  fundId: number;
  fundName: string;
  managerAddress: string;
  currentNav: number;
  shares: number;
  invested: number;
  currentValue: number;
  returnPct: number;
};

const PAGE_SIZE = 5;
const DEFAULT_PAGINATION: PaginatedData<InvestmentFundItem>["pagination"] = {
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

export function InvestmentFundsTable() {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvestmentRow[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedData<InvestmentFundItem>["pagination"]>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";
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
  const amountUsdFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [numberLocale],
  );
  const shareFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [numberLocale],
  );

  useEffect(() => {
    let active = true;

    const fetchInvestmentFunds = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await listInvestmentFunds({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
        });
        if (!active) {
          return;
        }

        const mappedItems: InvestmentRow[] = data.items.map((item: InvestmentFundItem) => ({
          fundId: item.fundId,
          fundName: item.fundName,
          managerAddress: item.manager,
          currentNav: item.currentNav,
          shares: item.holdingShares,
          invested: item.investedAmount,
          currentValue: item.currentValue,
          returnPct: item.returnPct,
        }));

        setItems(mappedItems);
        setPagination(data.pagination);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to fetch investment funds";
        setLoadError(message);
        setItems([]);
        setPagination((prev) => ({ ...prev, page }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInvestmentFunds();

    return () => {
      active = false;
    };
  }, [keyword, page]);

  const columns = useMemo<ColumnDef<InvestmentRow>[]>(
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
        accessorKey: "managerAddress",
        header: "Manager",
        cell: ({ row }) => (
          <span
            className="font-mono text-xs text-[var(--text-muted)]"
            title={row.getValue("managerAddress")}
          >
            {formatManagerAddress(row.getValue("managerAddress"))}
          </span>
        ),
      },
      {
        accessorKey: "currentNav",
        header: "Current NAV",
        cell: ({ row }) => navUsdFormatter.format(row.getValue<number>("currentNav")),
      },
      {
        accessorKey: "shares",
        header: "Shares",
        cell: ({ row }) => shareFormatter.format(row.getValue<number>("shares")),
      },
      {
        accessorKey: "invested",
        header: "Invested",
        cell: ({ row }) => amountUsdFormatter.format(row.getValue<number>("invested")),
      },
      {
        accessorKey: "currentValue",
        header: "Current Value",
        cell: ({ row }) => amountUsdFormatter.format(row.getValue<number>("currentValue")),
      },
      {
        id: "pnl",
        header: "PnL",
        cell: ({ row }) => {
          const invested = row.original.invested;
          const currentValue = row.original.currentValue;
          const delta = currentValue - invested;
          const positive = delta >= 0;
          return (
            <span className={positive ? "text-[var(--deposit)]" : "text-[var(--danger)]"}>
              {positive ? "+" : "-"}
              {amountUsdFormatter.format(Math.abs(delta))}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={`/investment/funds/${row.original.fundId}`}>Details</Link>
          </Button>
        ),
      },
    ],
    [amountUsdFormatter, navUsdFormatter, shareFormatter],
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
          placeholder="Search by fund name, manager address, or fund ID"
          className="w-full max-w-sm"
        />
        <Button type="button" size="sm" onClick={triggerSearch} disabled={loading}>
          Search
        </Button>
      </div>
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">Failed to load investments: {loadError}</p>
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
