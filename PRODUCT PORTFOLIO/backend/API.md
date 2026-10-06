# Dashboard API

No authentication is required.

## GET /api/products
Returns all products ordered by most recent update.

## GET /api/products/:id/history
Returns the product change history.

## PATCH /api/products/:id
Accepted JSON fields: `stage`, `next_action`, `blocked`, `blocker_reason`.
Stage must be one of: idea, specs, 3mf, to_print, printed, published.
Every changed field is appended to history with source `dashboard`.

## GET /api/health
Returns service and D1 health.
