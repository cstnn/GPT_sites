---
name: product-to-3mf-team
description: Cost-optimized orchestrated workflow for developing printable products from concept/reference through STL/3MF, QA, imagery, approval, and delivery.
---

## REQUIRED FIRST STEP — NORHOLM shared contract
Before **any** Google Drive file/folder creation, update, move, rename or deletion, or any portfolio JSON edit, fetch and read the **current** `GPT-WORK/SKILLS/NORHOLM-CONTRACT.md` (Drive folder ID `1ToPGkISZmpSt3t4JKK5SOnIQUUsUejiT`). GitHub mirror: `cstnn/GPT_sites/PRODUCT PORTFOLIO/workflow/NORHOLM-CONTRACT.md`. The Drive contract is authoritative for Drive writes. Obey its exact canonical filenames, destinations, status gates, identity/upsert rules and post-write verification. If contract cannot be read, stop Drive writes and report the blocker. **This instruction supersedes any conflicting legacy status or storage instructions elsewhere in this skill.** Read current `PRODUCT PORTFOLIO/portfolio.json` to confirm live status enum before a portfolio write.



# Product to 3MF Team

## Core rule
Continue from persisted project state. Do not reconstruct completed work from conversation history unless project files are missing, contradictory, or explicitly insufficient.

## Mandatory concept-image and specs reconciliation
Before any modeling, including resumed work, inspect the **actual latest user-approved concept image** in the product folder alongside `SPECS.md`, `STATE.md`, and `TO_DO.md`. Do not rely on specs alone or merely on the image filename/description. If the approved image is missing or inaccessible, stop and request it.

Treat the approved concept image as visual authority (silhouette, proportions, facets, curvature, number and placement of elements, decorative details and visible colors), and the specifications as technical authority (dimensions, tolerances, materials, parts, connections, print orientation and assembly). Compare both before delegating or generating geometry. Neither source may be ignored. When they contradict or leave material ambiguity, ask targeted clarification questions and **pause modeling until the user resolves them**. Do not silently choose one or invent details. Record decisions and the image revision in `SPECS.md` and `STATE.md`.

Give geometry workers the approved concept image and reconciled specifications together. Compare actual-model front/right previews and geometry with both sources before requesting approval. Correct discrepancies in the geometry rather than masking them with renders. Re-run this check on every resume and major revision; unresolved differences are blockers in `TO_DO.md` and `STATE.md`.

## Agent architecture
- **Lead Orchestrator / Reviewer:** GPT-6.1 Sol, Medium. Owns consequential aesthetic/engineering decisions, specifications, delegation, geometry review, QA, approval readiness.
- **Geometry Workers:** GPT-6 Astra, Low. Create/modify bounded STL parts from explicit Lead specifications. They may not change approved intent, interfaces, tolerances, or assembly strategy.
- **Utility Workers:** GPT-5.6 Sol, Low. Mechanical checks, exports, packaging, file/folder work, previews, Drive operations, checkpoint persistence, and state maintenance.
- No High tier by default. Parallelize independent bounded tasks when safe.

## Persistent project files
Every active product folder must contain:
- `SPECS.md`
- `TO_DO.md`
- `STATE.md`
- `WORK/`
- `STL/`

### SPECS.md
Authoritative current product specification and downstream handoff contract. Include verified product name/revision, purpose, dimensions, parts, colors/materials, printer assumptions, orientations, interfaces, assembly, immutable visual/functional features, print constraints, validation status, final 3MF path, current STL/source paths, approved image paths, and safe customer-facing facts. Mark unknown facts `unverified`; never infer engineering facts from generated lifestyle imagery.

### TO_DO.md
Keep only actionable unresolved work, validation/test-print items, missing imagery/instructions, packaging/delivery, and next actions.

### STATE.md
Keep compact. Record product/revision, current stage, last verified milestone, blocker, exact next action, relevant paths, worker/skill needed next, and critical resume warning.

## Checkpointing and resume
Checkpoint only at meaningful milestones. On resume read `STATE.md`, then `TO_DO.md`, then the needed parts of `SPECS.md` **and the actual latest approved concept image**; load referenced geometry as needed. Reuse valid `WORK/` and `STL/`. Do not replay the full chat unless persisted state is missing or contradictory.

