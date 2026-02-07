"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
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
  Pencil,
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
import { Category } from "@/lib/database";
import { cn } from "@/lib/utils";

interface MerchantCategoryTableProps {
  categories?: Category[];
  onSave?: (categories: Category[]) => Promise<void>;
  onClose?: () => void;
  onRefresh?: () => Promise<void>;
}

export function MerchantCategoryTable({
  categories: propCategories,
  onSave,
  onClose,
  onRefresh,
}: MerchantCategoryTableProps) {
  const [categories, setCategories] = React.useState<Category[]>(propCategories || []);

  // Fetch categories if not provided
  useEffect(() => {
    if (!propCategories) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch((err) => console.error("Failed to fetch categories:", err));
    } else {
      setCategories(propCategories);
    }
  }, [propCategories]);
  const [nameFilter, setNameFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 250,
  });

  const parentCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => !c.parent_category_id);
  }, [categories]);

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        header: "Category Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
        size: 250,
      },
      {
        header: "Parent Category",
        accessorKey: "parent_category_id",
        cell: ({ row }) => {
          const parent = parentCategories.find(
            (p) => p.id === row.original.parent_category_id
          );
          return (
            <div>
              {parent ? (
                <Badge variant="outline">{parent.name}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        header: "PFC Mappings",
        accessorKey: "plaid_pfc_codes",
        cell: ({ row }) => {
          const count = row.original.plaid_pfc_codes?.length || 0;
          return (
            <div className="text-center">
              {count > 0 ? (
                <Badge variant="secondary">{count} mapped</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => {
          const date = row.original.created_at
            ? new Date(row.original.created_at)
            : null;
          return (
            <div className="text-sm text-muted-foreground">
              {date ? date.toLocaleDateString() : "-"}
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => <RowActions category={row.original} />,
        size: 60,
      },
    ],
    [parentCategories]
  );

  const filteredData = useMemo(() => {
    if (!categories) return [];
    if (!nameFilter) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }, [categories, nameFilter]);

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
            <span className="text-xl font-semibold">Categories</span>
            <Button variant="default" size="sm">
              Add Category
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search categories..."
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
                  No categories found.
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

function RowActions({ category }: { category: Category }) {
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
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Manage PFC Mappings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
