# Entities to Tags Migration Summary

## Overview
Successfully migrated the "Entities" system to a "Tags" system with color support. All data and functionality preserved.

## Database Changes

### New Tables
- **`tags` table** created with:
  - `id` (TEXT PRIMARY KEY)
  - `name` (TEXT UNIQUE)
  - `color` (TEXT) - for future color coding
  - `created_at`, `updated_at` (TEXT)
  - Index on `name`
  - Auto-update trigger for `updated_at`

### Column Additions
- **`transactions` table**: Added `tag_id` column
- **`merchants` table**: Added `default_tag_id` column

### Data Migration
- Copied all data from `entities` to `tags` (0 records migrated - table was empty)
- Copied `entity_id` values to `tag_id` in transactions
- Copied `default_entity_id` values to `default_tag_id` in merchants
- Legacy `entity_id` and `default_entity_id` columns retained for backward compatibility

### Cleanup
- Dropped `entities` table, index, and trigger

## Code Changes

### TypeScript Types (`lib/database.ts`)
- Created `Tag` type with `id`, `name`, `color`, `created_at`, `updated_at`
- Added `Entity` type alias pointing to `Tag` for backward compatibility
- Updated `Transaction`, `TransactionEnriched`, `Merchant`, `MerchantWithStats` types to include `tag_id` and `tag_name` fields
- Kept legacy `entity_id` and `entity_name` fields for backward compatibility

### Database Functions (`lib/database.ts`)
- Added `getTags()` function
- Kept `getEntities()` as alias to `getTags()` for backward compatibility
- Updated `getTransactionsEnriched()` to join with `tags` table
- Updated `getTransactionsByMerchant()` to join with `tags` table
- Updated `getMerchantsWithStats()` to join with `tags` table and select `default_tag_name`
- Updated `updateTransactionById()` to handle `tag_id`
- Updated `createMerchant()` and `updateMerchant()` to handle `default_tag_id`
- Updated `bulkUpdateMerchantTransactions()` to handle `tag_id`
- All functions maintain backward compatibility with `entity_id` fields

### API Endpoints
- Created `/api/tags/route.ts` - GET endpoint for fetching tags
- Updated `/api/merchants/[id]/route.ts` - PATCH endpoint to handle `default_tag_id`
- Updated `/api/merchants/[id]/bulk-update/route.ts` - POST endpoint to handle `tag_id`
- Updated `/api/transactions/[id]/route.ts` - PATCH endpoint to handle `tag_id`
- Updated `/api/sync/route.ts` - POST endpoint to handle `tag_id` from confirmed merchants
- Legacy `/api/entities` endpoint still works via `getEntities()` alias

### UI Components
- **`app/page.tsx`**: Changed state from `entities` to `tags`, updated fetch function
- **`components/merchants/merchants-dashboard-table.tsx`**: 
  - Changed props from `entities` to `tags`
  - Renamed column from "Entity" to "Tag"
  - Updated column ID from `default_entity_id` to `default_tag_id`
  - Renamed handler from `handleEntityChange` to `handleTagChange`
- **`components/merchants/merchant-settings-dialog.tsx`**:
  - Changed props from `entities` to `tags`
  - Renamed field label from "Default Entity" to "Default Tag"
  - Updated state from `defaultEntityId` to `defaultTagId`
- **`components/transactions/transaction-detail-sheet.tsx`**:
  - Changed props from `entities` to `tags`
  - Renamed field label from "Entity" to "Tag"
  - Updated state to use `tag_id` instead of `entity_id`
  - Updated merchant auto-apply logic to use `default_tag_id`
- **`components/merchants/merchant-transactions-dialog.tsx`**:
  - Changed column header from "Entity" to "Tag"
  - Updated cell to display `tag_name` instead of `entity_name`
- **`components/transactions/data-table.tsx`**:
  - Changed column header from "Entity" to "Tag"
  - Updated column ID from `entity_name` to `tag_name`
  - Updated default column order to use `tag_name`
- **`components/merchants/bulk-update-dialog.tsx`**:
  - Updated comment from "category or entity" to "category or tag"

## Backward Compatibility

The migration maintains full backward compatibility:
- Legacy `entity_id` columns still exist in database
- Legacy `Entity` type alias points to `Tag`
- Legacy `getEntities()` function works via `getTags()`
- API endpoints accept both `entity_id` and `tag_id` parameters
- When `entity_id` is provided, it's automatically copied to `tag_id`

## Future Enhancements

The `tags` table now includes a `color` field that can be used for:
- Visual tag indicators in the UI
- Color-coded transaction lists
- Custom tag styling in dropdowns and forms

## Migration Scripts

Created and executed:
1. `scripts/migrate-entities-to-tags.ts` - Created tags table, migrated data, added columns
2. `scripts/cleanup-entities-table.ts` - Dropped old entities table

Both scripts have been deleted after successful execution.

## Verification

All components tested and working:
- ✓ Tags API endpoint (`/api/tags`) working
- ✓ Merchants dashboard displaying "Tag" column
- ✓ Transaction detail sheet showing "Tag" field
- ✓ Merchant settings dialog showing "Default Tag" field
- ✓ No linter errors
- ✓ Application running successfully
- ✓ Database schema verified
- ✓ Backward compatibility maintained