## Workflow
1. Establish/refine brief and complete mandatory approved-concept-image versus specs reconciliation before geometry work.
2. Refine concept only when visual iteration is needed.
3. Define part and assembly strategy.
4. Build real geometry.
5. Review actual mesh and validate dimensions, object count, walls, clearances, engagement, orientation, bed contact, overhang risk, build volume, and 3MF readability.
6. Package review revision with current STLs, final 3MF, actual-model previews, lifestyle image, and assembly material when multipart.
7. Create product imagery grounded in the actual modeled geometry.
8. Obtain final approval and reconcile `SPECS.md` against the current geometry/3MF and approved imagery.
9. Deliver the approved package.

## Standard product folder
```text
Product_Name/
├── Product_Name.3mf
├── SPECS.md
├── TO_DO.md
├── STATE.md
├── actual_model_front.png
├── actual_model_right.png
├── lifestyle.png
├── assembly.png
├── assembly_instructions.md
├── WORK/
└── STL/
```

## Mandatory folder-placement rule after 3MF completion
Once the current final 3MF has been created, verified, and approved:
- move the **entire product folder with all of its contents** into the main `GPT-WORK` folder;
- do not split the product package or leave working components behind in an idea/staging area;
- update `STATE.md`, `SPECS.md`, and portfolio location references to the new folder location;
- the product remains under `GPT-WORK` while subsequent marketplace work is performed.

This move is part of the final Product-to-3MF milestone. A failed folder move must be recorded as a blocking/pending delivery action rather than silently treated as complete.

## Downstream contract
`3mf-to-marketplace` treats current `SPECS.md` as the primary semantic handoff and verifies referenced geometry/images exist without reconstructing the full modeling history.

## Portfolio dashboard integration
Shared source: `GPT-WORK/PRODUCT PORTFOLIO/portfolio.json`.

At major milestones only, upsert the current product:
- preserve stable `product_id`;
- `stage: specs` when approved specs exist but no final verified 3MF;
- `stage: 3mf` once the final 3MF is created and verified;
- update product name, current folder ID/URL/location, next action, timestamp, hero references, `has_specs`, and `has_3mf`;
- after the mandatory move, store the product's new location directly under `GPT-WORK`;
- preserve marketplace/printed/published fields owned by later workflows.

Portfolio sync failure does not invalidate modeling work; record `portfolio_sync_pending: true` in `STATE.md`.

## Mandatory NORHOLM portfolio synchronization (every product run)

**Source of truth:** GitHub repository `cstnn/GPT_sites`, file `PRODUCT PORTFOLIO/portfolio.json` (not `product.json`). Fetch its current contents and SHA before writing; preserve unrelated products and metadata.

**Current canonical `stage` values (schema v4):**
- `idea` — brainstorming / concept only; an image and `brainstorm.md` do **not** mean approved specifications.
- `specs_ready` — approved, durable technical specifications; no verified final 3MF.
- `3mf_ready` — final 3MF verified, awaiting subsequent preparation / print readiness.
- `print_ready` — ready for physical print validation.
- `to_publish` — physical print validated, ready for marketplace publication.
- `published` — actual marketplace listing verified.

Always **read the current JSON and the portfolio dashboard skill first** and use the stage strings actually defined there if the schema has changed. Never use legacy stage keys (`specs`, `3mf`, `to_print`, `printed`) or silently upgrade a product based on an image, script, or marketing copy alone.

After any product creation, design revision, validated 3MF, marketing package, video, print confirmation, or publication:
1. Locate the existing product by `folder_id`/`product_id`; if absent, add a single entry using the existing JSON product schema. Do not create duplicates.
2. Update only evidence-backed metadata: `product_name`, `folder_id`, `folder_url`, `location`, `stage`, `has_specs`, `has_3mf`, `has_marketplace`, `printed`, `published`, `next_action`, `updated_at`, `hero_asset_id`, `hero_asset_url`, `hero_kind`, `seasonality`, `seasons`, `publication`, and applicable assessment fields. Preserve all other values and assessment history. Do not invent scores, print outcomes, or marketplace URLs.
3. Keep `reconciliation.product_count` and `reconciliation.stage_counts` consistent with the full products array; update `generated_at` when appropriate. Do not claim a full folder reconciliation or set `reconciliation.complete=true` without a full scan.
4. Commit the changed JSON using GitHub's current file SHA. Retry safely on SHA conflict by refetching and reapplying the specific product edit. This GitHub JSON powers the published portfolio and Kanban.
5. **Verify**: refetch JSON from GitHub after commit; assert exactly one matching product, correct status/metadata, accurate counts, and valid Drive asset IDs. Separately verify expected deliverables in their Drive folder. Report the commit and verification outcome. If a step fails, report partial completion and do not say the portfolio is synchronized.

Do not mutate portfolio stages merely because this skill ran; change stage only when its evidence gate has been met. For concept-only work, default to `idea`.
