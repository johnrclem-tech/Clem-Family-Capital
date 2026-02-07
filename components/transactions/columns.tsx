"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "./data-table-column-header"
import { TransactionEnriched, Category, Tag } from "@/lib/database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CategoryCombobox } from "@/components/categories/category-combobox"
import { TagCombobox } from "@/components/tags/tag-combobox"
import { MerchantCombobox } from "@/components/merchants/merchant-combobox"

interface ColumnsProps {
  categories: Category[]
  allCategories: Category[] // All categories including parent categories for color lookup
  tags: Tag[]
  merchantNames: string[]
  onTransactionUpdate: (id: string, updates: Partial<TransactionEnriched>) => void
}

export function createColumns({
  categories,
  allCategories,
  tags,
  merchantNames,
  onTransactionUpdate,
}: ColumnsProps): ColumnDef<TransactionEnriched>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string
        if (!value || (typeof value === 'object' && !value.from && !value.to)) return true
        if (!rowValue) return false
        
        const rowDate = new Date(rowValue)
        const filterValue = typeof value === 'object' ? value : { from: undefined, to: undefined }
        
        if (filterValue.from) {
          const fromDate = new Date(filterValue.from)
          fromDate.setHours(0, 0, 0, 0)
          if (rowDate < fromDate) return false
        }
        
        if (filterValue.to) {
          const toDate = new Date(filterValue.to)
          toDate.setHours(23, 59, 59, 999)
          if (rowDate > toDate) return false
        }
        
        return true
      },
      cell: ({ row }) => (
        <div className="whitespace-nowrap">{formatDate(row.getValue("date"))}</div>
      ),
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        return (
          <div className="text-right whitespace-nowrap">
            {formatCurrency(amount)}
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "original_description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Original Description" />
      ),
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string | null
        if (!value) return true
        if (!rowValue) return false
        // Text search - case insensitive
        return rowValue.toLowerCase().includes(String(value).toLowerCase())
      },
      cell: ({ row }) => {
        const description = row.getValue("original_description") as string | null
        return (
          <div className="whitespace-nowrap" title={description || undefined}>
            {description || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "plaid_merchant_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Merchant" />
      ),
      cell: ({ row }) => {
        const plaidMerchantName = row.getValue("plaid_merchant_name") as string | null
        return (
          <div className="whitespace-nowrap" title={plaidMerchantName || undefined}>
            {plaidMerchantName || "-"}
          </div>
        )
      },
      size: 200,
      minSize: 100,
      maxSize: 500,
    },
    {
      accessorKey: "merchant_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant" />
      ),
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string | null
        if (!value) return true
        if (!rowValue) return false
        // Support both array (for dropdown) and string (for text search)
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(rowValue)
        }
        // Text search - case insensitive
        return rowValue.toLowerCase().includes(String(value).toLowerCase())
      },
      cell: ({ row }) => {
        const transaction = row.original
        const [isEditing, setIsEditing] = React.useState(false)

        const handleSave = (merchantName: string | null) => {
          onTransactionUpdate(transaction.id, { merchant_name: merchantName })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div className="w-[200px]">
              <MerchantCombobox
                merchantNames={merchantNames}
                value={transaction.merchant_name}
                onChange={handleSave}
                className="h-8"
              />
            </div>
          )
        }

        return (
          <div
            className="w-[200px] cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
            onClick={() => setIsEditing(true)}
          >
            {transaction.merchant_name || (
              <span>Click to edit</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string | null
        if (!value) return true
        if (!rowValue) return false
        // Support both array (for dropdown) and string (for text search)
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(rowValue)
        }
        // Text search - case insensitive
        return rowValue.toLowerCase().includes(String(value).toLowerCase())
      },
      cell: ({ row }) => {
        const transaction = row.original
        const [isEditing, setIsEditing] = React.useState(false)

        const handleSave = (categoryId: string | null) => {
          onTransactionUpdate(transaction.id, { category_id: categoryId })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div>
              <CategoryCombobox
                categories={categories}
                value={transaction.category_id}
                onChange={handleSave}
                className="h-8"
              />
            </div>
          )
        }

        if (!transaction.category_id) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <span className="whitespace-nowrap">-</span>
            </div>
          )
        }

        const category = categories.find((c) => c.id === transaction.category_id)
        if (!category) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <span className="whitespace-nowrap">-</span>
            </div>
          )
        }

        // Find parent category to get its color
        const fullCategory = allCategories.find((c) => c.id === category.id)
        const parentCategory = fullCategory?.parent_id
          ? allCategories.find((c) => c.id === fullCategory.parent_id)
          : null

        // Use parent category color if available, otherwise use category color
        const badgeColor = parentCategory?.color || fullCategory?.color

        return (
          <div
            className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
            onClick={() => setIsEditing(true)}
            title={category.name}
          >
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap"
              style={{
                backgroundColor: badgeColor || undefined,
                color: badgeColor ? '#ffffff' : undefined,
                borderColor: badgeColor || undefined,
              }}
            >
              {category.name}
            </Badge>
          </div>
        )
      },
      size: 200,
      minSize: 100,
      maxSize: 500,
    },
    {
      accessorKey: "tag_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tag" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        const [isEditing, setIsEditing] = React.useState(false)

        const handleSave = (tagId: string | null) => {
          onTransactionUpdate(transaction.id, { tag_id: tagId })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div>
              <TagCombobox
                tags={tags}
                value={transaction.tag_id}
                onChange={handleSave}
                className="h-8"
              />
            </div>
          )
        }

        if (!transaction.tag_id) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <span className="whitespace-nowrap">-</span>
            </div>
          )
        }

        const tag = tags.find((t) => t.id === transaction.tag_id)
        if (!tag) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <span className="whitespace-nowrap">-</span>
            </div>
          )
        }

        // Use tag color for badge
        const badgeColor = tag.color

        return (
          <div
            className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
            onClick={() => setIsEditing(true)}
            title={tag.name}
          >
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap"
              style={{
                backgroundColor: badgeColor || undefined,
                color: badgeColor ? '#ffffff' : undefined,
                borderColor: badgeColor || undefined,
              }}
            >
              {tag.name}
            </Badge>
          </div>
        )
      },
      size: 200,
      minSize: 100,
      maxSize: 500,
    },
    {
      accessorKey: "personal_finance_category_detailed",
      id: "confidence",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confidence" />
      ),
      accessorFn: (row) => {
        const pfc = row.personal_finance_category_detailed
        if (!pfc) return null
        const pfcObj = typeof pfc === "string" ? JSON.parse(pfc) : pfc
        return pfcObj?.confidence_level || null
      },
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string | null
        if (!value || (Array.isArray(value) && value.length === 0)) return true
        if (!rowValue) return false
        // Support array (for multi-select dropdown)
        if (Array.isArray(value)) {
          return value.includes(rowValue)
        }
        // Text search - case insensitive (fallback)
        return rowValue.toLowerCase().includes(String(value).toLowerCase())
      },
      cell: ({ row }) => {
        const pfc = row.original.personal_finance_category_detailed
        if (!pfc) return <div className="whitespace-nowrap">-</div>
        
        const pfcObj = typeof pfc === "string" ? JSON.parse(pfc) : pfc
        const confidence = pfcObj?.confidence_level || null
        
        if (!confidence) return <div className="whitespace-nowrap">-</div>
        
        // Normalize confidence value for display
        const normalizedConf = String(confidence).toLowerCase().replace(/_/g, ' ').trim();
        const originalUpper = String(confidence).toUpperCase();
        let displayText = normalizedConf;
        
        // Capitalize first letter of each word
        displayText = displayText.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        // Determine badge colors based on confidence level
        let badgeStyle: React.CSSProperties = {
          backgroundColor: '#ffffff',
          color: '#ef4444',
          borderColor: '#ef4444',
        };
        
        // Check for "very high" first (must check before "high")
        if (
          normalizedConf === 'very high' || 
          normalizedConf.startsWith('very high') ||
          originalUpper === 'VERY_HIGH' ||
          originalUpper === 'VERY HIGH'
        ) {
          badgeStyle = {
            backgroundColor: '#ffffff',
            color: '#15803d', // Dark green
            borderColor: '#15803d', // Dark green
          };
        } else if (
          normalizedConf === 'high' ||
          originalUpper === 'HIGH'
        ) {
          badgeStyle = {
            backgroundColor: '#ffffff',
            color: '#22c55e', // Light green
            borderColor: '#22c55e', // Light green
          };
        }
        
        return (
          <div className="whitespace-nowrap min-h-8 flex items-center">
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap"
              style={badgeStyle}
            >
              {displayText}
            </Badge>
          </div>
        )
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "personal_finance_category_detailed",
      id: "pfc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PFC" />
      ),
      cell: ({ row }) => {
        const pfc = row.original.personal_finance_category_detailed
        if (!pfc) return <div className="whitespace-nowrap">-</div>
        
        const pfcObj = typeof pfc === "string" ? JSON.parse(pfc) : pfc
        const detailed = pfcObj?.detailed || pfcObj?.primary || "-"
        
        return <div className="whitespace-nowrap" title={detailed}>{detailed}</div>
      },
      size: 200,
      minSize: 100,
      maxSize: 400,
    },
    {
      accessorKey: "institution_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
      cell: ({ row }) => {
        const institutionName = row.getValue("institution_name") as string | null
        return <div className="whitespace-nowrap" title={institutionName || undefined}>{institutionName || "-"}</div>
      },
      size: 150,
      minSize: 100,
      maxSize: 300,
    },
    {
      accessorKey: "pending",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const pending = row.getValue("pending") as boolean
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            {pending ? "Pending" : "Cleared"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "payment_channel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Channel" />
      ),
      cell: ({ row }) => {
        const channel = row.getValue("payment_channel") as string | null
        return <div className="whitespace-nowrap" title={channel || undefined}>{channel || "-"}</div>
      },
      size: 150,
      minSize: 100,
      maxSize: 250,
    },
    {
      accessorKey: "authorized_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Authorized Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("authorized_date") as string | null
        return <div className="whitespace-nowrap">{date ? formatDate(date) : "-"}</div>
      },
    },
    {
      accessorKey: "check_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check #" />
      ),
      cell: ({ row }) => {
        const checkNumber = row.getValue("check_number") as string | null
        return <div className="whitespace-nowrap">{checkNumber || "-"}</div>
      },
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "iso_currency_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => {
        const currency = row.getValue("iso_currency_code") as string | null
        return <div className="whitespace-nowrap">{currency || "USD"}</div>
      },
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "personal_finance_category_version",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PFC Version" />
      ),
      cell: ({ row }) => {
        const version = row.getValue("personal_finance_category_version") as string | null
        return <div className="whitespace-nowrap">{version || "-"}</div>
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "datetime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DateTime" />
      ),
      cell: ({ row }) => {
        const datetime = row.getValue("datetime") as string | null
        return (
          <div className="whitespace-nowrap" title={datetime ? new Date(datetime).toLocaleString() : undefined}>
            {datetime ? new Date(datetime).toLocaleString() : "-"}
          </div>
        )
      },
      size: 180,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: "merchant_entity_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant ID" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("merchant_entity_id") as string | null
        return <div className="font-mono whitespace-nowrap" title={id || undefined}>{id || "-"}</div>
      },
      size: 150,
      minSize: 100,
      maxSize: 300,
    },
    {
      accessorKey: "account_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account ID" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("account_id") as string | null
        return <div className="font-mono whitespace-nowrap" title={id || undefined}>{id || "-"}</div>
      },
      size: 150,
      minSize: 100,
      maxSize: 300,
    },
    {
      accessorKey: "plaid_transaction_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("plaid_transaction_id") as string | null
        return <div className="font-mono whitespace-nowrap" title={id || undefined}>{id || "-"}</div>
      },
      size: 200,
      minSize: 150,
      maxSize: 400,
    },
  ]
}
