"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Plus, PlusCircle, X } from "lucide-react"
import { Category } from "@/lib/database"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { DataTableViewOptions } from "@/components/transactions/data-table-view-options"

interface CategoryTableToolbarProps<TData> {
  table: Table<TData>
  parentCategories: Category[]
  onAddCategory?: () => void
}

export function CategoryTableToolbar<TData>({
  table,
  parentCategories,
  onAddCategory,
}: CategoryTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const parentColumn = table.getColumn("parent_id")
  const selectedParentIds = new Set(parentColumn?.getFilterValue() as string[])

  // Get unique parent IDs from the data and map them to category names
  const parentOptions = React.useMemo(() => {
    const parentIdSet = new Set<string>()
    const tableData = table.getRowModel().rows.map(row => row.original as any)
    
    tableData.forEach((row) => {
      if (row.parent_id) {
        parentIdSet.add(row.parent_id)
      }
    })

    // Map parent IDs to parent categories (only show those marked as parent categories)
    return Array.from(parentIdSet)
      .map((parentId) => {
        const parent = parentCategories.find((p) => p.id === parentId)
        return parent ? { id: parentId, name: parent.name, color: parent.color } : null
      })
      .filter((p): p is { id: string; name: string; color: string | null } => p !== null)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [table, parentCategories])

  const handleParentFilterChange = (parentId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedParentIds)
    if (checked) {
      newSelectedIds.add(parentId)
    } else {
      newSelectedIds.delete(parentId)
    }
    const filterValues = Array.from(newSelectedIds)
    parentColumn?.setFilterValue(filterValues.length > 0 ? filterValues : undefined)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {onAddCategory && (
        <Button onClick={onAddCategory} size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      )}
      <Input
        placeholder="Filter by Category"
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="h-9 w-[150px] lg:w-[250px] border-border/40 bg-background"
      />
      {parentColumn && parentOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Parent Category
              {selectedParentIds?.size > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedParentIds.size}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedParentIds.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedParentIds.size} selected
                      </Badge>
                    ) : (
                      parentOptions
                        .filter((option) => selectedParentIds.has(option.id))
                        .map((option) => (
                          <Badge
                            variant="secondary"
                            key={option.id}
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.name}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-fit max-w-[300px]" align="start">
            <DropdownMenuLabel className="whitespace-nowrap">Parent Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {parentOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground whitespace-nowrap">
                No parent categories available
              </div>
            ) : (
              <>
                {parentOptions.map((option) => {
                  const isSelected = selectedParentIds.has(option.id)
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.id}
                      checked={isSelected}
                      onCheckedChange={() => handleParentFilterChange(option.id, !isSelected)}
                      className="whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {option.color && (
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        <span className="flex-1">{option.name}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {selectedParentIds.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => parentColumn?.setFilterValue(undefined)}
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
      <div className="ml-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
