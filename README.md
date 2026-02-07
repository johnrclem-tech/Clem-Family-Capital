# Clem Finance Tagger

A Next.js financial application for aggregating transactions from all bank accounts and credit cards, with powerful automated tagging capabilities.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Database**: SQLite (local file-based database)
- **Banking API**: Plaid
- **Data Grid**: TanStack Table

## Features

- 📊 **Transaction Dashboard**: Spreadsheet-style grid with sorting and filtering
- 🏦 **Multi-Account Support**: Connect multiple banks and credit cards via Plaid
- 🏷️ **Auto-Tagging**: Rule-based automatic categorization
- 📁 **Hierarchical Categories**: Nested category structure
- 🏢 **Entity Management**: Track transactions by entity (Personal, Properties, Business)
- 🔄 **Real-time Sync**: Incremental transaction syncing

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── plaid/
│   │   │   ├── create-link-token/route.ts
│   │   │   └── exchange-token/route.ts
│   │   ├── sync/route.ts
│   │   └── transactions/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── transactions/
│   │   └── data-table.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── table.tsx
├── lib/
│   ├── plaid.ts
│   ├── supabase.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql
└── package.json
```

## Database Schema

The application uses the following tables:

### `entities`
Represents financial entities (Personal, Properties, Business units)
- `id`, `name`, `description`

### `plaid_items`
Stores Plaid access tokens and sync status
- `id`, `item_id`, `access_token`, `institution_name`, `cursor`, `last_sync_at`, `sync_status`

### `categories`
Hierarchical category structure with `parent_id`
- `id`, `name`, `parent_id`, `description`, `color`, `icon`

### `transactions`
Main transaction data
- `id`, `plaid_transaction_id`, `date`, `amount`, `merchant_name`, `name`
- `entity_id`, `category_id`, `pending`, `notes`

### `category_rules`
Auto-mapping rules for merchant patterns
- `id`, `merchant_pattern`, `plaid_category_pattern`, `category_id`, `entity_id`, `priority`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-sandbox-secret
PLAID_ENV=sandbox
```

### 3. Set Up Database

The database is already initialized! A SQLite database file (`finance.db`) was created with the schema.

**Add sample entities** (optional):

```bash
sqlite3 finance.db << 'EOF'
INSERT INTO entities (id, name, description) VALUES
  (lower(hex(randomblob(16))), 'Personal', 'Personal finances'),
  (lower(hex(randomblob(16))), '113 29th St', 'Property at 113 29th Street'),
  (lower(hex(randomblob(16))), 'Handled', 'Business entity');
EOF
```

See `SQLITE_SETUP.md` for more database management commands.

### 4. Set Up Plaid

1. Sign up at [plaid.com](https://plaid.com) for a free sandbox account
2. Get your Client ID and Secret from the dashboard
3. Add them to `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Connecting a Bank Account

1. Click "Connect Account" in the dashboard
2. Complete the Plaid Link flow
3. Your transactions will begin syncing automatically

### Syncing Transactions

- Click "Sync Transactions" to manually trigger a sync
- The sync process fetches new transactions from Plaid
- Deduplication is handled automatically via `plaid_transaction_id`

### Creating Categories

Categories can be created through the database or via an admin UI (to be built):

```sql
-- Example: Create a parent category
INSERT INTO categories (name, description) 
VALUES ('Housing', 'Housing and property expenses');

-- Example: Create a child category
INSERT INTO categories (name, parent_id, description)
VALUES ('Mortgage', (SELECT id FROM categories WHERE name = 'Housing'), 'Mortgage payments');
```

### Creating Auto-Tag Rules

```sql
-- Example: Auto-tag Starbucks as "Coffee"
INSERT INTO category_rules (merchant_pattern, category_id, priority)
VALUES (
  'Starbucks',
  (SELECT id FROM categories WHERE name = 'Coffee'),
  10
);
```

## API Routes

### `POST /api/sync`
Syncs transactions from all connected Plaid items

### `GET /api/sync`
Returns sync status for all Plaid items

### `GET /api/transactions`
Returns all transactions with enriched data (entity names, category names)

### `POST /api/plaid/create-link-token`
Creates a Plaid Link token for connecting accounts

### `POST /api/plaid/exchange-token`
Exchanges a public token for an access token after Plaid Link success

## Next Steps

Here are some features you might want to add:

- [ ] Category management UI
- [ ] Entity management UI
- [ ] Rule builder interface
- [ ] Bulk transaction editing
- [ ] Transaction notes and attachments
- [ ] Reporting and analytics
- [ ] Budget tracking
- [ ] Recurring transaction detection
- [ ] Split transactions
- [ ] Multi-user support with authentication

## Development

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT
