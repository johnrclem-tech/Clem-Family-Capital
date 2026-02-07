# Clem Finance Tagger - Setup Guide

Welcome to Clem Finance Tagger! This guide will help you get the application up and running.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works) OR SQLite setup
- A Plaid account (free sandbox for development)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env.local` file in the root directory with your actual credentials:

```env
# Supabase Configuration
# Get these from https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Plaid Configuration  
# Get these from https://dashboard.plaid.com/team/keys
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-sandbox-secret
PLAID_ENV=sandbox

# App Configuration (optional for now)
NEXTAUTH_SECRET=generate-a-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

**Important:** Replace all `your-*` placeholder values with real credentials!

### 3. Set Up Your Database

#### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning
3. Go to the SQL Editor in the Supabase dashboard
4. Copy the contents of `supabase/schema.sql`
5. Paste and run it in the SQL Editor
6. Copy your project URL and keys from Settings > API to `.env.local`

#### Option B: Local SQLite

1. Install SQLite: `brew install sqlite` (macOS) or appropriate for your OS
2. Create the database: `sqlite3 finance.db < scripts/setup-sqlite.sql`
3. Update `lib/supabase.ts` to use a SQLite client instead
4. Install `better-sqlite3`: `npm install better-sqlite3 @types/better-sqlite3`

### 4. Set Up Plaid

1. Sign up at [plaid.com](https://plaid.com)
2. Go to Team Settings > Keys
3. Copy your Client ID and Sandbox secret
4. Add them to `.env.local`

**Note:** The sandbox environment uses test credentials and doesn't connect to real banks.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

### Create Some Entities

Entities represent the owners/organizers of transactions (e.g., Personal, Properties, Business).

Run this in your Supabase SQL Editor or SQLite:

```sql
INSERT INTO entities (name, description) VALUES
  ('Personal', 'Personal finances'),
  ('113 29th St', 'Property at 113 29th Street'),
  ('Handled', 'Business entity');
```

### Connect a Bank Account

1. Click "Connect Account" in the dashboard
2. In the Plaid Link flow, select any bank (in sandbox mode)
3. Use these test credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. Complete the flow

### Sync Transactions

1. Click "Sync Transactions" in the dashboard
2. Wait for the sync to complete
3. Your test transactions will appear in the table!

### View and Filter Transactions

- Sort by clicking column headers (Date, Merchant, Amount, Category)
- Filter using the search boxes above the table
- Change page size (25/50/100/200 rows)
- Navigate pages with Previous/Next buttons

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── plaid/        # Plaid integration endpoints
│   │   ├── sync/         # Transaction sync endpoint
│   │   └── transactions/ # Fetch transactions
│   ├── globals.css       # Tailwind + theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard
├── components/
│   ├── transactions/     # Data table component
│   └── ui/               # Shadcn/UI components
├── lib/
│   ├── plaid.ts         # Plaid client
│   ├── supabase.ts      # Database client
│   └── utils.ts         # Utilities
├── supabase/
│   └── schema.sql       # Database schema
└── scripts/
    └── setup-sqlite.sql # SQLite alternative
```

## Database Schema

### Core Tables

- **entities**: Financial entities (Personal, Properties, etc.)
- **plaid_items**: Connected bank accounts
- **categories**: Hierarchical category tree (parent_id for nesting)
- **transactions**: Main transaction data
- **category_rules**: Auto-tagging rules

### Views

- **transactions_enriched**: Transactions with entity/category names
- **categories_with_parent**: Categories with parent names

## API Endpoints

### `POST /api/sync`
Syncs transactions from all connected Plaid items.
Returns: `{ success, message, synced, added, modified, removed }`

### `GET /api/sync`
Gets sync status for all Plaid items.
Returns: `{ success, items[] }`

### `GET /api/transactions`
Fetches all transactions with enriched data.
Returns: `{ success, transactions[], count }`

### `POST /api/plaid/create-link-token`
Creates a Plaid Link token for connecting accounts.
Returns: `{ success, link_token, expiration }`

### `POST /api/plaid/exchange-token`
Exchanges a public token for access token.
Body: `{ public_token, institution_id }`
Returns: `{ success, item }`

## Development Commands

```bash
# Start dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Common Tasks

### Adding Categories

```sql
-- Parent category
INSERT INTO categories (name, description, color, icon) 
VALUES ('Housing', 'All housing expenses', '#3B82F6', '🏠');

-- Child category
INSERT INTO categories (name, parent_id, description)
VALUES ('Mortgage', (SELECT id FROM categories WHERE name = 'Housing'), 'Monthly mortgage payment');
```

### Creating Auto-Tag Rules

```sql
-- Auto-categorize Starbucks purchases
INSERT INTO category_rules (
  merchant_pattern,
  category_id,
  priority
) VALUES (
  'Starbucks',
  (SELECT id FROM categories WHERE name = 'Coffee'),
  10
);

-- Rule with amount range
INSERT INTO category_rules (
  merchant_pattern,
  category_id,
  amount_min,
  amount_max,
  priority
) VALUES (
  'Costco',
  (SELECT id FROM categories WHERE name = 'Groceries'),
  0,
  500,
  5
);
```

### Manual Transaction Categorization

```sql
UPDATE transactions 
SET 
  category_id = (SELECT id FROM categories WHERE name = 'Groceries'),
  entity_id = (SELECT id FROM entities WHERE name = 'Personal')
WHERE merchant_name LIKE '%Whole Foods%';
```

## Troubleshooting

### Build Fails with Supabase Error

Make sure your `.env.local` has valid URLs and keys. Placeholder values like `your-supabase-url` will cause build failures.

### Plaid Sync Fails

- Check that your Plaid credentials are correct in `.env.local`
- Verify you're using the sandbox secret (not development or production)
- Check the error message in the sync response

### No Transactions Appear

- Make sure you've clicked "Sync Transactions" after connecting an account
- Check the browser console for errors
- Verify the database has transactions: `SELECT COUNT(*) FROM transactions;`

### Transactions Show But Category/Entity is Null

This is normal! Newly synced transactions won't have categories or entities assigned yet. You need to either:
- Manually update them via SQL or a UI you build
- Create category rules that will auto-tag them

## Next Steps

Here are features you might want to build next:

1. **Category Management UI**: Add/edit/delete categories with hierarchy
2. **Entity Management**: Create/edit entities
3. **Rule Builder**: Visual interface for creating auto-tag rules
4. **Inline Editing**: Click to edit categories/entities directly in table
5. **Transaction Details**: Drawer or modal with full transaction info
6. **Bulk Operations**: Select multiple transactions and batch update
7. **Advanced Filtering**: Date ranges, amount ranges, status filters
8. **Analytics Dashboard**: Charts and insights
9. **Export**: Download transactions as CSV/Excel
10. **Recurring Detection**: Identify and flag recurring transactions

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review the PROJECT_STRUCTURE.md for architecture details
- Check Next.js docs: https://nextjs.org/docs
- Check Supabase docs: https://supabase.com/docs
- Check Plaid docs: https://plaid.com/docs

## License

MIT
