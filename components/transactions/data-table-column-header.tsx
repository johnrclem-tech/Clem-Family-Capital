"use client"

import { Column } from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div
      className={cn(
        "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
        className
      )}
      onClick={column.getToggleSortingHandler()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          column.getToggleSortingHandler()?.(e)
        }
      }}
      tabIndex={0}
    >
      <span>{title}</span>
      {{
        asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} />,
        desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} />,
      }[column.getIsSorted() as string] ?? null}
    </div>
  )
}
