# Clem Finance Tagger - UI Guide

## Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [☰] Clem Finance Tagger              [Sync] [Connect Account] │ Header
├──────────┬──────────────────────────────────────────────────────┤
│          │  All Transactions - 127 transactions • 23 need cat.  │
│ Accounts │  ┌────────┬────────┬────────┬────────┐              │
│          │  │ Total  │ Uncat  │No Entity│Pending│              │ Stats
│ 🏠 All   │  │  127   │   23   │   45    │  12   │              │
│          │  └────────┴────────┴────────┴────────┘              │
│ ═══════  │  ┌──────────────────────────────────┐              │
│          │  │ [Filter merchant] [Filter cat] 👁 │              │ Filters
│ 💰 Cash  │  └──────────────────────────────────┘              │
│ ▾ (2)    │  ┌─────────────────────────────────────────────┐  │
│   • Chase│  │ Date  │Merchant│Amount │Category │Entity │…│  │ Table
│   • BoA  │  ├───────┼────────┼───────┼─────────┼───────┼─┤  │ (scrollable)
│          │  │Jan 20 │Whole F.│-$45.23│Groceries│Personal│ │  │
│ 💳Credit │  │Jan 19 │Starbuck│ -$5.50│         │       │ │←─ Uncategorized
│ ▸ (1)    │  │Jan 18 │Amazon  │-$89.99│Shopping │Personal│ │  │ (amber)
│          │  │  ...  │   ...  │  ...  │   ...   │  ...  │ │  │
│ 📈Invest │  └─────────────────────────────────────────────┘  │
│ ▸ (0)    │                                                     │
│          │  [Previous] Page 1 of 3 [Next] [25▾50 100 200]     │
│ + Connect│                                                     │
└──────────┴─────────────────────────────────────────────────────┘
           Sidebar                  Main Content Area
