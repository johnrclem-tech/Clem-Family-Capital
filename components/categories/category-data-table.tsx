"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTablePagination } from "@/components/transactions/data-table-pagination"
import { CategoryTableToolbar } from "./category-table-toolbar"
import { Category } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CategoryCombobox } from "@/components/categories/category-combobox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type CategoryWithPfc = Category & {
  pfc_mapping_count?: number
  pfc_categories?: string | null
}

interface CategoryDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  parentCategories: Category[]
  onCategoryUpdate?: (id: string, updates: Partial<Category>) => Promise<void>
  onAddCategory?: () => void
}

export function CategoryDataTable<TData, TValue>({
  columns,
  data,
  parentCategories,
  onCategoryUpdate,
  onAddCategory,
}: CategoryDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [isUpdating, setIsUpdating] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 250,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Match Transactions table: Sheet open is driven by selection
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const isSheetOpen = selectedCount > 0
  const isSingleSelection = selectedCount === 1
  const selectedCategory = isSingleSelection
    ? (selectedRows[0].original as CategoryWithPfc)
    : null

  // Single selection state
  const [singleParent, setSingleParent] = React.useState<string | null>(null)
  const [singleIsParentCategory, setSingleIsParentCategory] = React.useState<boolean>(false)
  const [singleName, setSingleName] = React.useState<string>("")
  const [singleDescription, setSingleDescription] = React.useState<string>("")
  const [singleColor, setSingleColor] = React.useState<string>("")

  // Bulk update state
  // undefined = no change, null = clear parent (make a parent category)
  const [bulkParent, setBulkParent] = React.useState<string | null | undefined>(undefined)
  const [bulkIsParentCategory, setBulkIsParentCategory] = React.useState<boolean | undefined>(undefined)

  // Initialize single form when selection changes
  React.useEffect(() => {
    if (selectedCategory) {
      // Only set parent if it exists in parentCategories (is marked as parent category)
      const parentId = selectedCategory.parent_id || null
      const isValidParent = parentId ? parentCategories.some(p => p.id === parentId) : false
      setSingleParent(isValidParent ? parentId : null)
      setSingleIsParentCategory(selectedCategory.is_parent_category || false)
      setSingleName(selectedCategory.name || "")
      setSingleDescription(selectedCategory.description || "")
      setSingleColor(selectedCategory.color || "")
    }
  }, [selectedCategory, parentCategories])

  // Reset bulk form when selection changes
  React.useEffect(() => {
    if (!isSingleSelection) {
      setBulkParent(undefined)
      setBulkIsParentCategory(undefined)
    }
  }, [isSingleSelection])

  const handleSingleSave = async () => {
    if (!selectedCategory || !onCategoryUpdate) return

    setIsUpdating(true)
    try {
      const updates: Partial<Category> = {}
      
      if (singleName !== selectedCategory.name) {
        updates.name = singleName
      }
      if (singleDescription !== (selectedCategory.description || "")) {
        updates.description = singleDescription || null
      }
      if (singleParent !== (selectedCategory.parent_id || null)) {
        updates.parent_id = singleParent
      }
      if (singleIsParentCategory !== selectedCategory.is_parent_category) {
        updates.is_parent_category = singleIsParentCategory
      }
      if (singleIsParentCategory && singleColor !== (selectedCategory.color || "")) {
        updates.color = singleColor || null
      }

      if (Object.keys(updates).length > 0) {
        await onCategoryUpdate(selectedCategory.id, updates)
      }

      // Clear selection after save (closes Sheet)
      setRowSelection({})
    } catch (error) {
      console.error("Error updating category:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkSave = async () => {
    if (selectedCount === 0) return

    setIsUpdating(true)
    try {
      const categoryIds = selectedRows.map((row) => (row.original as CategoryWithPfc).id)
      const updates: { parent_id?: string | null; is_parent_category?: boolean } = {}

      if (bulkParent !== undefined) {
        updates.parent_id = bulkParent
      }
      if (bulkIsParentCategory !== undefined) {
        updates.is_parent_category = bulkIsParentCategory
      }

      if (Object.keys(updates).length > 0) {
        const response = await fetch("/api/categories/bulk-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categoryIds, updates }),
        })

        if (response.ok) {
          // Match Transactions: trigger a refresh by calling update with empty object
          if (onCategoryUpdate && categoryIds.length > 0) {
            await onCategoryUpdate(categoryIds[0], {})
          }
          // Clear selection after save (closes Sheet)
          setRowSelection({})
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.error("Bulk update failed:", errorData)
        }
      }
    } catch (error) {
      console.error("Error bulk updating categories:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <CategoryTableToolbar table={table} parentCategories={parentCategories} onAddCategory={onAddCategory} />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Sheet
        open={isSheetOpen}
        modal={false}
        onOpenChange={(open) => {
          // Always close sheet and clear selections when close button is clicked
          if (!open) {
            setRowSelection({})
          }
        }}
      >
        <SheetContent side="right" noOverlay className="w-full sm:max-w-md overflow-y-auto">
          {isSingleSelection && selectedCategory ? (
            <>
              <SheetHeader>
                <SheetTitle>Category Details</SheetTitle>
                <SheetDescription>
                  View and edit category information
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name" className="text-sm font-medium mb-2 block">
                        Category Name
                      </Label>
                      <Input
                        id="category-name"
                        value={singleName}
                        onChange={(e) => setSingleName(e.target.value)}
                        placeholder="Enter category name..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="category-description" className="text-sm font-medium mb-2 block">
                        Description
                      </Label>
                      <Textarea
                        id="category-description"
                        value={singleDescription}
                        onChange={(e) => setSingleDescription(e.target.value)}
                        placeholder="Enter description..."
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="is-parent-category" className="text-sm font-medium">
                          Is Parent Category
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mark this category as a parent category
                        </p>
                      </div>
                      <Switch
                        id="is-parent-category"
                        checked={singleIsParentCategory}
                        onCheckedChange={(checked) => {
                          setSingleIsParentCategory(checked)
                          if (checked) {
                            setSingleParent(null)
                          }
                        }}
                      />
                    </div>

                    {singleIsParentCategory && (
                      <div>
                        <Label htmlFor="category-color" className="text-sm font-medium mb-2 block">
                          Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="category-color"
                            value={singleColor || "#3B82F6"}
                            onChange={(e) => setSingleColor(e.target.value)}
                            className="h-10 w-20 cursor-pointer rounded-md border border-input"
                          />
                          <Input
                            value={singleColor || "#3B82F6"}
                            onChange={(e) => setSingleColor(e.target.value)}
                            placeholder="#3B82F6"
                            className="font-mono text-xs"
                            maxLength={7}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose a color for this parent category
                        </p>
                      </div>
                    )}

                    {!singleIsParentCategory && (
                      <div>
                        <Label htmlFor="parent-category" className="text-sm font-medium mb-2 block">
                          Parent Category
                        </Label>
                        <CategoryCombobox
                          categories={parentCategories.filter((p) => p.id !== selectedCategory.id)}
                          value={singleParent}
                          onChange={setSingleParent}
                          placeholder="Select a parent category..."
                          disabled={singleIsParentCategory}
                        />
                        {parentCategories.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            No parent categories available. Mark some categories as parent categories first.
                          </p>
                        )}
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium mb-2 block">PFC Mappings</Label>
                      <div>
                        {selectedCategory.pfc_categories ? (
                          <div className="space-y-1">
                            {selectedCategory.pfc_categories.split(',').map((pfcName, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pfcName}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Category ID: <span className="font-mono text-xs">{selectedCategory.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2 border-t pt-4 -mx-6 px-6">
                    <Button 
                      onClick={handleSingleSave} 
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setRowSelection({})}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Bulk Update Categories</SheetTitle>
                <SheetDescription>
                  Update {selectedCount} selected categor{selectedCount === 1 ? "y" : "ies"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bulk-is-parent-category" className="text-sm font-medium">
                        Mark as Parent Categories
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Mark selected categories as parent categories
                      </p>
                    </div>
                    <Switch
                      id="bulk-is-parent-category"
                      checked={bulkIsParentCategory || false}
                      onCheckedChange={(checked) => {
                        setBulkIsParentCategory(checked)
                        if (checked) {
                          setBulkParent(null)
                        } else {
                          setBulkIsParentCategory(undefined)
                        }
                      }}
                    />
                  </div>

                  {!bulkIsParentCategory && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Set Parent Category (optional)</label>
                      <CategoryCombobox
                        categories={parentCategories}
                        value={bulkParent}
                        onChange={setBulkParent}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Selected Categories</h3>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {selectedRows.slice(0, 10).map((row) => {
                      const cat = row.original as CategoryWithPfc
                      return (
                        <div
                          key={cat.id}
                          className="p-2 rounded-lg border bg-card text-sm space-y-1"
                        >
                          <p className="font-medium">{cat.name}</p>
                          {cat.description && (
                            <p className="text-muted-foreground text-xs break-words">{cat.description}</p>
                          )}
                        </div>
                      )
                    })}
                    {selectedCount > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        ... and {selectedCount - 10} more
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleBulkSave} 
                    disabled={isUpdating || (bulkParent === undefined && bulkIsParentCategory === undefined)}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      `Update ${selectedCount} Categor${selectedCount === 1 ? "y" : "ies"}`
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setRowSelection({})}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
