# Dashboard API

No authentication is required.

## GET /api/products
Returns all products ordered by most recent update.

## GET /api/products/:id/history
Returns the product change history.

## PATCH /api/products/:id
Accepted JSON fields: `stage`, `next_action`, `blocked`, `blocker_reason`, `publication` (partial object with `thangs` and/or `makerworld` boolean values).
Stage must be one of: idea, specs_ready, 3mf_ready, print_ready, to_publish, published.
Every changed field is appended to history with source `dashboard`.

## GET /api/health
Returns service and D1 health.

Responses expose `publication: {thangs: boolean|null, makerworld: boolean|null}`. Null means unverified. PATCH preserves omitted platform fields, rejects non-booleans and unknown platforms, and does not couple stage or platform values. Product and history changes commit in one D1 batch.

This optional API is not connected to the GitHub Pages board. Apply migrations/0002_status_publication.sql once to existing databases before deploying this Worker. Fresh databases use schema.sql. Reseeding retains existing platform decisions; import newer verified platform evidence through PATCH rather than overwriting saved values during seed.
