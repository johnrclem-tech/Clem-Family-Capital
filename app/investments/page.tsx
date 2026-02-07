"use client";

import * as React from "react";
import { DataTable } from "@/components/transactions/data-table";
import { createInvestmentColumns } from "@/components/investments/investment-columns";
import { createHoldingsColumns, Holding } from "@/components/investments/holdings-columns";
import { InvestmentTransactionEnriched } from "@/lib/database";
import { RefreshCw, Database } from "lucide-react";
import { useRegisterSync } from "@/components/layout/sync-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InvestmentsPage() {
  const [transactions, setTransactions] = React.useState<InvestmentTransactionEnriched[]>([]);
  const [holdings, setHoldings] = React.useState<Holding[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [holdingsLoading, setHoldingsLoading] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [populating, setPopulating] = React.useState(false);

  // Fetch data on mount
  React.useEffect(() => {
    fetchTransactions().catch((error) => {
      console.error("Error in fetchTransactions:", error);
      setLoading(false);
    });
    fetchHoldings().catch((error) => {
      console.error("Error in fetchHoldings:", error);
    });
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/investment-transactions");
      const data = await response.json();
      
      if (response.ok) {
        console.log("Investment transactions fetched:", data.count || 0);
        setTransactions(data.transactions || []);
      } else {
        console.error("API error:", data.error || "Unknown error");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching investment transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      setHoldingsLoading(true);
      const response = await fetch("/api/holdings");
      const data = await response.json();
      
      if (response.ok) {
        console.log("Holdings fetched:", data.count || 0);
        setHoldings(data.holdings || []);
      } else {
        console.error("API error:", data.error || "Unknown error");
        setHoldings([]);
      }
    } catch (error) {
      console.error("Error fetching holdings:", error);
      setHoldings([]);
    } finally {
      setHoldingsLoading(false);
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
        // Refresh data after sync
        await Promise.all([fetchTransactions(), fetchHoldings()]);
      } else {
        const error = await response.json();
        console.error("Sync error:", error);
      }
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Register sync handler with context so header can access it
  useRegisterSync(handleSync, syncing);

  const handlePopulateTestData = async () => {
    try {
      setPopulating(true);
      const response = await fetch("/api/test-data/populate-investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          override_accounts: [
            {
              type: "investment",
              subtype: "brokerage",
              starting_balance: 120,
              force_available_balance: 120,
              meta: {
                name: "Brokerage Test Account"
              },
              holdings: [
                { institution_price: 140.4, institution_price_as_of: "2025-11-15", quantity: 12, currency: "USD", security: { ticker_symbol: "AAPL", currency: "USD" } },
                { institution_price: 10.43, institution_price_as_of: "2025-02-14", cost_basis: 10.43, quantity: 10, currency: "USD", security: { ticker_symbol: "PAGP", currency: "USD" } },
                { institution_price: 2228.23, institution_price_as_of: "2025-03-21", cost_basis: 2228.23, quantity: 8, currency: "USD", security: { ticker_symbol: "GOOGL", currency: "USD" } },
                { institution_price: 91.78, institution_price_as_of: "2025-04-06", cost_basis: 91.78, quantity: 17, currency: "USD", security: { ticker_symbol: "CHD", currency: "USD" } },
                { institution_price: 108.6, institution_price_as_of: "2025-05-27", cost_basis: 108.6, quantity: 100, currency: "USD", security: { ticker_symbol: "AMZN", currency: "USD" } },
                { institution_price: 369.82, institution_price_as_of: "2025-06-23", cost_basis: 29.36, quantity: 5, currency: "USD", security: { ticker_symbol: "TDY", currency: "USD" } },
                { institution_price: 19999.54, institution_price_as_of: "2025-07-06", cost_basis: 120.03, quantity: 0.00293644, currency: "USD", security: { ticker_symbol: "CUR:BTC", currency: "USD" } },
                { institution_price: 13.35, institution_price_as_of: "2026-02-03", cost_basis: 13.35, quantity: 20, currency: "USD", security: { ticker_symbol: "AMC", currency: "USD" } },
                { institution_price: 495.72, institution_price_as_of: "2025-07-16", cost_basis: 495.72, quantity: 12, currency: "USD", security: { ticker_symbol: "BIO", currency: "USD" } },
                { institution_price: 11.43, institution_price_as_of: "2025-08-02", cost_basis: 11.43, quantity: 20, currency: "USD", security: { ticker_symbol: "F", currency: "USD" } },
                { institution_price: 670.81, institution_price_as_of: "2025-07-04", cost_basis: 670.81, quantity: 23, currency: "USD", security: { ticker_symbol: "TSLA", currency: "USD" } },
                { institution_price: 5.51, institution_price_as_of: "2025-02-07", cost_basis: 5.51, quantity: 9, currency: "USD", security: { ticker_symbol: "GPRO", currency: "USD" } },
                { institution_price: 114.07, institution_price_as_of: "2025-03-11", cost_basis: 114.07, quantity: 3, currency: "USD", security: { ticker_symbol: "PAYX", currency: "USD" } },
                { institution_price: 70.04, institution_price_as_of: "2025-04-21", cost_basis: 70.04, quantity: 19, currency: "USD", security: { ticker_symbol: "XEL", currency: "USD" } },
                { institution_price: 142.99, institution_price_as_of: "2025-05-30", cost_basis: 142.99, quantity: 30, currency: "USD", security: { ticker_symbol: "MRNA", currency: "USD" } },
                { institution_price: 78.85, institution_price_as_of: "2025-06-11", cost_basis: 78.85, quantity: 11, currency: "USD", security: { ticker_symbol: "D", currency: "USD" } },
                { institution_price: 20.83, institution_price_as_of: "2025-07-21", cost_basis: 20.83, quantity: 13, currency: "USD", security: { ticker_symbol: "T", currency: "USD" } },
                { institution_price: 5.9, institution_price_as_of: "2025-03-05", cost_basis: 5.9, quantity: 20, currency: "USD", security: { ticker_symbol: "F241108C00005000", currency: "USD" } }
              ],
              investment_transactions: [
                { date: "2025-11-05", name: "buy stock", quantity: 10, price: 10, fees: 20, type: "buy", currency: "USD", security: { ticker_symbol: "PLAID", currency: "USD" } },
                { date: "2025-11-05", name: "buy options", quantity: 10, price: 10, fees: 20, type: "buy", currency: "USD", security: { ticker_symbol: "F241108C00005000", currency: "USD" } },
                { date: "2025-11-19", name: "buy stock", quantity: 15, price: 10, fees: 20, type: "buy", currency: "USD", security: { ticker_symbol: "PLAID", currency: "USD" } },
                { date: "2025-07-15", name: "buy stock", quantity: 10, price: 2898.32, fees: 20, type: "buy", currency: "USD", security: { ticker_symbol: "GOOGL", currency: "USD" } },
                { date: "2025-07-20", name: "buy stock", quantity: 160, price: 121.45, fees: 20, type: "buy", currency: "USD", security: { ticker_symbol: "NET", currency: "USD" } },
                { date: "2025-07-17", name: "buy stock", quantity: 29, price: 120.03, fees: 4.25, type: "buy", currency: "USD", security: { ticker_symbol: "AMZN", currency: "USD" } },
                { date: "2025-07-21", name: "buy stock", quantity: 23, price: 125.03, fees: 4.25, type: "buy", currency: "USD", security: { ticker_symbol: "AA", currency: "USD" } },
                { date: "2025-07-25", name: "buy stock", quantity: 36, price: 120.03, fees: 4.25, type: "buy", currency: "USD", security: { ticker_symbol: "NYA", currency: "USD" } },
                { date: "2025-07-07", name: "buy stock in cash", quantity: 12, price: 80, fees: 1, type: "cash", currency: "USD", security: { ticker_symbol: "FN", currency: "USD" } },
                { date: "2025-07-16", name: "buy stock in cash", quantity: 25, price: 110, fees: 1, type: "cash", currency: "USD", security: { ticker_symbol: "CE", currency: "USD" } },
                { date: "2025-07-26", name: "buy stock in cash", quantity: 30, price: 170, fees: 4, type: "cash", currency: "USD", security: { ticker_symbol: "MRNA", currency: "USD" } },
                { date: "2025-07-19", name: "buy stock in cash", quantity: 10, price: 200, fees: 0, type: "cash", currency: "USD", security: { ticker_symbol: "GD", currency: "USD" } },
                { date: "2025-07-26", name: "buy stock in cash-fee", quantity: 30, price: 170, fees: 4, type: "fee", currency: "USD", security: { ticker_symbol: "MRNA", currency: "USD" } },
                { date: "2025-07-07", name: "buy stock in cash", quantity: 12, price: 80, fees: 1, type: "fee", currency: "USD", security: { ticker_symbol: "FN", currency: "USD" } },
                { date: "2025-07-16", name: "buy stock in cash", quantity: 25, price: 110, fees: 1, type: "fee", currency: "USD", security: { ticker_symbol: "CE", currency: "USD" } },
                { date: "2025-08-01", name: "transfer amount", quantity: 12, price: 125.98, fees: 6.55, type: "transfer", currency: "USD", security: { ticker_symbol: "AMZN", currency: "USD" } },
                { date: "2025-08-02", name: "transfer amount", quantity: 7, price: 150.23, fees: 6.25, type: "transfer", currency: "USD", security: { ticker_symbol: "AA", currency: "USD" } },
                { date: "2025-08-03", name: "transfer amount", quantity: 10, price: 170, fees: 4, type: "transfer", currency: "USD", security: { ticker_symbol: "MRNA", currency: "USD" } }
              ]
            }
          ]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Test data populated:", result);
        // Refresh data after populating
        await Promise.all([fetchTransactions(), fetchHoldings()]);
        alert(`Test data populated successfully!\nSecurities: ${result.data.securitiesCreated}\nTransactions: ${result.data.transactionsCreated}`);
      } else {
        const error = await response.json();
        console.error("Error populating test data:", error);
        alert(`Error: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error populating test data:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setPopulating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Populate Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handlePopulateTestData}
          disabled={populating}
          variant="outline"
        >
          {populating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Populating...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Populate Test Data
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="relative h-fit rounded-none bg-transparent p-0 border-b">
          <TabsTrigger 
            value="transactions"
            className="data-[state=active]:!border-b-primary rounded-none border-b-2 border-b-transparent font-normal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="holdings"
            className="data-[state=active]:!border-b-primary rounded-none border-b-2 border-b-transparent font-normal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Holdings
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <div className="flex-1 min-w-0 overflow-hidden">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center border rounded-lg">
                <div className="text-center">
                  <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading investment transactions...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={createInvestmentColumns({})}
                data={transactions}
              />
            )}
          </div>
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="mt-6">
          <div className="flex-1 min-w-0 overflow-hidden">
            {holdingsLoading ? (
              <div className="flex min-h-[400px] items-center justify-center border rounded-lg">
                <div className="text-center">
                  <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading holdings...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={createHoldingsColumns({})}
                data={holdings}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
