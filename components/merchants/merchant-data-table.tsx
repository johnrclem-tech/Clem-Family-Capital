"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/transactions/data-table-pagination"
import { MerchantTableToolbar } from "./merchant-table-toolbar"
import { MerchantDetailSheet } from "./merchant-detail-sheet"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { MerchantWithStats } from "@/lib/database"

interface MerchantDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string; color?: string | null }>
  onMerchantUpdate?: (id: string, updates: Partial<MerchantWithStats>) => Promise<void>
}

export function MerchantDataTable<TData, TValue>({
  columns,
  data,
  categories,
  tags,
  onMerchantUpdate,
}: MerchantDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [selectedMerchant, setSelectedMerchant] = React.useState<MerchantWithStats | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Update selected merchant when data changes (e.g., after save)
  React.useEffect(() => {
    if (selectedMerchant) {
      const updatedMerchant = (data as MerchantWithStats[]).find((m) => m.id === selectedMerchant.id)
      if (updatedMerchant) {
        setSelectedMerchant(updatedMerchant)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: false,
    initialState: {
      pagination: {
        pageSize: 250,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <>
      <div className="space-y-4">
        <MerchantTableToolbar table={table} />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const merchant = row.original as MerchantWithStats
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => {
                        setSelectedMerchant(merchant)
                        setIsSheetOpen(true)
                      }}
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Sheet 
        open={isSheetOpen}
        modal={false}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) {
            setSelectedMerchant(null)
          }
        }}
      >
        <SheetContent side="right" noOverlay className="w-full sm:max-w-md flex flex-col h-full">
          <MerchantDetailSheet 
            merchant={selectedMerchant} 
            categories={categories}
            tags={tags}
            onSave={onMerchantUpdate} 
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
