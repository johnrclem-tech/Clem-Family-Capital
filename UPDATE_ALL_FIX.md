# "Update All" Button Fix

## Problem
When selecting a tag in the merchant table and clicking **"Update All"** (to update both merchant and existing transactions), the tag was not saving or displaying. However, clicking **"Only Future"** worked correctly.

## Root Cause

The `transactions` table still had a **foreign key constraint** referencing the deleted `entities` table:

```sql
entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL
```

When the user clicked "Update All", the system tried to update existing transactions with:
```typescript
database.bulkUpdateMerchantTransactions(merchant.name, {
  tag_id: value,
  entity_id: value  // This line triggered the FK constraint error!
});
```

This caused a SQL error: `SqliteError: no such table: main.entities`

The **"Only Future"** button worked because it skipped the transaction update step (only updated the merchant record).

## Solution

Migrated the `transactions` table to:
1. Remove the foreign key constraint to `entities` table
2. Add a proper foreign key constraint to `tags` table
3. Preserve all 111 existing transaction records
4. Maintain backward compatibility with `entity_id` column (no FK)

### Migration Script
```sql
CREATE TABLE transactions_new (
  ...
  entity_id TEXT,  -- No FK constraint (legacy field)
  tag_id TEXT REFERENCES tags(id) ON DELETE SET NULL,  -- Proper FK
  ...
)
```

## How It Works Now

### "Only Future" Button Flow:
1. User selects tag → `update_existing: false`
2. Creates/updates merchant with `default_tag_id`
3. Does NOT update existing transactions
4. Future transactions use merchant's default tag

### "Update All" Button Flow:
1. User selects tag → `update_existing: true`
2. Creates/updates merchant with `default_tag_id`
3. **Bulk updates all existing transactions** for that merchant
4. Sets `tag_id` on all matching transactions
5. Future transactions use merchant's default tag

## Test Results

**Test Case**: McDonald's (9 transactions)

**Before Fix**:
- Click "Update All" → ❌ SQL error
- Tag not saved
- Transactions not updated

**After Fix**:
- Click "Update All" → ✅ Success
- Merchant created: `default_tag_id = "Business"`
- 9 transactions updated: `tag_id = "Business"`
- Tag displays in merchant table
- Tag persists after refresh

## Verification

```bash
# Merchant record
SELECT name, default_tag_id FROM merchants WHERE name = "McDonald's"
# Result: McDonald's|d12e8a1d-9ff1-49f0-b47f-ce67c9b5617b ✅

# Transaction updates
SELECT COUNT(*) FROM transactions 
WHERE merchant_name = "McDonald's" AND tag_id IS NOT NULL
# Result: 9 ✅

# API response
GET /api/merchants/stats
# {
#   "name": "McDonald's",
#   "default_tag_id": "d12e8a1d-9ff1-49f0-b47f-ce67c9b5617b",
#   "default_tag_name": "Business" ✅
# }
```

## Related Fixes

This was the last piece of the entities-to-tags migration. Previous fixes included:
1. **Merchants table** - Removed FK to entities, added FK to tags
2. **Table preferences** - Added 'merchants' context type
3. **API endpoints** - Fixed dynamic params handling
4. **Bulk update** - Changed to use merchant name instead of unstable IDs

## Technical Details

### Database Constraints Before:
- `merchants.default_entity_id` → `entities.id` ❌
- `transactions.entity_id` → `entities.id` ❌

### Database Constraints After:
- `merchants.default_tag_id` → `tags.id` ✅
- `transactions.tag_id` → `tags.id` ✅
- Legacy fields (`entity_id`, `default_entity_id`) kept without FK for compatibility

### Function Updated:
```typescript
// lib/database.ts - bulkUpdateMerchantTransactions()
database.bulkUpdateMerchantTransactions(merchantName, {
  tag_id: value,        // Updates tag_id
  entity_id: value      // Updates entity_id (no FK constraint now)
});
```

## Results

Both buttons now work correctly:

**"Only Future"**:
- ✅ Saves merchant tag
- ✅ Displays in table
- ✅ Persists on refresh
- ✅ Only affects future transactions

**"Update All"**:
- ✅ Saves merchant tag
- ✅ Displays in table  
- ✅ Persists on refresh
- ✅ Updates all existing transactions
- ✅ Affects future transactions

The merchant tagging system is now **fully functional** for both scenarios! 🎉
