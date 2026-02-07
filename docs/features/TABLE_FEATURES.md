# Enhanced Data Table Features

Your transactions table now includes **all Plaid fields** and **drag-and-drop column reordering**!

## ✅ New Features

### 1. **All Plaid Fields Visible**
The table now displays **25 columns** with all available Plaid transaction data:

**Core Fields:**
- Date, Merchant, Name, Amount
- Category, Entity, Status, Account

**Plaid Payment Fields:**
- Payment Channel (online/in store/other)
- Transaction Type
- Check Number
- Currency Code

**Date & Time Fields:**
- Authorized Date
- DateTime (full timestamp)

**Merchant Details:**
- Merchant Entity ID
- Logo URL (displays merchant logos!)
- Website (clickable links)

**Account Info:**
- Account Owner
- Account ID
- Transaction ID

**Location Data:**
- Location (city, state)

**Payment Metadata:**
- Payment Meta (payment method, reference numbers)

**Category Details:**
- Personal Finance Category (detailed breakdown)

**Other:**
- Original Description
- Plaid Category ID

### 2. **Drag-and-Drop Column Reordering**
- **Hover over column headers** to see the drag handle (grip icon)
- **Click and drag** any column header to reorder
- **Drop** the column in your preferred position
- Column order is saved in your session

### 3. **Column Visibility Toggle**
- Click the **"Columns"** button (eye icon) in the top right
- **Check/uncheck** columns to show or hide them
- Perfect for focusing on specific data

## How to Use

### Reorder Columns
1. **Hover** over any column header
2. **Grab** the grip icon (⋮⋮) that appears
3. **Drag** the column left or right
4. **Drop** it in your preferred position

### Show/Hide Columns
1. Click the **"Columns"** button (with eye icon)
2. Check/uncheck columns in the dropdown
3. Hidden columns won't appear in the table

### Filter Data
- Use the **"Filter by merchant"** input
- Use the **"Filter by category"** input
- Click column headers to **sort** by that column

## Column Display Details

### Smart Formatting
- **Amounts**: Color-coded (green for income, red for expenses)
- **Dates**: Formatted as readable dates
- **JSON Fields**: Parsed and displayed intelligently
- **URLs**: Clickable links (websites)
- **Images**: Merchant logos displayed inline
- **Long Text**: Truncated with tooltips on hover

### Responsive Design
- Table scrolls horizontally for many columns
- Columns auto-size based on content
- Mobile-friendly with horizontal scroll

## Default Column Order

Columns appear in this order by default:
1. Date
2. Merchant
3. Name
4. Amount
5. Category
6. Entity
7. Status
8. Account
9. Payment Channel
10. Type
11. Check #
12. Currency
13. ... (all other fields)

You can reorder them however you like!

## Tips

### Focus on What Matters
- Hide columns you don't need using the Columns dropdown
- Reorder columns to put important data first
- Use filters to narrow down transactions

### View All Data
- Scroll horizontally to see all columns
- Hover over truncated text to see full values
- Click website URLs to visit merchant sites

### Performance
- Table paginates (25/50/100/200 rows per page)
- Sorting and filtering are instant
- Column reordering is smooth and responsive

## Technical Details

- **Drag & Drop**: Uses `@dnd-kit` library
- **Column Management**: TanStack Table v8
- **State Management**: React hooks for column order and visibility
- **Performance**: Optimized rendering for large datasets

## Troubleshooting

### Columns Not Dragging?
- Make sure you're grabbing the grip icon (⋮⋮), not the header text
- Try refreshing the page if drag stops working

### Can't See All Columns?
- Scroll horizontally
- Or hide some columns using the Columns dropdown

### Column Order Reset?
- Column order is session-based (resets on page refresh)
- Future enhancement: Save column preferences to localStorage

Enjoy exploring all your Plaid transaction data! 🎉
