# Plaid PFC Category Mapping Feature

## Overview
Automatically categorize transactions using Plaid's Personal Finance Category (PFC) v2 taxonomy by mapping Plaid categories to your custom Merchant Categories.

## ✅ What's Implemented

### 1. Database Infrastructure

**New Table**: `plaid_pfc_categories`
- **104 Plaid PFC v2 categories** seeded
- **16 primary categories**
- **Detailed subcategories** with descriptions
- **Mappings** to merchant categories
- **Fast lookups** with indexes

```sql
CREATE TABLE plaid_pfc_categories (
  id TEXT PRIMARY KEY,
  primary_category TEXT NOT NULL,           -- e.g., "FOOD_AND_DRINK"
  detailed_category TEXT NOT NULL UNIQUE,   -- e.g., "FOOD_AND_DRINK_RESTAURANTS"
  description TEXT,                          -- Human-readable
  default_merchant_category_id TEXT,         -- FK to your categories
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (default_merchant_category_id) REFERENCES categories(id)
);
```

**Category Breakdown**:
- BANK_FEES: 6 categories
- ENTERTAINMENT: 6 categories
- FOOD_AND_DRINK: 7 categories
- GENERAL_MERCHANDISE: 14 categories
- GENERAL_SERVICES: 10 categories
- GOVERNMENT_AND_NON_PROFIT: 4 categories
- HOME_IMPROVEMENT: 5 categories
- INCOME: 7 categories
- LOAN_PAYMENTS: 6 categories
- MEDICAL: 7 categories
- PERSONAL_CARE: 4 categories
- RENT_AND_UTILITIES: 7 categories
- TRANSFER_IN: 6 categories
- TRANSFER_OUT: 5 categories
- TRANSPORTATION: 6 categories
- TRAVEL: 4 categories

### 2. API Endpoints

**GET** `/api/plaid-pfc-categories`
- Returns all 104 PFC categories
- Includes merchant category mappings
- Enriched with merchant category names

**PATCH** `/api/plaid-pfc-categories/:id`
- Update mapping for a single PFC category
- Set `default_merchant_category_id`

### 3. UI Components

#### **CategoryCombobox**
`components/categories/category-combobox.tsx`

Searchable dropdown for categories with:
- Search functionality
- "None" option
- Color/icon display support
- **"Manage Mappings"** pinned at bottom

#### **PlaidPfcMappingDialog**
`components/categories/plaid-pfc-mapping-dialog.tsx`

Full-featured mapping management modal:
- **Wide modal** (max-w-6xl) for comfortable viewing
- **Collapsible groups** by primary category
- **Search** across all fields
- **Filter** to show only unmapped categories
- **Expand All / Collapse All** controls
- **Inline editing** with dropdowns
- **Tracks changes** before save
- **Bulk save** all modifications

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Plaid PFC Category Mappings                             │
├─────────────────────────────────────────────────────────┤
│ 🔍 Search... [Unmapped Only] [Expand] [Collapse]       │
├─────────────────────────────────────────────────────────┤
│ ▼ FOOD_AND_DRINK (7 categories)                         │
│   ├─ RESTAURANTS                                        │
│   │   "Restaurants and dining"                          │
│   │   FOOD_AND_DRINK_RESTAURANT                         │
│   │   Category: [Dining & Restaurants ▼]               │
│   ├─ FAST_FOOD                                          │
│   │   "Fast food restaurants"                           │
│   │   FOOD_AND_DRINK_FAST_FOOD                          │
│   │   Category: [Fast Food ▼]                          │
│   └─ ...                                                │
├─────────────────────────────────────────────────────────┤
│ 2 changes pending           [Cancel] [Save 2 Changes]  │
└─────────────────────────────────────────────────────────┘
```

### 4. Merchant Table Integration

**Updated**: `components/merchants/merchants-dashboard-table.tsx`

- ✅ Replaced plain `Select` with `CategoryCombobox`
- ✅ Added "Manage Mappings" option in dropdown
- ✅ Opens `PlaidPfcMappingDialog` when clicked
- ✅ Maintains all existing functionality (bulk updates, etc.)

### 5. Auto-Categorization System

**Updated**: `app/api/sync/route.ts`

**Smart categorization priority** for incoming Plaid transactions:

```typescript
Priority 1: Confirmed Merchant Defaults (highest)
  ├─ If merchant is marked "confirmed"
  └─ Use merchant's default_category_id

Priority 2: Plaid PFC Mapping
  ├─ If no confirmed merchant
  ├─ Look up txn.personal_finance_category.detailed
  └─ Use mapped merchant category

Priority 3: No Category
  └─ Leave blank for manual categorization
