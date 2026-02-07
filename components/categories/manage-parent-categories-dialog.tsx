"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  is_parent_category: boolean;
}

interface ManageParentCategoriesDialogProps {
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ParentCategoryEdit {
  id: string;
  name: string;
  originalName: string;
  isNew: boolean;
}

export function ManageParentCategoriesDialog({
  categories,
  open,
  onClose,
  onSave,
}: ManageParentCategoriesDialogProps) {
  const [editingCategories, setEditingCategories] = React.useState<ParentCategoryEdit[]>([]);
  const [saving, setSaving] = React.useState(false);

  // Initialize editing state when dialog opens or categories change
  React.useEffect(() => {
    if (open) {
      const parentCategories = categories
        .filter((cat) => cat.is_parent_category === true)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          originalName: cat.name,
          isNew: false,
        }));
      setEditingCategories(parentCategories);
    }
  }, [categories, open]);

  const handleAddCategory = () => {
    const newCategory: ParentCategoryEdit = {
      id: `new-${Date.now()}`,
      name: "",
      originalName: "",
      isNew: true,
    };
    setEditingCategories([...editingCategories, newCategory]);
  };

  const handleUpdateName = (id: string, newName: string) => {
    setEditingCategories(
      editingCategories.map((cat) =>
        cat.id === id ? { ...cat, name: newName } : cat
      )
    );
  };

  const handleRemove = (id: string) => {
    setEditingCategories(editingCategories.filter((cat) => cat.id !== id));
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Process all changes
      for (const cat of editingCategories) {
        if (cat.isNew && cat.name.trim()) {
          // Create new parent category
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: cat.name.trim(),
              parent_id: null,
            }),
          });
        } else if (!cat.isNew && cat.name !== cat.originalName) {
          // Update existing category
          await fetch(`/api/categories/${cat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: cat.name.trim(),
            }),
          });
        }
      }

      // Handle deleted categories (ones that were in original but not in editingCategories)
      const originalParentIds = categories
        .filter((cat) => cat.is_parent_category === true)
        .map((cat) => cat.id);
      const currentIds = editingCategories
        .filter((cat) => !cat.isNew)
        .map((cat) => cat.id);
      const deletedIds = originalParentIds.filter((id) => !currentIds.includes(id));

      for (const id of deletedIds) {
        await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving parent categories:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Parent Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or remove parent categories. Changes will be saved when you click Save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {editingCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Input
                  value={cat.name}
                  onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                  placeholder="Parent category name"
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(cat.id)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCategory}
            className="w-full h-9"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Parent Category
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
