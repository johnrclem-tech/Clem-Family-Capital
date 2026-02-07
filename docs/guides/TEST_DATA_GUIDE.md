# Test Data Seed Script

## ✅ Seed Script Created!

A comprehensive seed script has been created to populate your database with realistic test transactions that include **all Plaid fields** with complete data.

## 🚀 How to Use

### Run the Seed Script

```bash
npm run seed
```

Or directly:

```bash
npx tsx scripts/seed-test-transactions.ts
```

## 📊 What Gets Added

The script creates **13 realistic test transactions** with complete Plaid data:

### Transaction Types

1. **Whole Foods** - Groceries ($125.43)
   - Complete location data
   - Payment metadata
   - Personal Finance Category

2. **Shell** - Gas Station ($45.67)
   - Location with coordinates
   - Payment processor info

3. **Starbucks** - Restaurant ($8.95)
   - Merchant logo and website
   - Location data

4. **Amazon** - Online Purchase ($89.99)
   - Online payment channel
   - Merchant entity ID

5. **ACME Corporation** - Salary Deposit ($3,500.00)
   - Income transaction
   - ACH payment method
   - Payroll metadata

6. **Uber** - Pending Trip ($23.45)
   - **Pending status** (highlighted in UI)
   - Rideshare category

7. **Pacific Gas & Electric** - Utility Check ($125.00)
   - Check number included
   - Utility category

8. **Bank of America ATM** - Cash Withdrawal ($100.00)
   - ATM transaction type
   - Location data

9. **Netflix** - Subscription ($15.99)
   - Subscription category
   - Recurring payment metadata

10. **Target** - Superstore ($234.56)
    - Large purchase
    - Complete location

11. **Apple** - Subscription ($29.99)
    - App Store subscription
    - Online payment

12. **Chevron** - Gas Station ($52.34)
    - Another gas purchase
    - Different location

13. **Chipotle** - Restaurant ($12.50)
    - Fast casual restaurant
    - Complete data

## 📋 Complete Data Included

Every transaction includes:

- ✅ **Basic Info**: Date, amount, merchant name, description
- ✅ **Location Data**: Address, city, state, postal code, country, lat/lon
- ✅ **Payment Metadata**: Method, processor, reference numbers, payee/payer
- ✅ **Personal Finance Category**: Primary, detailed, confidence level
- ✅ **Merchant Details**: Logo URL, website, entity ID
- ✅ **Timestamps**: Authorized date, authorized datetime, transaction datetime
- ✅ **Payment Channel**: In store, online, other
- ✅ **Transaction Type**: Place, special
- ✅ **Currency**: ISO currency code
- ✅ **Check Numbers**: Where applicable
- ✅ **Plaid Categories**: Standard category arrays and IDs

## 🎯 Use Cases

### Testing Uncategorized Transactions
- All transactions are **uncategorized** by default
- They'll show with **amber highlighting** in the UI
- Perfect for testing categorization workflow

### Testing Pending Transactions
- Uber trip is marked as **pending**
- Shows yellow badge in UI
- Tests pending transaction display

### Testing Income vs Expenses
- Salary deposit is **positive** ($3,500.00)
- All others are **negative** (expenses)
- Tests amount color coding

### Testing Different Payment Types
- Card payments (most transactions)
- ACH (salary deposit)
- Check (utility payment)
- ATM (cash withdrawal)

### Testing Location Data
- Some have full addresses
- Some have city/state only
- Some have coordinates
- Tests location display in detail sheet

## 🔄 Running Multiple Times

The script is **idempotent** - you can run it multiple times:

- Creates a test Plaid item if none exists
- Uses existing item if available
- Each run adds new transactions (won't duplicate)

## 🗑️ Clearing Test Data

To remove test transactions:

```bash
sqlite3 finance.db "DELETE FROM transactions WHERE plaid_transaction_id LIKE 'txn_test_%';"
```

Or to remove everything:

```bash
sqlite3 finance.db "DELETE FROM transactions;"
```

## 📝 Customization

Edit `scripts/seed-test-transactions.ts` to:
- Add more transaction types
- Change amounts
- Modify dates
- Add different merchants
- Test edge cases

## ✨ Benefits

### Before (Plaid Sandbox)
- Most fields are `null`
- Limited test data
- Hard to test UI features

### After (Seed Script)
- ✅ All fields populated
- ✅ Realistic test scenarios
- ✅ Complete data for UI testing
- ✅ Various transaction types
- ✅ Different payment methods
- ✅ Location data for mapping
- ✅ Categories for testing

## 🎨 UI Testing

With this seed data, you can test:

1. **Uncategorized Highlighting** - All transactions show amber
2. **Transaction Detail Sheet** - Click any row to see full data
3. **Column Display** - All Plaid columns have data
4. **Location Display** - See addresses and coordinates
5. **Payment Metadata** - View payment methods and processors
6. **Category Display** - See Personal Finance Categories
7. **Pending Status** - Uber trip shows as pending
8. **Amount Formatting** - Positive/negative amounts
9. **Date Sorting** - Transactions span multiple days
10. **Filtering** - Filter by merchant, category, etc.

## 🚀 Next Steps

1. **Run the seed script:**
   ```bash
   npm run seed
   ```

2. **Refresh your app** in the browser

3. **See the test transactions** with complete data!

4. **Test your UI features** with realistic data

5. **Categorize transactions** to test your workflow

Your app now has comprehensive test data to work with! 🎉
