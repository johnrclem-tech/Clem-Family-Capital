"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePagination } from "@/hooks/use-pagination";
import { MerchantWithStats, Category } from "@/lib/database";
import { formatCurrency, cn } from "@/lib/utils";

interface MerchantsDashboardTableProps {
  merchants: MerchantWithStats[];
  categories: Category[];
  tags: Array<{ id: string; name: string; color?: string | null }>;
  onRefresh: () => void;
}

export function MerchantsDashboardTable({
  merchants,
  categories,
  tags,
  onRefresh,
}: MerchantsDashboardTableProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 250,
  });

  const columns = useMemo<ColumnDef<MerchantWithStats>[]>(
    () => [
      {
        header: "Merchant",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
        size: 250,
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => {
          const category = categories?.find((c) => c.id === row.original.category_id);
          if (!category) {
            return (
              <span className="text-muted-foreground text-sm whitespace-nowrap">Uncategorized</span>
            );
          }

          // Find parent category to get its color
          const parentCategory = category.parent_id
            ? categories.find((c) => c.id === category.parent_id)
            : null;

          // Use parent category color if available, otherwise use category color
          const badgeColor = parentCategory?.color || category.color;

          return (
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap"
              style={{
                backgroundColor: badgeColor || undefined,
                color: badgeColor ? '#ffffff' : undefined,
                borderColor: badgeColor || undefined,
              }}
            >
              {category.name}
            </Badge>
          );
        },
        size: 180,
      },
      {
        header: "Tags",
        accessorKey: "tags",
        cell: ({ row }) => {
          const merchantTags = row.original.tag_ids && tags
            ? tags.filter((t) => row.original.tag_ids?.includes(t.id))
            : [];
          return (
            <div className="flex gap-1 flex-wrap">
              {merchantTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          );
        },
        size: 200,
      },
      {
        header: "Transactions",
        accessorKey: "transaction_count",
        cell: ({ row }) => (
          <div className="text-center">{row.original.transaction_count}</div>
        ),
        size: 120,
      },
      {
        header: "Total Spent",
        accessorKey: "total_amount",
        cell: ({ row }) => {
          const amount = row.original.total_amount || 0;
          return (
            <div className={cn("text-right font-medium", amount < 0 ? "text-red-600" : "text-green-600")}>
              {formatCurrency(Math.abs(amount))}
            </div>
          );
        },
        size: 140,
      },
      {
        header: "Avg Amount",
        accessorKey: "avg_amount",
        cell: ({ row }) => {
          const amount = row.original.avg_amount || 0;
          return (
            <div className="text-right">
              {formatCurrency(Math.abs(amount))}
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => <RowActions merchant={row.original} />,
        size: 60,
      },
    ],
    [categories, tags]
  );

  const filteredData = useMemo(() => {
    if (!merchants) return [];
    if (!nameFilter) return merchants;
    return merchants.filter((m) =>
      m.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }, [merchants, nameFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
  });

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2,
  });

  return (
    <div className="w-full">
      <div className="border-b">
        {/* Filter Section */}
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">Merchants</span>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search merchants..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-14 border-t">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="text-muted-foreground last:text-center"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={0}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} />,
                          desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-transparent">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-14">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No merchants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer with Pagination */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col">
        <p className="text-muted-foreground text-sm whitespace-nowrap">
          Showing{" "}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                table.getState().pagination.pageSize,
              table.getRowCount()
            )}
          </span>{" "}
          of <span>{table.getRowCount()} entries</span>
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon />
                  Previous
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map((page) => {
                const isActive = page === table.getState().pagination.pageIndex + 1;

                return (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      className={cn(
                        !isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                );
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  Next
                  <ChevronRightIcon />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function RowActions({ merchant }: { merchant: MerchantWithStats }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full p-2">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>View Transactions</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
