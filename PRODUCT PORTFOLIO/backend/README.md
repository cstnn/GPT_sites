# Protected Worker scaffold

Not connected to the Product Hub frontend and not verified deployed. D1 configuration still contains a placeholder ID. The local-first frontend is usable independently.

All private reads/writes require verified Cloudflare Access JWT (RS256 signature, issuer, audience, expiry/issued-at and owner email allowlist). Configure ACCESS_TEAM_DOMAIN, ACCESS_AUD and ALLOWED_EMAILS server-side. Missing configuration fails closed. No frontend credentials are committed. `/api/health` is public and generic.

PATCH requires same-origin Origin, application/json and If-Match with current updated_at. Field validation and conditional audit/update batch prevent stale writes. Initial seed imports full snapshots with ON CONFLICT DO NOTHING, preserving existing records on reruns. It is intentionally not a sync process.

See ../MVP_GUIDE.md and ../ADR-001.md for deployment gates, field ownership and remaining work. Do not make D1 authoritative or wire private frontend API calls before audited sync/export and actual Access/D1 tests pass.
