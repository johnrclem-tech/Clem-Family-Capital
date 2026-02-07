"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MerchantCategoryTable } from "./merchant-category-table";

interface MerchantCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MerchantCategoryDialog({
  open,
  onClose,
  onSave,
}: MerchantCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Merchant Categories</DialogTitle>
          <DialogDescription>
            View and manage your merchant categories with Plaid PFC mappings
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <MerchantCategoryTable onClose={onClose} onRefresh={onSave} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
