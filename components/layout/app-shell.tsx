"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Building2,
  FileText,
  Settings,
  ChevronRight,
  User,
  LogOut,
  SearchIcon,
  ActivityIcon,
  BellIcon,
  RefreshCw,
  DollarSign,
  Store,
  FolderTree,
  ChevronRight as ChevronRightIcon,
  CreditCard,
  Wallet,
  Building2 as Building2Icon,
} from "lucide-react";
import { PlaidItem } from "@/lib/database";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SearchDialog from "@/components/shadcn-studio/blocks/dialog-search";
import ActivityDialog from "@/components/shadcn-studio/blocks/dialog-activity";
import NotificationDropdown from "@/components/shadcn-studio/blocks/dropdown-notification";
import ProfileDropdown from "@/components/shadcn-studio/blocks/dropdown-profile";
import { useSync } from "@/components/layout/sync-context";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Transactions",
    icon: Receipt,
    href: "/transactions",
  },
  {
    title: "Investments",
    icon: TrendingUp,
    href: "/investments",
  },
  {
    title: "Real Estate",
    icon: Building2,
    href: "/real-estate",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { syncing: contextSyncing, handleSync: contextHandleSync } = useSync();
  
  // Map pathnames to page titles
  const getPageTitle = (path: string): string => {
    // First, try to find exact match in navigation items
    const navItem = navigationItems.find(item => item.href === path);
    if (navItem) {
      return navItem.title;
    }
    
    // Handle routes not in navigationItems
    const routeMap: Record<string, string> = {
      "/investments": "Investments",
      "/accounts": "Accounts",
      "/account": "Account",
      "/transaction": "Transaction",
      "/merchant": "Merchant",
      "/category": "Category",
      "/tag": "Tag",
    };
    
    // Check if path starts with any mapped route
    for (const [route, title] of Object.entries(routeMap)) {
      if (path.startsWith(route)) {
        return title;
      }
    }
    
    // Extract page name from pathname (e.g., "/accounts" -> "Accounts")
    if (path === "/") {
      return "Dashboard";
    }
    
    // Capitalize first letter and replace hyphens with spaces
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      const pageName = segments[segments.length - 1];
      return pageName
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    
    // Fallback to Dashboard
    return "Dashboard";
  };
  
  // Get the active page title
  const activePageTitle = getPageTitle(pathname);

  // Local sync state for AppShell's own sync handler
  const [localSyncing, setLocalSyncing] = React.useState(false);

  // Fetch accounts for Net Worth calculation
  const [accounts, setAccounts] = React.useState<PlaidItem[]>([]);

  React.useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.accounts) {
          setAccounts(data.accounts);
        }
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
      });
  }, []);

  // AppShell's own sync handler - always available
  const handleSync = React.useCallback(async () => {
    try {
      setLocalSyncing(true);
      const response = await fetch("/api/sync", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sync completed:", result);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Sync error:", error);
      }
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setLocalSyncing(false);
    }
  }, []);

  // Use context sync handler if available, otherwise use local handler
  const syncing = contextSyncing || localSyncing;
  const syncHandler = contextHandleSync || handleSync;

  // Calculate Net Worth: (Cash + Investment) - (Credit + Loan)
  const netWorth = React.useMemo(() => {
    let total = 0;
    const visibleAccounts = accounts.filter((acc) => !acc.is_hidden);

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
  }, [accounts]);

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
  const currencyCode = accounts.length > 0 
    ? (accounts[0]?.balance_currency_code || "USD")
    : "USD";

  // Group accounts by account_type
  const accountsByType = React.useMemo(() => {
    const grouped: Record<string, PlaidItem[]> = {};
    const visibleAccounts = accounts.filter((acc) => !acc.is_hidden);
    
    visibleAccounts.forEach((account) => {
      const type = account.account_type || "Other";
      // Filter out Depository and Investment account types (case-insensitive)
      const typeLower = type.toLowerCase();
      if (typeLower === "depository" || typeLower === "investment") {
        return;
      }
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(account);
    });
    
    return grouped;
  }, [accounts]);

  // Account type labels
  const accountTypeLabels: Record<string, string> = {
    Cash: "Checking",
    Credit: "Credit Cards",
    Investment: "Investments",
    Loan: "Loans",
    Property: "Properties",
  };

  // State for expanded account types
  const [expandedTypes, setExpandedTypes] = React.useState<Record<string, boolean>>({});

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider defaultOpen={true} className="w-full">
        {/* Sidebar */}
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <DollarSign className="size-4" />
                    </div>
                    <div className="flex flex-1 items-center text-left">
                      <span className="truncate text-lg font-bold">
                        {formatCurrency(netWorth, currencyCode)}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            {/* Dashboard - No Group */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/"}
                    tooltip="Dashboard"
                  >
                    <Link href="/">
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Accounts Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Accounts</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Checking */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/transactions"}
                      tooltip="Checking"
                    >
                      <Link href="/transactions">
                        <Building2 className="size-4" />
                        <span>Checking</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Investments */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/investments"}
                      tooltip="Investments"
                    >
                      <Link href="/investments">
                        <TrendingUp className="size-4" />
                        <span>Investments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {Object.entries(accountsByType).map(([type, typeAccounts]) => {
                    const label = accountTypeLabels[type] || type;
                    const isExpanded = expandedTypes[type] || false;
                    
                    return (
                      <Collapsible
                        key={type}
                        open={isExpanded}
                        onOpenChange={(open) =>
                          setExpandedTypes((prev) => ({ ...prev, [type]: open }))
                        }
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={label}>
                              <span>{label}</span>
                              <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {typeAccounts.map((account) => (
                                <SidebarMenuSubItem key={account.id}>
                                  <SidebarMenuSubButton asChild>
                                    <Link href={`/accounts/${account.id}`}>
                                      {account.custom_name || account.account_name || account.institution_name || "Unnamed Account"}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Settings Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Accounts"
                      isActive={pathname === "/accounts"}
                    >
                      <Link href="/accounts">
                        <CreditCard className="size-4" />
                        <span>Accounts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Merchants"
                      isActive={pathname === "/merchants"}
                    >
                      <Link href="/merchants">
                        <Store className="size-4" />
                        <span>Merchants</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Categories"
                      isActive={pathname === "/categories"}
                    >
                      <Link href="/categories">
                        <FolderTree className="size-4" />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/avatar.png" alt="User" />
                        <AvatarFallback className="rounded-lg">JC</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Clem</span>
                        <span className="truncate text-xs text-muted-foreground">
                          john@example.com
                        </span>
                      </div>
                      <ChevronRight className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="end"
                    side="top"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">John Clem</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          john@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 w-full">
          {/* Header */}
          <header className="bg-card sticky top-0 z-50 border-b">
            <div className="flex items-center justify-between gap-6 px-4 py-2 sm:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="[&_svg]:!size-5" />
                <Separator orientation="vertical" className="hidden !h-4 sm:block" />
                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList className="text-2xl font-bold tracking-tight text-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-2xl font-bold tracking-tight text-foreground">
                        {activePageTitle}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-1.5">
                <SearchDialog
                  trigger={
                    <>
                      <Button variant="ghost" className="hidden !bg-transparent px-1 py-0 font-normal sm:block">
                        <div className="text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex">
                          <SearchIcon />
                          <span>Type to search...</span>
                        </div>
                      </Button>
                      <Button variant="ghost" size="icon" className="sm:hidden">
                        <SearchIcon />
                        <span className="sr-only">Search</span>
                      </Button>
                    </>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={syncHandler}
                  disabled={syncing}
                  title="Sync Plaid Transactions"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  <span className="sr-only">Sync Plaid Transactions</span>
                </Button>
                <ActivityDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <ActivityIcon />
                    </Button>
                  }
                />
                <NotificationDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="relative">
                      <BellIcon />
                      <span className="bg-destructive absolute top-2 right-2.5 size-2 rounded-full" />
                    </Button>
                  }
                />
                <ProfileDropdown
                  trigger={
                    <Button variant="ghost" className="h-full p-0 font-normal sm:pr-1">
                      <Avatar className="size-9.5 rounded-md">
                        <AvatarImage src="/avatar.png" alt="User" />
                        <AvatarFallback>JC</AvatarFallback>
                      </Avatar>
                      <div className="hidden flex-col items-start gap-0.5 sm:flex md:max-lg:hidden">
                        <span className="text-sm font-medium">John Clem</span>
                        <span className="text-muted-foreground text-xs">Admin</span>
                      </div>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
