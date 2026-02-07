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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Merchant, MerchantWithStats } from "@/lib/database";
import { Save, Trash2 } from "lucide-react";
import { TagCombobox } from "@/components/tags/tag-combobox";
import { TagManagementDialog } from "@/components/tags/tag-management-dialog";

interface MerchantSettingsDialogProps {
  merchant: Merchant | MerchantWithStats | null;
  open: boolean;
  onClose: () => void;
  onSave: (merchant: Merchant) => void;
  onDelete?: (id: string) => void;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string; color?: string | null }>;
}

export function MerchantSettingsDialog({
  merchant,
  open,
  onClose,
  onSave,
  onDelete,
  categories,
  tags,
}: MerchantSettingsDialogProps) {
  const [name, setName] = React.useState("");
  const [defaultCategoryId, setDefaultCategoryId] = React.useState<string>("");
  const [defaultTagId, setDefaultTagId] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [confidenceLevel, setConfidenceLevel] = React.useState("");
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);

  React.useEffect(() => {
    if (merchant) {
      setName(merchant.name);
      setDefaultCategoryId(merchant.default_category_id || "");
      setDefaultTagId(merchant.default_tag_id || "");
      setNotes(merchant.notes || "");
      setLogoUrl(merchant.logo_url || "");
      setConfidenceLevel(merchant.confidence_level || "");
      setIsConfirmed(merchant.is_confirmed || false);
    } else {
      setName("");
      setDefaultCategoryId("");
      setDefaultTagId("");
      setNotes("");
      setLogoUrl("");
      setConfidenceLevel("");
      setIsConfirmed(false);
    }
  }, [merchant]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Merchant name is required");
      return;
    }

    setSaving(true);
    try {
      if (merchant) {
        // Update existing merchant
        const response = await fetch(`/api/merchants/${merchant.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            default_category_id: defaultCategoryId || null,
            default_tag_id: defaultTagId || null,
            notes: notes.trim() || null,
            logo_url: logoUrl.trim() || null,
            confidence_level: confidenceLevel.trim() || null,
            is_confirmed: isConfirmed,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update merchant");
        }

        const data = await response.json();
        onSave(data.merchant);
      } else {
        // Create new merchant
        const response = await fetch("/api/merchants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            default_category_id: defaultCategoryId || null,
            default_tag_id: defaultTagId || null,
            notes: notes.trim() || null,
            logo_url: logoUrl.trim() || null,
            confidence_level: confidenceLevel.trim() || null,
            is_confirmed: isConfirmed,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create merchant");
        }

        const data = await response.json();
        onSave(data.merchant);
      }
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to save merchant");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!merchant || !onDelete) return;
    if (!confirm(`Are you sure you want to delete "${merchant.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/merchants/${merchant.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete merchant");
      }

      onDelete(merchant.id);
      onClose();
    } catch (error) {
      alert("Failed to delete merchant");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {merchant ? "Edit Merchant" : "New Merchant"}
          </DialogTitle>
          <DialogDescription>
            {merchant
              ? "Update merchant settings and default category/tag"
              : "Create a new merchant with default category and tag"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 overflow-y-auto flex-1">
          {/* Editable Fields - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="merchant-name">Merchant Name</Label>
                <Input
                  id="merchant-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter merchant name..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="default-category">Default Category</Label>
                <Select
                  value={defaultCategoryId}
                  onValueChange={setDefaultCategoryId}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="default-tag">Default Tag</Label>
                <div className="mt-1.5">
                  <TagCombobox
                    tags={tags}
                    value={defaultTagId || null}
                    onChange={(value) => setDefaultTagId(value || "")}
                    onManageTags={() => setTagManagementOpen(true)}
                    placeholder="Select tag..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confidence-level">Confidence Level</Label>
                <Select
                  value={confidenceLevel}
                  onValueChange={setConfidenceLevel}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="VERY_HIGH">Very High</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1.5"
                />
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="h-8 w-8 object-contain rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between space-x-2 py-3 px-3 bg-muted/30 rounded-lg">
                <Label htmlFor="is-confirmed" className="flex flex-col space-y-1 cursor-pointer">
                  <span>Confirmed Merchant</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Mark as verified and confirmed
                  </span>
                </Label>
                <Switch
                  id="is-confirmed"
                  checked={isConfirmed}
                  onCheckedChange={setIsConfirmed}
                />
              </div>

              <div>
                <Label htmlFor="merchant-notes">Notes</Label>
                <Textarea
                  id="merchant-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this merchant..."
                  className="mt-1.5 min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Transaction Statistics (if available) */}
          {merchant && (merchant as MerchantWithStats).transaction_count !== undefined && (
            <div className="mb-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <h3 className="text-sm font-semibold mb-3 text-info uppercase tracking-wide">
                Transaction Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-info">Total Transactions</Label>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {(merchant as MerchantWithStats).transaction_count || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-info">Total Amount</Label>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }).format((merchant as MerchantWithStats).total_amount || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-info">Last Transaction</Label>
                  <p className="text-sm font-semibold mt-1 text-foreground">
                    {(merchant as MerchantWithStats).last_transaction_date 
                      ? new Date((merchant as MerchantWithStats).last_transaction_date!).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          {merchant && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                System Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Merchant ID</Label>
                  <p className="text-sm font-mono mt-1 break-all">{merchant.id}</p>
                </div>
                {merchant.merchant_entity_id && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Plaid Entity ID</Label>
                    <p className="text-sm font-mono mt-1 break-all">{merchant.merchant_entity_id}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="text-sm mt-1">{new Date(merchant.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p className="text-sm mt-1">{new Date(merchant.updated_at).toLocaleString()}</p>
                </div>
                {merchant.merged_into_merchant_id && (
                  <div className="col-span-2 md:col-span-4">
                    <Label className="text-xs text-muted-foreground">Merged Into Merchant</Label>
                    <p className="text-sm font-mono mt-1 break-all">{merchant.merged_into_merchant_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row !justify-between !space-x-0 w-full !p-0 !pt-4">
          <div className="flex items-center justify-start flex-1">
            {merchant && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Tag Management Dialog */}
      <TagManagementDialog
        open={tagManagementOpen}
        onClose={() => setTagManagementOpen(false)}
        onSave={() => {
          // Refresh tags in parent component
          window.location.reload();
        }}
      />
    </Dialog>
  );
}
