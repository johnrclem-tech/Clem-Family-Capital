import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  TransactionsGetRequest,
  Transaction as PlaidTransaction,
  InvestmentTransaction as PlaidInvestmentTransaction,
  Security as PlaidSecurity,
} from "plaid";

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Plaid Link configuration
export const plaidLinkConfig = {
  clientName: "Clem Finance Tagger",
  products: [Products.Transactions, Products.Auth, Products.Investments], // Auth required for accountsBalanceGet, Investments for investment accounts
  countryCodes: [CountryCode.Us],
  language: "en",
};

/**
 * Create a Link token for Plaid Link initialization
 */
export async function createLinkToken(userId: string, webhookUrl?: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: plaidLinkConfig.clientName,
      products: plaidLinkConfig.products as Products[],
      country_codes: plaidLinkConfig.countryCodes as CountryCode[],
      language: "en",
      webhook: webhookUrl, // Configure webhook URL for transaction updates
    });

    return response.data;
  } catch (error) {
    console.error("Error creating link token:", error);
    throw error;
  }
}

/**
 * Exchange public token for access token after Plaid Link success
 */
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    console.error("Error exchanging public token:", error);
    throw error;
  }
}

/**
 * Get institution details
 */
export async function getInstitution(institutionId: string) {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });

    return response.data.institution;
  } catch (error) {
    console.error("Error fetching institution:", error);
    throw error;
  }
}

/**
 * Fetch transactions for an access token
 * Uses transactions/sync for incremental updates
 */
export async function syncTransactions(
  accessToken: string,
  cursor?: string
): Promise<{
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: { transaction_id: string }[];
  nextCursor: string;
  hasMore: boolean;
}> {
  try {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: cursor,
      options: {
        include_personal_finance_category: true,
        include_original_description: true,
      },
    });

    return {
      added: response.data.added,
      modified: response.data.modified,
      removed: response.data.removed,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more,
    };
  } catch (error) {
    console.error("Error syncing transactions:", error);
    throw error;
  }
}

/**
 * Fetch transactions using the legacy transactions/get endpoint
 * Useful for initial historical data fetch
 */
export async function getTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  try {
    const request: TransactionsGetRequest = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        include_personal_finance_category: true,
        include_original_description: true,
      },
    };

    let allTransactions: PlaidTransaction[] = [];
    let offset = 0;
    const batchSize = 100;

    // Paginate through all transactions
    while (true) {
      const response = await plaidClient.transactionsGet({
        ...request,
        options: {
          ...request.options,
          offset,
          count: batchSize,
        },
      });

      allTransactions = allTransactions.concat(response.data.transactions);

      if (allTransactions.length >= response.data.total_transactions) {
        break;
      }

      offset += batchSize;
    }

    return allTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

/**
 * Get account balances for an access token
 */
export async function getAccountBalances(accessToken: string) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plaid.ts:179',message:'Calling accountsBalanceGet',data:{accessTokenLength:accessToken?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plaid.ts:185',message:'accountsBalanceGet succeeded',data:{accountCount:response.data.accounts?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    return response.data.accounts;
  } catch (error: any) {
    console.error("Error fetching account balances:", error);
    const errorDetails = {
      message: error?.message,
      statusCode: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
      errorCode: error?.response?.data?.error_code,
      errorType: error?.response?.data?.error_type,
      displayMessage: error?.response?.data?.display_message,
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plaid.ts:193',message:'accountsBalanceGet failed',data:errorDetails,timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    console.error("Plaid API Error Details:", JSON.stringify(errorDetails, null, 2));
    throw error;
  }
}

/**
 * Get item details including last successful update timestamp
 */
export async function getItem(accessToken: string) {
  try {
    const response = await plaidClient.itemGet({
      access_token: accessToken,
    });

    return {
      item: response.data.item,
      lastSuccessfulUpdate: response.data.status?.transactions?.last_successful_update || null,
    };
  } catch (error) {
    console.error("Error fetching item details:", error);
    throw error;
  }
}

/**
 * Remove a Plaid Item (disconnect institution)
 */
export async function removeItem(accessToken: string) {
  try {
    const response = await plaidClient.itemRemove({
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
}

/**
 * Get investment transactions for an access token
 * Returns investment transactions, securities, and accounts
 */
export async function getInvestmentTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<{
  investment_transactions: PlaidInvestmentTransaction[];
  securities: PlaidSecurity[];
  accounts: any[];
}> {
  try {
    const response = await plaidClient.investmentsTransactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    return {
      investment_transactions: response.data.investment_transactions || [],
      securities: response.data.securities || [],
      accounts: response.data.accounts || [],
    };
  } catch (error) {
    console.error("Error fetching investment transactions:", error);
    throw error;
  }
}

/**
 * Get holdings for investment accounts
 */
export async function getHoldings(accessToken: string) {
  try {
    const response = await plaidClient.investmentsHoldingsGet({
      access_token: accessToken,
    });

    return {
      accounts: response.data.accounts || [],
      holdings: response.data.holdings || [],
      securities: response.data.securities || [],
    };
  } catch (error) {
    console.error("Error fetching holdings:", error);
    throw error;
  }
}
