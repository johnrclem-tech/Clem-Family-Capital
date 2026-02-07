"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { InvestmentTransactionEnriched } from "@/lib/database"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ColumnsProps {
  onTransactionUpdate?: (id: string, updates: Partial<InvestmentTransactionEnriched>) => void
}

const getTransactionTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "buy":
      return "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
    case "sell":
      return "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
    case "dividend":
      return "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400"
    case "interest":
      return "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400"
    case "fee":
      return "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
    default:
      return "bg-gray-600/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400"
  }
}

export function createInvestmentColumns({
  onTransactionUpdate,
}: ColumnsProps): ColumnDef<InvestmentTransactionEnriched>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">{formatDate(row.getValue("date"))}</div>
      ),
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        return (
          <div className="whitespace-nowrap" title={name}>
            {name}
          </div>
        )
      },
      size: 250,
      minSize: 150,
      maxSize: 1000,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const subtype = row.original.subtype
        return (
          <div className="flex flex-col gap-1 whitespace-nowrap">
            <Badge className={`${getTransactionTypeColor(type)} whitespace-nowrap`}>
              {type}
            </Badge>
            {subtype && (
              <span className="whitespace-nowrap">{subtype}</span>
            )}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "security_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Security" />
      ),
      cell: ({ row }) => {
        const securityName = row.getValue("security_name") as string | null
        const ticker = row.original.security_ticker
        return (
          <div className="flex flex-col gap-1 whitespace-nowrap">
            {securityName && (
              <span className="whitespace-nowrap">{securityName}</span>
            )}
            {ticker && (
              <span className="font-mono whitespace-nowrap">{ticker}</span>
            )}
            {!securityName && !ticker && (
              <span className="whitespace-nowrap">-</span>
            )}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 500,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const currencyCode = row.original.iso_currency_code || "USD"
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(amount, currencyCode)}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number | null
        if (quantity === null || quantity === undefined) return <span className="whitespace-nowrap">-</span>
        return (
          <div className="text-right whitespace-nowrap">
            {quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = row.getValue("price") as number | null
        const currencyCode = row.original.iso_currency_code || "USD"
        if (price === null || price === undefined) return <span className="whitespace-nowrap">-</span>
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(price, currencyCode)}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "fees",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fees" />
      ),
      cell: ({ row }) => {
        const fees = row.getValue("fees") as number | null
        const currencyCode = row.original.iso_currency_code || "USD"
        if (fees === null || fees === undefined || fees === 0) return <span className="whitespace-nowrap">-</span>
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(fees, currencyCode)}
          </div>
        )
      },
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "institution_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution" />
      ),
      cell: ({ row }) => {
        const institutionName = row.getValue("institution_name") as string | null
        return (
          <div className="whitespace-nowrap" title={institutionName || undefined}>
            {institutionName || "-"}
          </div>
        )
      },
      size: 150,
      minSize: 120,
      maxSize: 400,
    },
    {
      accessorKey: "account_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account ID" />
      ),
      cell: ({ row }) => {
        const accountId = row.getValue("account_id") as string | null
        return (
          <span className="font-mono whitespace-nowrap">
            {accountId || "-"}
          </span>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 400,
    },
    {
      accessorKey: "security_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Security ID" />
      ),
      cell: ({ row }) => {
        const securityId = row.getValue("security_id") as string | null
        return (
          <span className="font-mono whitespace-nowrap">
            {securityId || "-"}
          </span>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 400,
    },
  ]
}
