"use client";

import * as React from "react";
import { DataTable } from "@/components/transactions/data-table";
import { createColumns } from "@/components/transactions/columns";
import { TransactionTableToolbar } from "@/components/transactions/transaction-table-toolbar";
import { TransactionEnriched, Category, Tag } from "@/lib/database";
import { RefreshCw } from "lucide-react";
import { useRegisterSync } from "@/components/layout/sync-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<TransactionEnriched[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [merchantNames, setMerchantNames] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);

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
      fetchCategories(),
      fetchTags(),
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
        await fetchTransactions(); // Refresh transactions
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`[CLIENT] Error updating transaction ${id}:`, response.status, errorData);
      }
    } catch (error) {
      console.error(`[CLIENT] Error updating transaction ${id}:`, error);
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
      }
    } catch (error) {
      console.error("Error syncing:", error);
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

  // Get unique account names from transactions with uncategorized counts
  const accountNamesWithCounts = React.useMemo(() => {
    const accountMap = new Map<string, { name: string; uncategorized: number }>();
    
    transactions.forEach((t) => {
      if (t.institution_name) {
        const accountName = t.institution_name;
        if (!accountMap.has(accountName)) {
          accountMap.set(accountName, { name: accountName, uncategorized: 0 });
        }
        const account = accountMap.get(accountName)!;
        if (!t.category_id && !t.tag_id) {
          account.uncategorized++;
        }
      }
    });
    
    return Array.from(accountMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  // Calculate total uncategorized count
  const totalUncategorized = React.useMemo(() => {
    return transactions.filter((t) => !t.category_id && !t.tag_id).length;
  }, [transactions]);

  // Tab state
  const [selectedTab, setSelectedTab] = React.useState<string>("all");

  // Filter transactions based on selected tab
  const filteredTransactions = React.useMemo(() => {
    if (selectedTab === "all") {
      return transactions;
    }
    // Filter by account name
    return transactions.filter((t) => t.institution_name === selectedTab);
  }, [transactions, selectedTab]);

  return (
    <div className="flex flex-col gap-6">
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
          ) : (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="relative h-fit w-full rounded-none bg-transparent p-0 border-b flex">
                <TabsTrigger 
                  value="all"
                  className="text-base rounded-none border-b-2 border-b-transparent px-4 py-2 font-normal data-[state=active]:border-b-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-blue-600 flex-1 justify-start text-left"
                >
                  All{totalUncategorized > 0 && ` (${totalUncategorized})`}
                </TabsTrigger>
                {accountNamesWithCounts.map((account) => (
                  <TabsTrigger 
                    key={account.name} 
                    value={account.name}
                    className="text-base rounded-none border-b-2 border-b-transparent px-4 py-2 font-normal data-[state=active]:border-b-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-blue-600 flex-1 justify-start text-left"
                  >
                    {account.name}{account.uncategorized > 0 && ` (${account.uncategorized})`}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-6">
                <DataTable
                  columns={createColumns({
                    categories: regularCategories,
                    allCategories: categories,
                    tags,
                    merchantNames,
                    onTransactionUpdate: handleSaveTransaction,
                  })}
                  data={filteredTransactions}
                  toolbar={TransactionTableToolbar}
                />
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