```

**Example**:
- Transaction from "Starbucks" with PFC `FOOD_AND_DRINK_COFFEE`
- No confirmed merchant rule exists
- PFC mapping: `FOOD_AND_DRINK_COFFEE` → "Coffee Shops" category
- ✅ Transaction auto-assigned to "Coffee Shops"

## 🎯 How to Use

### Setting Up Mappings

1. Go to **Merchants** page
2. Click any **Category** dropdown
3. Select **"Manage Mappings"** at bottom
4. **PlaidPfcMappingDialog** opens with all 104 categories

### Managing Mappings

**Search & Filter**:
- Type to search across all fields
- Click "Unmapped Only" to focus on unmapped categories
- Use "Expand All" / "Collapse All" for navigation

**Create Mappings**:
1. Find a Plaid category (e.g., `FOOD_AND_DRINK_RESTAURANTS`)
2. Select your merchant category from dropdown
3. Repeat for as many categories as needed
4. Click **"Save X Changes"**

**Example Mappings**:
- `FOOD_AND_DRINK_RESTAURANTS` → "Dining & Restaurants"
- `FOOD_AND_DRINK_FAST_FOOD` → "Fast Food"
- `FOOD_AND_DRINK_GROCERIES` → "Groceries"
- `TRANSPORTATION_GAS` → "Gas & Fuel"
- `GENERAL_SERVICES_TAXI_AND_RIDESHARE` → "Transportation"
- `RENT_AND_UTILITIES_RENT` → "Housing"

### Automatic Categorization

Once mappings are set up:

1. **Sync transactions** (sync button in app)
2. **Plaid categories** automatically applied
3. **Confirmed merchants** still take priority
4. **Manual overrides** always possible

## 📊 Benefits

### For Users:
- ✅ **Less manual work** - Auto-categorize based on Plaid's AI
- ✅ **Consistent categorization** - Same Plaid category → Same merchant category
- ✅ **One-time setup** - Map once, apply forever
- ✅ **Smart defaults** - Leverages Plaid's merchant intelligence

### For System:
- ✅ **Scalable** - Works for all 104 Plaid categories
- ✅ **Flexible** - Mappings can be changed anytime
- ✅ **Prioritized** - Confirmed merchants always override mappings
- ✅ **Fast** - Indexed lookups during sync

## 🔧 Technical Details

### Database Functions

```typescript
// Get all PFC categories with merchant category names
database.getPlaidPfcCategories(): PlaidPfcCategory[]

// Get single PFC category
database.getPlaidPfcCategory(id): PlaidPfcCategory | null

// Update mapping
database.updatePlaidPfcMapping(id, merchantCategoryId): PlaidPfcCategory

// Get mapping by detailed category (for auto-categorization)
database.getPlaidPfcMappingByDetailed(detailed): string | null
```

### Auto-Categorization Flow

```
New Transaction from Plaid
        ↓
Does merchant exist & is confirmed?
   YES → Use merchant.default_category_id ✅
   NO  → ↓
        
Does PFC mapping exist for this category?
   YES → Use mapped category ✅
   NO  → Leave uncategorized
```

### Component Architecture

```
MerchantsDashboardTable
  ├─ CategoryCombobox (replaces Select)
  │   ├─ Search & select categories
  │   └─ "Manage Mappings" button
  └─ PlaidPfcMappingDialog
      ├─ Fetch all 104 PFC categories
      ├─ Group by primary category
      ├─ Inline category dropdown editing
      └─ Bulk save all changes
```

## 📁 Files Created

```
New Files:
├── scripts/
│   └── plaid-pfc-v2-categories.json       (104 category definitions)
├── components/categories/
│   ├── category-combobox.tsx              (Searchable dropdown)
│   └── plaid-pfc-mapping-dialog.tsx       (Mapping management)
└── app/api/plaid-pfc-categories/
    ├── route.ts                            (GET all)
    └── [id]/route.ts                       (PATCH mapping)

Modified Files:
├── lib/database.ts                         (Added PlaidPfcCategory type & functions)
├── components/merchants/
│   └── merchants-dashboard-table.tsx       (Added CategoryCombobox & dialog)
└── app/api/sync/route.ts                   (Added auto-categorization logic)
```

## 🎨 UI/UX Features

### CategoryCombobox
- Consistent design with TagCombobox
- Search-as-you-type
- Keyboard navigation
- Color/icon support
- "Manage Mappings" always accessible

### PlaidPfcMappingDialog
- **Grouping**: Categories grouped by primary for easy navigation
- **Search**: Find categories quickly
- **Filtering**: Focus on unmapped categories
- **Bulk editing**: Change multiple mappings before saving
- **Visual feedback**: Modified categories highlighted
- **Efficient**: Wide modal prevents cramped layout

## 🚀 Next Steps

### Recommended Mappings to Start With:

**Essential Categories** (map these first):
1. `FOOD_AND_DRINK_RESTAURANT` → Your dining category
2. `FOOD_AND_DRINK_GROCERIES` → Your groceries category
3. `TRANSPORTATION_GAS` → Your gas/fuel category
4. `GENERAL_MERCHANDISE_ONLINE_MARKETPLACES` → Your online shopping category
5. `RENT_AND_UTILITIES_RENT` → Your housing/rent category

**Common Categories**:
- All FOOD_AND_DRINK → Various food categories
- INCOME categories → Income/payroll categories
- TRANSPORTATION → Travel/transport categories
- GENERAL_SERVICES → Services categories

### Usage Tips:

1. **Start broad** - Map high-volume categories first
2. **Review regularly** - Check "Unmapped Only" to see what needs mapping
3. **Be specific** - Map detailed categories to specific merchant categories
4. **Test with sync** - Sync transactions to see auto-categorization in action
5. **Override when needed** - Confirmed merchants always take priority

## ✅ Verification

Tested and confirmed:
- ✅ Table created with 104 categories
- ✅ API returns all categories with breakdowns
- ✅ CategoryCombobox displays in merchant table
- ✅ "Manage Mappings" opens dialog
- ✅ PlaidPfcMappingDialog loads all categories
- ✅ Grouping by primary category works
- ✅ Search and filter functionality
- ✅ Mappings can be edited and saved
- ✅ Auto-categorization logic implemented
- ✅ No linter errors
- ✅ App running successfully

## 🎉 Results

Your Clem Finance Tagger now has:
- **104 Plaid PFC v2 categories** ready to map
- **Smart auto-categorization** during transaction sync
- **Easy-to-use mapping UI** for setup
- **Consistent categorization** across all transactions
- **Flexible priority system** that respects your preferences

The Plaid PFC mapping system is ready to use! 🚀
