"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Plus, Trash2 } from "lucide-react";

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
}

export function CategoryManagementDialog({
  open,
  onClose,
  onSave,
}: CategoryManagementDialogProps) {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          // Only show parent categories (using is_parent_category flag)
          const parents = data.categories.filter((c: any) => c.is_parent_category === true);
          setCategories(parents);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (id: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, name: newName, isModified: true } : cat
      )
    );
  };

  const handleAdd = () => {
    const newCategory: CategoryItem = {
      id: `new_${Date.now()}`,
      name: "New Category",
      isNew: true,
      isModified: true,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, isDeleted: true } : cat
        )
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Handle deletions
      const toDelete = categories.filter((c) => c.isDeleted && !c.isNew);
      await Promise.all(
        toDelete.map((cat) =>
          fetch(`/api/categories/${cat.id}`, { method: "DELETE" })
        )
      );

      // Handle creates and updates
      const toSave = categories.filter((c) => (c.isNew || c.isModified) && !c.isDeleted);
      await Promise.all(
        toSave.map((cat) => {
          if (cat.isNew) {
            return fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: cat.name }),
            });
          } else {
            return fetch(`/api/categories/${cat.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: cat.name }),
            });
          }
        })
      );

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving categories:", error);
    } finally {
      setSaving(false);
    }
  };

  const visibleCategories = categories.filter((c) => !c.isDeleted);
  const modifiedCount = categories.filter((c) => (c.isModified && !c.isDeleted) || c.isDeleted).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add, rename, or delete parent categories. Subcategories can be managed in the full category view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Button */}
          <Button onClick={handleAdd} size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>

          {/* Categories List */}
          <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading categories...
              </div>
            ) : visibleCategories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No categories. Click "Add Category" to create one.
              </div>
            ) : (
              visibleCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 p-3 hover:bg-muted/50"
                >
                  <Input
                    value={category.name}
                    onChange={(e) => handleNameChange(category.id, e.target.value)}
                    className="flex-1"
                    placeholder="Category name..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {modifiedCount > 0 && (
              <span className="text-orange-500 font-medium">
                {modifiedCount} {modifiedCount === 1 ? "change" : "changes"} pending
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || modifiedCount === 0}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
