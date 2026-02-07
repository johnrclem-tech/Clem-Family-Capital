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
import { AccountTableToolbar } from "./account-table-toolbar"
import { AccountDetailSheet } from "./account-detail-sheet"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { PlaidItem } from "@/lib/database"

interface AccountDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onAccountUpdate?: (id: string, updates: { custom_name: string; is_hidden: boolean }) => Promise<void>
  onAddAccount?: () => void
  connecting?: boolean
}

export function AccountDataTable<TData, TValue>({
  columns,
  data,
  onAccountUpdate,
  onAddAccount,
  connecting,
}: AccountDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "institution_name", desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [selectedAccount, setSelectedAccount] = React.useState<PlaidItem | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Update selected account when data changes (e.g., after save)
  React.useEffect(() => {
    if (selectedAccount) {
      const updatedAccount = (data as PlaidItem[]).find((acc) => acc.id === selectedAccount.id)
      if (updatedAccount) {
        setSelectedAccount(updatedAccount)
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
        <AccountTableToolbar table={table} onAddAccount={onAddAccount} connecting={connecting} />
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
                  const account = row.original as PlaidItem
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => {
                        setSelectedAccount(account)
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
            setSelectedAccount(null)
          }
        }}
      >
        <SheetContent side="right" noOverlay className="w-full sm:max-w-md flex flex-col h-full">
          <AccountDetailSheet account={selectedAccount} onSave={onAccountUpdate} />
        </SheetContent>
      </Sheet>
    </>
  )
}
