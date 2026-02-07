"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionEnriched } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/utils";

interface MerchantTransactionsDialogProps {
  merchantName: string;
  merchantId: string;
  merchantEntityId?: string | null;
  open: boolean;
  onClose: () => void;
}

export function MerchantTransactionsDialog({
  merchantName,
  merchantId,
  merchantEntityId,
  open,
  onClose,
}: MerchantTransactionsDialogProps) {
  const [transactions, setTransactions] = React.useState<TransactionEnriched[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && merchantId) {
      loadTransactions();
    } else {
      setTransactions([]);
      setError(null);
    }
  }, [open, merchantId]);

  const loadTransactions = async () => {
    if (!merchantId && !merchantName) return;
    
    setLoading(true);
    setError(null);
    try {
      // Use merchant name as query parameter to handle merchants from transactions
      const url = `/api/merchants/${merchantId || merchantName}/transactions?merchantName=${encodeURIComponent(merchantName)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        setError("Failed to load transactions");
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total
  const total = React.useMemo(() => {
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }, [transactions]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-semibold">{merchantName}</DialogTitle>
            <div className="text-lg font-semibold">
              <span className={total >= 0 ? "text-success" : "text-destructive"}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
          <DialogDescription className="flex items-center gap-4">
            <span>
              {transactions.length > 0
                ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} found`
                : "No transactions found"}
            </span>
            {merchantEntityId && (
              <span>
                Entity ID: {merchantEntityId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this merchant
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-background sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="h-10 px-3 text-left text-xs font-medium bg-background">Date</th>
                    <th className="h-10 px-3 text-left text-xs font-medium bg-background">Original Description</th>
                    <th className="h-10 px-3 text-left text-xs font-medium bg-background">Category</th>
                    <th className="h-10 px-3 text-left text-xs font-medium bg-background">Tag</th>
                    <th className="h-10 px-3 text-right text-xs font-medium bg-background">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-4 text-sm whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="p-4 text-sm">
                        {txn.original_description || "-"}
                      </td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        {txn.category_name || "-"}
                      </td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        {txn.tag_name || "-"}
                      </td>
                      <td className="p-4 text-sm text-right whitespace-nowrap">
                        <span
                          className={
                            txn.amount >= 0 ? "text-success" : "text-destructive"
                          }
                        >
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
