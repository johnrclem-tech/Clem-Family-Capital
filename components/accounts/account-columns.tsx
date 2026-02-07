"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { PlaidItem } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, Wallet, TrendingUp, Building2, Home, DollarSign } from "lucide-react"

interface ColumnsProps {
  onAccountUpdate: (id: string, updates: { custom_name: string; is_hidden: boolean }) => Promise<void>
}

const getAccountIcon = (accountType: string) => {
  switch (accountType) {
    case "Credit":
      return <CreditCard className="size-4" />;
    case "Cash":
      return <Wallet className="size-4" />;
    case "Investment":
      return <TrendingUp className="size-4" />;
    case "Loan":
      return <Building2 className="size-4" />;
    case "Property":
      return <Home className="size-4" />;
    default:
      return <DollarSign className="size-4" />;
  }
};

const getAccountTypeColor = (accountType: string) => {
  switch (accountType) {
    case "Credit":
      return "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400";
    case "Cash":
      return "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    case "Investment":
      return "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400";
    case "Loan":
      return "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    case "Property":
      return "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400";
    default:
      return "bg-gray-600/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400";
  }
};

export function createAccountColumns({
  onAccountUpdate,
}: ColumnsProps): ColumnDef<PlaidItem>[] {
  return [
    {
      accessorKey: "institution_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const icon = getAccountIcon(account.account_type || "Other")
        return (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="p-2 rounded-lg bg-primary/5 text-primary">
              {icon}
            </div>
            <span>{account.institution_name || "Unknown"}</span>
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "account_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Name" />
      ),
      cell: ({ row }) => {
        const accountName = row.getValue("account_name") as string | null
        return <span className="whitespace-nowrap">{accountName || "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "mask",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mask" />
      ),
      cell: ({ row }) => {
        const mask = row.getValue("mask") as string | null
        return <span className="whitespace-nowrap">{mask || "-"}</span>
      },
      size: 100,
    },
    {
      accessorKey: "account_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Type" />
      ),
      cell: ({ row }) => {
        const accountType = row.getValue("account_type") as string
        return (
          <span className="capitalize whitespace-nowrap">
            {accountType || "Other"}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: "account_subtype",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Subtype" />
      ),
      cell: ({ row }) => {
        const subtype = row.getValue("account_subtype") as string | null
        return (
          <span className="capitalize whitespace-nowrap">
            {subtype || "-"}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: "is_hidden",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Visibility" />
      ),
      cell: ({ row }) => {
        const isHidden = row.getValue("is_hidden") as boolean
        return (
          <span>
            {isHidden ? "Hidden" : "Visible"}
          </span>
        )
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as boolean
        const stringValue = cellValue ? "true" : "false"
        return value.includes(stringValue)
      },
      size: 100,
    },
    {
      accessorKey: "sync_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("sync_status") as string
        const isActive = status === "active"
        return (
          <span className="capitalize whitespace-nowrap">
            {status || "unknown"}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: "last_sync_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Sync" />
      ),
      cell: ({ row }) => {
        const lastSync = row.getValue("last_sync_at") as string | null
        if (!lastSync) return <span className="whitespace-nowrap">Never</span>
        const date = new Date(lastSync)
        return <span className="whitespace-nowrap">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
      },
      size: 180,
    },
    {
      accessorKey: "official_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Official Name" />
      ),
      cell: ({ row }) => {
        const officialName = row.getValue("official_name") as string | null
        return <span className="whitespace-nowrap">{officialName || "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "custom_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Custom Name" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const displayName = account.custom_name || account.account_name || "Unnamed Account"
        return <span className="whitespace-nowrap">{displayName}</span>
      },
      size: 200,
    },
    {
      accessorKey: "current_balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current Balance" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const balance = account.current_balance || 0
        const currencyCode = account.balance_currency_code || "USD"
        return (
          <span className="whitespace-nowrap">
            {formatCurrency(balance, currencyCode)}
          </span>
        )
      },
      size: 150,
    },
    {
      accessorKey: "plaid_account_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account ID" />
      ),
      cell: ({ row }) => {
        const accountId = row.getValue("plaid_account_id") as string | null
        return <span className="font-mono whitespace-nowrap">{accountId || "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "available_balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Available" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const available = account.available_balance
        if (available === null || available === undefined) return <span className="whitespace-nowrap">-</span>
        const currencyCode = account.balance_currency_code || account.unofficial_currency_code || "USD"
        return (
          <span className="whitespace-nowrap">
            {formatCurrency(available, currencyCode)}
          </span>
        )
      },
      size: 150,
    },
    {
      accessorKey: "balance_limit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Limit" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const limit = account.balance_limit
        if (limit === null || limit === undefined) return <span className="whitespace-nowrap">-</span>
        const currencyCode = account.balance_currency_code || account.unofficial_currency_code || "USD"
        return (
          <span className="whitespace-nowrap">
            {formatCurrency(limit, currencyCode)}
          </span>
        )
      },
      size: 150,
    },
    {
      accessorKey: "unofficial_currency_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => {
        const account = row.original
        const currency = account.unofficial_currency_code || account.balance_currency_code || "USD"
        return <span className="whitespace-nowrap">{currency}</span>
      },
      size: 100,
    },
    {
      accessorKey: "balance_last_updated_datetime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance Updated" />
      ),
      cell: ({ row }) => {
        const lastUpdated = row.getValue("balance_last_updated_datetime") as string | null
        if (!lastUpdated) return <span className="whitespace-nowrap">-</span>
        const date = new Date(lastUpdated)
        return <span className="whitespace-nowrap">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
      },
      size: 180,
    },
    {
      accessorKey: "verification_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verification" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("verification_status") as string | null
        return (
          <span className="capitalize whitespace-nowrap">
            {status || "-"}
          </span>
        )
      },
      size: 150,
    },
    {
      accessorKey: "verification_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verification Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("verification_name") as string | null
        return <span className="whitespace-nowrap">{name || "-"}</span>
      },
      size: 180,
    },
    {
      accessorKey: "persistent_account_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Persistent ID" />
      ),
      cell: ({ row }) => {
        const persistentId = row.getValue("persistent_account_id") as string | null
        return <span className="font-mono whitespace-nowrap">{persistentId || "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "holder_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Holder Category" />
      ),
      cell: ({ row }) => {
        const category = row.getValue("holder_category") as string | null
        return (
          <span className="capitalize whitespace-nowrap">
            {category || "-"}
          </span>
        )
      },
      size: 150,
    },
    {
      accessorKey: "item_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item ID" />
      ),
      cell: ({ row }) => {
        const itemId = row.getValue("item_id") as string
        return <span className="font-mono whitespace-nowrap">{itemId || "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "institution_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution ID" />
      ),
      cell: ({ row }) => {
        const institutionId = row.getValue("institution_id") as string | null
        return <span className="font-mono whitespace-nowrap">{institutionId || "-"}</span>
      },
      size: 150,
    },
    {
      accessorKey: "balance_currency_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency Code" />
      ),
      cell: ({ row }) => {
        const currencyCode = row.getValue("balance_currency_code") as string | null
        return <span className="whitespace-nowrap">{currencyCode || "USD"}</span>
      },
      size: 120,
    },
    {
      accessorKey: "cursor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sync Cursor" />
      ),
      cell: ({ row }) => {
        const cursor = row.getValue("cursor") as string | null
        return <span className="font-mono whitespace-nowrap">{cursor ? cursor.substring(0, 20) + "..." : "-"}</span>
      },
      size: 200,
    },
    {
      accessorKey: "error_message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Error Message" />
      ),
      cell: ({ row }) => {
        const errorMessage = row.getValue("error_message") as string | null
        return (
          <span className={`whitespace-nowrap ${errorMessage ? "text-destructive" : ""}`}>
            {errorMessage || "-"}
          </span>
        )
      },
      size: 250,
    },
    {
      accessorKey: "verification_insights",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verification Insights" />
      ),
      cell: ({ row }) => {
        const insights = row.getValue("verification_insights") as any | null
        if (!insights) return <span className="whitespace-nowrap">-</span>
        const hasInsights = typeof insights === "object" && Object.keys(insights).length > 0
        return (
          <span className="whitespace-nowrap">
            {hasInsights ? "Yes" : "-"}
          </span>
        )
      },
      size: 180,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string | null
        if (!createdAt) return <span className="whitespace-nowrap">-</span>
        const date = new Date(createdAt)
        return <span className="whitespace-nowrap">{date.toLocaleDateString()}</span>
      },
      size: 120,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updated_at") as string | null
        if (!updatedAt) return <span className="whitespace-nowrap">-</span>
        const date = new Date(updatedAt)
        return <span className="whitespace-nowrap">{date.toLocaleDateString()}</span>
      },
      size: 120,
    },
  ]
}
