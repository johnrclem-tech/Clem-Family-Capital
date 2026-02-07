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
import { AlertTriangle } from "lucide-react";

interface BulkUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updateExisting: boolean) => void;
  merchantName: string;
  transactionCount: number;
  fieldName: string; // "category" or "tag"
}

export function BulkUpdateDialog({
  open,
  onClose,
  onConfirm,
  merchantName,
  transactionCount,
  fieldName,
}: BulkUpdateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Update Past Transactions?
          </DialogTitle>
          <DialogDescription>
            You're changing the default {fieldName} for <strong>{merchantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            This merchant has <strong>{transactionCount}</strong> existing transaction{transactionCount !== 1 ? 's' : ''}.
          </p>
          <p className="text-sm text-muted-foreground">
            Would you like to update all past transactions with this new {fieldName}, or only apply it to future transactions?
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onConfirm(false)}
            className="w-full sm:w-auto"
          >
            Only Future
          </Button>
          <Button 
            onClick={() => onConfirm(true)}
            className="w-full sm:w-auto"
          >
            Update All {transactionCount}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
