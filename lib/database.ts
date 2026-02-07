import Database from "better-sqlite3";
import path from "path";

// Initialize SQLite database
const dbPath = path.join(process.cwd(), "finance.db");
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Database types (same as Supabase for compatibility)
export type Tag = {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

// Legacy type alias for backward compatibility
export type Entity = Tag;

export type PlaidItem = {
  id: string;
  item_id: string;
  access_token: string;
  institution_id: string | null;
  institution_name: string | null;
  account_type: string;
  account_name: string | null;
  custom_name: string | null;
  is_hidden: boolean;
  current_balance: number;
  balance_currency_code: string;
  cursor: string | null;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
  // Additional Plaid account fields
  plaid_account_id: string | null;
  mask: string | null;
  official_name: string | null;
  account_subtype: string | null;
  available_balance: number | null;
  balance_limit: number | null;
  unofficial_currency_code: string | null;
  balance_last_updated_datetime: string | null;
  verification_status: string | null;
  verification_name: string | null;
  verification_insights: any | null; // JSON object
  persistent_account_id: string | null;
  holder_category: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_parent_category: boolean;
  plaid_detailed_category_id: string | null;
  plaid_primary_category: string | null;
  plaid_description: string | null;
  created_at: string;
  updated_at: string;
};

export type PlaidPfcCategory = {
  id: string;
  primary_category: string;
  detailed_category: string;
  description: string | null;
  default_merchant_category_id: string | null;
  default_merchant_category_name?: string | null; // Enriched from join
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  plaid_transaction_id: string | null;
  plaid_item_id: string | null;
  account_id: string | null;
  date: string;
  amount: number;
  merchant_name: string | null;
  plaid_merchant_name: string | null; // Original Plaid merchant name (preserved, read-only)
  tag_id: string | null;
  entity_id: string | null; // Legacy field for backward compatibility
  category_id: string | null;
  pending: boolean;
  notes: string | null;
  is_recurring: boolean;
  is_reviewed: boolean;
  // Additional Plaid fields
  payment_channel: string | null;
  transaction_code: string | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  authorized_date: string | null;
  authorized_datetime: string | null;
  datetime: string | null;
  check_number: string | null;
  merchant_entity_id: string | null;
  logo_url: string | null;
  website: string | null;
  account_owner: string | null;
  pending_transaction_id: string | null;
  location: any; // JSON object with address, city, region, etc.
  payment_meta: any; // JSON object with payment metadata
  personal_finance_category_detailed: any; // JSON object with detailed category info
  original_description: string | null;
  // New Plaid fields (v2)
  counterparties: any; // JSON array of counterparty objects
  personal_finance_category_icon_url: string | null;
  personal_finance_category_version: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionEnriched = Transaction & {
  tag_name: string | null;
  entity_name: string | null; // Legacy field for backward compatibility
  category_name: string | null;
  institution_name: string | null;
};

export type InvestmentTransaction = {
  id: string;
  plaid_investment_transaction_id: string | null;
  plaid_item_id: string | null;
  account_id: string | null;
  security_id: string | null;
  date: string;
  name: string;
  amount: number;
  quantity: number | null;
  price: number | null;
  fees: number | null;
  type: string;
  subtype: string | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestmentTransactionEnriched = InvestmentTransaction & {
  security_name: string | null;
  security_ticker: string | null;
  institution_name: string | null;
};

export type Security = {
  id: string;
  plaid_security_id: string;
  name: string;
  ticker_symbol: string | null;
  isin: string | null;
  cusip: string | null;
  sedol: string | null;
  close_price: number | null;
  close_price_as_of: string | null;
  type: string | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRule = {
  id: string;
  merchant_pattern: string | null;
  plaid_category_pattern: string | null;
  amount_min: number | null;
  amount_max: number | null;
  category_id: string;
  tag_id: string | null;
  entity_id: string | null; // Legacy field for backward compatibility
  priority: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TablePreferences = {
  id: string;
  context_type: 'account' | 'category' | 'all' | 'merchants';
  context_id: string | null;
  column_visibility: Record<string, boolean>;
  column_order: string[];
  column_sizing: Record<string, number>;
  sorting: Array<{ id: string; desc: boolean }>;
  created_at: string;
  updated_at: string;
};

export type Merchant = {
  id: string;
  name: string;
  default_category_id: string | null;
  default_tag_id: string | null;
  default_entity_id: string | null; // Legacy field for backward compatibility
  notes: string | null;
  is_confirmed: boolean;
  merged_into_merchant_id: string | null;
  logo_url: string | null;
  confidence_level: string | null;
  merchant_entity_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MerchantWithStats = {
  id: string;
  name: string;
  default_category_id: string | null;
  default_tag_id: string | null;
  default_entity_id: string | null; // Legacy field for backward compatibility
  default_category_name: string | null;
  default_tag_name: string | null;
  default_entity_name: string | null; // Legacy field for backward compatibility
  notes: string | null;
  is_confirmed: boolean;
  merged_into_merchant_id: string | null;
  logo_url: string | null;
  confidence_level: string | null;
  merchant_entity_id: string | null;
  total_amount: number;
  transaction_count: number;
  last_transaction_date: string | null;
  created_at: string;
  updated_at: string;
};

// Helper function to generate UUIDs (SQLite doesn't have built-in UUID)
function generateId(): string {
  return crypto.randomUUID();
}

// Helper to convert boolean to SQLite integer
function boolToInt(val: boolean): number {
  return val ? 1 : 0;
}

// Helper to convert SQLite integer to boolean
function intToBool(val: number): boolean {
  return val === 1;
}

// Database operations
export const database = {
  // Tags
  getTags: () => {
    return db.prepare("SELECT * FROM tags ORDER BY name").all() as Tag[];
  },

  getTag: (id: string) => {
    return db.prepare("SELECT * FROM tags WHERE id = ?").get(id) as Tag | undefined;
  },

  createTag: (tag: { name: string; color?: string | null }): Tag => {
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO tags (id, name, color)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, tag.name, tag.color || null);
    return database.getTag(id)!;
  },

  updateTag: (id: string, updates: { name?: string; color?: string | null }): Tag => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.color !== undefined) {
      fields.push("color = ?");
      values.push(updates.color);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      const stmt = db.prepare(`UPDATE tags SET ${fields.join(", ")} WHERE id = ?`);
      stmt.run(...values);
    }

    return database.getTag(id)!;
  },

  deleteTag: (id: string): void => {
    db.prepare("DELETE FROM tags WHERE id = ?").run(id);
  },

  // Legacy function for backward compatibility
  getEntities: () => {
    return db.prepare("SELECT * FROM tags ORDER BY name").all() as Tag[];
  },

  // Categories
  getCategories: () => {
    const rows = db.prepare("SELECT * FROM categories ORDER BY name").all() as Array<any>;
    return rows.map(row => ({
      ...row,
      is_parent_category: intToBool(row.is_parent_category || 0),
    })) as Category[];
  },

  getCategoriesWithPfcCounts: () => {
    // Deprecated: PFC mappings are now direct via plaid_detailed_category_id
    // This function now just returns categories with pfc_mapping_count = 1 if they have a plaid_detailed_category_id
    // Check if plaid columns exist first
    const tableInfo = db.prepare("PRAGMA table_info(categories)").all() as Array<{ name: string }>;
    const hasPlaidFields = tableInfo.some(col => col.name === "plaid_detailed_category_id");
    
    let query: string;
    if (hasPlaidFields) {
      query = `
        SELECT
          c.*,
          CASE WHEN c.plaid_detailed_category_id IS NOT NULL THEN 1 ELSE 0 END as pfc_mapping_count,
          c.plaid_detailed_category_id as pfc_categories
        FROM categories c
        ORDER BY c.is_parent_category DESC, c.name
      `;
    } else {
      // Fallback if plaid fields don't exist yet
      query = `
        SELECT
          c.*,
          0 as pfc_mapping_count,
          NULL as pfc_categories
        FROM categories c
        ORDER BY c.is_parent_category DESC, c.name
      `;
    }
    
    const rows = db.prepare(query).all() as Array<any>;
    return rows.map(row => ({
      ...row,
      is_parent_category: intToBool(row.is_parent_category || 0),
      pfc_mapping_count: row.pfc_mapping_count || 0,
      pfc_categories: row.pfc_categories || null,
    })) as Array<Category & { pfc_mapping_count: number; pfc_categories: string | null }>;
  },

  createCategory: (data: {
    name: string;
    parent_id?: string | null;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    is_parent_category?: boolean;
    plaid_detailed_category_id?: string | null;
    plaid_primary_category?: string | null;
    plaid_description?: string | null;
  }): Category => {
    const stmt = db.prepare(`
      INSERT INTO categories (name, parent_id, description, color, icon, is_parent_category, plaid_detailed_category_id, plaid_primary_category, plaid_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.name, 
      data.parent_id || null, 
      data.description || null, 
      data.color || null, 
      data.icon || null,
      boolToInt(data.is_parent_category || false),
      data.plaid_detailed_category_id || null,
      data.plaid_primary_category || null,
      data.plaid_description || null
    );
    const result = db.prepare("SELECT * FROM categories ORDER BY rowid DESC LIMIT 1").get() as any;
    return {
      ...result,
      is_parent_category: intToBool(result.is_parent_category || 0),
    } as Category;
  },

  updateCategory: (id: string, data: {
    name?: string;
    parent_id?: string | null;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    is_parent_category?: boolean;
    plaid_detailed_category_id?: string | null;
    plaid_primary_category?: string | null;
    plaid_description?: string | null;
  }): Category => {
    // If changing a parent category to a non-parent category, unassign all child categories
    if (data.is_parent_category === false) {
      const currentCategory = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any;
      const isCurrentlyParent = intToBool(currentCategory?.is_parent_category || 0);
      if (isCurrentlyParent) {
        // Unassign all child categories
        db.prepare("UPDATE categories SET parent_id = NULL WHERE parent_id = ?").run(id);
      }
    }

    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.parent_id !== undefined) {
      fields.push("parent_id = ?");
      values.push(data.parent_id);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.color !== undefined) {
      fields.push("color = ?");
      values.push(data.color);
    }
    if (data.icon !== undefined) {
      fields.push("icon = ?");
      values.push(data.icon);
    }
    if (data.is_parent_category !== undefined) {
      fields.push("is_parent_category = ?");
      values.push(boolToInt(data.is_parent_category));
    }
    if (data.plaid_detailed_category_id !== undefined) {
      fields.push("plaid_detailed_category_id = ?");
      values.push(data.plaid_detailed_category_id);
    }
    if (data.plaid_primary_category !== undefined) {
      fields.push("plaid_primary_category = ?");
      values.push(data.plaid_primary_category);
    }
    if (data.plaid_description !== undefined) {
      fields.push("plaid_description = ?");
      values.push(data.plaid_description);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      const stmt = db.prepare(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`);
      stmt.run(...values);
    }

    const result = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any;
    return {
      ...result,
      is_parent_category: intToBool(result.is_parent_category || 0),
    } as Category;
  },

  deleteCategory: (id: string): void => {
    // First, unassign all child categories to prevent orphaned references
    db.prepare("UPDATE categories SET parent_id = NULL WHERE parent_id = ?").run(id);

    // Then delete the category
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  },

  getCategoryByPlaidDetailedCategoryId: (plaidDetailedCategoryId: string): Category | null => {
    const result = db.prepare("SELECT * FROM categories WHERE plaid_detailed_category_id = ?").get(plaidDetailedCategoryId) as any;
    if (!result) return null;
    return {
      ...result,
      is_parent_category: intToBool(result.is_parent_category || 0),
    } as Category;
  },

  // Plaid Items
  getPlaidItems: () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:388',message:'getPlaidItems called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const items = db.prepare("SELECT * FROM plaid_items").all() as any[];
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:391',message:'getPlaidItems raw query result',data:{totalCount:items.length,accountIds:items.map(i=>i.id),plaidAccountIds:items.map(i=>i.plaid_account_id).filter(Boolean),syncStatuses:items.map(i=>i.sync_status),itemIds:Array.from(new Set(items.map(i=>i.item_id)))},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return items.map(item => ({
        ...item,
        is_hidden: intToBool(item.is_hidden || 0),
        verification_insights: item.verification_insights 
          ? (typeof item.verification_insights === 'string' 
              ? JSON.parse(item.verification_insights) 
              : item.verification_insights)
          : null,
      })) as PlaidItem[];
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:402',message:'getPlaidItems error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  },

  getPlaidItemsByStatus: (status: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:413',message:'getPlaidItemsByStatus called',data:{status:status},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      // Check if table exists
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='plaid_items'
      `).get() as { name: string } | undefined;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:420',message:'Table existence check',data:{exists:!!tableExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!tableExists) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:423',message:'Table does not exist',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return [];
      }
      
      const items = db
        .prepare("SELECT * FROM plaid_items WHERE sync_status = ?")
        .all(status) as any[];
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:428',message:'getPlaidItemsByStatus result',data:{status:status,count:items.length,accountIds:items.map(i=>i.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return items.map(item => ({
        ...item,
        is_hidden: intToBool(item.is_hidden || 0),
        verification_insights: item.verification_insights 
          ? (typeof item.verification_insights === 'string' 
              ? JSON.parse(item.verification_insights) 
              : item.verification_insights)
          : null,
      })) as PlaidItem[];
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:437',message:'getPlaidItemsByStatus error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  },

  getPlaidItemsByItemId: (itemId: string) => {
    const items = db.prepare("SELECT * FROM plaid_items WHERE item_id = ?").all(itemId) as any[];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:416',message:'getPlaidItemsByItemId query result',data:{itemId:itemId,rawCount:items.length,accountIds:items.map(i=>i.id),plaidAccountIds:items.map(i=>i.plaid_account_id).filter(Boolean),syncStatuses:items.map(i=>i.sync_status)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return items.map(item => ({
      ...item,
      is_hidden: intToBool(item.is_hidden || 0),
      verification_insights: item.verification_insights 
        ? (typeof item.verification_insights === 'string' 
            ? JSON.parse(item.verification_insights) 
            : item.verification_insights)
        : null,
    })) as PlaidItem[];
  },

  getPlaidItemByAccountId: (plaidAccountId: string) => {
    const item = db.prepare("SELECT * FROM plaid_items WHERE plaid_account_id = ?").get(plaidAccountId) as any;
    if (!item) return null;
    return {
      ...item,
      is_hidden: intToBool(item.is_hidden || 0),
      verification_insights: item.verification_insights 
        ? (typeof item.verification_insights === 'string' 
            ? JSON.parse(item.verification_insights) 
            : item.verification_insights)
        : null,
    } as PlaidItem;
  },

  insertPlaidItem: (item: {
    item_id: string;
    access_token: string;
    institution_id?: string;
    institution_name?: string;
    account_type?: string;
    account_name?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO plaid_items (id, item_id, access_token, institution_id, institution_name, account_type, account_name, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    const id = generateId();
    stmt.run(
      id,
      item.item_id,
      item.access_token,
      item.institution_id || null,
      item.institution_name || null,
      item.account_type || 'Cash',
      item.account_name || null
    );
    const result = db.prepare("SELECT * FROM plaid_items WHERE id = ?").get(id) as any;
    return {
      ...result,
      is_hidden: intToBool(result.is_hidden || 0),
      verification_insights: result.verification_insights 
        ? (typeof result.verification_insights === 'string' 
            ? JSON.parse(result.verification_insights) 
            : result.verification_insights)
        : null,
    } as PlaidItem;
  },

  insertPlaidItemWithAccountData: (item: {
    item_id: string;
    access_token: string;
    institution_id?: string;
    institution_name?: string;
    plaid_account_id: string;
    account_type: string;
    account_subtype?: string | null;
    account_name?: string | null;
    official_name?: string | null;
    mask?: string | null;
    current_balance: number;
    available_balance?: number | null;
    balance_limit?: number | null;
    balance_currency_code?: string;
    unofficial_currency_code?: string | null;
    balance_last_updated_datetime?: string | null;
    verification_status?: string | null;
    verification_name?: string | null;
    verification_insights?: any | null;
    persistent_account_id?: string | null;
    holder_category?: string | null;
  }) => {
    try {
      // #region agent log
      try { fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:544',message:'insertPlaidItemWithAccountData called',data:{plaidAccountId:item.plaid_account_id,itemId:item.item_id,accountType:item.account_type},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{}); } catch(e){}
      // #endregion
      
      // Defensive check: ensure required columns exist
      const tableInfo = db.prepare("PRAGMA table_info(plaid_items)").all() as Array<{ name: string }>;
      const columnNames = new Set(tableInfo.map(col => col.name));
      const requiredColumns = [
        { name: 'plaid_account_id', sql: "ALTER TABLE plaid_items ADD COLUMN plaid_account_id TEXT;" },
        { name: 'account_type', sql: "ALTER TABLE plaid_items ADD COLUMN account_type TEXT DEFAULT 'Cash';" },
        { name: 'account_name', sql: "ALTER TABLE plaid_items ADD COLUMN account_name TEXT;" },
        { name: 'custom_name', sql: "ALTER TABLE plaid_items ADD COLUMN custom_name TEXT;" },
        { name: 'is_hidden', sql: "ALTER TABLE plaid_items ADD COLUMN is_hidden INTEGER DEFAULT 0;" },
        { name: 'current_balance', sql: "ALTER TABLE plaid_items ADD COLUMN current_balance REAL DEFAULT 0;" },
        { name: 'balance_currency_code', sql: "ALTER TABLE plaid_items ADD COLUMN balance_currency_code TEXT DEFAULT 'USD';" },
        { name: 'mask', sql: "ALTER TABLE plaid_items ADD COLUMN mask TEXT;" },
        { name: 'official_name', sql: "ALTER TABLE plaid_items ADD COLUMN official_name TEXT;" },
        { name: 'account_subtype', sql: "ALTER TABLE plaid_items ADD COLUMN account_subtype TEXT;" },
        { name: 'available_balance', sql: "ALTER TABLE plaid_items ADD COLUMN available_balance REAL;" },
        { name: 'balance_limit', sql: "ALTER TABLE plaid_items ADD COLUMN balance_limit REAL;" },
        { name: 'unofficial_currency_code', sql: "ALTER TABLE plaid_items ADD COLUMN unofficial_currency_code TEXT;" },
        { name: 'balance_last_updated_datetime', sql: "ALTER TABLE plaid_items ADD COLUMN balance_last_updated_datetime TEXT;" },
        { name: 'verification_status', sql: "ALTER TABLE plaid_items ADD COLUMN verification_status TEXT;" },
        { name: 'verification_name', sql: "ALTER TABLE plaid_items ADD COLUMN verification_name TEXT;" },
        { name: 'verification_insights', sql: "ALTER TABLE plaid_items ADD COLUMN verification_insights TEXT;" },
        { name: 'persistent_account_id', sql: "ALTER TABLE plaid_items ADD COLUMN persistent_account_id TEXT;" },
        { name: 'holder_category', sql: "ALTER TABLE plaid_items ADD COLUMN holder_category TEXT;" }
      ];
      
      for (const col of requiredColumns) {
        if (!columnNames.has(col.name)) {
          try {
            db.exec(col.sql);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:570',message:'Added missing column on-the-fly',data:{column:col.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H'})}).catch(()=>{});
            // #endregion
          } catch (e: any) {
            if (!e.message?.includes('duplicate column')) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:574',message:'Error adding column on-the-fly',data:{error:e.message,column:col.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H'})}).catch(()=>{});
              // #endregion
              throw e;
            }
          }
        }
      }
      
      const stmt = db.prepare(`
        INSERT INTO plaid_items (
          id, item_id, access_token, institution_id, institution_name,
          plaid_account_id, account_type, account_subtype, account_name, official_name, mask,
          current_balance, available_balance, balance_limit,
          balance_currency_code, unofficial_currency_code, balance_last_updated_datetime,
          verification_status, verification_name, verification_insights,
          persistent_account_id, holder_category, sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `);
      const id = generateId();
      // #region agent log
      try { fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:558',message:'About to execute INSERT',data:{id:id,plaidAccountId:item.plaid_account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{}); } catch(e){}
      // #endregion
      
      console.log(`[DB] Inserting account ${id} for plaid_account_id ${item.plaid_account_id}`);
      stmt.run(
        id,
        item.item_id,
        item.access_token,
        item.institution_id || null,
        item.institution_name || null,
        item.plaid_account_id,
        item.account_type,
        item.account_subtype || null,
        item.account_name || null,
        item.official_name || null,
        item.mask || null,
        item.current_balance,
        item.available_balance ?? null,
        item.balance_limit ?? null,
        item.balance_currency_code || 'USD',
        item.unofficial_currency_code || null,
        item.balance_last_updated_datetime || null,
        item.verification_status || null,
        item.verification_name || null,
        item.verification_insights ? JSON.stringify(item.verification_insights) : null,
        item.persistent_account_id || null,
        item.holder_category || null
      );
      console.log(`[DB] INSERT executed for account ${id}`);
      // #region agent log
      try { fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:590',message:'INSERT executed successfully',data:{id:id,plaidAccountId:item.plaid_account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{}); } catch(e){}
      // #endregion
      const result = db.prepare("SELECT * FROM plaid_items WHERE id = ?").get(id) as any;
      console.log(`[DB] SELECT after INSERT: found=${!!result}, plaid_account_id=${result?.plaid_account_id}`);
      // #region agent log
      try { fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:593',message:'SELECT after INSERT',data:{id:id,found:!!result,plaidAccountIdInDb:result?.plaid_account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{}); } catch(e){}
      // #endregion
      if (!result) {
        throw new Error(`Account ${id} was not found after INSERT`);
      }
      return {
        ...result,
        is_hidden: intToBool(result.is_hidden || 0),
        verification_insights: result.verification_insights 
          ? (typeof result.verification_insights === 'string' 
              ? JSON.parse(result.verification_insights) 
              : result.verification_insights)
          : null,
      } as PlaidItem;
    } catch (error) {
      console.error(`[DB] Error in insertPlaidItemWithAccountData:`, error);
      // #region agent log
      try { fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:605',message:'INSERT failed',data:{error:error instanceof Error?error.message:String(error),plaidAccountId:item.plaid_account_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{}); } catch(e){}
      // #endregion
      throw error;
    }
  },

  updatePlaidItem: (id: string, updates: Partial<PlaidItem>) => {
    const fields = [];
    const values = [];

    if (updates.cursor !== undefined) {
      fields.push("cursor = ?");
      values.push(updates.cursor);
    }
    if (updates.last_sync_at !== undefined) {
      fields.push("last_sync_at = ?");
      values.push(updates.last_sync_at);
    }
    if (updates.sync_status !== undefined) {
      fields.push("sync_status = ?");
      values.push(updates.sync_status);
    }
    if (updates.error_message !== undefined) {
      fields.push("error_message = ?");
      values.push(updates.error_message);
    }
    if (updates.current_balance !== undefined) {
      fields.push("current_balance = ?");
      values.push(updates.current_balance);
    }
    if (updates.balance_currency_code !== undefined) {
      fields.push("balance_currency_code = ?");
      values.push(updates.balance_currency_code);
    }
    if (updates.custom_name !== undefined) {
      fields.push("custom_name = ?");
      values.push(updates.custom_name);
    }
    if (updates.is_hidden !== undefined) {
      fields.push("is_hidden = ?");
      values.push(updates.is_hidden ? 1 : 0);
    }
    // Additional Plaid account fields
    if (updates.plaid_account_id !== undefined) {
      fields.push("plaid_account_id = ?");
      values.push(updates.plaid_account_id);
    }
    if (updates.mask !== undefined) {
      fields.push("mask = ?");
      values.push(updates.mask);
    }
    if (updates.official_name !== undefined) {
      fields.push("official_name = ?");
      values.push(updates.official_name);
    }
    if (updates.account_subtype !== undefined) {
      fields.push("account_subtype = ?");
      values.push(updates.account_subtype);
    }
    if (updates.available_balance !== undefined) {
      fields.push("available_balance = ?");
      values.push(updates.available_balance);
    }
    if (updates.balance_limit !== undefined) {
      fields.push("balance_limit = ?");
      values.push(updates.balance_limit);
    }
    if (updates.unofficial_currency_code !== undefined) {
      fields.push("unofficial_currency_code = ?");
      values.push(updates.unofficial_currency_code);
    }
    if (updates.balance_last_updated_datetime !== undefined) {
      fields.push("balance_last_updated_datetime = ?");
      values.push(updates.balance_last_updated_datetime);
    }
    if (updates.verification_status !== undefined) {
      fields.push("verification_status = ?");
      values.push(updates.verification_status);
    }
    if (updates.verification_name !== undefined) {
      fields.push("verification_name = ?");
      values.push(updates.verification_name);
    }
    if (updates.verification_insights !== undefined) {
      fields.push("verification_insights = ?");
      values.push(updates.verification_insights ? JSON.stringify(updates.verification_insights) : null);
    }
    if (updates.persistent_account_id !== undefined) {
      fields.push("persistent_account_id = ?");
      values.push(updates.persistent_account_id);
    }
    if (updates.holder_category !== undefined) {
      fields.push("holder_category = ?");
      values.push(updates.holder_category);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);

      const stmt = db.prepare(`
        UPDATE plaid_items 
        SET ${fields.join(", ")}
        WHERE id = ?
      `);
      stmt.run(...values);
    }
  },

  getUnreviewedTransactionCount: (plaidItemId: string) => {
    const result = db
      .prepare(
        "SELECT COUNT(*) as count FROM transactions WHERE plaid_item_id = ? AND is_reviewed = 0"
      )
      .get(plaidItemId) as { count: number };
    return result.count;
  },

  // Transactions
  getTransactionsEnriched: (limit: number = 1000) => {
    try {
      const rows = db
        .prepare(
          `
        SELECT 
          t.*,
          tg.name as tag_name,
          tg.name as entity_name,
          c.name as category_name,
          pi.institution_name
        FROM transactions t
        LEFT JOIN tags tg ON t.tag_id = tg.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN plaid_items pi ON t.plaid_item_id = pi.id
        ORDER BY t.date DESC
        LIMIT ?
      `
        )
        .all(limit) as any[];

      return rows.map((row: any) => {
        try {
          return {
            ...row,
            pending: intToBool(row.pending),
            is_recurring: intToBool(row.is_recurring),
            location: row.location ? (typeof row.location === 'string' ? JSON.parse(row.location) : row.location) : null,
            payment_meta: row.payment_meta ? (typeof row.payment_meta === 'string' ? JSON.parse(row.payment_meta) : row.payment_meta) : null,
            personal_finance_category_detailed: row.personal_finance_category_detailed ? (typeof row.personal_finance_category_detailed === 'string' ? JSON.parse(row.personal_finance_category_detailed) : row.personal_finance_category_detailed) : null,
            counterparties: row.counterparties ? (typeof row.counterparties === 'string' ? JSON.parse(row.counterparties) : row.counterparties) : null,
          };
        } catch (parseError) {
          console.error("Error parsing transaction row:", parseError, row);
          // Return row with null for problematic fields
          return {
            ...row,
            pending: intToBool(row.pending),
            is_recurring: intToBool(row.is_recurring),
            location: null,
            payment_meta: null,
            personal_finance_category_detailed: null,
            counterparties: null,
          };
        }
      }) as TransactionEnriched[];
    } catch (error) {
      console.error("Error in getTransactionsEnriched:", error);
      throw error;
    }
  },

  upsertTransaction: (transaction: {
    plaid_transaction_id: string;
    plaid_item_id: string;
    account_id: string;
    date: string;
    amount: number;
    merchant_name?: string;
    plaid_merchant_name?: string; // Original Plaid merchant name (preserved)
    pending: boolean;
    category_id?: string;
    tag_id?: string;
    // Additional Plaid fields
    payment_channel?: string;
    transaction_code?: string;
    iso_currency_code?: string;
    unofficial_currency_code?: string;
    authorized_date?: string;
    authorized_datetime?: string;
    datetime?: string;
    check_number?: string;
    merchant_entity_id?: string;
    logo_url?: string;
    website?: string;
    account_owner?: string;
    pending_transaction_id?: string;
    location?: any;
    payment_meta?: any;
    personal_finance_category_detailed?: any;
    original_description?: string;
    // New Plaid fields (v2)
    counterparties?: any;
    personal_finance_category_icon_url?: string;
    personal_finance_category_version?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO transactions (
        id, plaid_transaction_id, plaid_item_id, account_id, date, amount,
        merchant_name, plaid_merchant_name, name, pending, category_id, tag_id,
        payment_channel, transaction_code,
        iso_currency_code, unofficial_currency_code,
        authorized_date, authorized_datetime, datetime,
        check_number, merchant_entity_id, logo_url, website,
        account_owner, pending_transaction_id,
        location, payment_meta, personal_finance_category_detailed, original_description,
        counterparties, personal_finance_category_icon_url, personal_finance_category_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(plaid_transaction_id) DO UPDATE SET
        account_id = excluded.account_id,
        date = excluded.date,
        amount = excluded.amount,
        merchant_name = excluded.merchant_name,
        plaid_merchant_name = COALESCE(transactions.plaid_merchant_name, excluded.plaid_merchant_name),
        name = excluded.name,
        pending = excluded.pending,
        category_id = excluded.category_id,
        tag_id = excluded.tag_id,
        payment_channel = excluded.payment_channel,
        transaction_code = excluded.transaction_code,
        iso_currency_code = excluded.iso_currency_code,
        unofficial_currency_code = excluded.unofficial_currency_code,
        authorized_date = excluded.authorized_date,
        authorized_datetime = excluded.authorized_datetime,
        datetime = excluded.datetime,
        check_number = excluded.check_number,
        merchant_entity_id = excluded.merchant_entity_id,
        logo_url = excluded.logo_url,
        website = excluded.website,
        account_owner = excluded.account_owner,
        pending_transaction_id = excluded.pending_transaction_id,
        location = excluded.location,
        payment_meta = excluded.payment_meta,
        personal_finance_category_detailed = excluded.personal_finance_category_detailed,
        original_description = excluded.original_description,
        counterparties = excluded.counterparties,
        personal_finance_category_icon_url = excluded.personal_finance_category_icon_url,
        personal_finance_category_version = excluded.personal_finance_category_version,
        updated_at = datetime('now')
    `);

    const id = generateId();
    // Use original_description as fallback for deprecated name field (required by schema)
    const nameValue = transaction.original_description || transaction.merchant_name || "";
    
    try {
      const result = stmt.run(
        id,
        transaction.plaid_transaction_id,
        transaction.plaid_item_id,
        transaction.account_id,
        transaction.date,
        transaction.amount,
        transaction.merchant_name || null,
        transaction.plaid_merchant_name || null,
        nameValue, // name (deprecated, but required by schema)
        boolToInt(transaction.pending),
        transaction.category_id || null,
        transaction.tag_id || null,
        transaction.payment_channel || null,
        transaction.transaction_code || null,
        transaction.iso_currency_code || null,
        transaction.unofficial_currency_code || null,
        transaction.authorized_date || null,
        transaction.authorized_datetime || null,
        transaction.datetime || null,
        transaction.check_number || null,
        transaction.merchant_entity_id || null,
        transaction.logo_url || null,
        transaction.website || null,
        transaction.account_owner || null,
        transaction.pending_transaction_id || null,
        transaction.location ? JSON.stringify(transaction.location) : null,
        transaction.payment_meta ? JSON.stringify(transaction.payment_meta) : null,
        transaction.personal_finance_category_detailed ? JSON.stringify(transaction.personal_finance_category_detailed) : null,
        transaction.original_description || null,
        transaction.counterparties ? JSON.stringify(transaction.counterparties) : null,
        transaction.personal_finance_category_icon_url || null,
        transaction.personal_finance_category_version || null
      );
      
      // Log if changes were made (1 = insert, 2 = update)
      if (result.changes === 0) {
        console.warn(`[DB] upsertTransaction: No changes made for transaction ${transaction.plaid_transaction_id}`);
      }
    } catch (error) {
      console.error(`[DB] Error upserting transaction ${transaction.plaid_transaction_id}:`, error);
      if (error instanceof Error) {
        console.error(`[DB] Error message: ${error.message}`);
        console.error(`[DB] Error stack: ${error.stack}`);
      }
      throw error; // Re-throw to surface the error
    }
  },

  updateTransaction: (plaidTransactionId: string, updates: {
    account_id?: string;
    date?: string;
    amount?: number;
    merchant_name?: string;
    plaid_merchant_name?: string; // Only set if current value is NULL (preserve original)
    pending?: boolean;
    category_id?: string;
    tag_id?: string;
    payment_channel?: string;
    transaction_code?: string;
    iso_currency_code?: string;
    unofficial_currency_code?: string;
    authorized_date?: string;
    authorized_datetime?: string;
    datetime?: string;
    check_number?: string;
    merchant_entity_id?: string;
    logo_url?: string;
    website?: string;
    account_owner?: string;
    pending_transaction_id?: string;
    location?: any;
    payment_meta?: any;
    personal_finance_category_detailed?: any;
    original_description?: string;
    // New Plaid fields (v2)
    counterparties?: any;
    personal_finance_category_icon_url?: string;
    personal_finance_category_version?: string;
  }) => {
    const fields = [];
    const values = [];

    if (updates.account_id !== undefined) {
      fields.push("account_id = ?");
      values.push(updates.account_id);
    }
    if (updates.date !== undefined) {
      fields.push("date = ?");
      values.push(updates.date);
    }
    if (updates.amount !== undefined) {
      fields.push("amount = ?");
      values.push(updates.amount);
    }
    if (updates.merchant_name !== undefined) {
      fields.push("merchant_name = ?");
      values.push(updates.merchant_name);
    }
    if (updates.plaid_merchant_name !== undefined) {
      // Only update plaid_merchant_name if it's currently NULL (preserve existing values)
      fields.push("plaid_merchant_name = COALESCE(plaid_merchant_name, ?)");
      values.push(updates.plaid_merchant_name);
    }
    if (updates.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(updates.category_id);
    }
    if (updates.tag_id !== undefined) {
      fields.push("tag_id = ?");
      values.push(updates.tag_id);
    }
    if (updates.pending !== undefined) {
      fields.push("pending = ?");
      values.push(boolToInt(updates.pending));
    }
    if (updates.payment_channel !== undefined) {
      fields.push("payment_channel = ?");
      values.push(updates.payment_channel);
    }
    if (updates.transaction_code !== undefined) {
      fields.push("transaction_code = ?");
      values.push(updates.transaction_code);
    }
    if (updates.iso_currency_code !== undefined) {
      fields.push("iso_currency_code = ?");
      values.push(updates.iso_currency_code);
    }
    if (updates.unofficial_currency_code !== undefined) {
      fields.push("unofficial_currency_code = ?");
      values.push(updates.unofficial_currency_code);
    }
    if (updates.authorized_date !== undefined) {
      fields.push("authorized_date = ?");
      values.push(updates.authorized_date);
    }
    if (updates.authorized_datetime !== undefined) {
      fields.push("authorized_datetime = ?");
      values.push(updates.authorized_datetime);
    }
    if (updates.datetime !== undefined) {
      fields.push("datetime = ?");
      values.push(updates.datetime);
    }
    if (updates.check_number !== undefined) {
      fields.push("check_number = ?");
      values.push(updates.check_number);
    }
    if (updates.merchant_entity_id !== undefined) {
      fields.push("merchant_entity_id = ?");
      values.push(updates.merchant_entity_id);
    }
    if (updates.logo_url !== undefined) {
      fields.push("logo_url = ?");
      values.push(updates.logo_url);
    }
    if (updates.website !== undefined) {
      fields.push("website = ?");
      values.push(updates.website);
    }
    if (updates.account_owner !== undefined) {
      fields.push("account_owner = ?");
      values.push(updates.account_owner);
    }
    if (updates.pending_transaction_id !== undefined) {
      fields.push("pending_transaction_id = ?");
      values.push(updates.pending_transaction_id);
    }
    if (updates.location !== undefined) {
      fields.push("location = ?");
      values.push(JSON.stringify(updates.location));
    }
    if (updates.payment_meta !== undefined) {
      fields.push("payment_meta = ?");
      values.push(JSON.stringify(updates.payment_meta));
    }
    if (updates.personal_finance_category_detailed !== undefined) {
      fields.push("personal_finance_category_detailed = ?");
      values.push(JSON.stringify(updates.personal_finance_category_detailed));
    }
    if (updates.original_description !== undefined) {
      fields.push("original_description = ?");
      values.push(updates.original_description);
    }
    if (updates.counterparties !== undefined) {
      fields.push("counterparties = ?");
      values.push(JSON.stringify(updates.counterparties));
    }
    if (updates.personal_finance_category_icon_url !== undefined) {
      fields.push("personal_finance_category_icon_url = ?");
      values.push(updates.personal_finance_category_icon_url);
    }
    if (updates.personal_finance_category_version !== undefined) {
      fields.push("personal_finance_category_version = ?");
      values.push(updates.personal_finance_category_version);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(plaidTransactionId);

      const stmt = db.prepare(`
        UPDATE transactions 
        SET ${fields.join(", ")}
        WHERE plaid_transaction_id = ?
      `);
      stmt.run(...values);
    }
  },

  deleteTransaction: (plaidTransactionId: string) => {
    db.prepare("DELETE FROM transactions WHERE plaid_transaction_id = ?").run(
      plaidTransactionId
    );
  },

  // Update transaction by ID (for manual edits)
  updateTransactionById: (id: string, updates: {
    category_id?: string | null;
    tag_id?: string | null;
    notes?: string | null;
    merchant_name?: string | null;
  }) => {
    const fields = [];
    const values = [];

    if (updates.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(updates.category_id);
    }
    if (updates.tag_id !== undefined) {
      fields.push("tag_id = ?");
      values.push(updates.tag_id);
      console.log(`[DB] Setting tag_id to: ${updates.tag_id} (type: ${typeof updates.tag_id}, isNull: ${updates.tag_id === null})`);
    }
    // Note: Removed entity_id fallback - using tag_id directly
    if (updates.notes !== undefined) {
      fields.push("notes = ?");
      values.push(updates.notes);
    }
    if (updates.merchant_name !== undefined) {
      fields.push("merchant_name = ?");
      values.push(updates.merchant_name);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);

      console.log(`[DB] Updating transaction ${id} with fields: ${fields.join(", ")}`);
      const stmt = db.prepare(`
        UPDATE transactions 
        SET ${fields.join(", ")}
        WHERE id = ?
      `);
      const result = stmt.run(...values);
      console.log(`[DB] Update result: ${result.changes} row(s) affected`);
      
      // Verify the update
      const verify = db.prepare("SELECT tag_id FROM transactions WHERE id = ?").get(id) as { tag_id: string | null } | undefined;
      console.log(`[DB] Verified tag_id after update: ${verify?.tag_id ?? "undefined"}`);
    } else {
      console.log(`[DB] No fields to update for transaction ${id}`);
    }
  },

  // Table Preferences
  getTablePreferences: (contextType: 'account' | 'category' | 'all' | 'merchants', contextId: string | null): TablePreferences | null => {
    const row = db
      .prepare("SELECT * FROM table_preferences WHERE context_type = ? AND (context_id = ? OR (context_id IS NULL AND ? IS NULL))")
      .get(contextType, contextId, contextId) as any;

    if (!row) return null;

    return {
      id: row.id,
      context_type: row.context_type,
      context_id: row.context_id,
      column_visibility: JSON.parse(row.column_visibility),
      column_order: JSON.parse(row.column_order),
      column_sizing: JSON.parse(row.column_sizing),
      sorting: JSON.parse(row.sorting),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  upsertTablePreferences: (preferences: {
    context_type: 'account' | 'category' | 'all' | 'merchants';
    context_id: string | null;
    column_visibility: Record<string, boolean>;
    column_order: string[];
    column_sizing: Record<string, number>;
    sorting: Array<{ id: string; desc: boolean }>;
  }): TablePreferences => {
    const existing = database.getTablePreferences(preferences.context_type, preferences.context_id);

    if (existing) {
      // Update existing
      const stmt = db.prepare(`
        UPDATE table_preferences
        SET column_visibility = ?,
            column_order = ?,
            column_sizing = ?,
            sorting = ?,
            updated_at = datetime('now')
        WHERE context_type = ? AND (context_id = ? OR (context_id IS NULL AND ? IS NULL))
      `);
      stmt.run(
        JSON.stringify(preferences.column_visibility),
        JSON.stringify(preferences.column_order),
        JSON.stringify(preferences.column_sizing),
        JSON.stringify(preferences.sorting),
        preferences.context_type,
        preferences.context_id,
        preferences.context_id
      );

      return database.getTablePreferences(preferences.context_type, preferences.context_id)!;
    } else {
      // Insert new
      const stmt = db.prepare(`
        INSERT INTO table_preferences (context_type, context_id, column_visibility, column_order, column_sizing, sorting)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        preferences.context_type,
        preferences.context_id,
        JSON.stringify(preferences.column_visibility),
        JSON.stringify(preferences.column_order),
        JSON.stringify(preferences.column_sizing),
        JSON.stringify(preferences.sorting)
      );

      return database.getTablePreferences(preferences.context_type, preferences.context_id)!;
    }
  },

  deleteTablePreferences: (contextType: 'account' | 'category' | 'all' | 'merchants', contextId: string | null): void => {
    db.prepare("DELETE FROM table_preferences WHERE context_type = ? AND (context_id = ? OR (context_id IS NULL AND ? IS NULL))")
      .run(contextType, contextId, contextId);
  },

  // Merchants
  getMerchants: (): Merchant[] => {
    const merchants = db.prepare("SELECT * FROM merchants ORDER BY name").all() as Array<any>;
    return merchants.map(m => ({
      ...m,
      is_confirmed: intToBool(m.is_confirmed || 0),
      merchant_entity_id: m.merchant_entity_id || null,
    })) as Merchant[];
  },

  getMerchant: (id: string): Merchant | null => {
    const merchant = db.prepare("SELECT * FROM merchants WHERE id = ?").get(id) as any;
    if (!merchant) return null;
    return {
      ...merchant,
      is_confirmed: intToBool(merchant.is_confirmed || 0),
      merchant_entity_id: merchant.merchant_entity_id || null,
    } as Merchant;
  },

  getMerchantByName: (name: string): Merchant | null => {
    const merchant = db.prepare("SELECT * FROM merchants WHERE name = ?").get(name) as any;
    if (!merchant) return null;
    return {
      ...merchant,
      is_confirmed: intToBool(merchant.is_confirmed || 0),
      merchant_entity_id: merchant.merchant_entity_id || null,
    } as Merchant;
  },

  getMerchantByEntityId: (entityId: string): Merchant | null => {
    if (!entityId) return null;
    const merchant = db.prepare("SELECT * FROM merchants WHERE merchant_entity_id = ?").get(entityId) as any;
    if (!merchant) return null;
    return {
      ...merchant,
      is_confirmed: intToBool(merchant.is_confirmed || 0),
      merchant_entity_id: merchant.merchant_entity_id || null,
    } as Merchant;
  },

  createMerchant: (merchant: { name: string; default_category_id?: string | null; default_tag_id?: string | null; default_entity_id?: string | null; merchant_entity_id?: string | null; notes?: string | null; logo_url?: string | null; confidence_level?: string | null }): Merchant => {
    const id = generateId();
    const tagId = merchant.default_tag_id || merchant.default_entity_id; // Support legacy field
    const stmt = db.prepare(`
      INSERT INTO merchants (id, name, default_category_id, default_tag_id, default_entity_id, merchant_entity_id, notes, logo_url, confidence_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      merchant.name,
      merchant.default_category_id || null,
      tagId || null,
      tagId || null, // Also store in legacy field
      merchant.merchant_entity_id || null,
      merchant.notes || null,
      merchant.logo_url || null,
      merchant.confidence_level || null
    );
    return database.getMerchant(id)!;
  },

  updateMerchant: (id: string, updates: { name?: string; default_category_id?: string | null; default_tag_id?: string | null; default_entity_id?: string | null; merchant_entity_id?: string | null; notes?: string | null; logo_url?: string | null; confidence_level?: string | null; is_confirmed?: boolean }): Merchant => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.default_category_id !== undefined) {
      fields.push("default_category_id = ?");
      values.push(updates.default_category_id);
    }
    const tagId = updates.default_tag_id !== undefined ? updates.default_tag_id : updates.default_entity_id;
    if (tagId !== undefined) {
      fields.push("default_tag_id = ?");
      values.push(tagId);
      fields.push("default_entity_id = ?");
      values.push(tagId);
    }
    if (updates.merchant_entity_id !== undefined) {
      fields.push("merchant_entity_id = ?");
      values.push(updates.merchant_entity_id);
    }
    if (updates.notes !== undefined) {
      fields.push("notes = ?");
      values.push(updates.notes);
    }
    if (updates.logo_url !== undefined) {
      fields.push("logo_url = ?");
      values.push(updates.logo_url);
    }
    if (updates.confidence_level !== undefined) {
      fields.push("confidence_level = ?");
      values.push(updates.confidence_level);
    }
    if (updates.is_confirmed !== undefined) {
      fields.push("is_confirmed = ?");
      values.push(boolToInt(updates.is_confirmed));
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      const stmt = db.prepare(`UPDATE merchants SET ${fields.join(", ")} WHERE id = ?`);
      stmt.run(...values);
    }

    return database.getMerchant(id)!;
  },

  deleteMerchant: (id: string): void => {
    db.prepare("DELETE FROM merchants WHERE id = ?").run(id);
  },

  getUniqueMerchantNames: (): string[] => {
    const result = db.prepare(`
      SELECT DISTINCT merchant_name 
      FROM transactions 
      WHERE merchant_name IS NOT NULL AND merchant_name != ''
      ORDER BY merchant_name
    `).all() as Array<{ merchant_name: string }>;
    return result.map(r => r.merchant_name);
  },

  ensureMerchantExists: (merchantName: string, logoUrl?: string | null, personalFinanceCategory?: any, merchantEntityId?: string | null): Merchant | null => {
    if (!merchantName) return null;
    
    // Extract confidence level and detailed category from PFC
    let confidenceLevel: string | null = null;
    let detailedCategory: string | null = null;
    if (personalFinanceCategory) {
      try {
        const pfc = typeof personalFinanceCategory === 'string' ? JSON.parse(personalFinanceCategory) : personalFinanceCategory;
        confidenceLevel = pfc?.confidence_level || null;
        detailedCategory = pfc?.detailed || null;
      } catch (e) {
        // If parsing fails, try to access directly
        if (personalFinanceCategory && typeof personalFinanceCategory === 'object') {
          confidenceLevel = personalFinanceCategory.confidence_level || null;
          detailedCategory = personalFinanceCategory.detailed || null;
        }
      }
    }
    
    // First, check if merchant exists by merchant_entity_id (highest priority)
    let merchant: Merchant | null = null;
    if (merchantEntityId) {
      merchant = database.getMerchantByEntityId(merchantEntityId);
    }
    
    // If not found by entity_id, check by name
    if (!merchant) {
      merchant = database.getMerchantByName(merchantName);
    }
    
    if (!merchant) {
      // Create new merchant
      // Get default category from Plaid detailed category ID if available
      let defaultCategoryId: string | null = null;
      if (detailedCategory) {
        const category = database.getCategoryByPlaidDetailedCategoryId(detailedCategory);
        if (category) {
          defaultCategoryId = category.id;
        }
      }
      
      merchant = database.createMerchant({
        name: merchantName,
        merchant_entity_id: merchantEntityId || null,
        default_category_id: defaultCategoryId,
        logo_url: logoUrl || null,
        confidence_level: confidenceLevel,
        notes: null, // No longer storing entity_id in notes
      });
    } else {
      // Update existing merchant with new data if missing
      const updates: any = {};
      
      // Update merchant_entity_id if not set and we have one
      if (merchantEntityId && !merchant.merchant_entity_id) {
        updates.merchant_entity_id = merchantEntityId;
      }
      
      if (logoUrl && !merchant.logo_url) {
        updates.logo_url = logoUrl;
      }
      if (confidenceLevel && !merchant.confidence_level) {
        updates.confidence_level = confidenceLevel;
      }
      
      if (Object.keys(updates).length > 0) {
        database.updateMerchant(merchant.id, updates);
        merchant = database.getMerchant(merchant.id)!;
      }
    }
    
    return merchant;
  },

  syncMerchantsFromTransactions: (): { created: number; updated: number } => {
    const transactions = db.prepare(`
      SELECT DISTINCT merchant_name, logo_url, personal_finance_category_detailed, merchant_entity_id
      FROM transactions
      WHERE merchant_name IS NOT NULL AND merchant_name != ''
    `).all() as Array<{
      merchant_name: string;
      logo_url: string | null;
      personal_finance_category_detailed: any;
      merchant_entity_id: string | null;
    }>;
    
    let created = 0;
    let updated = 0;
    
    for (const txn of transactions) {
      const existing = database.getMerchantByName(txn.merchant_name);
      const hadLogo = existing?.logo_url || false;
      const hadConfidence = existing?.confidence_level || false;
      
      const merchant = database.ensureMerchantExists(
        txn.merchant_name,
        txn.logo_url,
        txn.personal_finance_category_detailed,
        txn.merchant_entity_id
      );
      
      if (!existing && merchant) {
        created++;
      } else if (existing && merchant) {
        // Check if anything was updated
        if (txn.logo_url && !hadLogo) updated++;
        if (!hadConfidence && txn.personal_finance_category_detailed) {
          // Try to extract confidence level
          try {
            const pfc = typeof txn.personal_finance_category_detailed === 'string' 
              ? JSON.parse(txn.personal_finance_category_detailed) 
              : txn.personal_finance_category_detailed;
            if (pfc?.confidence_level) updated++;
          } catch {}
        }
      }
    }
    
    return { created, updated };
  },

  getMerchantsWithStats: (): MerchantWithStats[] => {
    const query = `
      WITH all_merchants AS (
        -- Merchants from merchants table
        SELECT 
          m.id,
          m.name,
          m.default_category_id,
          m.default_tag_id,
          m.default_entity_id,
          m.merchant_entity_id,
          m.notes,
          m.is_confirmed,
          m.merged_into_merchant_id,
          m.logo_url,
          m.confidence_level,
          m.created_at,
          m.updated_at
        FROM merchants m
        WHERE m.merged_into_merchant_id IS NULL
        
        UNION
        
        -- Merchants from transactions that don't exist in merchants table
        SELECT 
          NULL as id,
          t.merchant_name as name,
          NULL as default_category_id,
          NULL as default_tag_id,
          NULL as default_entity_id,
          NULL as merchant_entity_id,
          NULL as notes,
          0 as is_confirmed,
          NULL as merged_into_merchant_id,
          (SELECT logo_url FROM transactions WHERE merchant_name = t.merchant_name AND logo_url IS NOT NULL ORDER BY date DESC LIMIT 1) as logo_url,
          NULL as confidence_level,
          MIN(t.date) as created_at,
          MAX(t.date) as updated_at
        FROM transactions t
        WHERE t.merchant_name IS NOT NULL 
          AND t.merchant_name != ''
          AND NOT EXISTS (
            SELECT 1 FROM merchants m2 WHERE m2.name = t.merchant_name
          )
        GROUP BY t.merchant_name
      )
      SELECT 
        am.id,
        am.name,
        am.default_category_id,
        am.default_tag_id,
        am.default_entity_id,
        COALESCE(am.merchant_entity_id, (SELECT merchant_entity_id FROM transactions WHERE merchant_name = am.name AND merchant_entity_id IS NOT NULL AND merchant_entity_id != '' ORDER BY date DESC LIMIT 1)) as merchant_entity_id,
        am.notes,
        am.is_confirmed,
        am.merged_into_merchant_id,
        am.logo_url,
        am.confidence_level,
        am.created_at,
        am.updated_at,
        c.name as default_category_name,
        tg.name as default_tag_name,
        tg.name as default_entity_name,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id) as transaction_count,
        MAX(t.date) as last_transaction_date,
        (SELECT logo_url FROM transactions WHERE merchant_name = am.name AND logo_url IS NOT NULL ORDER BY date DESC LIMIT 1) as latest_logo_url,
        (SELECT personal_finance_category_detailed FROM transactions WHERE merchant_name = am.name AND personal_finance_category_detailed IS NOT NULL ORDER BY date DESC LIMIT 1) as latest_pfc,
        (SELECT personal_finance_category_icon_url FROM transactions WHERE merchant_name = am.name AND personal_finance_category_icon_url IS NOT NULL ORDER BY date DESC LIMIT 1) as latest_counterparties
      FROM all_merchants am
      LEFT JOIN categories c ON am.default_category_id = c.id
      LEFT JOIN tags tg ON am.default_tag_id = tg.id
      LEFT JOIN transactions t ON t.merchant_name = am.name
      GROUP BY am.name
      ORDER BY transaction_count DESC, am.name
    `;
    
    const merchants = db.prepare(query).all() as Array<any>;
    return merchants.map(m => {
      // Parse confidence level from counterparties data (currently in personal_finance_category_icon_url due to column scramble)
      let confidenceLevel = m.confidence_level;
      if (!confidenceLevel && m.latest_counterparties) {
        try {
          const counterparties = typeof m.latest_counterparties === 'string' ? JSON.parse(m.latest_counterparties) : m.latest_counterparties;
          if (Array.isArray(counterparties) && counterparties.length > 0) {
            confidenceLevel = counterparties[0]?.confidence_level || null;
          }
        } catch {}
      }
      // Fallback to PFC data
      if (!confidenceLevel && m.latest_pfc) {
        try {
          const pfc = typeof m.latest_pfc === 'string' ? JSON.parse(m.latest_pfc) : m.latest_pfc;
          confidenceLevel = pfc?.confidence_level || null;
        } catch {}
      }
      
      // Generate ID for merchants from transactions if missing
      const id = m.id || generateId();
      
      return {
        ...m,
        id,
        is_confirmed: intToBool(m.is_confirmed || 0),
        logo_url: m.latest_logo_url || m.logo_url,
        confidence_level: confidenceLevel,
        merchant_entity_id: m.merchant_entity_id || null,
        total_amount: m.total_amount || 0,
        transaction_count: m.transaction_count || 0,
      };
    }) as MerchantWithStats[];
  },

  getTransactionsByMerchant: (merchantName: string): TransactionEnriched[] => {
    const query = `
      SELECT 
        t.*,
        tg.name as tag_name,
        tg.name as entity_name,
        c.name as category_name,
        pi.institution_name
      FROM transactions t
      LEFT JOIN tags tg ON t.tag_id = tg.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN plaid_items pi ON t.plaid_item_id = pi.id
      WHERE t.merchant_name = ?
      ORDER BY t.date DESC
    `;
    
    const transactions = db.prepare(query).all(merchantName) as Array<any>;
    return transactions.map(t => ({
      ...t,
      pending: intToBool(t.pending || 0),
      is_recurring: intToBool(t.is_recurring || 0),
      is_reviewed: intToBool(t.is_reviewed || 0),
      location: t.location ? (typeof t.location === 'string' ? JSON.parse(t.location) : t.location) : null,
      payment_meta: t.payment_meta ? (typeof t.payment_meta === 'string' ? JSON.parse(t.payment_meta) : t.payment_meta) : null,
      personal_finance_category_detailed: t.personal_finance_category_detailed ? (typeof t.personal_finance_category_detailed === 'string' ? JSON.parse(t.personal_finance_category_detailed) : t.personal_finance_category_detailed) : null,
      counterparties: t.counterparties ? (typeof t.counterparties === 'string' ? JSON.parse(t.counterparties) : t.counterparties) : null,
    })) as TransactionEnriched[];
  },

  confirmMerchant: (merchantId: string): void => {
    db.prepare("UPDATE merchants SET is_confirmed = 1, updated_at = datetime('now') WHERE id = ?").run(merchantId);
  },

  mergeMerchants: (sourceMerchantId: string, targetMerchantId: string): void => {
    const sourceMerchant = database.getMerchant(sourceMerchantId);
    const targetMerchant = database.getMerchant(targetMerchantId);
    
    if (!sourceMerchant || !targetMerchant) {
      throw new Error('Source or target merchant not found');
    }

    // Update all transactions with source merchant name to target merchant name
    db.prepare(`
      UPDATE transactions 
      SET merchant_name = ?, updated_at = datetime('now')
      WHERE merchant_name = ?
    `).run(targetMerchant.name, sourceMerchant.name);

    // Mark source merchant as merged
    db.prepare(`
      UPDATE merchants 
      SET merged_into_merchant_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(targetMerchantId, sourceMerchantId);
  },

  bulkUpdateMerchantTransactions: (merchantName: string, updates: {
    category_id?: string | null;
    tag_id?: string | null;
    entity_id?: string | null; // Legacy field
  }): number => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(updates.category_id);
    }
    const tagId = updates.tag_id !== undefined ? updates.tag_id : updates.entity_id;
    if (tagId !== undefined) {
      fields.push("tag_id = ?");
      values.push(tagId);
      fields.push("entity_id = ?");
      values.push(tagId);
    }

    if (fields.length === 0) return 0;

    fields.push("updated_at = datetime('now')");
    values.push(merchantName);

    const stmt = db.prepare(`
      UPDATE transactions 
      SET ${fields.join(", ")}
      WHERE merchant_name = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes;
  },

  // DEPRECATED: Plaid PFC Categories functions
  // These functions are deprecated. Plaid categories are now stored directly in the categories table.
  // Use getCategoryByPlaidDetailedCategoryId() instead.
  getPlaidPfcCategories: (): PlaidPfcCategory[] => {
    console.warn("getPlaidPfcCategories() is deprecated. Use categories table with plaid_detailed_category_id instead.");
    const query = `
      SELECT 
        p.*,
        c.name as default_merchant_category_name
      FROM plaid_pfc_categories p
      LEFT JOIN categories c ON p.default_merchant_category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.primary_category, p.detailed_category
    `;
    const categories = db.prepare(query).all() as Array<any>;
    return categories.map(c => ({
      ...c,
      is_active: intToBool(c.is_active || 1),
    })) as PlaidPfcCategory[];
  },

  getPlaidPfcCategory: (id: string): PlaidPfcCategory | null => {
    console.warn("getPlaidPfcCategory() is deprecated. Use categories table with plaid_detailed_category_id instead.");
    const category = db.prepare("SELECT * FROM plaid_pfc_categories WHERE id = ?").get(id) as any;
    if (!category) return null;
    return {
      ...category,
      is_active: intToBool(category.is_active || 1),
    } as PlaidPfcCategory;
  },

  updatePlaidPfcMapping: (id: string, merchantCategoryId: string | null): PlaidPfcCategory => {
    console.warn("updatePlaidPfcMapping() is deprecated. Update categories table directly instead.");
    db.prepare(`
      UPDATE plaid_pfc_categories 
      SET default_merchant_category_id = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(merchantCategoryId, id);
    return database.getPlaidPfcCategory(id)!;
  },

  getPlaidPfcMappingByDetailed: (detailedCategory: string): string | null => {
    console.warn("getPlaidPfcMappingByDetailed() is deprecated. Use getCategoryByPlaidDetailedCategoryId() instead.");
    const result = db.prepare(`
      SELECT default_merchant_category_id 
      FROM plaid_pfc_categories 
      WHERE detailed_category = ? AND is_active = 1
    `).get(detailedCategory) as any;
    return result?.default_merchant_category_id || null;
  },

  // Delete all transactions (for testing/overwrite)
  deleteAllTransactions: () => {
    const result = db.prepare("DELETE FROM transactions").run();
    return result.changes;
  },

  // Reset cursor for a Plaid item (for full resync)
  resetPlaidItemCursor: (plaidItemId: string) => {
    db.prepare("UPDATE plaid_items SET cursor = NULL WHERE id = ?").run(plaidItemId);
  },

  // Reset all Plaid item cursors (for full resync)
  resetAllPlaidItemCursors: () => {
    db.prepare("UPDATE plaid_items SET cursor = NULL").run();
  },

  // Get transaction count for a specific Plaid item (for verification)
  getTransactionCountByPlaidItemId: (plaidItemId: string) => {
    const result = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE plaid_item_id = ?").get(plaidItemId) as { count: number };
    return result.count;
  },

  // Get total transaction count (for verification)
  getTotalTransactionCount: () => {
    const result = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
    return result.count;
  },

  // Investment Transactions
  upsertInvestmentTransaction: (transaction: {
    plaid_investment_transaction_id: string;
    plaid_item_id: string;
    account_id: string;
    security_id?: string | null;
    date: string;
    name: string;
    amount: number;
    quantity?: number | null;
    price?: number | null;
    fees?: number | null;
    type: string;
    subtype?: string | null;
    iso_currency_code?: string | null;
    unofficial_currency_code?: string | null;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO investment_transactions (
        id, plaid_investment_transaction_id, plaid_item_id, account_id, security_id,
        date, name, amount, quantity, price, fees, type, subtype,
        iso_currency_code, unofficial_currency_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(plaid_investment_transaction_id) DO UPDATE SET
        account_id = excluded.account_id,
        security_id = excluded.security_id,
        date = excluded.date,
        name = excluded.name,
        amount = excluded.amount,
        quantity = excluded.quantity,
        price = excluded.price,
        fees = excluded.fees,
        type = excluded.type,
        subtype = excluded.subtype,
        iso_currency_code = excluded.iso_currency_code,
        unofficial_currency_code = excluded.unofficial_currency_code,
        updated_at = datetime('now')
    `);

    const id = generateId();
    stmt.run(
      id,
      transaction.plaid_investment_transaction_id,
      transaction.plaid_item_id,
      transaction.account_id,
      transaction.security_id || null,
      transaction.date,
      transaction.name,
      transaction.amount,
      transaction.quantity ?? null,
      transaction.price ?? null,
      transaction.fees ?? null,
      transaction.type,
      transaction.subtype || null,
      transaction.iso_currency_code || null,
      transaction.unofficial_currency_code || null
    );

    return database.getInvestmentTransaction(id)!;
  },

  getInvestmentTransaction: (id: string): InvestmentTransaction | null => {
    const row = db.prepare("SELECT * FROM investment_transactions WHERE id = ?").get(id) as any;
    if (!row) return null;
    return row as InvestmentTransaction;
  },

  getInvestmentTransactionsEnriched: (limit: number = 1000) => {
    try {
      const rows = db
        .prepare(
          `
        SELECT 
          it.*,
          s.name as security_name,
          s.ticker_symbol as security_ticker,
          pi.institution_name
        FROM investment_transactions it
        LEFT JOIN securities s ON it.security_id = s.plaid_security_id
        LEFT JOIN plaid_items pi ON it.plaid_item_id = pi.id
        ORDER BY it.date DESC
        LIMIT ?
      `
        )
        .all(limit) as any[];

      return rows.map((row: any) => ({
        ...row,
      })) as InvestmentTransactionEnriched[];
    } catch (error) {
      console.error("Error in getInvestmentTransactionsEnriched:", error);
      throw error;
    }
  },

  // Securities
  upsertSecurity: (security: {
    plaid_security_id: string;
    name: string;
    ticker_symbol?: string | null;
    isin?: string | null;
    cusip?: string | null;
    sedol?: string | null;
    close_price?: number | null;
    close_price_as_of?: string | null;
    type?: string | null;
    iso_currency_code?: string | null;
    unofficial_currency_code?: string | null;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO securities (
        id, plaid_security_id, name, ticker_symbol, isin, cusip, sedol,
        close_price, close_price_as_of, type,
        iso_currency_code, unofficial_currency_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(plaid_security_id) DO UPDATE SET
        name = excluded.name,
        ticker_symbol = excluded.ticker_symbol,
        isin = excluded.isin,
        cusip = excluded.cusip,
        sedol = excluded.sedol,
        close_price = excluded.close_price,
        close_price_as_of = excluded.close_price_as_of,
        type = excluded.type,
        iso_currency_code = excluded.iso_currency_code,
        unofficial_currency_code = excluded.unofficial_currency_code,
        updated_at = datetime('now')
    `);

    const id = generateId();
    stmt.run(
      id,
      security.plaid_security_id,
      security.name,
      security.ticker_symbol || null,
      security.isin || null,
      security.cusip || null,
      security.sedol || null,
      security.close_price ?? null,
      security.close_price_as_of || null,
      security.type || null,
      security.iso_currency_code || null,
      security.unofficial_currency_code || null
    );

    return database.getSecurity(security.plaid_security_id)!;
  },

  getSecurity: (plaidSecurityId: string): Security | null => {
    const row = db.prepare("SELECT * FROM securities WHERE plaid_security_id = ?").get(plaidSecurityId) as any;
    if (!row) return null;
    return row as Security;
  },

  getSecurities: (): Security[] => {
    return db.prepare("SELECT * FROM securities ORDER BY name").all() as Security[];
  },

  // Delete all investment transactions (for testing/overwrite)
  deleteAllInvestmentTransactions: () => {
    const result = db.prepare("DELETE FROM investment_transactions").run();
    return result.changes;
  },
};

// Initialize database schema if tables don't exist
export function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), "scripts", "setup-sqlite.sql");
  const fs = require("fs");
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
    console.log("Database initialized successfully");
  }

  // Run migrations to add tag_id column if it doesn't exist
  try {
    // Check if transactions table exists first
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='transactions'
    `).get() as { name: string } | undefined;
    
    if (!tableExists) {
      console.log("Transactions table doesn't exist yet, skipping migration");
      return;
    }
    
    // Get table info once for all column checks
    const tableInfo = db.prepare("PRAGMA table_info(transactions)").all() as Array<{ name: string }>;
    
    // Check if tag_id column exists in transactions table
    const hasTagId = tableInfo.some((col) => col.name === "tag_id");
    
    if (!hasTagId) {
      console.log("Adding tag_id column to transactions table...");
      try {
        // Create tags table if it doesn't exist
        db.exec(`
          CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          );
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`);
        
        // Add tag_id column to transactions (may fail if column exists, that's ok)
        try {
          db.exec(`ALTER TABLE transactions ADD COLUMN tag_id TEXT;`);
          db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_tag_id ON transactions(tag_id);`);
        } catch (e: any) {
          if (!e.message?.includes('duplicate column')) {
            throw e;
          }
        }
        
        // Add default_tag_id column to merchants (may fail if column exists, that's ok)
        try {
          db.exec(`ALTER TABLE merchants ADD COLUMN default_tag_id TEXT;`);
          db.exec(`CREATE INDEX IF NOT EXISTS idx_merchants_default_tag_id ON merchants(default_tag_id);`);
        } catch (e: any) {
          if (!e.message?.includes('duplicate column')) {
            throw e;
          }
        }
        
        // Create trigger for tags
        db.exec(`
          CREATE TRIGGER IF NOT EXISTS update_tags_updated_at 
          AFTER UPDATE ON tags
          BEGIN
            UPDATE tags SET updated_at = datetime('now') WHERE id = NEW.id;
          END;
        `);
        console.log("Migration completed: tag_id column added");
      } catch (migrationError: any) {
        console.error("Migration error (non-fatal):", migrationError.message);
        // Don't throw - migration errors are non-fatal
      }
    }

    // Check if plaid_merchant_name column exists in transactions table
    const hasPlaidMerchantName = tableInfo.some((col) => col.name === "plaid_merchant_name");
    
    if (!hasPlaidMerchantName) {
      console.log("Adding plaid_merchant_name column to transactions table...");
      try {
        // Add plaid_merchant_name column to transactions
        try {
          db.exec(`ALTER TABLE transactions ADD COLUMN plaid_merchant_name TEXT;`);
          db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_plaid_merchant_name ON transactions(plaid_merchant_name);`);
          
          // Backfill: copy existing merchant_name to plaid_merchant_name for existing transactions
          db.exec(`
            UPDATE transactions 
            SET plaid_merchant_name = merchant_name 
            WHERE plaid_merchant_name IS NULL AND merchant_name IS NOT NULL
          `);
          
          console.log("Migration completed: plaid_merchant_name column added");
        } catch (e: any) {
          if (!e.message?.includes('duplicate column')) {
            throw e;
          }
        }
      } catch (migrationError: any) {
        console.error("Migration error (non-fatal):", migrationError.message);
        // Don't throw - migration errors are non-fatal
      }
    }

    // Check if merchant_entity_id column exists in merchants table
    const merchantsTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='merchants'
    `).get() as { name: string } | undefined;
    
    if (merchantsTableExists) {
      const merchantsTableInfo = db.prepare("PRAGMA table_info(merchants)").all() as Array<{ name: string }>;
      const hasMerchantEntityId = merchantsTableInfo.some((col) => col.name === "merchant_entity_id");
      
      if (!hasMerchantEntityId) {
        console.log("Adding merchant_entity_id column to merchants table...");
        try {
          try {
            db.exec(`ALTER TABLE merchants ADD COLUMN merchant_entity_id TEXT;`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_merchants_merchant_entity_id ON merchants(merchant_entity_id);`);
            
            // Backfill: extract merchant_entity_id from notes field if it exists
            db.exec(`
              UPDATE merchants 
              SET merchant_entity_id = REPLACE(notes, 'Plaid Entity ID: ', '')
              WHERE notes LIKE 'Plaid Entity ID: %' AND merchant_entity_id IS NULL
            `);
            
            console.log("Migration completed: merchant_entity_id column added");
          } catch (e: any) {
            if (!e.message?.includes('duplicate column')) {
              throw e;
            }
          }
        } catch (migrationError: any) {
          console.error("Migration error (non-fatal):", migrationError.message);
          // Don't throw - migration errors are non-fatal
        }
      }
    }

    // Check if is_parent_category column exists in categories table
    const categoriesTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='categories'
    `).get() as { name: string } | undefined;
    
    if (categoriesTableExists) {
      const categoriesTableInfo = db.prepare("PRAGMA table_info(categories)").all() as Array<{ name: string }>;
      const hasIsParentCategory = categoriesTableInfo.some((col) => col.name === "is_parent_category");
      
      if (!hasIsParentCategory) {
        console.log("Adding is_parent_category column to categories table...");
        try {
          try {
            db.exec(`ALTER TABLE categories ADD COLUMN is_parent_category INTEGER NOT NULL DEFAULT 0;`);
            // Backfill: set is_parent_category = 1 for categories without a parent
            db.exec(`
              UPDATE categories 
              SET is_parent_category = 1 
              WHERE parent_id IS NULL
            `);
            console.log("Migration completed: is_parent_category column added");
          } catch (e: any) {
            if (!e.message?.includes('duplicate column')) {
              throw e;
            }
          }
        } catch (migrationError: any) {
          console.error("Migration error (non-fatal):", migrationError.message);
          // Don't throw - migration errors are non-fatal
        }
      }

      // Check if plaid fields exist in categories table
      const hasPlaidDetailedCategoryId = categoriesTableInfo.some((col) => col.name === "plaid_detailed_category_id");
      
      if (!hasPlaidDetailedCategoryId) {
        console.log("Adding plaid category fields to categories table...");
        try {
          try {
            db.exec(`ALTER TABLE categories ADD COLUMN plaid_detailed_category_id TEXT;`);
            db.exec(`ALTER TABLE categories ADD COLUMN plaid_primary_category TEXT;`);
            db.exec(`ALTER TABLE categories ADD COLUMN plaid_description TEXT;`);
            db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_plaid_detailed_category_id ON categories(plaid_detailed_category_id);`);
            console.log("Migration completed: plaid category fields added");
          } catch (e: any) {
            if (!e.message?.includes('duplicate column')) {
              throw e;
            }
          }
        } catch (migrationError: any) {
          console.error("Migration error (non-fatal):", migrationError.message);
          // Don't throw - migration errors are non-fatal
        }
      }
    }

    // Migration: Remove UNIQUE constraint from plaid_items.item_id
    // This allows multiple accounts per institution
    try {
      const plaidItemsTableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='plaid_items'
      `).get() as { name: string } | undefined;
      
      if (plaidItemsTableExists) {
        // Check the table creation SQL for UNIQUE constraint on item_id
        const tableSql = db.prepare(`
          SELECT sql FROM sqlite_master 
          WHERE type='table' AND name='plaid_items'
        `).get() as { sql: string } | undefined;
        
        // Check if item_id has UNIQUE constraint in the table definition
        // Look for patterns like "item_id TEXT NOT NULL UNIQUE" or "item_id TEXT UNIQUE"
        const hasUniqueConstraint = tableSql?.sql && 
                                    (tableSql.sql.match(/item_id\s+[^,)]*UNIQUE/i) !== null ||
                                     tableSql.sql.match(/UNIQUE\s*\([^)]*item_id/i) !== null);
        
        if (hasUniqueConstraint) {
          console.log("Running migration: Remove UNIQUE constraint from plaid_items.item_id");
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1802',message:'Starting migration',data:{tableSql:tableSql?.sql?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // Check account count before migration
          const accountCountBefore = db.prepare("SELECT COUNT(*) as count FROM plaid_items").get() as { count: number };
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1806',message:'Account count before migration',data:{count:accountCountBefore.count},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          const migrationPath = path.join(process.cwd(), "scripts", "migrate-remove-item-id-unique.sql");
          const fs = require("fs");
          
          if (fs.existsSync(migrationPath)) {
            const migration = fs.readFileSync(migrationPath, "utf8");
            try {
              db.exec(migration);
              // Check account count after migration
              const accountCountAfter = db.prepare("SELECT COUNT(*) as count FROM plaid_items").get() as { count: number };
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1815',message:'Migration completed',data:{countBefore:accountCountBefore.count,countAfter:accountCountAfter.count},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
              console.log("Migration completed: UNIQUE constraint removed from plaid_items.item_id");
            } catch (migrationExecError: any) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1819',message:'Migration execution failed',data:{error:migrationExecError instanceof Error?migrationExecError.message:String(migrationExecError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              throw migrationExecError;
            }
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1823',message:'Migration file not found',data:{path:migrationPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.warn("Migration file not found: migrate-remove-item-id-unique.sql");
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1827',message:'No migration needed',data:{tableSql:tableSql?.sql?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
        }
      }
      
      // Check if account fields exist, add them if missing (run regardless of UNIQUE constraint check)
      const plaidItemsTableInfo = db.prepare("PRAGMA table_info(plaid_items)").all() as Array<{ name: string }>;
      const hasPlaidAccountId = plaidItemsTableInfo.some((col) => col.name === "plaid_account_id");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1915',message:'Checking for plaid_account_id column',data:{hasPlaidAccountId,columns:plaidItemsTableInfo.map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (!hasPlaidAccountId) {
        console.log("Adding missing Plaid account fields to plaid_items table...");
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1919',message:'Starting to add missing columns',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        try {
          const addFieldsMigrationPath = path.join(process.cwd(), "scripts", "migrate-add-plaid-account-fields.sql");
          const fs = require("fs");
          
          if (fs.existsSync(addFieldsMigrationPath)) {
            const addFieldsMigration = fs.readFileSync(addFieldsMigrationPath, "utf8");
            db.exec(addFieldsMigration);
            console.log("Migration completed: Plaid account fields added");
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1927',message:'Migration file executed successfully',data:{path:addFieldsMigrationPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1929',message:'Migration file not found, using fallback',data:{path:addFieldsMigrationPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            // Fallback: add columns manually if migration file doesn't exist
            const columnsToAdd = [
              "ALTER TABLE plaid_items ADD COLUMN account_type TEXT DEFAULT 'Cash';",
              "ALTER TABLE plaid_items ADD COLUMN account_name TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN custom_name TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN is_hidden INTEGER DEFAULT 0;",
              "ALTER TABLE plaid_items ADD COLUMN current_balance REAL DEFAULT 0;",
              "ALTER TABLE plaid_items ADD COLUMN balance_currency_code TEXT DEFAULT 'USD';",
              "ALTER TABLE plaid_items ADD COLUMN plaid_account_id TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN mask TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN official_name TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN account_subtype TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN available_balance REAL;",
              "ALTER TABLE plaid_items ADD COLUMN balance_limit REAL;",
              "ALTER TABLE plaid_items ADD COLUMN unofficial_currency_code TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN balance_last_updated_datetime TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN verification_status TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN verification_name TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN verification_insights TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN persistent_account_id TEXT;",
              "ALTER TABLE plaid_items ADD COLUMN holder_category TEXT;"
            ];
            
            for (const sql of columnsToAdd) {
              try {
                db.exec(sql);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1952',message:'Added column',data:{sql:sql.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
              } catch (e: any) {
                if (!e.message?.includes('duplicate column')) {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1956',message:'Error adding column',data:{error:e.message,sql:sql.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                  // #endregion
                  throw e;
                }
              }
            }
            
            // Create indexes
            db.exec("CREATE INDEX IF NOT EXISTS idx_plaid_items_plaid_account_id ON plaid_items(plaid_account_id);");
            db.exec("CREATE INDEX IF NOT EXISTS idx_plaid_items_account_subtype ON plaid_items(account_subtype);");
            db.exec("CREATE INDEX IF NOT EXISTS idx_plaid_items_verification_status ON plaid_items(verification_status);");
            
            console.log("Migration completed: Plaid account fields added (fallback method)");
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1967',message:'Fallback migration completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
          }
        } catch (addFieldsError: any) {
          console.error("Error adding Plaid account fields (non-fatal):", addFieldsError.message);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71b49104-b800-4120-bb0e-4954bc1b2318',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.ts:1970',message:'Error in addFields migration',data:{error:addFieldsError instanceof Error?addFieldsError.message:String(addFieldsError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          // Don't throw - migration errors are non-fatal
        }
      }
    } catch (migrationError: any) {
      console.error("Migration error (non-fatal):", migrationError.message);
      // Don't throw - migration errors are non-fatal
    }
  } catch (error: any) {
    // Migration check errors are non-fatal
    console.error("Migration check error (non-fatal):", error.message);
  }
}

// Auto-initialize database on module load
try {
  initializeDatabase();
} catch (error: any) {
  console.error("Database initialization error (non-fatal):", error.message);
  // Don't throw - allow the app to continue even if initialization fails
  // The database might already be initialized
}
