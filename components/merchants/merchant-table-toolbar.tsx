"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/transactions/data-table-view-options"

interface MerchantTableToolbarProps<TData> {
  table: Table<TData>
}

export function MerchantTableToolbar<TData>({
  table,
}: MerchantTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Input
        placeholder="Filter by Merchant"
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="h-9 w-[150px] lg:w-[250px] border-border/40 bg-background"
      />
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          Reset
          <X className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}
      {table.getColumn("default_category_id") && (
        <Input
          placeholder="Filter by Category"
          value={(table.getColumn("default_category_id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("default_category_id")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[150px] lg:w-[250px] border-border/40 bg-background"
        />
      )}
      <div className="ml-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
