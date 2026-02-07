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
import { Switch } from "@/components/ui/switch";
import { PlaidItem } from "@/lib/database";
import { Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AccountSettingsModalProps {
  account: PlaidItem | null;
  open: boolean;
  onClose: () => void;
  onSave?: (id: string, updates: { custom_name: string; is_hidden: boolean }) => void;
}

export function AccountSettingsModal({
  account,
  open,
  onClose,
  onSave,
}: AccountSettingsModalProps) {
  const [customName, setCustomName] = React.useState("");
  const [isHidden, setIsHidden] = React.useState(false);

  React.useEffect(() => {
    if (account) {
      setCustomName(account.custom_name || account.account_name || account.institution_name || "");
      setIsHidden(account.is_hidden || false);
    }
  }, [account]);

  if (!account) return null;

  const handleSave = () => {
    if (onSave && account.id) {
      onSave(account.id, {
        custom_name: customName,
        is_hidden: isHidden,
      });
      onClose();
    }
  };

  const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Customize your account display and view Plaid metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Editable Fields */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-medium">Customization</h3>

            <div className="space-y-2">
              <Label htmlFor="custom-name">Account Nickname</Label>
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

          {/* Read-Only Plaid Metadata */}
          <div className="space-y-4">
            <h3 className="font-medium">Account Information (Plaid)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Institution</Label>
                <div className="mt-1 text-sm">
                  {account.institution_name || "—"}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Account Type</Label>
                <div className="mt-1 text-sm capitalize">
                  {account.account_type || "—"}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Current Balance</Label>
                <div className="mt-1 text-sm font-medium">
                  {formatCurrency(account.current_balance || 0, account.balance_currency_code)}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Currency</Label>
                <div className="mt-1 text-sm">
                  {account.balance_currency_code || "USD"}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Last Synced</Label>
                <div className="mt-1 text-sm">
                  {account.last_sync_at ? formatDate(account.last_sync_at) : "Never"}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Sync Status</Label>
                <div className="mt-1">
                  {account.sync_status === "active" ? (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-success text-success">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-destructive text-destructive">
                      {account.sync_status || "Unknown"}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground">Plaid Item ID</Label>
                <div className="mt-1 text-xs font-mono text-muted-foreground break-all">
                  {account.item_id}
                </div>
              </div>

              {account.institution_id && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Institution ID</Label>
                  <div className="mt-1 text-xs font-mono text-muted-foreground">
                    {account.institution_id}
                  </div>
                </div>
              )}

              {account.error_message && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Error Message</Label>
                  <div className="mt-1 text-sm text-destructive">
                    {account.error_message}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Created</Label>
                <div className="mt-1 text-sm">
                  {formatDate(account.created_at)}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <div className="mt-1 text-sm">
                  {formatDate(account.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
