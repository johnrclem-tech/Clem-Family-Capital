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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { Category } from "@/lib/database";
import { Loader2 } from "lucide-react";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentCategories: Category[];
  onSave: () => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  parentCategories,
  onSave,
}: AddCategoryDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isParentCategory, setIsParentCategory] = React.useState(false);
  const [parentId, setParentId] = React.useState<string | null>(null);
  const [color, setColor] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      // Reset form when opening
      setName("");
      setDescription("");
      setIsParentCategory(false);
      setParentId(null);
      setColor("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      return; // Name is required
    }

    // If not a parent category, parent category is required
    if (!isParentCategory && !parentId) {
      return; // Parent category is required for non-parent categories
    }

    setSaving(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          is_parent_category: isParentCategory,
          parent_id: isParentCategory ? null : (parentId || null),
          color: isParentCategory ? (color || null) : null,
        }),
      });

      if (response.ok) {
        onSave(); // Refresh categories list
        onOpenChange(false); // Close dialog
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error creating category:", errorData);
        // TODO: Show error toast/notification
      }
    } catch (error) {
      console.error("Error creating category:", error);
      // TODO: Show error toast/notification
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category or parent category. Category name is required. Regular categories must have a parent category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Name */}
          <div>
            <Label htmlFor="category-name" className="text-sm font-medium mb-2 block">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name..."
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="category-description" className="text-sm font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Is Parent Category */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-parent-category" className="text-sm font-medium">
                Is Parent Category
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark this category as a parent category. Parent categories can have child categories assigned to them.
              </p>
            </div>
            <Switch
              id="is-parent-category"
              checked={isParentCategory}
              onCheckedChange={setIsParentCategory}
            />
          </div>

          {/* Color (only if parent category) */}
          {isParentCategory && (
            <div>
              <Label htmlFor="category-color" className="text-sm font-medium mb-2 block">
                Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="category-color"
                  value={color || "#3B82F6"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded-md border border-input"
                />
                <Input
                  value={color || "#3B82F6"}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
          )}

          {/* Parent Category (only if not parent category) */}
          {!isParentCategory && (
            <div>
              <Label htmlFor="parent-category" className="text-sm font-medium mb-2 block">
                Parent Category <span className="text-destructive">*</span>
              </Label>
              <CategoryCombobox
                categories={parentCategories}
                value={parentId}
                onChange={setParentId}
                placeholder="Select a parent category..."
              />
              {parentCategories.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No parent categories available. Mark some categories as parent categories first.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !name.trim() || (!isParentCategory && !parentId)}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
