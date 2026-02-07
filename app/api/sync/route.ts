import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import { PlaidItem } from "@/lib/database";
import { syncTransactions, getAccountBalances, getItem, getInvestmentTransactions } from "@/lib/plaid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:8',message:'Sync route called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    // Manual sync always overwrites: delete all transactions and reset cursors
    console.log("Manual sync: Deleting all transactions and resetting cursors...");
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:11',message:'About to delete transactions',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const deletedCount = database.deleteAllTransactions();
    database.resetAllPlaidItemCursors();
    console.log(`Deleted ${deletedCount} transactions and reset all cursors`);

    // Get all active Plaid items that need syncing
    const plaidItems = database.getPlaidItemsByStatus("active");
    console.log(`Found ${plaidItems?.length || 0} active Plaid accounts to sync`);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:18',message:'Got plaid items',data:{count:plaidItems?.length||0,accountIds:plaidItems?.map(i=>i.id)||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!plaidItems || plaidItems.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:20',message:'No accounts to sync',data:{totalAccounts:database.getPlaidItems().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({
        success: true,
        message: "No Plaid accounts found. Please connect accounts using the 'Add Account' button first.",
        synced: 0,
      });
    }

    // Group accounts by item_id (institution) to sync transactions once per institution
    const itemsByInstitution = new Map<string, PlaidItem[]>();
    for (const item of plaidItems) {
      if (!itemsByInstitution.has(item.item_id)) {
        itemsByInstitution.set(item.item_id, []);
      }
      itemsByInstitution.get(item.item_id)!.push(item);
    }

    console.log(`Found ${itemsByInstitution.size} unique institutions to sync`);

    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    // Sync each institution (item_id)
    for (const [itemId, accounts] of itemsByInstitution.entries()) {
      // Use the first account's access_token (all accounts share the same token)
      const primaryAccount = accounts[0];
      const institutionName = primaryAccount.institution_name || 'Unknown';
      
      try {
        console.log(`Syncing institution ${itemId} (${institutionName}) with ${accounts.length} account(s)...`);
        let hasMore = true;
        // Cursor is now NULL (reset), so Plaid will return all transactions from the beginning
        let cursor = undefined;
        let iterationCount = 0;

        while (hasMore) {
          iterationCount++;
          console.log(`  Fetching transactions batch ${iterationCount} (cursor: ${cursor || 'null'}...)`);
          const syncResult = await syncTransactions(
            primaryAccount.access_token,
            cursor
          );

          console.log(`  Received: ${syncResult.added.length} added, ${syncResult.modified.length} modified, ${syncResult.removed.length} removed`);

          // Process added transactions
          for (const txn of syncResult.added) {
            try {
              // Auto-categorization priority:
              // 1. Merchant defaults (by entity_id first, then by name) - highest priority
              // 2. Plaid PFC mapping (if no merchant found or merchant has no defaults)
              // 3. No category (if neither exists)
              let categoryId = undefined;
              let tagId = undefined;
              let merchant: ReturnType<typeof database.getMerchantByEntityId> | ReturnType<typeof database.getMerchantByName> | null = null;
              
              // Check merchant by entity_id first (most reliable)
              if (txn.merchant_entity_id) {
                merchant = database.getMerchantByEntityId(txn.merchant_entity_id);
              }
              
              // If not found by entity_id, check by name
              if (!merchant && txn.merchant_name) {
                merchant = database.getMerchantByName(txn.merchant_name);
              }
              
              // If merchant exists, use its defaults
              if (merchant) {
                categoryId = merchant.default_category_id || undefined;
                tagId = merchant.default_tag_id || undefined;
              }
              
              // Check if category exists by plaid detailed category ID
              if (!categoryId && txn.personal_finance_category?.detailed) {
                let existingCategory = database.getCategoryByPlaidDetailedCategoryId(
                  txn.personal_finance_category.detailed
                );
                
                if (existingCategory) {
                  categoryId = existingCategory.id;
                } else {
                  // Auto-create category from Plaid PFC
                  const pfc = txn.personal_finance_category;
                  const primaryCategory = pfc.primary || "";
                  const detailedCategory = pfc.detailed || "";
                  
                  // Format category name from detailed category (e.g., "FOOD_AND_DRINK_RESTAURANTS" -> "Restaurants")
                  let categoryName = detailedCategory;
                  if (detailedCategory.startsWith(primaryCategory + "_")) {
                    categoryName = detailedCategory.substring(primaryCategory.length + 1);
                  }
                  categoryName = categoryName.replace(/_/g, " ");
                  // Capitalize first letter of each word
                  categoryName = categoryName.split(" ").map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(" ");
                  
                  // Get description from existing category if it was created from Plaid before
                  // Otherwise, it will be null and can be updated later
                  let plaidDescription: string | null = null;
                  const existingCategory = database.getCategoryByPlaidDetailedCategoryId(detailedCategory);
                  if (existingCategory?.plaid_description) {
                    plaidDescription = existingCategory.plaid_description;
                  }
                  
                  // Create new category
                  const newCategory = database.createCategory({
                    name: categoryName,
                    description: plaidDescription,
                    plaid_detailed_category_id: detailedCategory,
                    plaid_primary_category: primaryCategory,
                    plaid_description: plaidDescription,
                  });
                  
                  categoryId = newCategory.id;
                }
              }
              
              // Legacy fallback: if category still not found, try to find by plaid_detailed_category_id
              // This handles cases where categories were created before the auto-creation feature
              if (!categoryId && txn.personal_finance_category?.detailed) {
                const legacyCategory = database.getCategoryByPlaidDetailedCategoryId(
                  txn.personal_finance_category.detailed
                );
                if (legacyCategory) {
                  categoryId = legacyCategory.id;
                }
              }
              
              // Auto-create merchant if it doesn't exist (this will also set default category from PFC if available)
              if (txn.merchant_name && !merchant) {
                const newMerchant = database.ensureMerchantExists(
                  txn.merchant_name,
                  txn.logo_url,
                  txn.personal_finance_category,
                  txn.merchant_entity_id
                );
                
                // If merchant was created, use its default category for this transaction
                if (newMerchant && newMerchant.default_category_id) {
                  categoryId = newMerchant.default_category_id;
                  tagId = newMerchant.default_tag_id || undefined;
                }
              }
              
              // Find the correct PlaidItem for this transaction's account
              const accountItem = accounts.find(acc => acc.plaid_account_id === txn.account_id) || primaryAccount;
              
              database.upsertTransaction({
                plaid_transaction_id: txn.transaction_id,
                plaid_item_id: accountItem.id,
                account_id: txn.account_id,
                date: txn.date,
                amount: -txn.amount, // Plaid returns negative for expenses
                merchant_name: txn.merchant_name || undefined,
                plaid_merchant_name: txn.merchant_name || undefined, // Preserve original Plaid merchant name
                pending: txn.pending,
                category_id: categoryId, // Auto-apply from confirmed merchant
                tag_id: tagId, // Auto-apply from confirmed merchant
                // All additional Plaid fields
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
            } catch (insertError) {
              console.error(`Error inserting transaction ${txn.transaction_id}:`, insertError);
              if (insertError instanceof Error) {
                console.error(`  Error message: ${insertError.message}`);
                console.error(`  Error stack: ${insertError.stack}`);
              }
            }
          }

          // Process modified transactions
          for (const txn of syncResult.modified) {
            try {
              // Auto-create merchant if it doesn't exist
              if (txn.merchant_name) {
                database.ensureMerchantExists(
                  txn.merchant_name,
                  txn.logo_url,
                  txn.personal_finance_category,
                  txn.merchant_entity_id
                );
              }
              
              // Auto-categorization for modified transactions (same logic as added)
              let categoryId = undefined;
              
              if (txn.merchant_name) {
                const merchant = database.getMerchantByName(txn.merchant_name);
                if (merchant && merchant.is_confirmed) {
                  categoryId = merchant.default_category_id || undefined;
                }
              }
              
              // If no confirmed merchant category, try to find category by Plaid detailed category ID
              if (!categoryId && txn.personal_finance_category?.detailed) {
                const category = database.getCategoryByPlaidDetailedCategoryId(
                  txn.personal_finance_category.detailed
                );
                if (category) {
                  categoryId = category.id;
                }
              }
              
              database.updateTransaction(txn.transaction_id, {
                account_id: txn.account_id,
                date: txn.date,
                amount: -txn.amount,
                merchant_name: txn.merchant_name || undefined,
                plaid_merchant_name: txn.merchant_name || undefined, // Preserve original Plaid merchant name
                pending: txn.pending,
                category_id: categoryId, // Auto-apply from PFC mapping or confirmed merchant
                // All additional Plaid fields
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
            } catch (updateError) {
              console.error("Error updating transaction:", updateError);
            }
          }

          // Process removed transactions
          for (const removed of syncResult.removed) {
            try {
              database.deleteTransaction(removed.transaction_id);
            } catch (deleteError) {
              console.error("Error deleting transaction:", deleteError);
            }
          }

          totalAdded += syncResult.added.length;
          totalModified += syncResult.modified.length;
          totalRemoved += syncResult.removed.length;

          cursor = syncResult.nextCursor;
          hasMore = syncResult.hasMore;
          console.log(`  Batch ${iterationCount} complete. Total so far: ${totalAdded} added, ${totalModified} modified, ${totalRemoved} removed. Has more: ${hasMore}`);
        }
        
        console.log(`Completed syncing institution ${itemId}. Total: ${totalAdded} added, ${totalModified} modified, ${totalRemoved} removed`);

        // Sync investment transactions for investment accounts
        const investmentAccounts = accounts.filter(acc => acc.account_type === 'investment');
        if (investmentAccounts.length > 0) {
          try {
            console.log(`  Syncing investment transactions for ${investmentAccounts.length} investment account(s)`);
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 24); // 24 months of history
            const startDateStr = startDate.toISOString().split('T')[0];

            const investmentData = await getInvestmentTransactions(
              primaryAccount.access_token,
              startDateStr,
              endDate
            );

            // Store securities first
            for (const security of investmentData.securities) {
              try {
                database.upsertSecurity({
                  plaid_security_id: security.security_id,
                  name: security.name || 'Unknown Security',
                  ticker_symbol: security.ticker_symbol || null,
                  isin: security.isin || null,
                  cusip: security.cusip || null,
                  sedol: security.sedol || null,
                  close_price: security.close_price || null,
                  close_price_as_of: security.close_price_as_of || null,
                  type: security.type || null,
                  iso_currency_code: security.iso_currency_code || null,
                  unofficial_currency_code: security.unofficial_currency_code || null,
                });
              } catch (secError) {
                console.error(`Error storing security ${security.security_id}:`, secError);
              }
            }

            // Store investment transactions
            let investmentAdded = 0;
            for (const invTxn of investmentData.investment_transactions) {
              try {
                // Find the correct account for this transaction
                const txnAccount = investmentAccounts.find(
                  acc => acc.plaid_account_id === invTxn.account_id
                ) || primaryAccount;

                database.upsertInvestmentTransaction({
                  plaid_investment_transaction_id: invTxn.investment_transaction_id,
                  plaid_item_id: txnAccount.id,
                  account_id: invTxn.account_id,
                  security_id: invTxn.security_id || null,
                  date: invTxn.date,
                  name: invTxn.name,
                  amount: invTxn.amount,
                  quantity: invTxn.quantity || null,
                  price: invTxn.price || null,
                  fees: invTxn.fees || null,
                  type: invTxn.type,
                  subtype: invTxn.subtype || null,
                  iso_currency_code: invTxn.iso_currency_code || null,
                  unofficial_currency_code: invTxn.unofficial_currency_code || null,
                });
                investmentAdded++;
              } catch (invTxnError) {
                console.error(`Error storing investment transaction ${invTxn.investment_transaction_id}:`, invTxnError);
              }
            }
            console.log(`  Stored ${investmentAdded} investment transactions and ${investmentData.securities.length} securities`);
          } catch (investmentError) {
            console.error(`Error syncing investment transactions for institution ${itemId}:`, investmentError);
          }
        }

        // Fetch and update account balances for each account
        try {
          const plaidAccounts = await getAccountBalances(primaryAccount.access_token);
          console.log(`  Found ${plaidAccounts.length} account(s) from Plaid for institution ${itemId}`);
          console.log(`  Plaid account IDs: ${plaidAccounts.map(a => `${a.name} (${a.account_id})`).join(', ')}`);
          console.log(`  Existing accounts in database: ${accounts.length}`);
          console.log(`  Existing account IDs: ${accounts.map(a => `${a.account_name || 'unnamed'} (${a.plaid_account_id || 'NO_ID'})`).join(', ')}`);
          
          // Get official last successful update from /item/get
          const itemDetails = await getItem(primaryAccount.access_token);
          const officialSyncTime = itemDetails.lastSuccessfulUpdate || new Date().toISOString();

          // Refresh accounts list from database to include any newly created accounts
          // This ensures we have the most up-to-date list for matching
          const allAccountsForInstitution = database.getPlaidItemsByItemId(itemId);
          console.log(`  All accounts for institution after refresh: ${allAccountsForInstitution.length}`);

          // Handle migration: if there's only one existing account without plaid_account_id and one Plaid account,
          // update the existing account instead of creating a duplicate
          const accountsWithoutPlaidId = allAccountsForInstitution.filter(acc => !acc.plaid_account_id);
          const shouldMigrateExistingAccount = accountsWithoutPlaidId.length === 1 && plaidAccounts.length === 1 && allAccountsForInstitution.length === 1;
          
          if (shouldMigrateExistingAccount) {
            console.log(`  Migrating single account without plaid_account_id`);
          }
          
          // Update each account separately
          for (const plaidAccount of plaidAccounts) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:269',message:'Processing Plaid account',data:{plaidAccountId:plaidAccount.account_id,plaidAccountName:plaidAccount.name,allAccountsCount:allAccountsForInstitution.length,existingAccountIds:allAccountsForInstitution.map(a=>a.plaid_account_id).filter(Boolean)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // Find the corresponding database account by plaid_account_id
            let dbAccount = allAccountsForInstitution.find(acc => acc.plaid_account_id === plaidAccount.account_id);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:272',message:'Match result',data:{plaidAccountId:plaidAccount.account_id,foundMatch:!!dbAccount,matchedAccountId:dbAccount?.id,shouldMigrate:shouldMigrateExistingAccount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            // If no match found and we're migrating, use the account without plaid_account_id
            if (!dbAccount && shouldMigrateExistingAccount) {
              dbAccount = accountsWithoutPlaidId[0];
              console.log(`  Migrating existing account ${dbAccount.id} to use plaid_account_id: ${plaidAccount.account_id}`);
            }
            
            if (dbAccount) {
              // Update existing account
              console.log(`  Updating existing account: ${plaidAccount.name} (${plaidAccount.mask || 'no mask'}) - plaid_account_id: ${plaidAccount.account_id}`);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:281',message:'Updating existing account',data:{accountId:dbAccount.id,plaidAccountId:plaidAccount.account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
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
              
              // Verify transactions for this account
              const verifyCount = database.getTransactionCountByPlaidItemId(dbAccount.id);
              console.log(`    Account ${plaidAccount.name} (${plaidAccount.mask}): ${verifyCount} transactions, balance: ${plaidAccount.balances.current}`);
            } else {
              // New account found - create it
              console.log(`  *** Creating NEW account: ${plaidAccount.name} (${plaidAccount.mask || 'no mask'}) - plaid_account_id: ${plaidAccount.account_id}, type: ${plaidAccount.type} ***`);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:308',message:'Creating new account',data:{plaidAccountId:plaidAccount.account_id,plaidAccountName:plaidAccount.name,itemId:itemId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
              try {
                const newAccount = database.insertPlaidItemWithAccountData({
                  item_id: itemId,
                  access_token: primaryAccount.access_token,
                  institution_id: primaryAccount.institution_id || undefined,
                  institution_name: institutionName,
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
                console.log(`    Created account with ID: ${newAccount.id}`);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:333',message:'Account created successfully',data:{newAccountId:newAccount.id,plaidAccountId:plaidAccount.account_id,syncStatus:newAccount.sync_status,plaidAccountIdInResult:newAccount.plaid_account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
              } catch (insertError) {
                console.error(`    ERROR creating account:`, insertError);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:336',message:'Account creation failed',data:{error:insertError instanceof Error?insertError.message:String(insertError),plaidAccountId:plaidAccount.account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
              }
            }
          }
          
          // Refresh accounts list again after creating new accounts
          const finalAccountsList = database.getPlaidItemsByItemId(itemId);
          console.log(`  Final account count for institution: ${finalAccountsList.length}`);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:338',message:'Final accounts list after creation',data:{finalCount:finalAccountsList.length,accountIds:finalAccountsList.map(a=>a.id),plaidAccountIds:finalAccountsList.map(a=>a.plaid_account_id).filter(Boolean),syncStatuses:finalAccountsList.map(a=>a.sync_status)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          // Mark old accounts without plaid_account_id as inactive if they weren't migrated
          if (!shouldMigrateExistingAccount && accountsWithoutPlaidId.length > 0) {
            console.log(`  Marking ${accountsWithoutPlaidId.length} old account(s) without plaid_account_id as inactive`);
            for (const oldAccount of accountsWithoutPlaidId) {
              database.updatePlaidItem(oldAccount.id, {
                sync_status: 'inactive',
                error_message: 'Account migrated to new structure',
              });
            }
          }

          // Mark any accounts that no longer exist as inactive
          const currentAccountIds = new Set(plaidAccounts.map(acc => acc.account_id));
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:353',message:'Checking for accounts to mark inactive',data:{currentPlaidAccountIds:Array.from(currentAccountIds),finalAccountsCount:finalAccountsList.length,finalAccountPlaidIds:finalAccountsList.map(a=>a.plaid_account_id).filter(Boolean)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          for (const dbAccount of finalAccountsList) {
            if (dbAccount.plaid_account_id && !currentAccountIds.has(dbAccount.plaid_account_id)) {
              console.log(`  Marking account ${dbAccount.id} (${dbAccount.plaid_account_id}) as inactive - no longer exists in Plaid`);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:356',message:'Marking account as inactive',data:{accountId:dbAccount.id,plaidAccountId:dbAccount.plaid_account_id,reason:'no longer exists in Plaid'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
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

      } catch (itemError) {
        console.error(`Error syncing institution ${itemId}:`, itemError);
        
        // Mark all accounts for this institution as error
        for (const account of accounts) {
          try {
            database.updatePlaidItem(account.id, {
              sync_status: "error",
              error_message: itemError instanceof Error ? itemError.message : "Unknown error",
            });
          } catch (updateError) {
            console.error("Error updating account status:", updateError);
          }
        }
      }
    }

    console.log(`Sync completed. Items synced: ${plaidItems.length}, Total added: ${totalAdded}, Total modified: ${totalModified}, Total removed: ${totalRemoved}`);
    
    // Final verification - check total transactions in database
    const totalInDb = database.getTotalTransactionCount();
    console.log(`Final verification: Total transactions in database: ${totalInDb}`);
    
    return NextResponse.json({
      success: true,
      message: "Sync completed",
      synced: plaidItems.length,
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
      totalInDatabase: totalInDb,
    });

  } catch (error) {
    console.error("Sync error:", error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sync/route.ts:391',message:'Sync route error',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const plaidItems = database.getPlaidItems();

    return NextResponse.json({
      success: true,
      items: plaidItems || [],
    });

  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
