"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface DataTableDropdownFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

export function DataTableDropdownFilter<TData, TValue>({
  column,
  title,
}: DataTableDropdownFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const sortedUniqueValues = React.useMemo(() => {
    if (!facets) return []
    const values = Array.from(facets.keys())
    return values
      .filter((v): v is string => v != null && v !== "")
      .sort()
  }, [facets])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  sortedUniqueValues
                    .filter((value) => selectedValues.has(value))
                    .map((value) => (
                      <Badge
                        variant="secondary"
                        key={value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {value}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-fit max-w-[300px]" align="start">
        <DropdownMenuLabel className="whitespace-nowrap">{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedUniqueValues.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground whitespace-nowrap">
            No options available
          </div>
        ) : (
          <>
            {sortedUniqueValues.map((value) => {
              const isSelected = selectedValues.has(value)
              return (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={isSelected}
                  onCheckedChange={() => {
                    const newSelectedValues = new Set(selectedValues)
                    if (isSelected) {
                      newSelectedValues.delete(value)
                    } else {
                      newSelectedValues.add(value)
                    }
                    const filterValues = Array.from(newSelectedValues)
                    column?.setFilterValue(
                      filterValues.length > 0 ? filterValues : undefined
                    )
                  }}
                  className="whitespace-nowrap"
                >
                  <span className="flex-1 capitalize">{value || "(Empty)"}</span>
                  {facets?.get(value) && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({facets.get(value)})
                    </span>
                  )}
                </DropdownMenuCheckboxItem>
              )
            })}
            {selectedValues.size > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={false}
                  onCheckedChange={() => column?.setFilterValue(undefined)}
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
  )
}
