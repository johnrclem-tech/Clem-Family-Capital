# Merchant Dialog - Wide Layout Update

## Summary
Updated the Merchant Settings Dialog to use a wider modal with optimized layout that displays all fields (including read-only data) while minimizing vertical scrolling.

## Changes Made

### 1. Modal Width Increase
- **Before**: `max-w-2xl` (672px)
- **After**: `max-w-5xl` (1024px)
- Provides more horizontal space for multi-column layout

### 2. Read-Only Information Sections

#### System Information Panel
Displays core merchant metadata in a 4-column grid:
- **Merchant ID** - Full UUID displayed
- **Plaid Entity ID** - If available from Plaid
- **Created Date** - Full timestamp with locale formatting
- **Last Updated Date** - Full timestamp with locale formatting
- **Merged Into Merchant** - If merchant was merged (full width)

Features:
- Light gray background (`bg-muted/30`)
- Border for separation
- Responsive grid (2 columns on mobile, 4 on desktop)
- `break-all` for long IDs to prevent overflow

#### Transaction Statistics Panel
Shows merchant transaction data (when available):
- **Total Transactions** - Count of all transactions
- **Total Amount** - Sum formatted as currency
- **Last Transaction** - Date of most recent transaction

Features:
- Blue-tinted background for visual distinction
- Large, bold numbers for key metrics
- 3-column grid layout
- Only displayed when `MerchantWithStats` data is available
- Dark mode support

### 3. Two-Column Editable Fields Layout

#### Left Column:
1. **Merchant Name** (required)
2. **Default Category** (dropdown)
3. **Default Tag** (searchable combobox)
4. **Confidence Level** (dropdown with predefined values)

#### Right Column:
1. **Logo URL** (text input with live preview)
2. **Is Confirmed** (toggle switch with description)
3. **Notes** (larger textarea - 120px min height)

### 4. New Features

#### Logo Preview
- When a logo URL is entered, a small preview image appears
- 8x8 pixel thumbnail with rounded border
- Graceful error handling (hides if image fails to load)
- "Preview" label for clarity

#### Enhanced Layout
- Consistent spacing with `space-y-4` in each column
- Confirmed toggle in highlighted box (`bg-muted/30`)
- Larger notes textarea for better text editing
- Grid automatically collapses to single column on mobile

## Layout Organization

```
┌────────────────────────────────────────────────────────────────┐
│  Edit Merchant                                            [X]   │
├────────────────────────────────────────────────────────────────┤
│  System Information                                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐│
│  │ Merchant ID  │ Plaid Ent ID │ Created      │ Last Updated ││
│  └──────────────┴──────────────┴──────────────┴──────────────┘│
│                                                                 │
│  Transaction Statistics (when available)                       │
│  ┌───────────────┬───────────────┬───────────────┐            │
│  │ Total Trans   │ Total Amount  │ Last Trans    │            │
│  └───────────────┴───────────────┴───────────────┘            │
│                                                                 │
│  Editable Fields                                               │
│  ┌─────────────────────────┬─────────────────────────┐        │
│  │ Left Column             │ Right Column            │        │
│  ├─────────────────────────┼─────────────────────────┤        │
│  │ • Merchant Name         │ • Logo URL              │        │
│  │ • Default Category      │   [Preview Image]       │        │
│  │ • Default Tag           │ • Is Confirmed [◉]      │        │
│  │ • Confidence Level      │ • Notes (textarea)      │        │
│  └─────────────────────────┴─────────────────────────┘        │
│                                                                 │
│  [Delete]                         [Cancel]  [Save]             │
└────────────────────────────────────────────────────────────────┘
```

## Benefits

### ✅ Reduced Vertical Scrolling
- Two-column layout for editable fields
- Information panels are compact and well-organized
- Most content visible without scrolling on standard screens

### ✅ Better Information Hierarchy
- Read-only data clearly separated at top
- System information vs. statistics distinction
- Editable fields grouped logically

### ✅ Improved Readability
- More breathing room with wider modal
- Clear section headers with visual styling
- Color-coded statistics panel

### ✅ Enhanced Usability
- Logo preview provides immediate feedback
- All data visible without hunting through fields
- Responsive design works on various screen sizes

### ✅ Professional Appearance
- Clean, modern layout
- Consistent spacing and alignment
- Visual hierarchy with backgrounds and borders

## Field Visibility

### Always Visible (for existing merchants):
1. ✅ Merchant ID
2. ✅ Created Date
3. ✅ Last Updated Date

### Conditionally Visible:
4. ✅ Plaid Entity ID (if available)
5. ✅ Merged Into Merchant (if merged)
6. ✅ Transaction Statistics (if `MerchantWithStats`)
7. ✅ Logo Preview (if URL entered)

### Editable Fields:
8. ✅ Merchant Name
9. ✅ Default Category
10. ✅ Default Tag
11. ✅ Logo URL
12. ✅ Confidence Level
13. ✅ Is Confirmed
14. ✅ Notes

## Technical Details

### Responsive Grid Classes
- `grid-cols-1 md:grid-cols-2` - Editable fields
- `grid-cols-2 md:grid-cols-4` - System information
- `grid-cols-3` - Transaction statistics

### Color Schemes
- **System Info**: `bg-muted/30` with `border`
- **Statistics**: `bg-blue-50 dark:bg-blue-950/30` with `border-blue-200`
- **Confirmed Toggle**: `bg-muted/30` highlight box

### Typography
- Section headers: `text-sm font-semibold uppercase tracking-wide`
- Labels: `text-xs text-muted-foreground`
- Data: `text-sm` with appropriate font weights
- Statistics: `text-2xl font-bold`

## Testing

Verified:
- ✅ No linter errors
- ✅ Proper responsive behavior
- ✅ All fields display correctly
- ✅ Logo preview works with error handling
- ✅ Statistics show when available
- ✅ Dark mode compatible
- ✅ Application loads successfully

The merchant dialog now provides a comprehensive view of all merchant data with an organized, professional layout that minimizes scrolling while maximizing information density.
