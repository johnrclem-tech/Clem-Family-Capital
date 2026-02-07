# Merchant Table Persistence Fix

## Problem
Column visibility and column width changes were not being saved between browser refreshes in the Merchants table.

## Root Cause
The `table_preferences` database table had a CHECK constraint that only allowed context_type values of `'account'`, `'category'`, or `'all'`. The Merchants table was trying to save preferences with context_type `'merchants'`, which was being rejected by the database constraint.

## Solution

### 1. Updated API Endpoint
**File**: `app/api/table-preferences/route.ts`

Added `'merchants'` to the accepted context types in the GET endpoint:
```typescript
const contextType = searchParams.get("contextType") as 'account' | 'category' | 'all' | 'merchants' | null;

if (!['account', 'category', 'all', 'merchants'].includes(contextType)) {
  // ... validation error
}
```

### 2. Database Migration
**Script**: `scripts/migrate-table-preferences-merchants.ts` (temporary, now deleted)

Updated the database CHECK constraint:
```sql
CREATE TABLE table_preferences (
  -- ... other fields
  context_type TEXT NOT NULL CHECK(context_type IN ('account', 'category', 'all', 'merchants')),
  -- ... other fields
)
```

Migration steps:
1. Created new table with updated constraint
2. Copied all existing data
3. Dropped old table
4. Renamed new table
5. Recreated indexes and triggers
6. All existing preferences preserved

### 3. Added All Merchant Fields to Table
Updated the merchants table to display all database fields:

**New Columns Added**:
- `logo_url` - Logo URL with thumbnail preview
- `notes` - Merchant notes (truncated with tooltip)
- `is_confirmed` - Confirmation status (✓ indicator)
- `merged_into_merchant_id` - Merged merchant reference
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Total Columns**: 14 (previously 8)

## Updated Default Column Order
```javascript
[
  "name",
  "logo_url",
  "default_category_id",
  "confidence_level",
  "default_tag_id",
  "notes",
  "is_confirmed",
  "merchant_entity_id",
  "merged_into_merchant_id",
  "total_amount",
  "transaction_count",
  "created_at",
  "updated_at",
  "actions"
]
```

## Features Now Working

### ✅ Column Visibility Persistence
- Show/hide any columns via Eye icon dropdown
- Settings saved automatically after 500ms debounce
- Preferences restored on page reload

### ✅ Column Width Persistence
- Resize columns by dragging edges
- Custom widths saved automatically
- Widths restored on page reload

### ✅ Column Order Persistence
- Drag and drop columns to reorder
- Order saved automatically
- Arrangement restored on page reload

### ✅ Sorting Persistence
- Sort by any column
- Sort direction and column saved
- Sorting state restored on page reload

## Column Display Features

### Logo URL Column
- Displays 6x6 thumbnail preview
- Shows truncated URL text
- Graceful error handling for broken images

### Notes Column
- Truncated display (max-w-[200px])
- Full text on hover (title attribute)
- Muted text styling

### Is Confirmed Column
- Green checkmark (✓) for confirmed merchants
- Gray dash (-) for unconfirmed
- Color-coded for quick scanning

### Timestamp Columns (created_at, updated_at)
- Formatted as locale date strings
- Muted text for secondary information
- Sortable for audit purposes

### Merged Into Column
- Shows merchant ID if merged
- Monospace font for IDs
- Dash (-) if not merged

## Technical Details

### Database Schema Update
```sql
-- Before
CHECK(context_type IN ('account', 'category', 'all'))

-- After
CHECK(context_type IN ('account', 'category', 'all', 'merchants'))
```

### Persistence Flow
1. User changes visibility/width/order
2. Change triggers React state update
3. useEffect detects state change
4. Debounced save (500ms) to API
5. API saves to database
6. On reload: preferences fetched and restored

### API Endpoints
- **GET** `/api/table-preferences?contextType=merchants&contextId=`
- **POST** `/api/table-preferences` (with JSON body)
- **DELETE** `/api/table-preferences?contextType=merchants&contextId=`

## Verification

Tested and confirmed:
- ✅ Preferences save successfully to database
- ✅ Preferences load correctly on page reload
- ✅ All 14 columns display properly
- ✅ Column visibility toggles work
- ✅ Column resizing persists
- ✅ Column reordering persists
- ✅ Sorting preferences persist
- ✅ No linter errors
- ✅ Application running successfully

## Results

The Merchants table now:
- Displays all 14+ database fields
- Saves all customizations automatically
- Restores your exact table setup on refresh
- Provides complete control over table layout

Your column preferences (visibility, width, order, sorting) are now fully persistent across browser sessions! 🎉
