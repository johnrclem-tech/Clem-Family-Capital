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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MerchantWithStats } from "@/lib/database";
import { GitMerge } from "lucide-react";

interface MergeMerchantsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (targetMerchantId: string) => void;
  sourceMerchant: MerchantWithStats | null;
  availableMerchants: MerchantWithStats[];
}

export function MergeMerchantsDialog({
  open,
  onClose,
  onConfirm,
  sourceMerchant,
  availableMerchants,
}: MergeMerchantsDialogProps) {
  const [targetMerchantId, setTargetMerchantId] = React.useState<string>("");
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTargetMerchantId("");
      setConfirming(false);
    }
  }, [open]);

  const targetMerchant = availableMerchants.find(m => m.id === targetMerchantId);

  const handleConfirm = async () => {
    if (!targetMerchantId) return;
    
    setConfirming(true);
    try {
      await onConfirm(targetMerchantId);
      onClose();
    } catch (error) {
      console.error("Error merging merchants:", error);
    } finally {
      setConfirming(false);
    }
  };

  if (!sourceMerchant) return null;

  // Filter out the source merchant from available options
  const targetOptions = availableMerchants.filter(m => m.id !== sourceMerchant.id);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Merge Merchants
          </DialogTitle>
          <DialogDescription>
            Merge <strong>{sourceMerchant.name}</strong> into another merchant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="target-merchant">Target Merchant</Label>
            <Select
              value={targetMerchantId}
              onValueChange={setTargetMerchantId}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a merchant..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select a merchant...</SelectItem>
                {targetOptions.map((merchant) => (
                  <SelectItem key={merchant.id} value={merchant.id}>
                    {merchant.name} ({merchant.transaction_count} transactions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {targetMerchant && (
            <div className="rounded-md bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm text-muted-foreground">
                All {sourceMerchant.transaction_count} transaction{sourceMerchant.transaction_count !== 1 ? 's' : ''} from 
                <strong> {sourceMerchant.name}</strong> will be moved to 
                <strong> {targetMerchant.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                The merchant "{sourceMerchant.name}" will be marked as merged and hidden from the list.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={confirming}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!targetMerchantId || confirming}
          >
            {confirming ? "Merging..." : "Merge Merchants"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
