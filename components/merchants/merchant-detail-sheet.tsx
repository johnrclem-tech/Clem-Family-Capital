"use client"

import * as React from "react"
import { MerchantWithStats } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface MerchantDetailSheetProps {
  merchant: MerchantWithStats | null
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string; color?: string | null }>
  onSave?: (id: string, updates: Partial<MerchantWithStats>) => Promise<void>
}

export function MerchantDetailSheet({ merchant, categories, tags, onSave }: MerchantDetailSheetProps) {
  const [defaultCategoryId, setDefaultCategoryId] = React.useState<string>("")
  const [defaultTagId, setDefaultTagId] = React.useState<string>("")
  const [notes, setNotes] = React.useState("")
  const [isConfirmed, setIsConfirmed] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (merchant) {
      setDefaultCategoryId(merchant.default_category_id || "")
      setDefaultTagId(merchant.default_tag_id || "")
      setNotes(merchant.notes || "")
      setIsConfirmed(merchant.is_confirmed || false)
    }
  }, [merchant])

  if (!merchant) return null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch {
      return dateString
    }
  }

  const handleSave = async () => {
    if (onSave && merchant.id) {
      setIsSaving(true)
      try {
        await onSave(merchant.id, {
          default_category_id: defaultCategoryId || null,
          default_tag_id: defaultTagId || null,
          notes: notes || null,
          is_confirmed: isConfirmed,
        })
      } catch (error) {
        console.error("Error saving merchant:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const selectedCategory = categories.find((c) => c.id === defaultCategoryId)
  const selectedTag = tags.find((t) => t.id === defaultTagId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{merchant.name || "Unknown Merchant"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="font-medium text-lg">
                {formatCurrency(merchant.total_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction Count</p>
              <p className="font-medium">{merchant.transaction_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Transaction</p>
              <p className="font-medium text-sm">{formatDate(merchant.last_transaction_date)}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-6 pb-6">
          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="font-medium">Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="default-category">Default Category</Label>
              <Select
                value={defaultCategoryId || "none"}
                onValueChange={(value) => setDefaultCategoryId(value === "none" ? "" : value)}
              >
                <SelectTrigger id="default-category">
                  <SelectValue placeholder="Uncategorized" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-tag">Default Tag</Label>
              <Select
                value={defaultTagId || "none"}
                onValueChange={(value) => setDefaultTagId(value === "none" ? "" : value)}
              >
                <SelectTrigger id="default-tag">
                  <SelectValue placeholder="No Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tag</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-confirmed">Confirmed</Label>
                <p className="text-xs text-muted-foreground">
                  Mark merchant as confirmed
                </p>
              </div>
              <Switch
                id="is-confirmed"
                checked={isConfirmed}
                onCheckedChange={setIsConfirmed}
              />
            </div>
          </div>

          {/* Merchant Information */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Merchant Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Category</p>
                  <div className="font-medium">
                    {selectedCategory ? (
                      <Badge variant="outline">{selectedCategory.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Tag</p>
                  <div className="font-medium">
                    {selectedTag ? (
                      <Badge variant="secondary">{selectedTag.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
                  <p className="font-medium capitalize">{merchant.confidence_level || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Merchant Entity ID</p>
                  <p className="font-mono text-sm">{merchant.merchant_entity_id || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Statistics</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(merchant.total_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction Count</p>
                  <p className="font-medium">{merchant.transaction_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Transaction</p>
                  <p className="font-medium text-sm">{formatDate(merchant.last_transaction_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metadata</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created At</p>
                  <p className="font-medium text-sm">{formatDate(merchant.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Updated At</p>
                  <p className="font-medium text-sm">{formatDate(merchant.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter className="border-t pt-4 mt-auto">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </SheetFooter>
    </div>
  )
}
