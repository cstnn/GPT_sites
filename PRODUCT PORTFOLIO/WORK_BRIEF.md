# Product Studio — implementation work brief

Updated: 2026-10-18
Repository: cstnn/GPT_sites

## Source of truth
- Product folders in the complete GPT-WORK tree are authoritative for product evidence.
- PRODUCT PORTFOLIO/portfolio.json is the reconciled index, not a separate product catalog.
- PRODUCT PORTFOLIO/workflow/product-portfolio-dashboard-SKILL.md and STATUS_CONTRACT.md define reconciliation, stages, overrides and publication state.
- Preserve product IDs, heroes, assessments, timestamps and history; delete missing products only after a successful full recursive scan.

## Website architecture
- Dedicated site home: PRODUCT PORTFOLIO/site/index.html.
- Dedicated full Kanban route: PRODUCT PORTFOLIO/site/kanban/index.html, linked from the site home.
- Existing PRODUCT PORTFOLIO/index.html remains operational for backwards compatibility.
- Future product detail pages should be linked by stable product_id, not mutable folder names.

## Status and publication contract
Stages: Idea / Concept (idea), Specs ready (specs_ready), 3MF ready (3mf_ready), Print ready (print_ready), To Publish (to_publish), Published (published).
Each product has independent publication.thangs and publication.makerworld values (true/false/null). Never infer marketplace publication from overall stage. The Kanban offers separate THANGS and MAKERWORLD checkboxes in To Publish and Published.

## Editing and persistence
The existing Kanban stores pending edits in browser localStorage and exports dashboard-updates.json. Exported changes must be passed to the portfolio workflow for canonical merge and GitHub republish; GitHub Pages cannot itself persist edits across devices. Do not advertise live server sync until authenticated write APIs are deployed and connected. Do not overwrite newer manual edits with older folder evidence.

## Implementation milestones
1. Establish a website home and dedicated navigable Kanban page using the current reconciled dataset. [started]
2. Create product detail routes, with specs, 3MF/print information, marketing, images, milestones and publication state.
3. Connect authenticated persistence (evaluate existing Cloudflare Worker/D1 backend) and enforce field-level history and conflict resolution.
4. Build Drive reconciliation ingestion and deployment automation with complete-scan safeguards.
5. Test responsive layouts, routing, marketplace state, data migration, browser reload, and cross-device synchronization.

## Acceptance checks
- Dedicated Kanban route loads all portfolio products from the shared portfolio.json.
- Six canonical columns and independent platform checkboxes are available.
- Existing dashboard and portfolio remain accessible.
- Pending edits persist on reload and can be exported; server sync must be clearly identified as pending until verified.
- Site navigation works on GitHub Pages relative paths.
