"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TransactionEnriched, Merchant } from "@/lib/database";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Save, Split } from "lucide-react";
import { MerchantCombobox } from "@/components/merchants/merchant-combobox";
import { MerchantSettingsDialog } from "@/components/merchants/merchant-settings-dialog";
import { TagCombobox } from "@/components/tags/tag-combobox";
import { TagManagementDialog } from "@/components/tags/tag-management-dialog";

interface TransactionDetailSheetProps {
  transaction: TransactionEnriched | null;
  categories?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string; color?: string | null }>;
  onSave?: (id: string, updates: Partial<TransactionEnriched>) => void;
}

export function TransactionDetailSheet({
  transaction,
  categories = [],
  tags = [],
  onSave,
}: TransactionDetailSheetProps) {
  const [editedTransaction, setEditedTransaction] = React.useState<Partial<TransactionEnriched>>({});
  const [merchantNames, setMerchantNames] = React.useState<string[]>([]);
  const [merchants, setMerchants] = React.useState<Merchant[]>([]);
  const [merchantSettingsOpen, setMerchantSettingsOpen] = React.useState(false);
  const [selectedMerchant, setSelectedMerchant] = React.useState<Merchant | null>(null);
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);

  // Fetch merchant names and merchants
  React.useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const [namesRes, merchantsRes] = await Promise.all([
          fetch("/api/merchants/unique-names"),
          fetch("/api/merchants"),
        ]);
        const namesData = await namesRes.json();
        const merchantsData = await merchantsRes.json();
        setMerchantNames(namesData.names || []);
        setMerchants(merchantsData.merchants || []);
      } catch (error) {
        console.error("Error fetching merchants:", error);
      }
    };
    fetchMerchants();
  }, []);

  React.useEffect(() => {
    if (transaction) {
      setEditedTransaction({
        category_id: transaction.category_id,
        tag_id: transaction.tag_id,
        notes: transaction.notes,
        merchant_name: transaction.merchant_name, // Pre-populate with Plaid merchant
      });
    }
  }, [transaction]);

  // Handle merchant selection and auto-apply defaults
  const handleMerchantChange = (merchantName: string) => {
    // Find merchant first
    const merchant = merchantName ? merchants.find((m) => m.name === merchantName) : null;
    
    // Update merchant name and apply defaults if merchant exists
    setEditedTransaction((prev) => {
      const updates: Partial<TransactionEnriched> = {
        merchant_name: merchantName || null,
      };
      
      // Only auto-apply defaults if merchant exists and fields aren't already set
      if (merchant) {
        if (!prev.category_id && merchant.default_category_id) {
          updates.category_id = merchant.default_category_id;
        }
        if (!prev.tag_id && merchant.default_tag_id) {
          updates.tag_id = merchant.default_tag_id;
        }
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleMerchantSettingsClick = () => {
    const currentMerchantName = editedTransaction.merchant_name;
    if (currentMerchantName) {
      const merchant = merchants.find((m) => m.name === currentMerchantName);
      setSelectedMerchant(merchant || null);
    } else {
      setSelectedMerchant(null);
    }
    setMerchantSettingsOpen(true);
  };

  const handleMerchantSave = (merchant: Merchant) => {
    // Refresh merchants list
    fetch("/api/merchants")
      .then((res) => res.json())
      .then((data) => {
        setMerchants(data.merchants || []);
        // Update merchant names if new merchant was created
        if (!merchantNames.includes(merchant.name)) {
          setMerchantNames((prev) => [...prev, merchant.name].sort());
        }
      })
      .catch((error) => console.error("Error refreshing merchants:", error));

    // If this merchant is currently selected, apply defaults
    if (editedTransaction.merchant_name === merchant.name) {
      setEditedTransaction((prev) => ({
        ...prev,
        category_id: prev.category_id || merchant.default_category_id || null,
        tag_id: prev.tag_id || merchant.default_tag_id || null,
      }));
    }
  };

  const handleMerchantDelete = (id: string) => {
    const deletedMerchant = merchants.find((m) => m.id === id);
    if (deletedMerchant && editedTransaction.merchant_name === deletedMerchant.name) {
      setEditedTransaction((prev) => ({
        ...prev,
        merchant_name: null,
      }));
    }
    // Refresh merchants list
    fetch("/api/merchants")
      .then((res) => res.json())
      .then((data) => {
        setMerchants(data.merchants || []);
        setMerchantNames((prev) => prev.filter((name) => name !== deletedMerchant?.name));
      })
      .catch((error) => console.error("Error refreshing merchants:", error));
  };

  // Show empty state if no transaction selected
  if (!transaction) {
    return (
      <aside className="w-80 border-l bg-background flex flex-col">
        <div className="p-6 flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Select a transaction to view details</p>
        </div>
      </aside>
    );
  }

  const handleSave = () => {
    if (onSave && transaction.id) {
      onSave(transaction.id, editedTransaction);
    }
  };

  const parseJson = (value: any): any => {
    if (!value) return null;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  const location = parseJson(transaction.location);
  const paymentMeta = parseJson(transaction.payment_meta);
  const personalFinance = parseJson(transaction.personal_finance_category_detailed);

  // Get confidence level and map to color
  const getConfidenceColor = (confidence?: string) => {
    if (!confidence) return "bg-muted";
    const conf = confidence.toLowerCase();
    if (conf.includes("very high") || conf === "very_high") return "bg-success";
    if (conf.includes("high")) return "bg-success";
    if (conf.includes("medium")) return "bg-warning";
    if (conf.includes("low")) return "bg-warning";
    if (conf.includes("very low") || conf === "very_low") return "bg-destructive";
    return "bg-muted";
  };

  const confidenceLevel = personalFinance?.confidence_level;

  return (
    <aside className="w-80 border-l bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-2">
            {transaction.original_description || "Transaction"}
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{transaction.merchant_name || "-"}</div>
            <div>{formatDate(transaction.date)}</div>
            <div className={cn(
              transaction.amount >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(transaction.amount)}
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="p-4 space-y-6">
          {/* Categorization */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Categorization</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Merchant</label>
              <MerchantCombobox
                value={editedTransaction.merchant_name || ""}
                onChange={handleMerchantChange}
                onSettingsClick={handleMerchantSettingsClick}
                merchantNames={merchantNames}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
              <Select
                value={editedTransaction.category_id || ""}
                onChange={(e) =>
                  setEditedTransaction((prev) => ({
                    ...prev,
                    category_id: e.target.value || null,
                  }))
                }
                className="mt-1.5"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tag</label>
              <div className="mt-1.5">
                <TagCombobox
                  tags={tags}
                  value={editedTransaction.tag_id || null}
                  onChange={(value) =>
                    setEditedTransaction((prev) => ({
                      ...prev,
                      tag_id: value,
                    }))
                  }
                  onManageTags={() => setTagManagementOpen(true)}
                  placeholder="Select tag..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
              <Input
                value={editedTransaction.notes || ""}
                onChange={(e) =>
                  setEditedTransaction((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add notes..."
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Plaid Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Plaid Data</h3>

            {personalFinance && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personal Finance Category</label>
                <div className="mt-1.5 space-y-2 text-sm">
                  {personalFinance.primary && (
                    <div className="text-muted-foreground">
                      Primary: <span className="font-medium text-foreground">{personalFinance.primary}</span>
                    </div>
                  )}
                  {personalFinance.detailed && (
                    <div className="text-muted-foreground">
                      Detailed: <span className="font-medium text-foreground">{personalFinance.detailed}</span>
                    </div>
                  )}
                  {confidenceLevel && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white",
                        getConfidenceColor(confidenceLevel)
                      )}>
                        {confidenceLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {transaction.payment_channel && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Channel</label>
                <div className="mt-1.5 text-sm text-muted-foreground">{transaction.payment_channel}</div>
              </div>
            )}

            {transaction.check_number && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Check Number</label>
                <div className="mt-1.5 text-sm text-muted-foreground">{transaction.check_number}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <div className="mt-1.5">
                {transaction.pending ? (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-warning text-warning">
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-success text-success">
                    Cleared
                  </span>
                )}
              </div>
            </div>

            {location && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</label>
                <div className="mt-1.5 text-sm space-y-1 text-muted-foreground">
                  {location.address && <div>{location.address}</div>}
                  {(location.city || location.region) && (
                    <div>
                      {location.city}
                      {location.city && location.region && ", "}
                      {location.region} {location.postal_code}
                    </div>
                  )}
                  {location.country && <div>{location.country}</div>}
                </div>
              </div>
            )}

            {transaction.merchant_entity_id && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Merchant ID</label>
                <div className="mt-1.5 text-xs font-mono text-muted-foreground break-all">
                  {transaction.merchant_entity_id}
                </div>
              </div>
            )}

            {transaction.website && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</label>
                <div className="mt-1.5">
                  <a
                    href={transaction.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all"
                  >
                    {transaction.website}
                  </a>
                </div>
              </div>
            )}

            {paymentMeta && Object.keys(paymentMeta).length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Metadata</label>
                <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                  {Object.entries(paymentMeta).map(([key, value]) => (
                    <div key={key}>
                      {key.replace(/_/g, " ")}: <span className="font-medium text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Technical Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Technical Details</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              {transaction.plaid_transaction_id && (
                <div className="font-mono">
                  ID: {transaction.plaid_transaction_id}
                </div>
              )}
              {transaction.account_id && (
                <div className="font-mono">
                  Account: {transaction.account_id}
                </div>
              )}
              {transaction.iso_currency_code && (
                <div>
                  Currency: {transaction.iso_currency_code}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="border-t p-4">
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Merchant Settings Dialog */}
      <MerchantSettingsDialog
        merchant={selectedMerchant}
        open={merchantSettingsOpen}
        onClose={() => setMerchantSettingsOpen(false)}
        onSave={handleMerchantSave}
        onDelete={handleMerchantDelete}
        categories={categories}
        tags={tags}
      />

      {/* Tag Management Dialog */}
      <TagManagementDialog
        open={tagManagementOpen}
        onClose={() => setTagManagementOpen(false)}
        onSave={() => {
          // Refresh tags in parent component
          window.location.reload();
        }}
      />
    </aside>
  );
}
