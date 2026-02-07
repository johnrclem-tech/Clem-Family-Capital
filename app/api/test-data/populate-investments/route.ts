import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

interface SecurityData {
  ticker_symbol: string;
  currency?: string;
}

interface Holding {
  institution_price: number;
  institution_price_as_of: string;
  cost_basis?: number;
  quantity: number;
  currency: string;
  security: SecurityData;
}

interface InvestmentTransaction {
  date: string;
  name: string;
  quantity: number;
  price: number;
  fees: number;
  type: string;
  currency: string;
  security: SecurityData;
}

interface InvestmentAccountOverride {
  type: string;
  subtype: string;
  starting_balance: number;
  force_available_balance: number;
  meta?: {
    name?: string;
  };
  holdings?: Holding[];
  investment_transactions?: InvestmentTransaction[];
}

interface TestDataPayload {
  override_accounts: InvestmentAccountOverride[];
}

export async function POST(request: NextRequest) {
  try {
    const body: TestDataPayload = await request.json();

    if (!body.override_accounts || body.override_accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No override_accounts provided" },
        { status: 400 }
      );
    }

    const account = body.override_accounts[0]; // Use first account
    if (account.type !== "investment") {
      return NextResponse.json(
        { success: false, error: "Account type must be 'investment'" },
        { status: 400 }
      );
    }

    // Generate test IDs
    const testItemId = `test-investment-item-${Date.now()}`;
    const testAccessToken = `test-access-token-${Date.now()}`;
    const testAccountId = `test-account-id-${Date.now()}`;
    const testInstitutionId = "ins_test_investment";
    const testInstitutionName = account.meta?.name || "Test Investment Institution";

    // Create PlaidItem for investment account
    let plaidItem;
    try {
      plaidItem = database.insertPlaidItemWithAccountData({
        item_id: testItemId,
        access_token: testAccessToken,
        institution_id: testInstitutionId,
        institution_name: testInstitutionName,
        plaid_account_id: testAccountId,
        account_type: "investment",
        account_subtype: account.subtype || null,
        account_name: account.meta?.name || "Brokerage Test Account",
        official_name: account.meta?.name || "Brokerage Test Account",
        current_balance: account.starting_balance || 0,
        available_balance: account.force_available_balance || null,
        balance_currency_code: "USD",
      });
      console.log(`Created PlaidItem: ${plaidItem.id}`);
    } catch (error: any) {
      // If item already exists, try to find it
      const existingItem = database.getPlaidItemByAccountId(testAccountId);
      if (existingItem) {
        plaidItem = existingItem;
        console.log(`Using existing PlaidItem: ${plaidItem.id}`);
      } else {
        throw error;
      }
    }

    // Collect all unique securities from holdings and transactions
    const securitiesMap = new Map<string, { ticker: string; price?: number; priceAsOf?: string }>();

    // Add securities from holdings
    if (account.holdings) {
      for (const holding of account.holdings) {
        const ticker = holding.security.ticker_symbol;
        if (ticker && !securitiesMap.has(ticker)) {
          securitiesMap.set(ticker, {
            ticker,
            price: holding.institution_price,
            priceAsOf: holding.institution_price_as_of,
          });
        }
      }
    }

    // Add securities from transactions
    if (account.investment_transactions) {
      for (const txn of account.investment_transactions) {
        const ticker = txn.security.ticker_symbol;
        if (ticker && !securitiesMap.has(ticker)) {
          securitiesMap.set(ticker, {
            ticker,
          });
        }
      }
    }

    // Create Security records
    const securitiesCreated: string[] = [];
    for (const [ticker, data] of securitiesMap.entries()) {
      try {
        // Use ticker as plaid_security_id for test data
        const security = database.upsertSecurity({
          plaid_security_id: ticker,
          name: ticker, // Use ticker as name if no other name available
          ticker_symbol: ticker,
          close_price: data.price || null,
          close_price_as_of: data.priceAsOf || null,
          iso_currency_code: "USD",
        });
        securitiesCreated.push(security.id);
        console.log(`Created/Updated Security: ${ticker}`);
      } catch (error) {
        console.error(`Error creating security ${ticker}:`, error);
      }
    }

    // Create Investment Transaction records
    let transactionsCreated = 0;
    if (account.investment_transactions) {
      for (let i = 0; i < account.investment_transactions.length; i++) {
        const txn = account.investment_transactions[i];
        try {
          // Generate unique transaction ID
          const plaidInvestmentTransactionId = `test-inv-txn-${testAccountId}-${i}-${txn.date}`;
          
          // Calculate amount: (quantity * price) + fees (negative for buys, positive for sells)
          let amount = (txn.quantity * txn.price) + txn.fees;
          if (txn.type === "buy" || txn.type === "cash" || txn.type === "fee") {
            amount = -Math.abs(amount); // Negative for purchases/fees
          } else if (txn.type === "sell") {
            amount = Math.abs(amount); // Positive for sales
          } else if (txn.type === "transfer") {
            // Transfer amount depends on direction, default to negative
            amount = -Math.abs(amount);
          }

          database.upsertInvestmentTransaction({
            plaid_investment_transaction_id: plaidInvestmentTransactionId,
            plaid_item_id: plaidItem.id,
            account_id: testAccountId,
            security_id: txn.security.ticker_symbol, // Use ticker as security_id
            date: txn.date,
            name: txn.name,
            amount: amount,
            quantity: txn.quantity,
            price: txn.price,
            fees: txn.fees,
            type: txn.type,
            subtype: null,
            iso_currency_code: txn.currency || "USD",
          });
          transactionsCreated++;
        } catch (error) {
          console.error(`Error creating investment transaction ${i}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test investment data populated successfully",
      data: {
        plaidItemId: plaidItem.id,
        accountId: testAccountId,
        securitiesCreated: securitiesCreated.length,
        transactionsCreated,
      },
    });

  } catch (error) {
    console.error("Error populating test investment data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
