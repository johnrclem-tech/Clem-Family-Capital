"use client";

import * as React from "react";
import { Building2, Store, FolderTree, LayoutDashboard, TrendingUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeSelector } from "@/components/theme-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlaidItem } from "@/lib/database";

interface AppSidebarProps {
  showDashboardView: boolean;
  showCategoriesView: boolean;
  showMerchantsView: boolean;
  onSelectDashboard: () => void;
  onSelectCategories: () => void;
  onSelectMerchants: () => void;
  onSelectAll: () => void;
  accounts?: PlaidItem[];
}

export function AppSidebar({
  showDashboardView,
  showCategoriesView,
  showMerchantsView,
  onSelectDashboard,
  onSelectCategories,
  onSelectMerchants,
  onSelectAll,
  accounts = [],
}: AppSidebarProps) {
  // Fetch accounts if not provided
  const [localAccounts, setLocalAccounts] = React.useState<PlaidItem[]>(accounts);

  React.useEffect(() => {
    if (accounts.length > 0) {
      setLocalAccounts(accounts);
    } else {
      // Fetch accounts if not provided
      fetch("/api/accounts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.accounts) {
            setLocalAccounts(data.accounts);
          }
        })
        .catch((error) => {
          console.error("Error fetching accounts:", error);
        });
    }
  }, [accounts]);

  // Calculate Net Worth: (Cash + Investment) - (Credit + Loan)
  const netWorth = React.useMemo(() => {
    let total = 0;
    const visibleAccounts = localAccounts.filter((acc) => !acc.is_hidden);

    visibleAccounts.forEach((account) => {
      const balance = account.current_balance || 0;
      const accountType = account.account_type;

      if (accountType === "Cash" || accountType === "Investment") {
        total += balance;
      } else if (accountType === "Credit" || accountType === "Loan") {
        total -= balance;
      }
      // Property accounts are not included in liquid net worth
    });

    return total;
  }, [localAccounts]);

  // Format currency
  const formatCurrency = (amount: number, currencyCode: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get currency code from first account, default to USD
  const currencyCode = localAccounts.length > 0 
    ? (localAccounts[0]?.balance_currency_code || "USD")
    : "USD";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Clem Finance</span>
                  <span className="truncate text-xs">Tagger</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Net Worth Display */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="flex items-center justify-between w-full"
                disabled
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  <span className="text-sm text-muted-foreground">Net Worth</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    netWorth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(netWorth, currencyCode)}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onSelectDashboard}
                isActive={showDashboardView}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onSelectAll}
                isActive={!showDashboardView && !showCategoriesView && !showMerchantsView}
                tooltip="Checking"
              >
                <Building2 />
                <span>Checking</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onSelectCategories}
                isActive={showCategoriesView}
                tooltip="Categories"
              >
                <FolderTree />
                <span>Categories</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onSelectMerchants}
                isActive={showMerchantsView}
                tooltip="Merchants"
              >
                <Store />
                <span>Merchants</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2">
          <ThemeSelector />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
