"use client"

import { Table } from "@tanstack/react-table"
import { Plus, X, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/transactions/data-table-view-options"
import { DataTableDropdownFilter } from "@/components/transactions/data-table-dropdown-filter"

interface AccountTableToolbarProps<TData> {
  table: Table<TData>
  onAddAccount?: () => void
  connecting?: boolean
}

export function AccountTableToolbar<TData>({
  table,
  onAddAccount,
  connecting = false,
}: AccountTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {onAddAccount && (
        <Button onClick={onAddAccount} size="sm" className="h-9" disabled={connecting}>
          {connecting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </>
          )}
        </Button>
      )}
      <Input
        placeholder="Filter by Institution"
        value={(table.getColumn("institution_name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("institution_name")?.setFilterValue(event.target.value)
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
      {table.getColumn("account_type") && (
        <DataTableDropdownFilter
          column={table.getColumn("account_type")!}
          title="Account Type"
        />
      )}
      {table.getColumn("sync_status") && (
        <DataTableDropdownFilter
          column={table.getColumn("sync_status")!}
          title="Status"
        />
      )}
      {table.getColumn("is_hidden") && (
        <DataTableDropdownFilter
          column={table.getColumn("is_hidden")!}
          title="Visibility"
        />
      )}
      <div className="ml-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
