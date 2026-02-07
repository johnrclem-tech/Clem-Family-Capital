"use client";

import * as React from "react";
import { usePlaidLink } from "react-plaid-link";
import { DataTable } from "@/components/transactions/data-table";
import { createColumns } from "@/components/transactions/columns";
import { AccountSettingsModal } from "@/components/accounts/account-settings-modal";
import { MerchantsDashboardTable } from "@/components/merchants/merchants-dashboard-table";
import { MerchantCategoryTable } from "@/components/categories/merchant-category-table";
import { TransactionEnriched, PlaidItem, Category, Tag, MerchantWithStats } from "@/lib/database";
import { AccountType } from "@/lib/account-types";
import { RefreshCw } from "lucide-react";
import { useRegisterSync } from "@/components/layout/sync-context";

export default function HomePage() {
  const [transactions, setTransactions] = React.useState<TransactionEnriched[]>([]);
  const [accounts, setAccounts] = React.useState<PlaidItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [unreviewedCounts, setUnreviewedCounts] = React.useState<Record<string, number>>({});
  const [merchants, setMerchants] = React.useState<MerchantWithStats[]>([]);
  const [merchantNames, setMerchantNames] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [connecting, setConnecting] = React.useState(false);
  const [linkToken, setLinkToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  // Navigation state
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null);
  const [selectedGroupType, setSelectedGroupType] = React.useState<AccountType | null>(null);
  const [showCategoriesView, setShowCategoriesView] = React.useState(false);
  const [showMerchantsView, setShowMerchantsView] = React.useState(false);
  const [merchantsWithStats, setMerchantsWithStats] = React.useState<MerchantWithStats[]>([]);


  // Account settings modal state
  const [accountSettingsOpen, setAccountSettingsOpen] = React.useState(false);

  // Fetch all data on mount
  React.useEffect(() => {
    fetchAllData().catch((error) => {
      console.error("Error in fetchAllData:", error);
      setLoading(false);
    });
  }, []);

  const fetchAllData = React.useCallback(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchAccounts(),
      fetchCategories(),
      fetchTags(),
      fetchUnreviewedCounts(),
      fetchMerchantsWithStats(),
      fetchMerchantNames(),
    ]);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      const data = await response.json();
      
      if (response.ok) {
        console.log("Transactions fetched:", data.count || 0);
        setTransactions(data.transactions || []);
      } else {
        console.error("API error:", data.error || "Unknown error");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchUnreviewedCounts = async () => {
    try {
      const response = await fetch("/api/accounts/unreviewed-counts");
      if (response.ok) {
        const data = await response.json();
        setUnreviewedCounts(data.counts || {});
      }
    } catch (error) {
      console.error("Error fetching unreviewed counts:", error);
    }
  };

  const fetchMerchantsWithStats = async () => {
    try {
      const response = await fetch("/api/merchants/stats");
      if (response.ok) {
        const data = await response.json();
        setMerchantsWithStats(data.merchants || []);
      }
    } catch (error) {
      console.error("Error fetching merchants stats:", error);
    }
  };

  const fetchMerchantNames = async () => {
    try {
      const response = await fetch("/api/merchants/unique-names");
      if (response.ok) {
        const data = await response.json();
        setMerchantNames(data.names || []);
      }
    } catch (error) {
      console.error("Error fetching merchant names:", error);
    }
  };

  const createLinkToken = async () => {
    try {
      setConnecting(true);
      setError(null);
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.link_token) {
          setLinkToken(data.link_token);
        } else {
          const errorMsg = data.error || "Failed to create link token";
          setError(errorMsg);
          setPendingOpen(false); // Reset pending state on error
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || "Failed to create link token. Check your Plaid credentials.";
        setError(errorMsg);
        setPendingOpen(false); // Reset pending state on error
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error. Check your connection.";
      setError(errorMessage);
      setPendingOpen(false); // Reset pending state on error
      console.error("Error creating link token:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      console.log("Plaid link successful:", metadata);

      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token: publicToken,
          institution_id: metadata.institution?.institution_id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Account connected:", result);
        setLinkToken(null);
        await fetchAllData();
      } else {
        console.error("Failed to exchange token");
      }
    } catch (error) {
      console.error("Error exchanging token:", error);
    }
  };

  const handlePlaidExit = (error: any, metadata: any) => {
    console.log("Plaid link exited:", error, metadata);
    setLinkToken(null);
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: handlePlaidExit,
  });

  // Track if user initiated the connect flow
  const [pendingOpen, setPendingOpen] = React.useState(false);

  // Auto-open when token is ready and user clicked connect
  React.useEffect(() => {
    if (linkToken && ready && pendingOpen) {
      try {
        open();
        setPendingOpen(false);
      } catch (error) {
        console.error("Error opening Plaid Link:", error);
        setPendingOpen(false);
      }
    }
  }, [linkToken, ready, pendingOpen, open]);

  const handleConnectAccount = async () => {
    setPendingOpen(true); // Mark that user wants to connect
    
    if (!linkToken) {
      // Create token first, then useEffect will open when ready
      await createLinkToken();
    } else if (ready) {
      // Token exists and is ready, open immediately
      open();
      setPendingOpen(false);
    }
  };

  const handleSync = React.useCallback(async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/sync", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sync completed:", result);
        // Refresh all data after sync
        await fetchAllData();
      } else {
        const error = await response.json();
        console.error("Sync error:", error);
        setError(error.error || "Failed to sync transactions");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      setError(error instanceof Error ? error.message : "Failed to sync transactions");
    } finally {
      setSyncing(false);
    }
  }, [fetchAllData]);

  // Register sync handler with context so header can access it
  useRegisterSync(handleSync, syncing);

  // Filter out parent categories from regular category selection
  const regularCategories = React.useMemo(() => {
    return categories.filter((c) => !c.is_parent_category);
  }, [categories]);

  // Navigation handlers
  const handleSelectAll = () => {
    setSelectedAccountId(null);
    setSelectedGroupType(null);
    setShowCategoriesView(false);
    setShowMerchantsView(false);
  };

  const handleSelectGroup = (type: AccountType) => {
    setSelectedAccountId(null);
    setSelectedGroupType(type);
    setShowCategoriesView(false);
    setShowMerchantsView(false);
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setSelectedGroupType(null);
    setShowCategoriesView(false);
    setShowMerchantsView(false);
  };

  const handleSelectCategories = () => {
    setSelectedAccountId(null);
    setSelectedGroupType(null);
    setShowCategoriesView(true);
    setShowMerchantsView(false);
  };

  const handleSelectMerchants = () => {
    setSelectedAccountId(null);
    setSelectedGroupType(null);
    setShowCategoriesView(false);
    setShowMerchantsView(true);
  };

  // Filter transactions based on selection
  const filteredTransactions = React.useMemo(() => {
    if (selectedAccountId) {
      // Filter by specific account
      return transactions.filter((t) => t.plaid_item_id === selectedAccountId);
    } else if (selectedGroupType) {
      // Filter by account group type
      const accountsInGroup = accounts.filter((a) => a.account_type === selectedGroupType);
      const accountIds = accountsInGroup.map((a) => a.id);
      return transactions.filter((t) => t.plaid_item_id && accountIds.includes(t.plaid_item_id));
    }
    // Show all transactions
    return transactions;
  }, [transactions, selectedAccountId, selectedGroupType, accounts]);


  const handleSaveTransaction = async (id: string, updates: Partial<TransactionEnriched>) => {
    try {
      console.log(`[CLIENT] Updating transaction ${id} with:`, updates);
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[CLIENT] Transaction ${id} updated successfully:`, result);
        // Refresh transactions
        await fetchTransactions();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`[CLIENT] Error updating transaction ${id}:`, response.status, errorData);
      }
    } catch (error) {
      console.error(`[CLIENT] Error updating transaction ${id}:`, error);
    }
  };

  const handleSaveAccountSettings = async (id: string, updates: { custom_name: string; is_hidden: boolean }) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Refresh accounts
        await fetchAccounts();
      }
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: filteredTransactions.length,
      uncategorized: filteredTransactions.filter((t) => !t.category_id).length,
      unassignedTag: filteredTransactions.filter((t) => !t.tag_id).length,
      pending: filteredTransactions.filter((t) => t.pending).length,
    };
  }, [filteredTransactions]);

  // Get current view title and selected account
  const viewTitle = React.useMemo(() => {
    if (showCategoriesView) {
      return "Categories";
    }
    if (showMerchantsView) {
      return "Merchants";
    }
    if (selectedAccountId) {
      const account = accounts.find((a) => a.id === selectedAccountId);
      return account?.custom_name || account?.account_name || account?.institution_name || "Account";
    } else if (selectedGroupType) {
      return `${selectedGroupType} Accounts`;
    }
    return "All Transactions";
  }, [showCategoriesView, showMerchantsView, selectedAccountId, selectedGroupType, accounts]);

  const selectedAccount = React.useMemo(() => {
    if (selectedAccountId) {
      return accounts.find((a) => a.id === selectedAccountId) || null;
    }
    return null;
  }, [selectedAccountId, accounts]);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Format currency using Intl.NumberFormat
  const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate balance discrepancy for selected account or all accounts
  const balanceDiscrepancy = React.useMemo(() => {
    if (selectedAccountId) {
      // Calculate for single selected account
      const account = accounts.find((a) => a.id === selectedAccountId);
      if (!account) return null;

      const accountTransactions = filteredTransactions.filter(
        (t) => t.plaid_item_id === selectedAccountId
      );
      const calculatedBalance = accountTransactions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );
      
      const plaidBalance = account.current_balance || 0;
      const discrepancy = plaidBalance - calculatedBalance;
      
      return {
        discrepancy,
        currencyCode: account.balance_currency_code || 'USD',
        accountName: account.custom_name || account.account_name || account.institution_name || 'Account',
      };
    } else if (selectedGroupType) {
      // Calculate for selected group
      const accountsInGroup = accounts.filter((a) => a.account_type === selectedGroupType);
      let totalDiscrepancy = 0;
      let currencyCode = 'USD';
      
      accountsInGroup.forEach((account) => {
        const accountTransactions = filteredTransactions.filter(
          (t) => t.plaid_item_id === account.id
        );
        const calculatedBalance = accountTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        
        const plaidBalance = account.current_balance || 0;
        totalDiscrepancy += (plaidBalance - calculatedBalance);
        if (account.balance_currency_code) {
          currencyCode = account.balance_currency_code;
        }
      });
      
      return {
        discrepancy: totalDiscrepancy,
        currencyCode,
        accountName: `${selectedGroupType} Accounts`,
      };
    } else {
      // Calculate for all accounts
      let totalDiscrepancy = 0;
      let currencyCode = 'USD';
      
      accounts.forEach((account) => {
        const accountTransactions = transactions.filter(
          (t) => t.plaid_item_id === account.id
        );
        const calculatedBalance = accountTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        
        const plaidBalance = account.current_balance || 0;
        totalDiscrepancy += (plaidBalance - calculatedBalance);
        if (account.balance_currency_code) {
          currencyCode = account.balance_currency_code;
        }
      });
      
      return {
        discrepancy: totalDiscrepancy,
        currencyCode,
        accountName: 'All Accounts',
      };
    }
  }, [selectedAccountId, selectedGroupType, accounts, filteredTransactions, transactions]);

  const hasDiscrepancy = balanceDiscrepancy && Math.abs(balanceDiscrepancy.discrepancy) > 0.01;

  return (
    <div className="flex flex-col gap-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Context Messages */}
      {showCategoriesView && (
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Manage merchant categories and Plaid PFC mappings
          </p>
        </div>
      )}
      {showMerchantsView && (
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Manage merchant categorization rules and view spending analytics
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center border rounded-lg">
              <div className="text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : showCategoriesView ? (
            <MerchantCategoryTable
              onClose={() => setShowCategoriesView(false)}
              onRefresh={async () => {
                await fetchCategories();
                await fetchTransactions();
              }}
            />
          ) : showMerchantsView ? (
            <MerchantsDashboardTable
              merchants={merchantsWithStats}
              categories={categories}
              tags={tags}
              onRefresh={async () => {
                await fetchMerchantsWithStats();
                await fetchTransactions();
              }}
            />
          ) : (
            <>
              {/* Stats Text */}
              {!showCategoriesView && !showMerchantsView && (
                <div className="flex items-center gap-4 text-sm mb-4">
                  {stats.uncategorized > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Needs Categorization:</span>
                      <span className="font-medium">{stats.uncategorized}</span>
                    </span>
                  )}
                  {hasDiscrepancy && balanceDiscrepancy && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Balance Discrepancy:</span>
                      <span className="font-medium">
                        {formatCurrency(balanceDiscrepancy.discrepancy, balanceDiscrepancy.currencyCode)}
                      </span>
                    </span>
                  )}
                </div>
              )}
              <DataTable
                columns={createColumns({
                  categories: regularCategories,
                  allCategories: categories,
                  tags,
                  merchantNames,
                  onTransactionUpdate: handleSaveTransaction,
                })}
                data={filteredTransactions}
                categories={regularCategories}
                tags={tags}
                merchantNames={merchantNames}
                onTransactionUpdate={handleSaveTransaction}
              />
            </>
          )}
        </div>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        account={selectedAccount}
        open={accountSettingsOpen}
        onClose={() => setAccountSettingsOpen(false)}
        onSave={handleSaveAccountSettings}
      />
    </div>
  );
}
