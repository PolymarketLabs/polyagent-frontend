"use client";

import { useEffect, useState } from "react";

import {
  listManagerIntents,
  type ManagerIntent,
  type ManagerIntentStatus,
} from "@/lib/api/services/manager";
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

type ExecutionIntentsTableProps = {
  fundId: number;
  pageSize?: number;
};

function formatUtcDateTime(value: string): string {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

function getIntentStatusVariant(
  status: ManagerIntentStatus,
): "default" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") {
    return "success";
  }
  if (status === "EXECUTING" || status === "PENDING") {
    return "warning";
  }
  if (status === "FAILED") {
    return "destructive";
  }
  return "default";
}

export function ExecutionIntentsTable({ fundId, pageSize = 10 }: ExecutionIntentsTableProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ManagerIntent[]>([]);
  const [pagination, setPagination] = useState<PaginatedData<ManagerIntent>["pagination"]>({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [fundId]);

  useEffect(() => {
    let active = true;

    const fetchIntents = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await listManagerIntents(fundId, {
          page,
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
        const message =
          error instanceof Error ? error.message : "Failed to fetch execution intents";
        setLoadError(message);
        setItems([]);
        setPagination((prev) => ({ ...prev, page }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchIntents();

    return () => {
      active = false;
    };
  }, [fundId, page, pageSize]);

  const canPreviousPage = page > 1 && !loading;
  const canNextPage = page < pagination.totalPages && !loading;

  return (
    <div className="space-y-4">
      {loadError ? (
        <p className="text-sm text-[var(--danger)]">
          Failed to load execution intents: {loadError}
        </p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Intent ID</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Order Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--text-muted)]">
                Loading execution intents...
              </TableCell>
            </TableRow>
          ) : items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.intentId}>
                <TableCell className="font-mono text-xs">{item.intentId}</TableCell>
                <TableCell>{formatUtcDateTime(item.createdAt)}</TableCell>
                <TableCell>{item.order.side}</TableCell>
                <TableCell>{item.orderType}</TableCell>
                <TableCell>
                  <Badge variant={getIntentStatusVariant(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-[var(--text-muted)]">
                  {item.errorMessage ?? "—"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--text-muted)]">
                No execution intents
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </div>
  );
}
