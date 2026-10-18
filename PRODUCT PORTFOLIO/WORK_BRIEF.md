# CSTN Studio Product Hub — Codex / ChatGPT Work Build Brief

## Mission
Extend the existing product portfolio into a secure, mobile-first, end-to-end product management application. **Do not replace the current portfolio or discard its reconciliation logic.** The Kanban board is one view of shared product records. Keep ChatGPT Project voice/chat workflows available separately; do not assume ChatGPT Plus can be embedded in a third-party site or that external code can invoke Project skills.

## Inspected repository (18 October 2026)
- Repository: https://github.com/cstnn/GPT_sites ; branch main.
- Existing directory: PRODUCT PORTFOLIO/.
- Existing portfolio.json, STATUS_CONTRACT.md, workflow/product-portfolio-dashboard-SKILL.md, workflow/build_portfolio.py, workflow/portfolio_assessments.py.
- Existing backend scaffold: backend/wrangler.toml, backend/schema.sql, backend/src/worker.js, backend/src/seed.js, backend/API.md, backend/README.md.
- Existing backend documented endpoints: GET /api/products, GET /api/products/:id/history, PATCH /api/products/:id, GET /api/health.
- **Security blocker:** backend README states no authentication. Never expose mutation endpoints publicly. Deployment of Worker/D1 is unverified.

## Hard invariants
1. Stable product_id, Drive folder IDs and links; never identify products by mutable names.
2. Target pipeline specified by owner: idea -> specs -> 3mf -> to_print -> printed -> published. **Migration blocker:** existing STATUS_CONTRACT.md and running UI instead use idea -> specs_ready -> 3mf_ready -> print_ready -> to_publish -> published. Do not change live keys without an audited, tested migration; see ADR-001.md.
3. blocked independent of stage. Preserve next_action, needs_review, history, hero, market scores, seasonality, curated metadata, and newer manual edits.
4. Membership only from successful full recursive GPT-WORK Drive scan. Partial scan never deletes products.
5. READY TO PUBLISH folder is printed evidence; PUBLISHED folder or verified publication evidence is published evidence. Preserve precedence in status contract and portfolio skill.
6. Drive stays canonical for assets, 3MF/STL, marketing, SPECS/STATE/TO_DO. No bulk binary migration.
7. MakerWorld and Thangs publication fields remain independent.
8. No automatic publication, final 3MF overwrite, folder deletion, or publication-state change without evidence/confirmation.

## Product experience
- Mobile-first gallery/list and six-column Kanban with search, filters, thumbnails, next action, drag/drop and mobile stage selector.
- Product workspace tabs: Overview, Concept & Design, Files, Printing & Testing, Marketing, Publishing, Tasks & History, AI Workflows.
- Idea capture: required name; optional description and image; stable ID, idea stage, protected Drive folder creation; durable draft fallback.
- Editable product metadata: name, description, stage, blocker, next action, category, explicit scores, seasonality, links, notes, test results, marketplace state/URLs.
- Drive asset links without public confidential-data proxy.
- Skill catalog and ChatGPT Project handoff: copy context-rich prompts/deep-link only; never claim a skill ran unless results verified.
- Reconcile connected GitHub/Drive voice/chat updates to the site.

## Architecture and security
- Reuse PRODUCT PORTFOLIO UI and Cloudflare Worker+D1 scaffold, not a second database by default.
- GitHub repo for code; GitHub Pages or Cloudflare Pages for static frontend; secure Worker API and D1 for mutable records.
- Protect all private reads/writes with server-validated authentication and authorization. CORS is not authentication. No frontend or committed secrets.
- D1 transactional authority only after deterministic audited sync/export with portfolio.json and Drive, field ownership and dual-write conflict prevention.
- Schema migrations/backups, idempotent import preserving newer manual edits, timestamped audit old/new/source for each write.
- Validated authenticated APIs, optimistic concurrency, actionable errors.
- ChatGPT Plus does not provide external Project execution or API credentials; optional separately billed AI is phase 2.

## Build order
### Milestone 0 — Audit and safety
Inspect repository, deployed state, frontend, Worker/schema and conflicts; write ADR; feature branch and PR; no production changes.
### Milestone 1 — Secure portfolio foundation
Authentication, migrations, protected CRUD, stage validation, audit history, JSON import/export, tests for auth/status/conflicts/migration. Preserve board operation.
### Milestone 2 — UI
Mobile-first gallery, Kanban, detail workspace, idea capture, editing and history.
### Milestone 3 — Drive reconciliation and workflow handoff
Safe server-side Drive integration or external reconciliation job; conflict preview and safe merge; honest ChatGPT Project handoff.
### Milestone 4 — Optional AI and publishing
Separately billed AI, tool orchestration, granular approvals, marketplace integrations only after MVP.

## Acceptance tests
- Lossless import of records, scores, heroes, history, stages, folder IDs and curated metadata.
- Mobile idea capture creates durable ID and appears in gallery/Kanban.
- Stage changes log exactly one event and survive refresh/reconciliation.
- Stale Drive TO_DO cannot overwrite newer manual update.
- Partial Drive scan deletes nothing; folder move preserves product ID and applies contract evidence.
- Unauthorized reads/writes denied; no frontend secrets.
- Marketing assets and separate MakerWorld/Thangs states visible.
- No workflow marked complete without verified outputs.

## Instructions to executor
Audit first and explain existing implementation. Make smallest coherent changes. Work on feature branch and supply PR/diff, deployment instructions, required secrets and tests. Never claim deployment without checking actual URL. Ask for credentials only through approved secure flows. Prioritize usable MVP over speculative features.
