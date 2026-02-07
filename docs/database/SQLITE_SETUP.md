# SQLite Setup Guide

Your app now uses SQLite instead of Supabase for local database storage!

## What Changed

✅ **Database**: SQLite (local file at `finance.db`)  
✅ **No External Services**: Everything runs locally  
✅ **Same Schema**: All tables and relationships preserved  
✅ **Simpler Setup**: No account or API keys needed  

## Database Location

Your database file: `/Users/johnclem/Documents/Cursor/Quicken App/finance.db`

## Environment Variables

Update your `.env.local` file - **remove** these Supabase variables:

```env
# Remove these lines:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Keep only Plaid variables:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-sandbox-secret
PLAID_ENV=sandbox
```

## Database Management

### View Your Data

```bash
# Open SQLite shell
sqlite3 finance.db

# List all tables
.tables

# View transactions
SELECT * FROM transactions LIMIT 10;

# View entities
SELECT * FROM entities;

# Exit
.quit
```

### Common Queries

```sql
-- Count transactions
SELECT COUNT(*) FROM transactions;

-- View transactions with details
SELECT 
  t.date,
  t.merchant_name,
  t.amount,
  c.name as category
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.date DESC
LIMIT 20;

-- View connected accounts
SELECT * FROM plaid_items;
```

### Backup Your Database

```bash
# Create a backup
cp finance.db finance-backup-$(date +%Y%m%d).db

# Or use SQLite backup
sqlite3 finance.db ".backup finance-backup.db"
```

### Reset Database

If you need to start fresh:

```bash
# Delete the database
rm finance.db

# Recreate it
sqlite3 finance.db < scripts/setup-sqlite.sql
```

## Add Sample Entities

To test the app, add some sample entities:

```bash
sqlite3 finance.db << 'EOF'
INSERT INTO entities (id, name, description) VALUES
  (lower(hex(randomblob(16))), 'Personal', 'Personal finances'),
  (lower(hex(randomblob(16))), '113 29th St', 'Property at 113 29th Street'),
  (lower(hex(randomblob(16))), 'Handled', 'Business entity');
EOF
```

Or use SQL directly:

```sql
INSERT INTO entities (id, name, description) VALUES
  (lower(hex(randomblob(16))), 'Personal', 'Personal finances');
```

## Database Schema

Your database has these tables:

- **entities** - Financial entities (Personal, Properties, etc.)
- **plaid_items** - Connected bank accounts
- **categories** - Hierarchical category tree
- **transactions** - Transaction data
- **category_rules** - Auto-tagging rules

## Advantages of SQLite

✅ **Local Storage**: Everything on your machine  
✅ **Fast**: No network latency  
✅ **Simple**: Single file database  
✅ **Portable**: Easy to backup/move  
✅ **Free**: No service costs  

## Limitations

⚠️ **Single User**: Not designed for concurrent multi-user access  
⚠️ **Local Only**: Not accessible from other devices  
⚠️ **Manual Backups**: You need to backup `finance.db` yourself  

## Migration to Supabase Later

If you want to switch to Supabase later:

1. Export data from SQLite
2. Set up Supabase project
3. Run `supabase/schema.sql` in Supabase
4. Import data
5. Update environment variables
6. Switch back to using Supabase client

## Troubleshooting

### Database Locked

If you get "database is locked":
- Close any other SQLite connections
- Restart your dev server

### Table Doesn't Exist

If you get "no such table":
```bash
sqlite3 finance.db < scripts/setup-sqlite.sql
```

### Permission Denied

If you can't write to the database:
```bash
chmod 644 finance.db
```

## Next Steps

1. Update `.env.local` (remove Supabase variables)
2. Restart your dev server: `npm run dev`
3. Connect a Plaid account
4. Sync transactions
5. View your data: `sqlite3 finance.db`

Your transactions are now stored in `finance.db` - a single file you can backup, share, or move around!
