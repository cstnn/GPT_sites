# Product Dashboard Backend

Cloudflare Worker + D1 backend for the private Product Development Dashboard.

## Access model
No authentication layer is used. This is a personal dashboard. Do not put secrets in browser code; any GitHub/Drive credentials used by synchronization jobs must remain server-side as Worker secrets.

Because the endpoint is unauthenticated, anyone who discovers the deployed URL can call the dashboard API. Keep sensitive information out of the dashboard data.

## Deploy
1. Create D1 database `product-dashboard`.
2. Replace `REPLACE_AFTER_D1_CREATE` in wrangler.toml with its database ID.
3. Apply `schema.sql` to D1.
4. Deploy the Worker.
5. Set the dashboard API base URL to the Worker route.
6. Seed/reconcile D1 from the generated portfolio snapshot.

The API supports:
- GET /api/products
- PATCH /api/products/:product_id

PATCH records explicit dashboard stage changes in the history table.

## Schema 4 upgrade
For an existing database, apply migrations/0002_status_publication.sql once before deploying the updated Worker; do not also run this migration on a fresh schema.sql database. The migration preserves history and introduces nullable independent platform flags. The Pages board continues using JSON and browser overrides, not this optional API. No Worker deployment is configured (database_id is a placeholder).

Seed snapshots retain complete product metadata in snapshot_json (including assessments, hero references and historical events); scalar fields support API filtering and updates. Apply a current canonical seed after migration to populate this metadata. The API history endpoint contains API change events; preexisting workflow history remains in each product's snapshot history.
