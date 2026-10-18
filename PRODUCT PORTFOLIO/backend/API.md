# Private API scaffold

Except health, every route requires a valid `Cf-Access-Jwt-Assertion` verified against the configured Access team and application audience, with an allowlisted email. CORS is not authentication. Do not put bearer credentials in the browser.

- GET /api/health: public `{ok:true}`, no DB check or product count.
- GET /api/products: protected snapshot records, preserving curated fields from snapshot_json.
- GET /api/products/:id/history: protected latest 100 API audit events; imported history is retained in product snapshot_json.
- PATCH /api/products/:id: protected, same-origin Origin and application/json required; `If-Match` equals current updated_at. Fields: stage (schema-4 key), next_action/blocker_reason (strings <=5000 chars), blocked (boolean), publication (partial thangs/makerworld booleans). Unknown fields rejected. State and audit entries run in one conditional batch.

Errors: 401 unauthorized/unconfigured, 403 foreign/missing Origin, 415 non-JSON, 400 malformed/invalid fields, 404 missing record, 428 missing If-Match, 409 stale/concurrent edit. Reload and explicitly reconcile a 409; never retry blindly.

No product creation/deletion, Drive folder endpoint or automated export/sync is implemented. This API is deliberately disconnected from the MVP UI pending the gates in ../MVP_GUIDE.md.
