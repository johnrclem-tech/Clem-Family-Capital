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
import { Plus, Trash2, Save } from "lucide-react";
import { Tag } from "@/lib/database";

interface TagManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TagEdit extends Tag {
  isNew?: boolean;
  isDeleted?: boolean;
}

export function TagManagementDialog({
  open,
  onClose,
  onSave,
}: TagManagementDialogProps) {
  const [tags, setTags] = React.useState<TagEdit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Fetch tags when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const newTag: TagEdit = {
      id: `temp_${Date.now()}`,
      name: "",
      color: "#3B82F6",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true,
    };
    setTags([...tags, newTag]);
  };

  const handleUpdateTag = (id: string, field: keyof Tag, value: string) => {
    setTags(
      tags.map((tag) =>
        tag.id === id ? { ...tag, [field]: value } : tag
      )
    );
  };

  const handleDeleteTag = (id: string) => {
    const tag = tags.find((t) => t.id === id);
    if (tag?.isNew) {
      // Remove new tags immediately
      setTags(tags.filter((t) => t.id !== id));
    } else {
      // Mark existing tags for deletion
      setTags(
        tags.map((t) =>
          t.id === id ? { ...t, isDeleted: true } : t
        )
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Process all changes
      const promises: Promise<any>[] = [];

      // Create new tags
      const newTags = tags.filter((t) => t.isNew && !t.isDeleted && t.name.trim());
      for (const tag of newTags) {
        promises.push(
          fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: tag.name.trim(),
              color: tag.color || null,
            }),
          })
        );
      }

      // Update existing tags
      const updatedTags = tags.filter((t) => !t.isNew && !t.isDeleted);
      for (const tag of updatedTags) {
        promises.push(
          fetch(`/api/tags/${tag.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: tag.name.trim(),
              color: tag.color || null,
            }),
          })
        );
      }

      // Delete tags
      const deletedTags = tags.filter((t) => t.isDeleted && !t.isNew);
      for (const tag of deletedTags) {
        promises.push(
          fetch(`/api/tags/${tag.id}`, {
            method: "DELETE",
          })
        );
      }

      await Promise.all(promises);

      // Notify parent and close
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving tags:", error);
      alert("Failed to save tags. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const visibleTags = tags.filter((t) => !t.isDeleted);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or delete tags. Changes are not saved until you click Save.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading tags...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Button onClick={handleAddTag} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="h-10 px-3 text-left text-xs font-medium">
                        Tag Name
                      </th>
                      <th className="h-10 px-3 text-left text-xs font-medium">
                        Color
                      </th>
                      <th className="h-10 px-3 text-right text-xs font-medium w-[100px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTags.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                          No tags yet. Click "Add Tag" to create one.
                        </td>
                      </tr>
                    ) : (
                      visibleTags.map((tag) => (
                        <tr key={tag.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Input
                              value={tag.name}
                              onChange={(e) =>
                                handleUpdateTag(tag.id, "name", e.target.value)
                              }
                              placeholder="Tag name..."
                              className="h-8"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={tag.color || "#3B82F6"}
                                onChange={(e) =>
                                  handleUpdateTag(tag.id, "color", e.target.value)
                                }
                                className="h-8 w-20 cursor-pointer rounded border"
                              />
                              <Input
                                value={tag.color || "#3B82F6"}
                                onChange={(e) =>
                                  handleUpdateTag(tag.id, "color", e.target.value)
                                }
                                placeholder="#3B82F6"
                                className="h-8 w-28 font-mono text-xs"
                                maxLength={7}
                              />
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
