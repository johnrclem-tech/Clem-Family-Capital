"use client";

import * as React from "react";
import { CategoryDataTable } from "@/components/categories/category-data-table";
import { createCategoryColumns } from "@/components/categories/category-columns";
import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { Category } from "@/lib/database";
import { RefreshCw } from "lucide-react";

type CategoryWithPfc = Category & {
  pfc_mapping_count?: number
  pfc_categories?: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryWithPfc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  // Get parent categories for lookup (categories marked as parent categories)
  const parentCategories = React.useMemo(() => {
    return categories.filter((c) => c.is_parent_category === true);
  }, [categories]);

  // Fetch all data on mount
  React.useEffect(() => {
    fetchAllData().catch((error) => {
      console.error("Error in fetchAllData:", error);
      setLoading(false);
    });
  }, []);

  const fetchAllData = React.useCallback(async () => {
    await fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories?withPfcCounts=true");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (id: string, updates: Partial<Category>) => {
    try {
      console.log(`[CLIENT] Updating category ${id} with:`, updates);
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[CLIENT] Category ${id} updated successfully:`, result);
        await fetchCategories(); // Refresh categories
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`[CLIENT] Error updating category ${id}:`, response.status, errorData);
        if (errorData.details) {
          console.error(`[CLIENT] Error details:`, errorData.details);
        }
      }
    } catch (error) {
      console.error(`[CLIENT] Error updating category ${id}:`, error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Content Area */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center border rounded-lg">
              <div className="text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            </div>
          ) : (
            <>
              <CategoryDataTable
                columns={createCategoryColumns({
                  parentCategories,
                  categories,
                  onCategoryUpdate: handleSaveCategory,
                })}
                data={categories}
                parentCategories={parentCategories}
                onCategoryUpdate={handleSaveCategory}
                onAddCategory={() => setAddDialogOpen(true)}
              />
              <AddCategoryDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                parentCategories={parentCategories}
                onSave={fetchCategories}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