```

## Sidebar Features

### Structure
```
┌───────────────┐
│   Accounts    │
├───────────────┤
│ 🏠 All Trans  │ ← Click to show all
├───────────────┤
│ 💰 Cash (2)   │ ← Click group to filter
│ ▾             │
│   • Chase     │ ← Click account to filter
│   • BoA       │
│               │
│ 💳 Credit (1) │
│ ▸             │ ← Collapsed (click to expand)
│               │
│ 📈 Invest (0) │
│ ▸             │
│               │
│ 🏦 Loans (0)  │
│ ▸             │
│               │
│ 🏠 Property   │
│ ▸             │
├───────────────┤
│ + Connect Acc │
└───────────────┘
```

### Interaction

**Chevron (▾/▸):**
- Click to expand/collapse groups
- Shows/hides individual accounts

**Group Header (e.g., "💰 Cash (2)"):**
- Click to filter transactions to all accounts in that group
- Number shows account count

**Individual Account:**
- Click to filter to just that account
- Name from Plaid or custom name

**All Transactions:**
- Click to clear all filters
- Shows all transactions from all accounts

## Transaction Grid

### Visual Indicators

**Uncategorized Rows:**
- Amber/yellow background
- Thick left border in amber
- Easy to spot what needs attention

**Amount Colors:**
- 🟢 Green = Income/deposits
- 🔴 Red = Expenses/withdrawals

**Status Badges:**
- 🟡 Yellow "Pending" = Not yet cleared
- 🟢 Green "Cleared" = Posted transaction

### Row Click Interaction

**Click any row → Detail sheet opens:**
```
┌──────────────────────────────────────┐
│ Transaction Details              [X] │
│ View and edit transaction information│
├──────────────────────────────────────┤
│                                      │
│ Date: Jan 20, 2026                   │
│ Amount: -$45.23                      │
│ Merchant: Whole Foods                │
│ Description: WHOLE FOODS #123        │
│ Status: [Cleared]                    │
│                                      │
│ ─────────────────────────────────────│
│                                      │
│ Categorization                       │
│                                      │
│ Category: [Groceries ▾]              │
│ Entity:   [Personal ▾]               │
│ Notes:    [Weekly shopping...]       │
│                                      │
│ ─────────────────────────────────────│
│                                      │
│ Plaid Data                           │
│ Personal Finance Category:           │
│   Primary: FOOD_AND_DRINK            │
│   Detailed: FOOD_AND_DRINK_GROCERIES │
│   Confidence: VERY_HIGH              │
│                                      │
│ Payment Channel: in store            │
│ Location: San Francisco, CA          │
│                                      │
│ ─────────────────────────────────────│
│                                      │
│ [💾 Save Changes] [❌ Cancel]        │
│ [➗ Split Transaction] (Coming Soon) │
└──────────────────────────────────────┘
```

## Column Management

### Default Columns (Visible)
1. Date
2. Merchant
3. Name
4. Amount
5. Category
6. Entity
7. Status
8. Account

### Additional Columns (Hidden by Default)
- Payment Channel
- Transaction Type
- Check Number
- Currency
- Authorized Date
- DateTime
- Merchant ID
- Logo
- Website
- Account Owner
- Location
- Payment Meta
- Finance Category
- ... and more

### Show/Hide Columns
1. Click "Columns" button (eye icon) in top right
2. Check/uncheck to show/hide
3. Columns appear instantly

### Reorder Columns
1. Hover over any column header
2. Grab the grip icon (⋮⋮)
3. Drag left or right
4. Drop in new position

## Filtering & Sorting

### Filters
- **Merchant Search**: Type to filter by merchant name
- **Category Search**: Type to filter by category
- **Sidebar**: Click accounts/groups to filter

### Sorting
- Click any column header to sort
- Click again to reverse sort
- Sort indicator shows direction

### Pagination
- Select rows per page: 25, 50, 100, 200
- Navigate with Previous/Next buttons
- Page counter shows current page

## Stats Dashboard

Located below the header, shows:

```
┌──────────┬──────────┬──────────┬──────────┐
│  Total   │ Uncat'd  │No Entity │ Pending  │
│   127    │    23    │    45    │    12    │
└──────────┴──────────┴──────────┴──────────┘
```

- Updates in real-time based on filters
- Uncategorized count in amber (warning color)
- Shows only for filtered view

## Mobile Experience

### Tablet/Mobile Layout
```
┌─────────────────────────────────┐
│ ☰  Clem Finance Tagger  [Sync]  │
│                      [+ Connect] │
├─────────────────────────────────┤
│  All Transactions - 127 trans.  │
│  ┌─────┬─────┬─────┬─────┐     │
│  │Total│Uncat│NoEnt│Pend │     │
│  │ 127 │  23 │  45 │  12 │     │
│  └─────┴─────┴─────┴─────┘     │
│  ┌───────────────────────────┐ │
│  │ Transactions (swipe →)    │ │
│  │ [Filters]                 │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘

Sidebar (overlay):
┌───────────┐
│ Accounts  │
│ 🏠 All    │
│ 💰 Cash   │
│   • Chase │
│ 💳 Credit │
│   ...     │
└───────────┘
```

- Hamburger menu (☰) toggles sidebar
- Sidebar overlays content on mobile
- Tap outside sidebar to close
- Full table width on mobile

## Color Scheme

### Primary Colors
- **Amber/Yellow**: Uncategorized transactions (warning)
- **Green**: Income, cleared status
- **Red**: Expenses
- **Blue**: Links, selected items
- **Purple**: Investments
- **Orange**: Loans
- **Indigo**: Properties

### UI Elements
- Borders: Subtle gray
- Backgrounds: White/light gray
- Hover: Accent color
- Selected: Secondary color

## Next Steps

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open the app:**
   - Navigate to http://localhost:3000

3. **Connect accounts:**
   - Click "Connect Account"
   - Use Plaid sandbox credentials

4. **Sync transactions:**
   - Click "Sync" button
   - Wait for transactions to load

5. **Explore the UI:**
   - Try the sidebar navigation
   - Click transactions to see details
   - Categorize the amber-highlighted rows

6. **Customize:**
   - Reorder columns to your preference
   - Hide columns you don't need
   - Set up your favorite view

You now have a fully-featured, Quicken-style financial transaction manager! 🚀
