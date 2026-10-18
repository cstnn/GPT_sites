Run from repository root:

    python3 -m unittest discover -s 'PRODUCT PORTFOLIO/tests' -v
    node 'PRODUCT PORTFOLIO/tests/dashboard.test.cjs'
    node 'PRODUCT PORTFOLIO/tests/backend.test.mjs'
    node 'PRODUCT PORTFOLIO/tests/hub-store.test.cjs'

Python verifies lossless/idempotent migration, immutable assessments and histories, exported overrides, repeated reconciliation and SQLite migration. Node verifies browser storage across reloads, legacy browser overrides, independent platform state, and the optional API with a D1 test double. The backend is not deployed by Pages.

Reconcile exported browser changes with:

    python3 'PRODUCT PORTFOLIO/workflow/build_portfolio.py' --current scanned.json --previous 'PRODUCT PORTFOLIO/portfolio.json' --template 'PRODUCT PORTFOLIO/site/kanban/index.html' --overrides dashboard-updates.json --output-json merged.json --output-html merged.html

Review merged outputs and publish them as portfolio.json and site/kanban/index.html. The fresh_reconciliation flag in an export requests the full Drive scan described in the skill; the builder itself does not access Drive. Without a scan, use the latest canonical JSON for both --current and --previous. Never substitute an older snapshot as --previous.

Backend tests generate and sign real RSA JWTs and exercise claim/signature rejection, owner authorization, missing configuration, same-origin enforcement, If-Match conflicts and field validation. D1 writes use a test double; actual D1/Access deployment tests remain required before cutover. Hub store tests cover local ideas, stable IDs, shared changes, history, canonical preservation and unreadable browser storage.
