import { NextRequest, NextResponse } from "next/server";
import { exchangePublicToken, getInstitution, getAccountBalances } from "@/lib/plaid";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_token, institution_id } = body;

    if (!public_token) {
      return NextResponse.json(
        { success: false, error: "Missing public_token" },
        { status: 400 }
      );
    }

    // Exchange the public token for an access token
    const { accessToken, itemId } = await exchangePublicToken(public_token);

    // Get institution details
    let institutionName = null;
    if (institution_id) {
      try {
        const institution = await getInstitution(institution_id);
        institutionName = institution.name;
      } catch (error) {
        console.error("Error fetching institution:", error);
      }
    }

    // Fetch all accounts for this institution
    const accounts = await getAccountBalances(accessToken);
    console.log(`Found ${accounts.length} accounts for institution ${institutionName || institution_id}`);

    // Check if this item_id already exists (updating existing connection)
    const existingItems = database.getPlaidItemsByItemId(itemId);
    const existingAccountIds = new Set(existingItems.map(item => item.plaid_account_id).filter(Boolean));

    const createdAccounts = [];

    // Create or update a PlaidItem record for each account
    for (const account of accounts) {
      const accountData = {
        item_id: itemId,
        access_token: accessToken,
        institution_id: institution_id,
        institution_name: institutionName || undefined,
        plaid_account_id: account.account_id,
        account_type: account.type || 'depository',
        account_subtype: account.subtype || null,
        account_name: account.name || null,
        official_name: account.official_name || null,
        mask: account.mask || null,
        current_balance: account.balances.current || 0,
        available_balance: account.balances.available ?? null,
        balance_limit: account.balances.limit ?? null,
        balance_currency_code: account.balances.iso_currency_code || 'USD',
        unofficial_currency_code: account.balances.unofficial_currency_code || null,
        balance_last_updated_datetime: account.balances.last_updated_datetime || null,
        verification_status: account.verification_status || null,
        verification_name: account.verification_name || null,
        verification_insights: account.verification_insights || null,
        persistent_account_id: account.persistent_account_id || null,
        holder_category: account.holder_category || null,
      };

      // Check if account already exists
      const existingAccount = existingItems.find(item => item.plaid_account_id === account.account_id);
      
      if (existingAccount) {
        // Update existing account
        database.updatePlaidItem(existingAccount.id, {
          ...accountData,
          sync_status: 'active',
          error_message: null,
        });
        createdAccounts.push(existingAccount.id);
      } else {
        // Create new account
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exchange-token/route.ts:82',message:'Creating new account',data:{plaidAccountId:account.account_id,accountName:account.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          const newAccount = database.insertPlaidItemWithAccountData(accountData);
          createdAccounts.push(newAccount.id);
          console.log(`Created account ${newAccount.id} for ${account.name} (${account.account_id})`);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exchange-token/route.ts:86',message:'Account created successfully',data:{accountId:newAccount.id,plaidAccountId:account.account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        } catch (createError) {
          console.error(`Error creating account ${account.account_id}:`, createError);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exchange-token/route.ts:89',message:'Error creating account',data:{error:createError instanceof Error?createError.message:String(createError),plaidAccountId:account.account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          throw createError;
        }
      }
    }

    // Mark any accounts that no longer exist as inactive
    const currentAccountIds = new Set(accounts.map(acc => acc.account_id));
    for (const existingItem of existingItems) {
      if (existingItem.plaid_account_id && !currentAccountIds.has(existingItem.plaid_account_id)) {
        database.updatePlaidItem(existingItem.id, {
          sync_status: 'inactive',
          error_message: 'Account no longer available',
        });
      }
    }

    return NextResponse.json({
      success: true,
      accounts_created: createdAccounts.length,
      accounts: createdAccounts,
    });

  } catch (error) {
    console.error("Error exchanging token:", error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exchange-token/route.ts:110',message:'Error exchanging token',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
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
