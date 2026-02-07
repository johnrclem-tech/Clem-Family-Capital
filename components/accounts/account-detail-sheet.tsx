"use client"

import * as React from "react"
import { PlaidItem } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface AccountDetailSheetProps {
  account: PlaidItem | null
  onSave?: (id: string, updates: { custom_name: string; is_hidden: boolean }) => Promise<void>
}

export function AccountDetailSheet({ account, onSave }: AccountDetailSheetProps) {
  const [customName, setCustomName] = React.useState("")
  const [isHidden, setIsHidden] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (account) {
      setCustomName(account.custom_name || account.account_name || account.institution_name || "")
      setIsHidden(account.is_hidden || false)
    }
  }, [account])

  if (!account) return null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch {
      return dateString
    }
  }

  const formatJson = (value: any) => {
    if (!value) return "-"
    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2)
      } catch {
        return value
      }
    }
    return JSON.stringify(value, null, 2)
  }

  const handleSave = async () => {
    if (onSave && account.id) {
      setIsSaving(true)
      try {
        await onSave(account.id, {
          custom_name: customName,
          is_hidden: isHidden,
        })
        // Update local account state to reflect saved values
        // The parent will refresh the data, but we update local state immediately
      } catch (error) {
        console.error("Error saving account:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{account.institution_name || "Unknown Institution"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Name</p>
              <p className="font-medium">{account.account_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mask</p>
              <p className="font-medium">{account.mask || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
              <p className="font-medium text-sm">{formatDate(account.last_sync_at)}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-6 pb-6">
          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="font-medium">Customization</h3>
            
            <div className="space-y-2">
              <Label htmlFor="custom-name">Custom Name</Label>
              <Input
                id="custom-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a custom name..."
              />
              <p className="text-xs text-muted-foreground">
                This name will appear in the sidebar instead of the default name
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-hidden">Hide from Navigation</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden accounts appear in a separate "Hidden" category
                </p>
              </div>
              <Switch
                id="is-hidden"
                checked={isHidden}
                onCheckedChange={setIsHidden}
              />
            </div>
          </div>

          {/* Basic Information - Matching Column Order */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                  <p className="font-medium capitalize">{account.account_type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Subtype</p>
                  <p className="font-medium capitalize">{account.account_subtype || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Visibility</p>
                  <p className="font-medium">{account.is_hidden ? "Hidden" : "Visible"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{account.sync_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Official Name</p>
                  <p className="font-medium">{account.official_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(account.current_balance || 0, account.balance_currency_code || "USD")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Identifiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Identifiers</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plaid Account ID</p>
                  <p className="font-mono text-sm break-all">{account.plaid_account_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plaid Item ID</p>
                  <p className="font-mono text-sm break-all">{account.item_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Institution ID</p>
                  <p className="font-mono text-sm break-all">{account.institution_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Persistent Account ID</p>
                  <p className="font-mono text-sm break-all">{account.persistent_account_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Database ID</p>
                  <p className="font-mono text-sm break-all">{account.id || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Balance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Balance Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="font-medium text-lg">
                    {account.available_balance !== null && account.available_balance !== undefined
                      ? formatCurrency(account.available_balance, account.balance_currency_code || account.unofficial_currency_code || "USD")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Credit Limit</p>
                  <p className="font-medium">
                    {account.balance_limit !== null && account.balance_limit !== undefined
                      ? formatCurrency(account.balance_limit, account.balance_currency_code || account.unofficial_currency_code || "USD")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Currency Code</p>
                  <p className="font-medium">{account.balance_currency_code || "USD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unofficial Currency</p>
                  <p className="font-medium">{account.unofficial_currency_code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance Last Updated</p>
                  <p className="font-medium text-sm">{formatDate(account.balance_last_updated_datetime)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Status</p>
                  <p className="font-medium capitalize">{account.verification_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Name</p>
                  <p className="font-medium">{account.verification_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Holder Category</p>
                  <p className="font-medium capitalize">{account.holder_category || "-"}</p>
                </div>
              </div>
              {account.verification_insights && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Insights</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto font-mono">
                    {formatJson(account.verification_insights)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Sync Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sync Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sync Status</p>
                  <p className="font-medium capitalize">{account.sync_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
                  <p className="font-medium text-sm">{formatDate(account.last_sync_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Is Hidden</p>
                  <p className="font-medium">{account.is_hidden ? "Yes" : "No"}</p>
                </div>
                {account.error_message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Error Message</p>
                    <p className="font-medium text-sm text-destructive break-words">{account.error_message}</p>
                  </div>
                )}
              </div>
              {account.cursor && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sync Cursor</p>
                  <p className="font-mono text-xs break-all bg-muted p-2 rounded">{account.cursor}</p>
                </div>
              )}
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
                  <p className="font-medium text-sm">{formatDate(account.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Updated At</p>
                  <p className="font-medium text-sm">{formatDate(account.updated_at)}</p>
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
