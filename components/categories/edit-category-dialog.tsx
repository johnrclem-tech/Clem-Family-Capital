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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/database";

interface EditCategoryDialogProps {
  category: Category | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditCategoryDialog({
  category,
  categories,
  open,
  onClose,
  onSave,
}: EditCategoryDialogProps) {
  const [name, setName] = React.useState("");
  const [parentId, setParentId] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  // Initialize form when category changes
  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parent_id || "");
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          parent_id: parentId || null,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (category) {
      setName(category.name);
      setParentId(category.parent_id || "");
    }
    onClose();
  };

  // Get parent categories (exclude current category and its descendants)
  const parentCategories = React.useMemo(() => {
    if (!category) return [];
    return categories.filter((c) => c.is_parent_category === true && c.id !== category.id);
  }, [categories, category]);

  // Get PFC mappings count
  const pfcMappingsCount = React.useMemo(() => {
    if (!category) return 0;
    // This would need to be fetched from the API in a real implementation
    // For now, we'll just show the structure
    return 0;
  }, [category]);

  const isParent = category && category.is_parent_category === true;

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category details and parent assignment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category</Label>
            <Select
              value={parentId}
              onValueChange={setParentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="None (Top-level category)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Top-level category)</SelectItem>
                {parentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    📁 {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {isParent
                ? "This is a parent category. Changing it to a subcategory will affect its children."
                : "Select a parent category or leave empty to make this a top-level category."}
            </p>
          </div>

          {/* Metadata Section */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">Metadata</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category ID:</span>
                <p className="font-mono text-xs mt-1">{category.id}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="mt-1">
                  {isParent ? (
                    <span className="inline-flex items-center rounded-md bg-info/10 px-2 py-1 text-xs font-medium text-info ring-1 ring-inset ring-info/20">
                      Parent Category
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
                      Subcategory
                    </span>
                  )}
                </p>
              </div>

              {category.parent_id && (
                <div>
                  <span className="text-muted-foreground">Current Parent:</span>
                  <p className="mt-1">
                    {categories.find((c) => c.id === category.parent_id)?.name || "Unknown"}
                  </p>
                </div>
              )}

              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="mt-1">
                  {new Date(category.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="mt-1">
                  {new Date(category.updated_at).toLocaleDateString()}
                </p>
              </div>

              {category.description && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{category.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
