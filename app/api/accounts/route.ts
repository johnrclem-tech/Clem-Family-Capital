import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const accounts = database.getPlaidItems();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts/route.ts:8',message:'getPlaidItems called',data:{totalAccounts:accounts.length,accountIds:accounts.map(a=>a.id),syncStatuses:accounts.map(a=>a.sync_status),plaidAccountIds:accounts.map(a=>a.plaid_account_id).filter(Boolean)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Group by institution for debugging
    const accountsByInstitution = accounts.reduce((acc, account) => {
      const key = account.institution_name || account.item_id || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(account);
      return acc;
    }, {} as Record<string, typeof accounts>);
    
    console.log(`[API] Returning ${accounts.length} total accounts`);
    Object.entries(accountsByInstitution).forEach(([institution, instAccounts]) => {
      console.log(`[API] Institution "${institution}": ${instAccounts.length} account(s)`);
      instAccounts.forEach(acc => {
        console.log(`[API]   - ${acc.account_name || 'unnamed'} (${acc.plaid_account_id || 'NO_ID'}) - status: ${acc.sync_status}`);
      });
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts/route.ts:26',message:'Returning accounts to client',data:{totalAccounts:accounts.length,accountsByInstitution:Object.entries(accountsByInstitution).map(([inst,accs])=>({institution:inst,count:accs.length,accountIds:accs.map(a=>a.id),syncStatuses:accs.map(a=>a.sync_status)}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      success: true,
      accounts: accounts || [],
      count: accounts?.length || 0,
    });

  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        accounts: [],
      },
      { status: 500 }
    );
  }
}
