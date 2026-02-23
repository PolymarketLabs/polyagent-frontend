"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pagination?: {
    page: number;
    totalItems: number;
    totalPages: number;
  };
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  canPreviousPage?: boolean;
  canNextPage?: boolean;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pagination,
  onPreviousPage,
  onNextPage,
  canPreviousPage,
  canNextPage,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = Math.max(table.getPageCount(), 1);
  const totalRows = table.getFilteredRowModel().rows.length;
  const displayTotalPages = Math.max(pagination?.totalPages ?? pageCount, 1);
  const displayPage = Math.min(Math.max(pagination?.page ?? pageIndex + 1, 1), displayTotalPages);
  const displayTotal = pagination?.totalItems ?? totalRows;
  const previousDisabled =
    canPreviousPage === undefined ? !table.getCanPreviousPage() : !canPreviousPage;
  const nextDisabled = canNextPage === undefined ? !table.getCanNextPage() : !canNextPage;
  const handlePrevious = onPreviousPage ?? (() => table.previousPage());
  const handleNext = onNextPage ?? (() => table.nextPage());

  return (
    <div className="space-y-4">
      {searchKey ? (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
      ) : null}

      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-sm text-[var(--text-muted)]"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)]">
          Page {displayPage} of {displayTotalPages} | Total {displayTotal}
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} disabled={previousDisabled}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={nextDisabled}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
