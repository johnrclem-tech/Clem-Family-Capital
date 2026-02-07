"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { MerchantWithStats } from "@/lib/database"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CategoryCombobox } from "@/components/categories/category-combobox"
import { TagCombobox } from "@/components/tags/tag-combobox"
import { Category } from "@/lib/database"

interface ColumnsProps {
  categories: Array<{ id: string; name: string }>
  allCategories: Category[] // All categories including parent categories for color lookup
  tags: Array<{ id: string; name: string; color?: string | null }>
  onMerchantUpdate: (id: string, updates: Partial<MerchantWithStats>) => void
}

export function createMerchantColumns({
  categories,
  allCategories,
  tags,
  onMerchantUpdate,
}: ColumnsProps): ColumnDef<MerchantWithStats>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant" />
      ),
      cell: ({ row }) => {
        const merchant = row.original
        return (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span>{merchant.name || "Unknown"}</span>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "default_category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Default Category" />
      ),
      filterFn: (row, id, value) => {
        const categoryId = row.getValue(id) as string | null
        if (!value || typeof value !== 'string') return true
        if (!categoryId) return false
        const category = categories.find((c) => c.id === categoryId)
        if (!category) return false
        return category.name.toLowerCase().includes(value.toLowerCase())
      },
      cell: ({ row }) => {
        const merchant = row.original
        const [isEditing, setIsEditing] = React.useState(false)

        const handleSave = (categoryId: string | null) => {
          onMerchantUpdate(merchant.id, { 
            name: merchant.name,
            default_category_id: categoryId 
          })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <CategoryCombobox
                categories={categories}
                value={merchant.default_category_id}
                onChange={handleSave}
                className="h-8"
              />
            </div>
          )
        }

        const category = categories.find((c) => c.id === merchant.default_category_id)

        if (!category) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
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
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
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
      accessorKey: "default_tag_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Default Tag" />
      ),
      cell: ({ row }) => {
        const merchant = row.original
        const [isEditing, setIsEditing] = React.useState(false)

        const handleSave = (tagId: string | null) => {
          onMerchantUpdate(merchant.id, { 
            name: merchant.name,
            default_tag_id: tagId 
          })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <TagCombobox
                tags={tags}
                value={merchant.default_tag_id}
                onChange={handleSave}
                className="h-8"
              />
            </div>
          )
        }

        const tag = tags.find((t) => t.id === merchant.default_tag_id)

        if (!tag) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
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
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
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
      accessorKey: "transaction_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transactions" />
      ),
      cell: ({ row }) => {
        const count = row.getValue("transaction_count") as number || 0
        return (
          <div className="text-center">
            {count > 0 ? (
              <Badge variant="secondary" className="whitespace-nowrap">{count}</Badge>
            ) : (
              <span className="whitespace-nowrap">-</span>
            )}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Spent" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("total_amount") as number || 0
        return (
          <span className="whitespace-nowrap">
            {formatCurrency(Math.abs(amount))}
          </span>
        )
      },
      size: 140,
    },
    {
      accessorKey: "last_transaction_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Transaction" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("last_transaction_date") as string | null
        if (!date) return <span className="whitespace-nowrap">-</span>
        const dateObj = new Date(date)
        return <span className="whitespace-nowrap">{dateObj.toLocaleDateString()}</span>
      },
      size: 150,
    },
    {
      accessorKey: "is_confirmed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confirmed" />
      ),
      cell: ({ row }) => {
        const isConfirmed = row.getValue("is_confirmed") as boolean
        return (
          <span className="whitespace-nowrap">
            {isConfirmed ? "Yes" : "No"}
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
  ]
}
