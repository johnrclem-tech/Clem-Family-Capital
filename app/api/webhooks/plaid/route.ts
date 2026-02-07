import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import { syncTransactions, getAccountBalances, getItem } from "@/lib/plaid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    // Note: Plaid webhooks are configured per-item via Link token creation
    // Verification can be added later if needed using webhook verification key
    const webhook = await request.json();
    
    console.log("Received Plaid webhook:", webhook.webhook_type, webhook.webhook_code);

    // Handle SYNC_UPDATES_AVAILABLE webhook
    if (webhook.webhook_code === "SYNC_UPDATES_AVAILABLE") {
      const itemId = webhook.item_id;
      
      // Find all accounts for this institution
      const accounts = database.getPlaidItemsByItemId(itemId);

      if (!accounts || accounts.length === 0) {
        console.error(`No accounts found for item ${itemId}`);
        return NextResponse.json(
          { success: false, error: "Item not found" },
          { status: 404 }
        );
      }

      const primaryAccount = accounts[0];
      console.log(`Syncing institution ${itemId} (${accounts.length} account(s)) due to webhook notification`);

      // Trigger sync for this institution
      try {
        // Use the cursor from the first account (all accounts share the same cursor)
        let hasMore = true;
        let cursor = primaryAccount.cursor || undefined;
        let totalAdded = 0;
        let totalModified = 0;
        let totalRemoved = 0;

        while (hasMore) {
          const syncResult = await syncTransactions(
            primaryAccount.access_token,
            cursor
          );

          // Process added transactions
          for (const txn of syncResult.added) {
            try {
              // Find the correct account for this transaction
              const accountItem = accounts.find(acc => acc.plaid_account_id === txn.account_id) || primaryAccount;
              
              database.upsertTransaction({
                plaid_transaction_id: txn.transaction_id,
                plaid_item_id: accountItem.id,
                account_id: txn.account_id,
                date: txn.date,
                amount: -txn.amount,
                merchant_name: txn.merchant_name || undefined,
                plaid_merchant_name: txn.merchant_name || undefined, // Preserve original Plaid merchant name
                pending: txn.pending,
                payment_channel: txn.payment_channel || undefined,
                transaction_code: txn.transaction_code || undefined,
                iso_currency_code: txn.iso_currency_code || undefined,
                unofficial_currency_code: txn.unofficial_currency_code || undefined,
                authorized_date: txn.authorized_date || undefined,
                authorized_datetime: txn.authorized_datetime || undefined,
                datetime: txn.datetime || undefined,
                check_number: txn.check_number || undefined,
                merchant_entity_id: txn.merchant_entity_id || undefined,
                logo_url: txn.logo_url || undefined,
                website: txn.website || undefined,
                account_owner: txn.account_owner || undefined,
                pending_transaction_id: txn.pending_transaction_id || undefined,
                location: txn.location || undefined,
                payment_meta: txn.payment_meta || undefined,
                personal_finance_category_detailed: txn.personal_finance_category || undefined,
                // Use original_description if available, otherwise leave null
                original_description: txn.original_description || undefined,
                // New Plaid fields (v2)
                counterparties: txn.counterparties || undefined,
                personal_finance_category_icon_url: txn.personal_finance_category_icon_url || undefined,
                personal_finance_category_version: txn.personal_finance_category?.version || undefined,
              });
              totalAdded++;
            } catch (insertError) {
              console.error("Error inserting transaction:", insertError);
            }
          }

          // Process modified transactions
          for (const txn of syncResult.modified) {
            try {
              database.updateTransaction(txn.transaction_id, {
                date: txn.date,
                amount: -txn.amount,
                merchant_name: txn.merchant_name || undefined,
                pending: txn.pending,
                payment_channel: txn.payment_channel || undefined,
                transaction_code: txn.transaction_code || undefined,
                iso_currency_code: txn.iso_currency_code || undefined,
                unofficial_currency_code: txn.unofficial_currency_code || undefined,
                authorized_date: txn.authorized_date || undefined,
                authorized_datetime: txn.authorized_datetime || undefined,
                datetime: txn.datetime || undefined,
                check_number: txn.check_number || undefined,
                merchant_entity_id: txn.merchant_entity_id || undefined,
                logo_url: txn.logo_url || undefined,
                website: txn.website || undefined,
                account_owner: txn.account_owner || undefined,
                pending_transaction_id: txn.pending_transaction_id || undefined,
                location: txn.location || undefined,
                payment_meta: txn.payment_meta || undefined,
                personal_finance_category_detailed: txn.personal_finance_category || undefined,
                original_description: txn.original_description || undefined,
                // New Plaid fields (v2)
                counterparties: txn.counterparties || undefined,
                personal_finance_category_icon_url: txn.personal_finance_category_icon_url || undefined,
                personal_finance_category_version: txn.personal_finance_category?.version || undefined,
              });
              totalModified++;
            } catch (updateError) {
              console.error("Error updating transaction:", updateError);
            }
          }

          // Process removed transactions
          for (const removed of syncResult.removed) {
            try {
              database.deleteTransaction(removed.transaction_id);
              totalRemoved++;
            } catch (deleteError) {
              console.error("Error deleting transaction:", deleteError);
            }
          }

          cursor = syncResult.nextCursor;
          hasMore = syncResult.hasMore;
        }

        // Fetch and update account balances for each account
        try {
          const plaidAccounts = await getAccountBalances(primaryAccount.access_token);

          // Get official last successful update from /item/get
          const itemDetails = await getItem(primaryAccount.access_token);
          const officialSyncTime = itemDetails.lastSuccessfulUpdate || new Date().toISOString();

          // Handle migration: if there's only one existing account without plaid_account_id and one Plaid account,
          // update the existing account instead of creating a duplicate
          const accountsWithoutPlaidId = accounts.filter(acc => !acc.plaid_account_id);
          const shouldMigrateExistingAccount = accountsWithoutPlaidId.length === 1 && plaidAccounts.length === 1 && accounts.length === 1;
          
          // Update each account separately
          for (const plaidAccount of plaidAccounts) {
            // Find the corresponding database account
            let dbAccount = accounts.find(acc => acc.plaid_account_id === plaidAccount.account_id);
            
            // If no match found and we're migrating, use the account without plaid_account_id
            if (!dbAccount && shouldMigrateExistingAccount) {
              dbAccount = accountsWithoutPlaidId[0];
              console.log(`  Migrating existing account to use plaid_account_id: ${plaidAccount.account_id}`);
            }
            
            if (dbAccount) {
              // Update existing account
              database.updatePlaidItem(dbAccount.id, {
                cursor: cursor,
                last_sync_at: officialSyncTime,
                sync_status: "active",
                error_message: null,
                current_balance: plaidAccount.balances.current || 0,
                available_balance: plaidAccount.balances.available ?? null,
                balance_limit: plaidAccount.balances.limit ?? null,
                balance_currency_code: plaidAccount.balances.iso_currency_code || 'USD',
                unofficial_currency_code: plaidAccount.balances.unofficial_currency_code || null,
                balance_last_updated_datetime: plaidAccount.balances.last_updated_datetime || null,
                plaid_account_id: plaidAccount.account_id, // Ensure plaid_account_id is set
                mask: plaidAccount.mask || null,
                official_name: plaidAccount.official_name || null,
                account_subtype: plaidAccount.subtype || null,
                verification_status: plaidAccount.verification_status || null,
                verification_name: plaidAccount.verification_name || null,
                verification_insights: plaidAccount.verification_insights || null,
                persistent_account_id: plaidAccount.persistent_account_id || null,
                holder_category: plaidAccount.holder_category || null,
              });
            } else {
              // New account found - create it
              console.log(`  New account found via webhook: ${plaidAccount.name} (${plaidAccount.account_id})`);
              database.insertPlaidItemWithAccountData({
                item_id: itemId,
                access_token: primaryAccount.access_token,
                institution_id: primaryAccount.institution_id || undefined,
                institution_name: primaryAccount.institution_name || undefined,
                plaid_account_id: plaidAccount.account_id,
                account_type: plaidAccount.type || 'depository',
                account_subtype: plaidAccount.subtype || null,
                account_name: plaidAccount.name || null,
                official_name: plaidAccount.official_name || null,
                mask: plaidAccount.mask || null,
                current_balance: plaidAccount.balances.current || 0,
                available_balance: plaidAccount.balances.available ?? null,
                balance_limit: plaidAccount.balances.limit ?? null,
                balance_currency_code: plaidAccount.balances.iso_currency_code || 'USD',
                unofficial_currency_code: plaidAccount.balances.unofficial_currency_code || null,
                balance_last_updated_datetime: plaidAccount.balances.last_updated_datetime || null,
                verification_status: plaidAccount.verification_status || null,
                verification_name: plaidAccount.verification_name || null,
                verification_insights: plaidAccount.verification_insights || null,
                persistent_account_id: plaidAccount.persistent_account_id || null,
                holder_category: plaidAccount.holder_category || null,
              });
            }
          }
          
          // Mark old accounts without plaid_account_id as inactive if they weren't migrated
          if (!shouldMigrateExistingAccount) {
            for (const oldAccount of accountsWithoutPlaidId) {
              database.updatePlaidItem(oldAccount.id, {
                sync_status: 'inactive',
                error_message: 'Account migrated to new structure',
              });
            }
          }

          // Mark any accounts that no longer exist as inactive
          const currentAccountIds = new Set(plaidAccounts.map(acc => acc.account_id));
          for (const dbAccount of accounts) {
            if (dbAccount.plaid_account_id && !currentAccountIds.has(dbAccount.plaid_account_id)) {
              database.updatePlaidItem(dbAccount.id, {
                sync_status: 'inactive',
                error_message: 'Account no longer available',
              });
            }
          }
        } catch (balanceError) {
          console.error(`Error fetching balances for institution ${itemId}:`, balanceError);
          
          // Still update cursor for all accounts even if balance fetch fails
          for (const account of accounts) {
            database.updatePlaidItem(account.id, {
              cursor: cursor,
              last_sync_at: new Date().toISOString(),
              sync_status: "active",
              error_message: null,
            });
          }
        }

        console.log(`Webhook sync complete for item ${itemId}:`, {
          added: totalAdded,
          modified: totalModified,
          removed: totalRemoved,
        });

        return NextResponse.json({
          success: true,
          message: "Sync completed",
          item_id: itemId,
          added: totalAdded,
          modified: totalModified,
          removed: totalRemoved,
        });

      } catch (syncError) {
        console.error(`Error syncing item ${itemId}:`, syncError);
        
        // Update item with error status
        database.updatePlaidItem(item.id, {
          sync_status: "error",
          error_message: syncError instanceof Error ? syncError.message : "Unknown error",
        });

        return NextResponse.json(
          {
            success: false,
            error: syncError instanceof Error ? syncError.message : "Sync failed",
          },
          { status: 500 }
        );
      }
    }

    // Handle other webhook types if needed
    console.log(`Webhook ${webhook.webhook_code} received but not handled`);
    
    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
