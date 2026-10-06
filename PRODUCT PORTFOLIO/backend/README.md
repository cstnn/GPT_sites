# Product Dashboard Backend

Cloudflare Worker + D1 backend for the private Product Development Dashboard.

## Security
Put the Worker/Pages application behind Cloudflare Access and allow only the owner's Google identity. No GitHub or Drive write token belongs in browser code.

## Deploy
1. Create D1 database `product-dashboard`.
2. Replace `REPLACE_AFTER_D1_CREATE` in wrangler.toml with its database ID.
3. Apply `schema.sql` to D1.
4. Deploy the Worker.
5. Configure Cloudflare Access with Google as identity provider and an allow policy for the owner's email.
6. Set the dashboard API base URL to the Worker route.
7. Seed/reconcile D1 from the generated portfolio snapshot.

The API supports:
- GET /api/products
- PATCH /api/products/:product_id

PATCH records explicit dashboard stage changes in the history table.
