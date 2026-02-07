"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { PlaidPfcCategory } from "@/lib/database"
import { Category } from "@/lib/database"
import { CategoryCombobox } from "@/components/categories/category-combobox"
import { formatDate, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  categories: Category[]
  allCategories: Category[] // All categories including parent categories for color lookup
  onMappingUpdate: (id: string, categoryId: string | null) => void
}

export function createPlaidCategoriesColumns({
  categories,
  allCategories,
  onMappingUpdate,
}: ColumnsProps): ColumnDef<PlaidPfcCategory>[] {
  return [
    {
      accessorKey: "detailed_category",
      id: "detailed_category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Detailed Category ID" />
      ),
      cell: ({ row }) => {
        const detailedCategory = row.original.detailed_category
        return (
          <div className="font-mono whitespace-nowrap">
            {detailedCategory}
          </div>
        )
      },
      size: 250,
      minSize: 200,
      maxSize: 400,
    },
    {
      accessorKey: "default_merchant_category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const plaidCategory = row.original
        const [isEditing, setIsEditing] = React.useState(false)
        const categoryId = row.getValue("default_merchant_category_id") as string | null

        const handleSave = (newCategoryId: string | null) => {
          onMappingUpdate(plaidCategory.id, newCategoryId)
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <CategoryCombobox
                categories={categories}
                value={categoryId}
                onChange={handleSave}
                placeholder="Select category..."
                className="h-8"
              />
            </div>
          )
        }

        if (!categoryId) {
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

        const category = categories.find((c) => c.id === categoryId)

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
        const parentCategory = category.parent_id
          ? allCategories.find((c) => c.id === category.parent_id)
          : null

        // Use parent category color if available, otherwise use category color
        const badgeColor = parentCategory?.color || category.color

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
      size: 250,
      minSize: 200,
      maxSize: 400,
    },
    {
      accessorKey: "primary_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Category" />
      ),
      cell: ({ row }) => {
        const primaryCategory = row.getValue("primary_category") as string
        return (
          <div className="font-medium whitespace-nowrap">
            {primaryCategory.replace(/_/g, " ")}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: "detailed_category",
      id: "detailed_category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Detailed Category Name" />
      ),
      cell: ({ row }) => {
        const detailedCategory = row.original.detailed_category
        const primaryCategory = row.original.primary_category
        const name = detailedCategory.replace(primaryCategory + "_", "").replace(/_/g, " ")
        
        return (
          <div className="font-medium text-sm whitespace-nowrap">
            {name}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Category Description" />
      ),
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null
        return (
          <div className="text-sm whitespace-nowrap">
            {description || <span>No description</span>}
          </div>
        )
      },
      size: 300,
      minSize: 200,
      maxSize: 500,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string
        return (
          <div className="text-sm whitespace-nowrap">
            {formatDate(createdAt)}
          </div>
        )
      },
      size: 150,
      minSize: 120,
      maxSize: 200,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updated_at") as string
        return (
          <div className="text-sm whitespace-nowrap">
            {formatDate(updatedAt)}
          </div>
        )
      },
      size: 150,
      minSize: 120,
      maxSize: 200,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Active" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean
        return (
          <Badge variant={isActive ? "default" : "outline"} className="whitespace-nowrap">
            {isActive ? "Yes" : "No"}
          </Badge>
        )
      },
      size: 100,
      minSize: 80,
      maxSize: 150,
    },
  ]
}
