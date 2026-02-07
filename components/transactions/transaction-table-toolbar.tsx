"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { DataTableViewOptions } from "./data-table-view-options"
import { PlusCircle } from "lucide-react"

interface TransactionTableToolbarProps<TData> {
  table: Table<TData>
}

export function TransactionTableToolbar<TData>({
  table,
}: TransactionTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  
  // Get unique confidence values for the dropdown
  const confidenceColumn = table.getColumn("confidence")
  const selectedConfidenceValues = new Set(confidenceColumn?.getFilterValue() as string[] || [])
  
  const confidenceOptions = React.useMemo(() => {
    if (!confidenceColumn) return []
    const values = Array.from(confidenceColumn.getFacetedUniqueValues().keys())
    return Array.from(new Set(values.filter(Boolean))).sort().map((value) => {
      const normalized = String(value).toLowerCase().replace(/_/g, ' ')
      const displayText = normalized.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      return { value: String(value), label: displayText }
    })
  }, [confidenceColumn])

  const handleConfidenceFilterChange = (confidenceValue: string, checked: boolean) => {
    const newSelectedValues = new Set(selectedConfidenceValues)
    if (checked) {
      newSelectedValues.add(confidenceValue)
    } else {
      newSelectedValues.delete(confidenceValue)
    }
    const filterValues = Array.from(newSelectedValues)
    confidenceColumn?.setFilterValue(filterValues.length > 0 ? filterValues : undefined)
  }

  // Date range state
  const [dateFrom, setDateFrom] = React.useState<string>("")
  const [dateTo, setDateTo] = React.useState<string>("")

  // Update date filter when date inputs change
  React.useEffect(() => {
    const dateColumn = table.getColumn("date")
    if (!dateColumn) return

    if (dateFrom || dateTo) {
      dateColumn.setFilterValue({ from: dateFrom || undefined, to: dateTo || undefined })
    } else {
      dateColumn.setFilterValue(undefined)
    }
  }, [dateFrom, dateTo, table])

  // Format date range display
  const dateRangeDisplay = React.useMemo(() => {
    const formatDateShort = (dateStr: string) => {
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      } catch {
        return dateStr
      }
    }
    
    if (!dateFrom && !dateTo) return "Date Range"
    if (dateFrom && dateTo) {
      return `${formatDateShort(dateFrom)} - ${formatDateShort(dateTo)}`
    }
    if (dateFrom) {
      return `From ${formatDateShort(dateFrom)}`
    }
    if (dateTo) {
      return `Until ${formatDateShort(dateTo)}`
    }
    return "Date Range"
  }, [dateFrom, dateTo])

  return (
    <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
      {table.getColumn("merchant_name") && (
        <Input
          placeholder="Merchant"
          value={(table.getColumn("merchant_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("merchant_name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[120px] border-border/40 bg-background"
        />
      )}
      {table.getColumn("category_name") && (
        <Input
          placeholder="Category"
          value={(table.getColumn("category_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("category_name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[120px] border-border/40 bg-background"
        />
      )}
      {table.getColumn("tag_name") && (
        <Input
          placeholder="Tag"
          value={(table.getColumn("tag_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("tag_name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[120px] border-border/40 bg-background"
        />
      )}
      {table.getColumn("original_description") && (
        <Input
          placeholder="Description"
          value={(table.getColumn("original_description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("original_description")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[120px] border-border/40 bg-background"
        />
      )}
      {confidenceColumn && confidenceOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Confidence
              {selectedConfidenceValues?.size > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedConfidenceValues.size}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedConfidenceValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedConfidenceValues.size} selected
                      </Badge>
                    ) : (
                      confidenceOptions
                        .filter((option) => selectedConfidenceValues.has(option.value))
                        .map((option) => (
                          <Badge
                            variant="secondary"
                            key={option.value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-fit max-w-[300px]" align="start">
            <DropdownMenuLabel className="whitespace-nowrap">Confidence</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {confidenceOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground whitespace-nowrap">
                No confidence levels available
              </div>
            ) : (
              <>
                {confidenceOptions.map((option) => {
                  const isSelected = selectedConfidenceValues.has(option.value)
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={isSelected}
                      onCheckedChange={() => handleConfidenceFilterChange(option.value, !isSelected)}
                      className="whitespace-nowrap"
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {selectedConfidenceValues.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => confidenceColumn?.setFilterValue(undefined)}
                      className="justify-center text-center whitespace-nowrap"
                    >
                      Clear filters
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {table.getColumn("date") && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-[160px] justify-start text-left font-normal border-border/40 bg-background"
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span className="truncate">{dateRangeDisplay}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="h-9"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                  }}
                  className="h-8"
                >
                  Clear
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => {
            table.resetColumnFilters()
            setDateFrom("")
            setDateTo("")
          }}
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          Reset
          <X className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}
      <div className="ml-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
