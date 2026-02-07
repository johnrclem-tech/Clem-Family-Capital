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
import { Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { PlaidPfcCategory, Category } from "@/lib/database";
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { CategoryManagementDialog } from "@/components/categories/category-management-dialog";

interface PlaidPfcMappingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface PfcEdit extends PlaidPfcCategory {
  modified?: boolean;
}

export function PlaidPfcMappingDialog({
  open,
  onClose,
  onSave,
}: PlaidPfcMappingDialogProps) {
  const [pfcCategories, setPfcCategories] = React.useState<PfcEdit[]>([]);
  const [merchantCategories, setMerchantCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const [filterUnmapped, setFilterUnmapped] = React.useState(false);
  const [categoryManagementOpen, setCategoryManagementOpen] = React.useState(false);

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pfcResponse, catResponse] = await Promise.all([
        fetch("/api/plaid-pfc-categories"),
        fetch("/api/categories"),
      ]);

      if (pfcResponse.ok) {
        const pfcData = await pfcResponse.json();
        setPfcCategories(pfcData.categories || []);
        
        // Auto-expand all groups initially
        const primaries = new Set((pfcData.categories || []).map((c: PlaidPfcCategory) => c.primary_category));
        setExpandedGroups(primaries);
      }

      if (catResponse.ok) {
        const catData = await catResponse.json();
        // Only show subcategories (those with parent_id)
        const subcategories = catData.categories.filter((c: Category) => c.parent_id);
        setMerchantCategories(subcategories);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (pfcId: string, merchantCategoryId: string) => {
    setPfcCategories((prev) =>
      prev.map((pfc) =>
        pfc.id === pfcId
          ? { ...pfc, default_merchant_category_id: merchantCategoryId || null, modified: true }
          : pfc
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const modifiedCategories = pfcCategories.filter((pfc) => pfc.modified);

      // Save all modified mappings
      await Promise.all(
        modifiedCategories.map((pfc) =>
          fetch(`/api/plaid-pfc-categories/${pfc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              default_merchant_category_id: pfc.default_merchant_category_id,
            }),
          })
        )
      );

      onSave();
    } catch (error) {
      console.error("Error saving mappings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const toggleGroup = (primary: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(primary)) {
        next.delete(primary);
      } else {
        next.add(primary);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allPrimaries = new Set(pfcCategories.map((c) => c.primary_category));
    setExpandedGroups(allPrimaries);
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Group categories by primary
  const groupedCategories = React.useMemo(() => {
    const groups = new Map<string, PfcEdit[]>();
    
    pfcCategories.forEach((pfc) => {
      if (!groups.has(pfc.primary_category)) {
        groups.set(pfc.primary_category, []);
      }
      groups.get(pfc.primary_category)!.push(pfc);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [pfcCategories]);

  // Filter categories
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm && !filterUnmapped) return groupedCategories;

    return groupedCategories
      .map(([primary, categories]) => {
        const filtered = categories.filter((pfc) => {
          const matchesSearch = !searchTerm || 
            pfc.primary_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pfc.detailed_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pfc.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesFilter = !filterUnmapped || !pfc.default_merchant_category_id;
          
          return matchesSearch && matchesFilter;
        });

        return [primary, filtered] as [string, PfcEdit[]];
      })
      .filter(([_, categories]) => categories.length > 0);
  }, [groupedCategories, searchTerm, filterUnmapped]);

  const modifiedCount = pfcCategories.filter((pfc) => pfc.modified).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Plaid PFC Category Mappings</DialogTitle>
          <DialogDescription>
            Map Plaid Personal Finance Categories to your Merchant Categories. These mappings will
            automatically categorize incoming transactions based on Plaid's categorization.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex gap-4 items-center py-2">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={filterUnmapped ? "default" : "outline"}
            onClick={() => setFilterUnmapped(!filterUnmapped)}
            size="sm"
          >
            {filterUnmapped ? "Show All" : "Unmapped Only"}
          </Button>
          <Button
            variant="outline"
            onClick={expandAll}
            size="sm"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            onClick={collapseAll}
            size="sm"
          >
            Collapse All
          </Button>
        </div>

        {/* Categories Table */}
        <div className="flex-1 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading categories...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No categories found
            </div>
          ) : (
            <div className="divide-y">
              {filteredGroups.map(([primary, categories]) => (
                <div key={primary}>
                  {/* Primary Category Header */}
                  <div
                    className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-3 font-semibold cursor-pointer hover:bg-muted flex items-center gap-2 z-10"
                    onClick={() => toggleGroup(primary)}
                  >
                    {expandedGroups.has(primary) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>{primary.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({categories.length} {categories.length === 1 ? 'category' : 'categories'})
                    </span>
                  </div>

                  {/* Detailed Categories */}
                  {expandedGroups.has(primary) && (
                    <div className="divide-y">
                      {categories.map((pfc) => (
                        <div
                          key={pfc.id}
                          className="px-4 py-3 hover:bg-muted/50 grid grid-cols-12 gap-4 items-start"
                        >
                          {/* Detailed Category Name */}
                          <div className="col-span-4">
                            <div className="font-medium text-sm">
                              {pfc.detailed_category.replace(primary + "_", "").replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {pfc.description}
                            </div>
                          </div>

                          {/* Full Category Name */}
                          <div className="col-span-4 text-xs font-mono text-muted-foreground">
                            {pfc.detailed_category}
                          </div>

                          {/* Merchant Category Mapping */}
                          <div className="col-span-4">
                            <div className="space-y-1">
                              <CategoryCombobox
                                categories={merchantCategories}
                                value={pfc.default_merchant_category_id || null}
                                onChange={(value) => handleCategoryChange(pfc.id, value || "")}
                                onManageCategories={() => setCategoryManagementOpen(true)}
                                placeholder="None"
                                className="w-full text-sm"
                              />
                              {pfc.modified && (
                                <span className="text-xs text-orange-500">Modified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {modifiedCount > 0 && (
              <span className="text-orange-500 font-medium">
                {modifiedCount} {modifiedCount === 1 ? 'change' : 'changes'} pending
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || modifiedCount === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : `Save ${modifiedCount > 0 ? modifiedCount : ''} Changes`}
            </Button>
          </div>
        </DialogFooter>

        {/* Category Management Dialog */}
        <CategoryManagementDialog
          open={categoryManagementOpen}
          onClose={() => setCategoryManagementOpen(false)}
          onSave={() => {
            setCategoryManagementOpen(false);
            fetchData(); // Refresh categories
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
