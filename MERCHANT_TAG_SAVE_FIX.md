# Merchant Tag Save & Display Fix

## Problem
Tags selected in the merchant table were not saving or displaying after browser refresh.

## Root Causes

### 1. Wrong Field Name (Bug #1)
**File**: `components/merchants/merchants-dashboard-table.tsx` (line 350)

The bulk update was using the old `entity_id` field instead of `tag_id`:
```typescript
// BEFORE - WRONG
updates.entity_id = bulkUpdateDialog.newValue;

// AFTER - CORRECT
updates.tag_id = bulkUpdateDialog.newValue;
```

### 2. Unstable Merchant IDs (Bug #2)
**File**: `lib/database.ts` (line 1059)

Merchants derived from transactions (not in merchants table) were getting NEW random IDs on every query:
```typescript
const id = m.id || generateId(); // Generates NEW ID each time!
```

**Solution**: Changed bulk-update to use merchant NAME (stable identifier) instead of ID.

**Files Changed**:
- `components/merchants/merchants-dashboard-table.tsx` - Pass `merchant_name` in request
- `app/api/merchants/[id]/bulk-update/route.ts` - Lookup by name, not ID

### 3. Database Foreign Key Constraint (Bug #3)
**File**: Database schema - `merchants` table

The merchants table had a foreign key constraint referencing the deleted `entities` table:
```sql
FOREIGN KEY (default_entity_id) REFERENCES entities(id) ON DELETE SET NULL
```

This caused SQL errors when trying to create merchant records.

**Solution**: Migrated merchants table to:
- Remove `entities` foreign key
- Add `tags` foreign key for `default_tag_id`
- Preserve all existing data

## Fixes Applied

### Fix 1: Update Field Name
```typescript
// components/merchants/merchants-dashboard-table.tsx
handleBulkUpdateConfirm: {
  updates.tag_id = bulkUpdateDialog.newValue; // Changed from entity_id
  updates.merchant_name = bulkUpdateDialog.merchantName; // Added for stable lookup
}
```

### Fix 2: Lookup by Merchant Name
```typescript
// app/api/merchants/[id]/bulk-update/route.ts
let merchant = database.getMerchantByName(merchant_name); // Use name, not unstable ID

if (!merchant) {
  // Auto-create merchant if it doesn't exist yet
  merchant = database.createMerchant({
    name: merchant_name,
    default_tag_id: tag_id,
  });
}
```

### Fix 3: Database Schema Migration
```sql
-- Removed foreign key to entities
-- Added foreign key to tags
CREATE TABLE merchants_new (
  ...
  default_tag_id TEXT,
  ...
  FOREIGN KEY (default_tag_id) REFERENCES tags(id) ON DELETE SET NULL
)
```

## How It Works Now

### Merchant Tag Save Flow:

1. **User Selects Tag** → `TagCombobox` in merchant table
2. **Dialog Opens** → "Update merchant only" or "Update + transactions"
3. **Request Sent** → `POST /api/merchants/{id}/bulk-update`
   ```json
   {
     "merchant_name": "Uber",
     "tag_id": "uuid-of-tag",
     "update_existing": false
   }
   ```
4. **Lookup by Name** → Finds merchant by stable name (not unstable ID)
5. **Auto-Create if Needed** → Creates merchant record if derived from transactions
6. **Save Tag** → Updates `default_tag_id` in merchants table
7. **Refresh UI** → Tag displays correctly in table

### Merchant Display Flow:

1. **Fetch Merchants** → `GET /api/merchants/stats`
2. **Query Joins Tags** → `LEFT JOIN tags tg ON am.default_tag_id = tg.id`
3. **Returns Data** → Includes `default_tag_id` and `default_tag_name`
4. **TagCombobox** → Displays selected tag with color indicator
5. **Persists on Refresh** → Tag saved in database, not just UI state

## Technical Details

### Merchant Creation Logic
- **Derived Merchants**: Automatically created from transaction `merchant_name`
- **Explicit Merchants**: Created when user sets tag/category for first time
- **Stable Identifier**: Merchant `name` (not ID) is the unique key

### Why IDs Were Unstable
The `getMerchantsWithStats()` function unions two sources:
1. Merchants table (has stable IDs)
2. Transactions table (generates NEW IDs each query)

For transaction-derived merchants, `generateId()` was called on every API call, making IDs unreliable.

### Database Schema
```sql
merchants table:
- id (PRIMARY KEY)
- name (UNIQUE) ← Stable identifier
- default_tag_id (FK to tags)
- default_category_id (FK to categories)
- default_entity_id (Legacy, still stored for compatibility)
- ...other fields
```

## Verification

Tested and confirmed:
- ✅ Tag selection saves successfully
- ✅ Tag displays immediately after save
- ✅ Tag persists after browser refresh
- ✅ Tag displays with correct color
- ✅ Bulk update dialog works correctly
- ✅ Auto-creates merchant records as needed
- ✅ No SQL errors
- ✅ No linter errors

## Example

**Before Fix**:
1. Select "Personal" tag for Uber → Dialog appears
2. Click "Update merchant only" → No error shown
3. Refresh page → Tag is gone ❌

**After Fix**:
1. Select "Personal" tag for Uber → Dialog appears
2. Click "Update merchant only" → Creates merchant record
3. Saves `default_tag_id = 8fae1bac...`
4. UI refreshes → "Personal" tag displayed ✅
5. Refresh browser → "Personal" tag still there ✅

## Results

Your tag selections in the merchant table now:
- **Save correctly** to the database
- **Display immediately** with colors
- **Persist across sessions** after browser refresh
- **Auto-create merchants** when needed

The merchant tagging system is now fully functional! 🎉
