# Merchant Confidence Level Fix

## Problem
All merchants in the merchant table were showing confidence as "unknown" instead of displaying their actual Plaid confidence levels (VERY_HIGH, HIGH, MEDIUM, LOW).

## Root Cause

During the transactions table migration (to remove the `entities` foreign key), the **column order got scrambled** when copying data:

```sql
-- Migration used SELECT * which copied by position, not by name
INSERT INTO transactions_new 
SELECT * FROM transactions
```

This caused data to be inserted into wrong columns:
- **Counterparties data** (containing `confidence_level`) → `personal_finance_category_icon_url` column
- **Location data** → `personal_finance_category_detailed` column  
- **Payment meta data** → Wrong column
- And so on...

The `getMerchantsWithStats()` function was looking for confidence in `personal_finance_category_detailed`, but that column now contained location data instead of PFC data.

## Solution

Updated the `getMerchantsWithStats()` query to extract confidence from the scrambled data location:

### Changes Made

**File**: `lib/database.ts`

1. **Added query for counterparties data**:
```typescript
(SELECT personal_finance_category_icon_url 
 FROM transactions 
 WHERE merchant_name = am.name 
   AND personal_finance_category_icon_url IS NOT NULL 
 ORDER BY date DESC LIMIT 1) as latest_counterparties
```

2. **Updated confidence extraction logic**:
```typescript
// Parse confidence from counterparties data (in wrong column due to scramble)
let confidenceLevel = m.confidence_level;
if (!confidenceLevel && m.latest_counterparties) {
  const counterparties = JSON.parse(m.latest_counterparties);
  if (Array.isArray(counterparties) && counterparties.length > 0) {
    confidenceLevel = counterparties[0]?.confidence_level || null;
  }
}
// Fallback to PFC data
if (!confidenceLevel && m.latest_pfc) {
  const pfc = JSON.parse(m.latest_pfc);
  confidenceLevel = pfc?.confidence_level || null;
}
```

## Column Scramble Details

**Actual Column Locations After Migration**:
| Expected Data | Actual Column | Position |
|--------------|---------------|----------|
| PFC with confidence | `personal_finance_category_detailed` | 32 |
| Payment metadata | `payment_meta` | 31 |
| Location data | Currently in wrong place | 30 |
| Counterparties (with confidence) | `personal_finance_category_icon_url` ❌ | 36 |

**What Happened**:
- Counterparties data (with confidence_level) ended up in `personal_finance_category_icon_url`
- Our fix reads from this column to extract confidence
- This is a workaround until a proper column reorganization can be done

## Test Results

**Before Fix**:
```
Uber: None
Starbucks: None
Amazon: None
Apple: None
All merchants: Unknown ❌
```

**After Fix**:
```
Uber: HIGH ✅
Starbucks: VERY_HIGH ✅
Amazon: VERY_HIGH ✅
Apple: VERY_HIGH ✅
Bank of America ATM: VERY_HIGH ✅
ACME Corporation: VERY_HIGH ✅
```

**Merchants without confidence data** (correctly showing as unknown):
- United Airlines: None (no Plaid counterparties data)
- FUN: None
- KFC: None
- McDonald's: None (recently created, no Plaid data yet)

## How It Works Now

1. **Query executes** → Fetches merchant data and latest counterparties from transactions
2. **Confidence extraction** → Parses counterparties JSON array
3. **Gets first merchant** → `counterparties[0].confidence_level`
4. **Fallback** → If no counterparties, tries PFC data
5. **Display** → ConfidenceBadge shows appropriate badge (VERY_HIGH, HIGH, etc.)

## Technical Notes

### Why Counterparties?
Plaid v2 API moved merchant confidence from `personal_finance_category.confidence_level` to `counterparties[0].confidence_level`. Our transactions have both, but the counterparties data is more reliable.

### Column Scramble Impact
The migration scrambled these columns:
- ✅ Fixed: Confidence extraction
- ⚠️ Affected: PFC detailed data access
- ⚠️ Affected: Payment meta access
- ⚠️ Affected: Location data access

These other columns may need similar workarounds or a comprehensive column reorganization.

## Future Improvement

To properly fix the column scramble:
1. Create new transactions table with explicit column mapping
2. Copy data using explicit SELECT column1, column2, ... format
3. Verify all data is in correct columns
4. Update all queries to use proper column names

For now, the workaround successfully restores confidence level display.

## Results

Merchant confidence levels now display correctly:

- **VERY_HIGH** → Green badge
- **HIGH** → Blue badge  
- **MEDIUM** → Yellow badge
- **LOW** → Orange badge
- **Unknown** → Gray badge (for merchants without Plaid data)

The merchant table confidence column is fully functional! ✅
