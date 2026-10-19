---
name: 3mf-to-marketplace
description: Cost-optimized conversion of a completed Product-to-3MF package into publication-ready MakerWorld and Thangs content, marketing assets and optional approved promo video.
---

## REQUIRED FIRST STEP — NORHOLM shared contract
Before **any** Google Drive file/folder creation, update, move, rename or deletion, or any portfolio JSON edit, fetch and read the **current** `GPT-WORK/SKILLS/NORHOLM-CONTRACT.md` (Drive folder ID `1ToPGkISZmpSt3t4JKK5SOnIQUUsUejiT`). GitHub mirror: `cstnn/GPT_sites/PRODUCT PORTFOLIO/workflow/NORHOLM-CONTRACT.md`. The Drive contract is authoritative for Drive writes. Obey its exact canonical filenames, destinations, status gates, identity/upsert rules and post-write verification. If contract cannot be read, stop Drive writes and report the blocker. **This instruction supersedes any conflicting legacy status or storage instructions elsewhere in this skill.** Read current `PRODUCT PORTFOLIO/portfolio.json` to confirm live status enum before a portfolio write.



# 3MF to Marketplace

## Core rule
Consume the completed Product-to-3MF handoff instead of reconstructing the product from chat. Primary semantic source is product-root `SPECS.md`; execution sources are `STATE.md` and `TO_DO.md`.

## Agent architecture
- **Lead Orchestrator:** GPT-6.1 Sol, Medium.
- **Utility Worker:** GPT-5.6 Sol, Low.
- **Content Worker:** GPT-5.6 Sol, Medium when needed.
- Image/video work uses the appropriate generation capability.

## Handoff validation
Read `STATE.md`, then `SPECS.md`, then only relevant `TO_DO.md` items, then verify referenced final 3MF and approved/current images. Do not redesign the model or invent unverified facts.

## Marketplace asset structure
Use `Marketplace/` inside the product folder. Move, do not duplicate, customer-facing publishing assets there when organization requires it. Keep final 3MF, `STL/`, `WORK/`, and core project-control files in their Product-to-3MF locations.

## Marketplace content
Create final product name, short summary, full description, key features, intended use, verified dimensions/specifications, included parts, assembly notes, and master keywords. Generate MakerWorld and Thangs adaptations every run.

### Thangs access recommendation
- small/simple gimmick -> Free;
- solid off-season product -> Thangs Bundle + Supporter + Commercial;
- premium/in-season product -> Supporter + Commercial.
MakerWorld does not use this tier logic.

## Additional marketplace images
Reuse approved Product-to-3MF images and propose at least one new realistic lifestyle setting and one different/lateral or three-quarter angle. Generate only after explicit approval. Generated scenes do not establish product facts.

## marketplace.md
Create `Marketplace/marketplace.md` containing shared copy, verified model information, included parts, assembly notes, keywords, MakerWorld/Thangs publishing matrix, Thangs tier rationale, and publishing asset inventory.

## Mandatory output verification
Before marketplace work is considered complete:
- save and verify `marketplace.md`;
- save approved/generated marketplace images;
- ensure intended customer-facing assets are in `Marketplace/`;
- verify package consistency.

## Mandatory print handoff
Once the required marketplace material is complete and verified:
- set the product portfolio stage/status to **`print_ready`**;
- set `next_action` to a concise instruction such as `Print physical sample`;
- update `STATE.md` to show that marketplace preparation is complete and the product is waiting for the user's physical print;
- **do not move the product to `READY TO PUBLISH` automatically**;
- **do not mark the product `printed`, `ready_to_publish`, or `published` automatically**;
- leave the product folder where it currently is under `GPT-WORK`.

The user performs the physical print. After printing, the user manually moves the complete product folder into `GPT-WORK/READY TO PUBLISH`. That folder placement is authoritative evidence that the physical-print gate has been completed.

## Optional promo video
After mandatory marketplace outputs are verified, optionally offer a 5–10 second 9:16 promo video. Storyboard approval is required before generation. Save approved video assets in `Marketplace/`.

## Compact resumable state
Use product-root `STATE.md`. Keep marketplace phase, last verified milestone, exact next action, approval state, relevant paths, and one critical warning. Do not duplicate `SPECS.md` or `marketplace.md`.

## Portfolio dashboard integration
Shared source: `GPT-WORK/PRODUCT PORTFOLIO/portfolio.json`.

At meaningful marketplace milestones:
- preserve stable `product_id`;
- set `has_marketplace: true` when the package is complete;
- when required marketplace material is complete, set `stage: print_ready`;
- update product name, folder ID/URL/location, next action, hero references when appropriate, and timestamp;
- never infer `printed` or `published` from marketplace completion;
- manual placement in `READY TO PUBLISH` is reconciled by the Product Portfolio Dashboard skill as `printed`;
- `published` requires explicit publication evidence or authoritative placement under `PUBLISHED`.

Portfolio sync failure must not block marketplace output; mark a compact pending sync in `STATE.md`.

## Mandatory NORHOLM portfolio synchronization (every product run)

**Source of truth:** GitHub repository `cstnn/GPT_sites`, file `PRODUCT PORTFOLIO/portfolio.json` (not `product.json`). Fetch its current contents and SHA before writing; preserve unrelated products and metadata.

**Current canonical `stage` values (schema v4):**
- `idea` — brainstorming / concept only; an image and `brainstorm.md` do **not** mean approved specifications.
- `specs_ready` — approved, durable technical specifications; no verified final 3MF.
- `3mf_ready` — final 3MF verified, awaiting subsequent preparation / print readiness.
- `print_ready` — ready for physical print validation.
- `to_publish` — physical print validated, ready for marketplace publication.
- `published` — actual marketplace listing verified.

Always **read the current JSON and the portfolio dashboard skill first** and use the stage strings actually defined there if the schema has changed. Never use legacy stage keys (`specs`, `3mf`, `print_ready`, `printed`) or silently upgrade a product based on an image, script, or marketing copy alone.

After any product creation, design revision, validated 3MF, marketing package, video, print confirmation, or publication:
1. Locate the existing product by `folder_id`/`product_id`; if absent, add a single entry using the existing JSON product schema. Do not create duplicates.
2. Update only evidence-backed metadata: `product_name`, `folder_id`, `folder_url`, `location`, `stage`, `has_specs`, `has_3mf`, `has_marketplace`, `printed`, `published`, `next_action`, `updated_at`, `hero_asset_id`, `hero_asset_url`, `hero_kind`, `seasonality`, `seasons`, `publication`, and applicable assessment fields. Preserve all other values and assessment history. Do not invent scores, print outcomes, or marketplace URLs.
3. Keep `reconciliation.product_count` and `reconciliation.stage_counts` consistent with the full products array; update `generated_at` when appropriate. Do not claim a full folder reconciliation or set `reconciliation.complete=true` without a full scan.
4. Commit the changed JSON using GitHub's current file SHA. Retry safely on SHA conflict by refetching and reapplying the specific product edit. This GitHub JSON powers the published portfolio and Kanban.
5. **Verify**: refetch JSON from GitHub after commit; assert exactly one matching product, correct status/metadata, accurate counts, and valid Drive asset IDs. Separately verify expected deliverables in their Drive folder. Report the commit and verification outcome. If a step fails, report partial completion and do not say the portfolio is synchronized.

Do not mutate portfolio stages merely because this skill ran; change stage only when its evidence gate has been met. For concept-only work, default to `idea`.
