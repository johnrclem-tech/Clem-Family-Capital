"use client";

import * as React from "react";
import { usePlaidLink } from "react-plaid-link";
import { AccountDataTable } from "@/components/accounts/account-data-table";
import { createAccountColumns } from "@/components/accounts/account-columns";
import { PlaidItem } from "@/lib/database";
import { RefreshCw } from "lucide-react";
import { useRegisterSync } from "@/components/layout/sync-context";

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState<PlaidItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [connecting, setConnecting] = React.useState(false);
  const [linkToken, setLinkToken] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  // Fetch accounts on mount
  React.useEffect(() => {
    fetchAccounts().catch((error) => {
      console.error("Error in fetchAccounts:", error);
      setLoading(false);
    });
  }, []);

  // Sync handler that refreshes accounts after sync
  const handleSync = React.useCallback(async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/sync", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sync completed:", result);
        // Refresh accounts after sync
        await fetchAccounts();
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

  // Register sync handler so header can trigger it
  useRegisterSync(handleSync, syncing);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts");
      const data = await response.json();
      
      if (response.ok) {
        console.log("Accounts fetched:", data.count || 0);
        setAccounts(data.accounts || []);
      } else {
        console.error("API error:", data.error || "Unknown error");
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (id: string, updates: { custom_name: string; is_hidden: boolean }) => {
    try {
      console.log(`[CLIENT] Updating account ${id} with:`, updates);
      const response = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[CLIENT] Account ${id} updated successfully:`, result);
        await fetchAccounts(); // Refresh accounts
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`[CLIENT] Error updating account ${id}:`, response.status, errorData);
      }
    } catch (error) {
      console.error(`[CLIENT] Error updating account ${id}:`, error);
    }
  };

  // Plaid Link functionality
  const createLinkToken = async () => {
    try {
      setConnecting(true);
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
        return data.link_token;
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error creating link token:", errorData);
        throw new Error(errorData.error || "Failed to create link token");
      }
    } catch (error) {
      console.error("Error creating link token:", error);
      throw error;
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
        await fetchAccounts(); // Refresh accounts list
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
    setConnecting(false);
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
        setConnecting(false);
      }
    }
  }, [linkToken, ready, pendingOpen, open]);

  const handleAddAccount = async () => {
    setPendingOpen(true);
    setConnecting(true);
    
    if (!linkToken) {
      // Create token first, then useEffect will open when ready
      try {
        await createLinkToken();
      } catch (error) {
        setPendingOpen(false);
        setConnecting(false);
      }
    } else if (ready) {
      // Token exists and is ready, open immediately
      open();
      setPendingOpen(false);
      setConnecting(false);
    }
  };

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
                <p className="text-muted-foreground">Loading accounts...</p>
              </div>
            </div>
          ) : (
            <AccountDataTable
              columns={createAccountColumns({
                onAccountUpdate: handleSaveAccount,
              })}
              data={accounts}
              onAccountUpdate={handleSaveAccount}
              onAddAccount={handleAddAccount}
              connecting={connecting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
