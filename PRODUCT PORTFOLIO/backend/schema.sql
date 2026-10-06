CREATE TABLE IF NOT EXISTS products (
 product_id TEXT PRIMARY KEY, product_name TEXT NOT NULL, stage TEXT NOT NULL,
 status TEXT, blocked INTEGER NOT NULL DEFAULT 0, blocker_reason TEXT, next_action TEXT,
 folder_id TEXT, folder_url TEXT, location TEXT, hero_asset_id TEXT, hero_asset_url TEXT, hero_kind TEXT,
 has_specs INTEGER DEFAULT 0, has_3mf INTEGER DEFAULT 0, has_marketplace INTEGER DEFAULT 0,
 printed INTEGER DEFAULT 0, published INTEGER DEFAULT 0, needs_review INTEGER DEFAULT 0,
 updated_at TEXT NOT NULL, last_update_source TEXT NOT NULL DEFAULT 'folder_reconciliation'
);
CREATE TABLE IF NOT EXISTS history (
 id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL, at TEXT NOT NULL,
 source TEXT NOT NULL, field TEXT NOT NULL, old_value TEXT, new_value TEXT, note TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_stage ON products(stage);
CREATE INDEX IF NOT EXISTS idx_history_product ON history(product_id,at);
