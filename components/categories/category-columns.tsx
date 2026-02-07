"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/transactions/data-table-column-header"
import { Category } from "@/lib/database"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utils"
import { ParentCategoryCombobox } from "@/components/categories/parent-category-combobox"

type CategoryWithPfc = Category & {
  pfc_mapping_count?: number
  pfc_categories?: string | null
}

interface ColumnsProps {
  parentCategories: Category[]
  categories: Category[]
  onCategoryUpdate: (id: string, updates: Partial<Category>) => void
  onManageParentCategories?: () => void
}

export function createCategoryColumns({
  parentCategories,
  categories,
  onCategoryUpdate,
  onManageParentCategories,
}: ColumnsProps): ColumnDef<CategoryWithPfc>[] {
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
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="whitespace-nowrap">{category.name}</div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "parent_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Parent Category" />
      ),
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string | null
        if (!value || !Array.isArray(value) || value.length === 0) return true
        if (!rowValue) return false
        return value.includes(rowValue)
      },
      cell: ({ row }) => {
        const category = row.original
        const [isEditing, setIsEditing] = React.useState(false)
        const parentId = row.getValue("parent_id") as string | null

        const handleSave = (newParentId: string | null) => {
          onCategoryUpdate(category.id, { parent_id: newParentId })
          setIsEditing(false)
        }

        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <ParentCategoryCombobox
                categories={categories}
                value={parentId}
                currentCategoryId={category.id}
                onChange={handleSave}
                onManageParentCategories={onManageParentCategories || (() => {})}
                className="h-8"
              />
            </div>
          )
        }

        if (!parentId) {
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

        // Only show parent categories (categories marked as parent categories)
        const parent = parentCategories.find((p) => p.id === parentId)

        if (!parent) {
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

        return (
          <div
            className="cursor-pointer hover:bg-muted/50 rounded whitespace-nowrap min-h-8 flex items-center"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            title={parent.name}
          >
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap"
              style={{
                backgroundColor: parent.color || undefined,
                color: parent.color ? '#ffffff' : undefined
              }}
            >
              {parent.name}
            </Badge>
          </div>
        )
      },
      size: 200,
      minSize: 100,
      maxSize: 500,
    },
    {
      accessorKey: "is_parent_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Is Parent" />
      ),
      cell: ({ row }) => {
        const isParent = row.getValue("is_parent_category") as boolean
        return (
          <Badge variant={isParent ? "default" : "outline"} className="whitespace-nowrap">
            {isParent ? "Yes" : "No"}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: "pfc_mapping_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PFC Mappings" />
      ),
      cell: ({ row }) => {
        const count = row.original.pfc_mapping_count || 0
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
      size: 150,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null
        return (
          <span className="whitespace-nowrap">
            {description || "-"}
          </span>
        )
      },
      size: 200,
    },
    {
      accessorKey: "plaid_detailed_category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Detailed Category ID" />
      ),
      cell: ({ row }) => {
        const plaidDetailedCategoryId = row.getValue("plaid_detailed_category_id") as string | null
        return (
          <div className="font-mono whitespace-nowrap">
            {plaidDetailedCategoryId || "-"}
          </div>
        )
      },
      size: 250,
      minSize: 200,
      maxSize: 400,
    },
    {
      accessorKey: "plaid_primary_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Primary Category" />
      ),
      cell: ({ row }) => {
        const plaidPrimaryCategory = row.getValue("plaid_primary_category") as string | null
        return (
          <div className="whitespace-nowrap">
            {plaidPrimaryCategory ? plaidPrimaryCategory.replace(/_/g, " ") : "-"}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: "plaid_description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plaid Description" />
      ),
      cell: ({ row }) => {
        const plaidDescription = row.getValue("plaid_description") as string | null
        return (
          <div className="whitespace-nowrap">
            {plaidDescription || "-"}
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
        const date = row.getValue("created_at") as string | null
        return (
          <div className="whitespace-nowrap">
            {date ? formatDate(date) : "-"}
          </div>
        )
      },
      size: 120,
    },
  ]
}
