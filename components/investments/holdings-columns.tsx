"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { formatCurrency } from "@/lib/utils"

export interface Holding {
  security_id: string;
  security_name: string | null;
  security_ticker: string | null;
  quantity: number;
  cost_basis: number;
  current_price: number | null;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  institution_name: string | null;
  account_id: string | null;
  currency_code: string;
}

interface ColumnsProps {
  onHoldingUpdate?: (securityId: string, updates: Partial<Holding>) => void
}

export function createHoldingsColumns({
  onHoldingUpdate,
}: ColumnsProps): ColumnDef<Holding>[] {
  return [
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
              <span className="whitespace-nowrap">{row.original.security_id}</span>
            )}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 500,
    },
    {
      accessorKey: "current_value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current Value" />
      ),
      cell: ({ row }) => {
        const currentValue = row.getValue("current_value") as number
        const currencyCode = row.original.currency_code || "USD"
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(currentValue, currencyCode)}
          </div>
        )
      },
      size: 130,
      minSize: 110,
      maxSize: 180,
    },
    {
      accessorKey: "cost_basis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cost Basis" />
      ),
      cell: ({ row }) => {
        const costBasis = row.getValue("cost_basis") as number
        const currencyCode = row.original.currency_code || "USD"
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(costBasis, currencyCode)}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "gain_loss",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gain ($)" />
      ),
      cell: ({ row }) => {
        const gainLoss = row.getValue("gain_loss") as number
        const currencyCode = row.original.currency_code || "USD"
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(gainLoss, currencyCode)}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "gain_loss_percent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gain (%)" />
      ),
      cell: ({ row }) => {
        const gainLossPercent = row.getValue("gain_loss_percent") as number
        return (
          <div className="text-right whitespace-nowrap">
            {gainLossPercent >= 0 ? "+" : ""}
            {gainLossPercent.toFixed(2)}%
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number
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
      accessorKey: "current_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current Price" />
      ),
      cell: ({ row }) => {
        const price = row.getValue("current_price") as number | null
        const currencyCode = row.original.currency_code || "USD"
        if (price === null || price === undefined || price === 0) {
          return <span className="whitespace-nowrap">-</span>
        }
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
