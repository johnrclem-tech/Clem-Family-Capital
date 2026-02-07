# Complete Plaid Transaction Fields

Your app now captures **ALL** fields available from Plaid transactions!

## ✅ What's Included

### Core Transaction Data
- **plaid_transaction_id** - Unique Plaid transaction ID
- **plaid_item_id** - Which Plaid item (bank connection) this belongs to
- **account_id** - Account identifier
- **date** - Transaction date (YYYY-MM-DD)
- **amount** - Transaction amount (negative = expense, positive = income)
- **name** - Transaction description from bank
- **merchant_name** - Merchant name (if identified)
- **pending** - Whether transaction is pending or posted

### Payment Information
- **payment_channel** - How the transaction was made
  - `online` - Online or digital
  - `in store` - In-person
  - `other` - Other methods
- **transaction_type** - Type of transaction
  - `place` - Standard place transaction
  - `special` - Special transaction type
  - `unresolved` - Unresolved transaction
- **transaction_code** - Institution-specific transaction code
- **check_number** - Check number (if check payment)

### Currency & Amount Details
- **iso_currency_code** - Standard currency code (USD, EUR, GBP, etc.)
- **unofficial_currency_code** - For non-standard currencies
- **original_description** - Original unmodified description

### Date & Time Details
- **authorized_date** - Date transaction was authorized
- **authorized_datetime** - Authorization timestamp (ISO 8601)
- **datetime** - Transaction timestamp (ISO 8601)

### Merchant Details
- **merchant_entity_id** - Plaid's unique merchant identifier
- **logo_url** - Merchant logo URL
- **website** - Merchant website URL

### Location Data (JSON Object)
```json
{
  "address": "123 Main St",
  "city": "San Francisco",
  "region": "CA",
  "postal_code": "94103",
  "country": "US",
  "lat": 37.7749,
  "lon": -122.4194,
  "store_number": "1234"
}
```

### Payment Metadata (JSON Object)
```json
{
  "by_order_of": "John Doe",
  "payee": "Acme Corp",
  "payer": "Jane Smith",
  "payment_method": "ACH",
  "payment_processor": "Stripe",
  "ppd_id": "12345",
  "reason": "Invoice 12345",
  "reference_number": "REF123456"
}
```

### Personal Finance Category (JSON Object)
```json
{
  "primary": "FOOD_AND_DRINK",
  "detailed": "FOOD_AND_DRINK_RESTAURANTS",
  "confidence_level": "VERY_HIGH"
}
```

### Additional Fields
- **account_owner** - Account holder name
- **pending_transaction_id** - Links pending transactions to their posted versions
- **plaid_category** - Legacy Plaid category (array)
- **plaid_category_id** - Legacy category ID

### Your Custom Fields
- **entity_id** - Links to your entities (Personal, Properties, etc.)
- **category_id** - Links to your custom categories
- **notes** - Your custom notes
- **is_recurring** - Mark as recurring transaction

## Database Schema

All fields are stored in the `transactions` table in SQLite. JSON fields (location, payment_meta, personal_finance_category_detailed) are stored as JSON strings and automatically parsed when retrieved.

## View Your Data

```bash
# View all fields for recent transactions
sqlite3 finance.db << 'EOF'
SELECT 
  date,
  name,
  amount,
  merchant_name,
  payment_channel,
  check_number,
  location,
  payment_meta
FROM transactions 
ORDER BY date DESC 
LIMIT 5;
EOF
```

## Query Examples

### Find Transactions by Payment Channel
```sql
SELECT date, merchant_name, amount, payment_channel
FROM transactions
WHERE payment_channel = 'online'
ORDER BY date DESC;
```

### Find Check Transactions
```sql
SELECT date, name, amount, check_number
FROM transactions
WHERE check_number IS NOT NULL
ORDER BY date DESC;
```

### View Location Data
```sql
SELECT 
  date,
  merchant_name,
  json_extract(location, '$.city') as city,
  json_extract(location, '$.region') as state
FROM transactions
WHERE location IS NOT NULL
ORDER BY date DESC;
```

### Find Transactions with Payment Metadata
```sql
SELECT 
  date,
  name,
  amount,
  json_extract(payment_meta, '$.payment_method') as payment_method,
  json_extract(payment_meta, '$.reference_number') as reference
FROM transactions
WHERE payment_meta IS NOT NULL
ORDER BY date DESC;
```

### View Personal Finance Categories
```sql
SELECT 
  date,
  merchant_name,
  amount,
  json_extract(personal_finance_category_detailed, '$.primary') as category,
  json_extract(personal_finance_category_detailed, '$.detailed') as subcategory,
  json_extract(personal_finance_category_detailed, '$.confidence_level') as confidence
FROM transactions
WHERE personal_finance_category_detailed IS NOT NULL
ORDER BY date DESC
LIMIT 20;
```

## Field Availability

Not all fields are available for all transactions. Availability depends on:

1. **Institution Support** - Some banks provide more data than others
2. **Transaction Type** - Online vs in-store transactions have different data
3. **Payment Method** - Credit cards vs ACH vs checks have different fields
4. **Merchant** - Well-known merchants have more complete data

### Commonly Populated Fields
- ✅ Always: transaction_id, account_id, date, amount, name, pending
- ✅ Usually: merchant_name, payment_channel, iso_currency_code
- ⚠️ Sometimes: location, merchant_entity_id, logo_url, check_number
- ⚠️ Rarely: payment_meta, transaction_code, website

## Next Sync

The next time you sync transactions (click "Sync Transactions"), all these fields will be captured automatically. Existing transactions won't be backfilled with new fields, but any updates to those transactions will include the new data.

## Performance Note

Capturing all these fields doesn't significantly impact performance because:
- Most fields are NULL for most transactions
- SQLite efficiently handles sparse data
- JSON fields are only parsed when explicitly accessed
- Indexes are on commonly queried fields only

## Migration Applied

The database migration `scripts/add-plaid-fields.sql` has been applied. Your schema is now complete with all Plaid fields!
