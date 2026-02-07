import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

interface Holding {
  security_id: string;
  security_name: string | null;
  security_ticker: string | null;
  quantity: number;
  cost_basis: number;
  current_price: number | null;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  institution_name: string | null;
  account_id: string | null;
  currency_code: string;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all investment transactions
    console.log("[API] Fetching holdings...");
    const startTime = Date.now();
    const transactions = database.getInvestmentTransactionsEnriched(10000);
    
    // Calculate holdings by aggregating transactions
    const holdingsMap = new Map<string, Holding>();
    
    for (const txn of transactions) {
      if (!txn.security_id) continue;
      
      const key = `${txn.plaid_item_id}-${txn.security_id}`;
      const existing = holdingsMap.get(key);
      
      let quantity = existing?.quantity || 0;
      let costBasis = existing?.cost_basis || 0;
      
      // Update quantity and cost basis based on transaction type
      if (txn.type === "buy" || txn.type === "cash") {
        // Add to holdings
        const txnQuantity = txn.quantity || 0;
        const txnCost = (txn.price || 0) * txnQuantity + (txn.fees || 0);
        quantity += txnQuantity;
        costBasis += txnCost;
      } else if (txn.type === "sell") {
        // Remove from holdings (FIFO - reduce cost basis proportionally)
        const txnQuantity = txn.quantity || 0;
        if (quantity > 0) {
          const costPerShare = costBasis / quantity;
          const soldCostBasis = costPerShare * txnQuantity;
          quantity -= txnQuantity;
          costBasis -= soldCostBasis;
        }
      }
      // Fee and transfer types don't affect quantity, but may affect cost basis
      if (txn.type === "fee" && txn.quantity) {
        // Some fees might reduce quantity (like account maintenance fees)
        // For now, we'll treat fees as cost basis adjustments
        costBasis += Math.abs(txn.fees || 0);
      }
      
      // Only include holdings with positive quantity
      if (quantity > 0) {
        holdingsMap.set(key, {
          security_id: txn.security_id,
          security_name: txn.security_name,
          security_ticker: txn.security_ticker,
          quantity,
          cost_basis: costBasis,
          current_price: null, // Will be set from securities table
          current_value: 0, // Will be recalculated with current price
          gain_loss: 0, // Will be recalculated with current price
          gain_loss_percent: 0, // Will be recalculated with current price
          institution_name: txn.institution_name,
          account_id: txn.account_id,
          currency_code: txn.iso_currency_code || "USD",
        });
      } else if (existing) {
        // Remove if quantity becomes zero or negative
        holdingsMap.delete(key);
      }
    }
    
    // Get current prices from securities table
    const securities = database.getSecurities();
    const securitiesMap = new Map(securities.map(s => [s.plaid_security_id, s]));
    
    // Update holdings with current prices and recalculate values
    const holdings: Holding[] = Array.from(holdingsMap.values()).map(holding => {
      const security = securitiesMap.get(holding.security_id);
      const currentPrice = security?.close_price || holding.current_price || 0;
      const currentValue = holding.quantity * currentPrice;
      const gainLoss = currentValue - holding.cost_basis;
      const gainLossPercent = holding.cost_basis > 0 ? (gainLoss / holding.cost_basis) * 100 : 0;
      
      return {
        ...holding,
        current_price: currentPrice,
        current_value: currentValue,
        gain_loss: gainLoss,
        gain_loss_percent: gainLossPercent,
      };
    });
    
    const duration = Date.now() - startTime;
    console.log(`[API] Calculated ${holdings.length} holdings in ${duration}ms`);

    const response = {
      success: true,
      holdings: holdings || [],
      count: holdings?.length || 0,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[API] Error fetching holdings:", error);
    if (error instanceof Error) {
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        holdings: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
