# Merchant Settings Dialog Update

## Summary
Updated the Merchant Settings Dialog to include all available fields from the merchant database table.

## Changes Made

### 1. Component Updates (`components/merchants/merchant-settings-dialog.tsx`)

#### New Fields Added:
- **Logo URL** - Text input for merchant logo URL
- **Confidence Level** - Dropdown with predefined options (Very High, High, Medium, Low)
- **Is Confirmed** - Toggle switch to mark merchant as confirmed/verified
- **Notes** - Changed from single-line Input to multi-line Textarea
- **Merged Into** - Read-only field showing if merchant was merged (displays when applicable)

#### UI Improvements:
- Increased dialog width to `max-w-2xl` to accommodate additional fields
- Added scrolling for content overflow with `overflow-y-auto`
- Changed Notes field to use Textarea component for better multi-line support
- Improved layout with proper spacing and labels

### 2. API Route Updates (`app/api/merchants/[id]/route.ts`)

Updated the PATCH endpoint to accept and process new fields:
```typescript
{
  name,
  default_category_id,
  default_tag_id,
  notes,
  logo_url,           // NEW
  confidence_level,   // NEW
  is_confirmed        // NEW
}
```

### 3. Database Function Updates (`lib/database.ts`)

Updated `updateMerchant` function signature to include:
```typescript
{
  logo_url?: string | null;
  confidence_level?: string | null;
  is_confirmed?: boolean;
}
```

Implemented proper handling:
- `logo_url` - stored as text
- `confidence_level` - stored as text
- `is_confirmed` - converted from boolean to integer (0/1) for SQLite

### 4. Dependencies Added

Installed Shadcn UI components:
- **Textarea** - For multi-line notes input
- **Switch** - Already available for the confirmed toggle

## Fields in Merchant Dialog

### Editable Fields:
1. **Merchant Name** (required)
2. **Default Category** (dropdown)
3. **Default Tag** (searchable combobox with "Manage Tags")
4. **Logo URL** (text input)
5. **Confidence Level** (dropdown: Very High, High, Medium, Low, None)
6. **Is Confirmed** (toggle switch)
7. **Notes** (multi-line textarea)

### Read-Only Fields:
8. **Plaid Entity ID** (displayed when available)
9. **Merged Into** (displayed when merchant was merged)

### Auto-Generated Fields (not shown):
- `id` - UUID
- `created_at` - timestamp
- `updated_at` - timestamp
- `default_entity_id` - legacy field (kept in sync with default_tag_id)

## Features

### Confidence Level Options
- **VERY_HIGH** - Very High confidence
- **HIGH** - High confidence
- **MEDIUM** - Medium confidence
- **LOW** - Low confidence
- **None** - No confidence level set

### Confirmed Merchant Toggle
- Visual switch control
- Helper text: "Mark this merchant as confirmed and verified"
- Useful for distinguishing manually verified merchants from auto-detected ones

### Multi-line Notes
- Replaced single-line input with textarea
- Minimum height of 80px
- Allows for detailed merchant notes and documentation

## Technical Details

### State Management
All new fields are managed with React useState:
```typescript
const [logoUrl, setLogoUrl] = useState("");
const [confidenceLevel, setConfidenceLevel] = useState("");
const [isConfirmed, setIsConfirmed] = useState(false);
```

### Data Persistence
- Fields are properly initialized from merchant data
- Updates are sent to API on save
- Boolean values are converted to integers for SQLite
- Empty strings are converted to null for database storage

### Backward Compatibility
- Maintains support for `default_entity_id` (legacy field)
- Keeps both `default_tag_id` and `default_entity_id` in sync
- All existing functionality preserved

## Testing

All fields have been:
- ✅ Added to the dialog UI
- ✅ Connected to state management
- ✅ Wired to API endpoints
- ✅ Mapped to database functions
- ✅ Verified for proper data types
- ✅ Tested for SQLite compatibility

## Usage

1. Navigate to Merchants page
2. Click the pencil icon (Edit) on any merchant
3. Update any of the fields
4. Click "Save" to persist changes
5. Click "Cancel" to discard changes

The dialog now provides complete control over all merchant properties stored in the database.
