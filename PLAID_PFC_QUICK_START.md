# Plaid PFC Mapping - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 0: Create Your Merchant Categories (If Not Done Yet)

**First time setup?** You'll need to create your merchant categories:
1. Create categories like "Dining", "Groceries", "Gas", "Shopping", etc.
2. You can create categories through the UI or via the categories API
3. Once you have categories, proceed to mapping

**Already have categories?** Skip to Step 1!

### Step 1: Open the Mapping Dialog

1. Navigate to the **Merchants** page
2. Click any **Category** dropdown in the merchant table
3. Click **"Manage Mappings"** at the bottom
4. The Plaid PFC Mapping dialog opens

### Step 2: Map Your Most Common Categories

**Start with these essential mappings**:

#### Food & Drink (7 categories)
- `FOOD_AND_DRINK_RESTAURANT` → Your "Dining" or "Restaurants" category
- `FOOD_AND_DRINK_FAST_FOOD` → Your "Fast Food" category
- `FOOD_AND_DRINK_GROCERIES` → Your "Groceries" category
- `FOOD_AND_DRINK_COFFEE` → Your "Coffee" or "Dining" category

#### Transportation (6 categories)
- `TRANSPORTATION_GAS` → Your "Gas & Fuel" category
- `GENERAL_SERVICES_TAXI_AND_RIDESHARE` → Your "Transportation" or "Uber/Lyft" category
- `TRANSPORTATION_PUBLIC_TRANSIT` → Your "Public Transit" category

#### Utilities (7 categories)
- `RENT_AND_UTILITIES_RENT` → Your "Housing" or "Rent" category
- `RENT_AND_UTILITIES_GAS_AND_ELECTRICITY` → Your "Utilities" category
- `RENT_AND_UTILITIES_INTERNET_AND_CABLE` → Your "Internet" or "Utilities" category

#### Shopping (14 categories)
- `GENERAL_MERCHANDISE_ONLINE_MARKETPLACES` → Your "Online Shopping" or "Amazon" category
- `GENERAL_MERCHANDISE_SUPERSTORES` → Your "Shopping" or "Retail" category
- `GENERAL_MERCHANDISE_DEPARTMENT_STORES` → Your "Shopping" category

### Step 3: Save and Sync

1. Click **"Save X Changes"** button
2. Go back to main page
3. Click **"Sync"** button to pull latest transactions
4. Watch as new transactions are **automatically categorized**! 🎉

## 💡 Pro Tips

### Use Search Effectively
- Type "food" to find all food-related categories
- Type "gas" to find gas/utilities
- Type "online" to find e-commerce categories

### Use Filters
- Click **"Unmapped Only"** to see what needs attention
- Focus on categories that appear in your actual transactions

### Priority System
Remember:
1. **Confirmed merchants** always win (override everything)
2. **PFC mappings** apply when no confirmed merchant exists
3. **Manual assignment** always possible for individual transactions

### Group Management
- Click primary category headers to collapse/expand
- Use "Expand All" to see everything at once
- Use "Collapse All" to focus on one category at a time

## 📋 All 16 Primary Categories

1. **INCOME** (7 categories) - Wages, dividends, interest
2. **TRANSFER_IN** (6 categories) - Deposits, incoming transfers
3. **TRANSFER_OUT** (5 categories) - Withdrawals, outgoing transfers
4. **LOAN_PAYMENTS** (6 categories) - Mortgages, car loans, credit cards
5. **BANK_FEES** (6 categories) - ATM fees, overdrafts, charges
6. **ENTERTAINMENT** (6 categories) - Movies, music, games, events
7. **FOOD_AND_DRINK** (7 categories) - Restaurants, groceries, coffee
8. **GENERAL_MERCHANDISE** (14 categories) - Retail, online, clothing
9. **HOME_IMPROVEMENT** (5 categories) - Furniture, hardware, repairs
10. **MEDICAL** (7 categories) - Doctors, pharmacies, dental
11. **PERSONAL_CARE** (4 categories) - Gyms, salons, laundry
12. **GENERAL_SERVICES** (10 categories) - Uber, insurance, legal, education
13. **GOVERNMENT_AND_NON_PROFIT** (4 categories) - Taxes, donations
14. **TRANSPORTATION** (6 categories) - Gas, parking, public transit
15. **TRAVEL** (4 categories) - Flights, hotels, car rentals
16. **RENT_AND_UTILITIES** (7 categories) - Rent, electricity, internet, water

## 🎯 Example: Complete Food & Drink Setup

Map all 7 food categories:

| Plaid Category | Your Category |
|----------------|---------------|
| `FOOD_AND_DRINK_RESTAURANT` | Dining & Restaurants |
| `FOOD_AND_DRINK_FAST_FOOD` | Fast Food |
| `FOOD_AND_DRINK_GROCERIES` | Groceries |
| `FOOD_AND_DRINK_COFFEE` | Coffee Shops |
| `FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR` | Alcohol |
| `FOOD_AND_DRINK_VENDING_MACHINES` | Snacks |
| `FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK` | Other Food |

**Result**: All food transactions automatically categorized! ✅

## ⚡ Quick Actions

### See All Unmapped Categories
1. Open "Manage Mappings"
2. Click "Unmapped Only"
3. Map the ones you use most

### Map a Whole Category Group
1. Expand a primary category (e.g., FOOD_AND_DRINK)
2. Map all subcategories to your merchant categories
3. Save once

### Update Existing Mappings
1. Search for the category
2. Change the dropdown
3. Save

## 🔍 Finding Your Data

**Check what PFC categories your transactions use**:
```sql
SELECT 
  json_extract(personal_finance_category_icon_url, '$[0].confidence_level') as confidence,
  COUNT(*) as count
FROM transactions 
WHERE personal_finance_category_icon_url IS NOT NULL
GROUP BY confidence;
```

This shows you which Plaid categories appear in your actual data, helping you prioritize mappings.

## ✅ Success Metrics

After setting up mappings, you should see:
- ✅ New transactions auto-categorized
- ✅ Fewer "uncategorized" transactions
- ✅ Consistent categorization across merchants
- ✅ Less manual categorization work
- ✅ Better spending insights

---

**Ready to categorize transactions automatically? Open the Merchants page and click "Manage Mappings"!** 🎉
