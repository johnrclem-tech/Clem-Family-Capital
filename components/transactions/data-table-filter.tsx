"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { useId } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableFilterProps<TData, TValue> {
  column: Column<TData, TValue>
  title?: string
}

export function DataTableFilter<TData, TValue>({
  column,
  title,
}: DataTableFilterProps<TData, TValue>) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const columnHeader = title || (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)

  const sortedUniqueValues = React.useMemo(() => {
    const values = Array.from(column.getFacetedUniqueValues().keys())
    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }
      return [...acc, curr]
    }, [])
    return Array.from(new Set(flattenedValues)).sort()
  }, [column.getFacetedUniqueValues()])

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={`${id}-select`} className="text-sm font-medium">
        {columnHeader}
      </Label>
      <Select
        value={columnFilterValue?.toString() ?? 'all'}
        onValueChange={(value) => {
          column.setFilterValue(value === 'all' ? undefined : value)
        }}
      >
        <SelectTrigger id={`${id}-select`} className="h-8 w-full capitalize">
          <SelectValue placeholder={`Select ${columnHeader}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {sortedUniqueValues.map((value) => (
            <SelectItem key={String(value)} value={String(value)} className="capitalize">
              {String(value) || "(Empty)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
