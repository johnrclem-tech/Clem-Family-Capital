"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlaidItem, TransactionEnriched } from "@/lib/database";
import { AlertCircle, DollarSign, CreditCard, Wallet, TrendingUp, Building2, Home } from "lucide-react";

interface AccountCardsProps {
  accounts: PlaidItem[];
  transactions?: TransactionEnriched[];
}

// Get icon based on account type
const getAccountIcon = (accountType: string) => {
  switch (accountType) {
    case "Credit":
      return CreditCard;
    case "Cash":
      return Wallet;
    case "Investment":
      return TrendingUp;
    case "Loan":
      return Building2;
    case "Property":
      return Home;
    default:
      return DollarSign;
  }
};

// Extract last 4 digits from account name or use a placeholder
const getLastFourDigits = (account: PlaidItem): string => {
  // Try to extract from account_name (e.g., "Chase Checking ••••1234")
  const accountName = account.account_name || "";
  const match = accountName.match(/(\d{4})/);
  if (match) {
    return match[1];
  }
  // Fallback: use last 4 chars of account ID as placeholder
  return account.id.slice(-4);
};

// Individual Account Card Component
function AccountCard({
  account,
  stats,
  formatCurrency,
}: {
  account: PlaidItem;
  stats: { discrepancy: number; uncategorized: number };
  formatCurrency: (amount: number, currencyCode: string) => string;
}) {
  const bankName = account.institution_name || account.account_name || "Bank";
  const balance = account.current_balance || 0;
  const currencyCode = account.balance_currency_code || "USD";
  const lastFour = getLastFourDigits(account);
  const accountType = account.account_type || "Other";
  const IconComponent = getAccountIcon(accountType);
  const hasDiscrepancy = Math.abs(stats.discrepancy) > 0.01;
  
  // Calculate the calculated balance (Plaid balance - discrepancy)
  const calculatedBalance = balance - stats.discrepancy;

  return (
    <Card className="shadow-none hover:shadow-sm transition-shadow w-full">
      <CardContent className="px-6 py-3 min-w-0">
        {/* Logo and Balance Row */}
        <div className="flex items-center gap-4 h-10">
          {/* ShadCN Default Icon Style */}
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>

          {/* Bank Name, Last 4, and Balance */}
          <div className="flex-1 min-w-0 h-10 flex flex-col justify-between">
            {/* Bank Name and Last 4 - same font as "Total Balance" label, top aligned */}
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate min-w-0 leading-tight">
                {bankName}
              </p>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 leading-tight">
                {lastFour}
              </span>
            </div>
            
            {/* Balance with Error Icon - bottom aligned */}
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold whitespace-nowrap leading-none">
                {formatCurrency(balance, currencyCode)}
              </p>
              {hasDiscrepancy && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Calculated Balance: {formatCurrency(calculatedBalance, currencyCode)}</p>
                    <p>Discrepancy: {formatCurrency(stats.discrepancy, currencyCode)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountCards({ accounts, transactions = [] }: AccountCardsProps) {
  const formatCurrency = (amount: number, currencyCode: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Filter out hidden accounts
  const visibleAccounts = React.useMemo(() => {
    return accounts.filter((acc) => !acc.is_hidden);
  }, [accounts]);

  // Calculate balance discrepancy and uncategorized transactions for each account
  const accountStats = React.useMemo(() => {
    const stats: Record<string, { discrepancy: number; uncategorized: number }> = {};
    
    visibleAccounts.forEach((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.plaid_item_id === account.id
      );
      
      // Calculate balance discrepancy
      const calculatedBalance = accountTransactions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );
      const plaidBalance = account.current_balance || 0;
      const discrepancy = plaidBalance - calculatedBalance;
      
      // Count uncategorized transactions
      const uncategorized = accountTransactions.filter(
        (t) => !t.category_id && !t.tag_id
      ).length;
      
      stats[account.id] = { discrepancy, uncategorized };
    });
    
    return stats;
  }, [visibleAccounts, transactions]);

  if (visibleAccounts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {visibleAccounts.map((account) => (
        <div key={account.id} className="min-w-0 w-full">
          <AccountCard
            account={account}
            stats={accountStats[account.id] || { discrepancy: 0, uncategorized: 0 }}
            formatCurrency={formatCurrency}
          />
        </div>
      ))}
    </div>
  );
}
