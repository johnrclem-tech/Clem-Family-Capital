# Clem Finance Tagger - Project Structure

```
quicken-app/
├── app/                                    # Next.js App Router
│   ├── api/                               # API Routes
│   │   ├── plaid/                         # Plaid Integration
│   │   │   ├── create-link-token/
│   │   │   │   └── route.ts              # Create Plaid Link token
│   │   │   └── exchange-token/
│   │   │       └── route.ts              # Exchange public token for access token
│   │   ├── sync/
│   │   │   └── route.ts                  # Sync transactions from Plaid
│   │   └── transactions/
│   │       └── route.ts                  # Fetch transactions with enriched data
│   ├── globals.css                        # Global styles with Tailwind + Shadcn theme
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Main dashboard page
│
├── components/                            # React Components
│   ├── transactions/
│   │   └── data-table.tsx                # TanStack Table with sorting/filtering
│   └── ui/                                # Shadcn/UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── table.tsx
│
├── lib/                                   # Utility Libraries
│   ├── plaid.ts                          # Plaid client and helper functions
│   ├── supabase.ts                       # Supabase client and database types
│   └── utils.ts                          # General utilities (cn, formatters)
│
├── supabase/                             # Database
│   └── schema.sql                        # PostgreSQL schema for Supabase
│
├── scripts/                              # Setup Scripts
│   └── setup-sqlite.sql                  # SQLite alternative schema
│
├── components.json                        # Shadcn/UI configuration
├── next.config.ts                        # Next.js configuration
├── package.json                          # Dependencies and scripts
├── postcss.config.mjs                    # PostCSS configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── tsconfig.json                         # TypeScript configuration
├── .eslintrc.json                        # ESLint configuration
├── .gitignore                            # Git ignore rules
├── README.md                             # Documentation
└── PROJECT_STRUCTURE.md                  # This file
```

## Key Files

### Configuration
- `components.json` - Shadcn/UI component configuration
- `tailwind.config.ts` - Tailwind theme (includes Shadcn variables)
- `tsconfig.json` - TypeScript with path aliases (@/*)
- `.env.local` - Environment variables (create from README)

### Database Schema
- `supabase/schema.sql` - Full PostgreSQL schema with:
  - Tables: entities, plaid_items, categories, transactions, category_rules
  - Views: transactions_enriched, categories_with_parent
  - Triggers: Auto-update timestamps
  - Indexes: Optimized for common queries

### API Routes
- `POST /api/sync` - Sync transactions from all Plaid items
- `GET /api/sync` - Get sync status
- `GET /api/transactions` - Get all transactions
- `POST /api/plaid/create-link-token` - Initialize Plaid Link
- `POST /api/plaid/exchange-token` - Store new Plaid connection

### Core Components
- `app/page.tsx` - Main dashboard with header, stats, sync button
- `components/transactions/data-table.tsx` - Full-featured data table with:
  - Sorting by date, merchant, amount, category
  - Filtering by merchant and category
  - Pagination (25/50/100/200 rows)
  - Status badges (pending/cleared)
  - Color-coded amounts (red/green)

## Database Schema Overview

### entities
Financial entities (Personal, Properties, Business)
- Used to organize transactions by owner/responsibility

### plaid_items
Connected bank accounts via Plaid
- Stores access tokens and sync cursors
- Tracks sync status and errors

### categories
Hierarchical category tree
- `parent_id` enables nested structure
- Optional color and icon for UI

### transactions
Main transaction data
- Links to entity, category, and plaid_item
- Stores both Plaid data and user edits
- Deduplication via `plaid_transaction_id`

### category_rules
Auto-tagging rules
- Pattern matching on merchant names
- Pattern matching on Plaid categories
- Optional amount ranges
- Priority-based rule application

## Development Workflow

1. **Setup**: Install dependencies, configure `.env.local`
2. **Database**: Run schema in Supabase or SQLite
3. **Run**: `npm run dev`
4. **Connect**: Use "Connect Account" to add Plaid items
5. **Sync**: Use "Sync Transactions" to fetch data
6. **Tag**: Manually categorize or create auto-tag rules

## Next Development Tasks

- [ ] Add category management UI
- [ ] Add entity management UI  
- [ ] Build rule builder interface
- [ ] Add inline editing to data table
- [ ] Create transaction detail drawer
- [ ] Add bulk operations
- [ ] Implement search across all fields
- [ ] Add date range filtering
- [ ] Create analytics dashboard
- [ ] Add export functionality (CSV/Excel)
