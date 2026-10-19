# NORHOLM Product Artifact & Portfolio Contract
Version: 1.0 — 2026-10-19
Canonical name: `NORHOLM-CONTRACT.md`
Canonical Drive location: `GPT-WORK/SKILLS/NORHOLM-CONTRACT.md`
GitHub mirror: `cstnn/GPT_sites/PRODUCT PORTFOLIO/workflow/NORHOLM-CONTRACT.md`

## Mandatory pre-write gate
Every NORHOLM skill MUST fetch and read the current contract **before creating, replacing, moving, renaming or deleting any file or folder in Google Drive**, and before any portfolio JSON write. Do not rely on a cached copy when Drive is accessible. If unavailable, stop Drive mutations, explain the blocker and retain local work. Read the current live GitHub portfolio schema/statuses as well before editing the index. The contract governs naming, location, identity and synchronization; skill-specific requirements govern design/content. If conflicting, contract takes precedence for file management; ask before a destructive or ambiguous action.

## Canonical locations and identity
- Root: `GPT-WORK` (Drive ID `1WliIAk1xWwewi_8NHIT9Mm31UZl1WCBR`).
- Brainstorming products: `GPT-WORK/IDEAS` (Drive ID `1XANFVOKCaOF8EcZoZct9Yxdqwkn9rDFR`).
- Skills: `GPT-WORK/SKILLS` (Drive ID `1ToPGkISZmpSt3t4JKK5SOnIQUUsUejiT`).
- Product's **one canonical folder** is identified by its stable Drive folder ID; never create a second folder merely because its name or stage changed. Keep one product per folder. After final 3MF approval, the product-to-3mf workflow may move the **whole** product folder under GPT-WORK root, keeping its folder ID. Respect any later explicit user-directed location/status moves.
- Portfolio source of truth for published website: GitHub `cstnn/GPT_sites`, path `PRODUCT PORTFOLIO/portfolio.json`. It is **not** `product.json`; use the exact existing file. Drive copy, if present, is a mirror, not a competing authority. Synchronize the Drive copy when possible; verify consistency and report failures.
- Never confuse `GPT-WORK/IDEAS` with other similarly named folders.

## Canonical product layout and filenames
Names are case-sensitive; use existing canonical file instead of creating aliases. Never overwrite approved assets with unapproved iterations.

```
<Product folder>/
  brainstorm.md             # approved idea summary, open questions; created at idea milestone
  concept.png               # latest user-approved concept image; never an unapproved draft
  SPECS.md                  # approved technical specs only, not a renamed brainstorm
  STATE.md                  # compact state and resume pointer
  TO_DO.md                  # unresolved work
  <Product_Slug>.3mf        # verified latest final printable 3MF, only when real
  actual_model_front.png    # render of actual geometry
  actual_model_right.png
  lifestyle.png             # actual-model-grounded visualization
  assembly.png              # optional
  assembly_instructions.md  # optional
  WORK/                     # editable sources, WIP, revisions
  STL/                      # per-part STLs
  Marketing/                # hero_lifestyle_landscape.png, hero_lifestyle_portrait.png,
                            # angled_lifestyle.png, marketing.md and approved assets
  Marketplace/              # marketplace.md and marketplace-specific publishing assets
  Shorts/                   # Short_01.json, Short_01.txt, approved copied reference images,
                            # generated clips when applicable
```

Create only folders and files required by the current stage; do not create empty placeholder files. Keep root free of duplicated marketing images. Use `Marketing/` for the product marketing skill; use `Marketplace/` for downstream marketplace handoff. If legacy assets are in a different existing folder, inspect before moving; avoid duplicate content and update references. Preserve product-specific approved filenames where downstream references already exist; record aliases in `STATE.md` rather than breaking them.

## Naming and revision rules
- Stable lowercase filenames exactly as above for canonical deliverables. No vague names like `final_final.png`, `image(1).png` or date-only names.
- Use `<Product_Slug>` (ASCII letters, digits, underscores) for model basename; preserve stable identity across renames.
- `concept.png` is the latest **approved** concept; preserve previous approved versions as `WORK/concept_rNN.png` before replacement when needed. Generated drafts belong in `WORK/`, not canonical `concept.png`.
- For separate video concepts use `Short_01.json`, `Short_02.json`, etc.; edit the same file for revisions of one concept, with optional `Short_01.txt` for Flow handoff.
- Preserve source/reference assets. Shorts uses **copies** of approved references, never moves originals.
- Update in place where supported; otherwise create replacement, verify, then remove or archive the superseded file only with permission or an established safe replacement workflow. Do not leave multiple ambiguous canonical files.
- All markdown must describe what is confirmed versus unverified; images are not evidence of printability.

## Portfolio stage contract
**Always fetch live `portfolio.json` first** and validate the stage enum and schema. As of schema v4, stages are:
`idea` -> `specs_ready` -> `3mf_ready` -> `print_ready` -> `to_publish` -> `published`.
- `idea`: concept/brainstorm, even if `brainstorm.md` and `concept.png` are approved.
- `specs_ready`: durable **approved technical** specifications.
- `3mf_ready`: final 3MF exists and is structurally verified; no inferred physical print.
- `print_ready`: required print package is ready; awaiting physical test.
- `to_publish`: user confirms print validation / authoritative READY TO PUBLISH move and publishing assets are ready.
- `published`: verified live marketplace listing or authoritative published state.
Do not write legacy values `specs`, `3mf`, `to_print`, `printed`, `ready_to_publish`. If live schema differs, use it and reconcile meanings explicitly. Do not advance stage just because marketing or video assets were created. On conflicting evidence, preserve current stage and flag `needs_review`.

## Portfolio upsert and metadata
- Read current GitHub JSON and blob SHA. Locate product by `product_id` or `folder_id` (not name alone); reuse stable `product_id` (new products normally use stable folder ID).
- Preserve unknown fields, curated assessments, assessment history, other products and publication details.
- Update only verified fields: `product_name`, `stage`, `folder_id`, `folder_url`, `location`, `hero_asset_id`, `hero_asset_url`, `hero_kind`, `has_specs`, `has_3mf`, `has_marketplace`, `printed`, `published`, `next_action`, `updated_at`, `needs_review`, `seasonality`, `seasons`, `publication` and applicable score fields. Never fabricate measurements, URLs, scores, or print status. A concept hero must be an actual uploaded image ID.
- Maintain `reconciliation.product_count` and `reconciliation.stage_counts` from **all** products. Do not change `reconciliation.complete` or imply full inventory scan during an incremental upsert. Preserve scan provenance.
- Commit JSON with current SHA; on conflict refetch, reapply only this product edit and retry.
- If Drive mirror `GPT-WORK/PRODUCT PORTFOLIO/portfolio.json` exists, update it from the committed GitHub content and verify; do not create a competing file in IDEAS.
- Do not edit generated HTML or deploy claims unless the site actually consumes this JSON and publication is verified; full dashboard skill owns HTML generation and full rescans.

## Transactional completion and verification
1. Preflight: resolve product folder, read this contract, read live portfolio, check existing canonical files and approvals.
2. Write product assets to exact locations; capture IDs and validate names, MIME types, parent IDs and nonempty bytes. For images confirm correct **latest approved** version; for markdown verify actual content, not only a successful API response.
3. Update GitHub portfolio and (if present) Drive mirror.
4. Refetch GitHub JSON: exactly one matching product, correct metadata/stage, consistent counts, preserved unrelated products; verify GitHub commit.
5. Re-list Drive folder and confirm expected files; if a file was replaced, confirm new bytes or revision. Validate links.
6. Only then report complete. If any operation fails, state exactly which succeeded/failed and leave a `portfolio_sync_pending` or equivalent in `STATE.md` when possible. Never claim success based only on upload response.

## Skill responsibility
- Brainstorm: create folder + `brainstorm.md` + `concept.png` + `idea` entry; no auto-specs.
- Image interview: approved visual brief and concept updates; preserve `idea` unless technical specs approved.
- Product-to-3MF / design-to-3MF: specs, state, real geometry and validation; advance stage only at evidence gates; move whole folder on approved final 3MF where required.
- Product marketing / 3mf-to-marketplace: approved assets under Marketing/ and Marketplace/; `has_marketplace` only when required package verified; no fabricated print or publication.
- Product video: scripts and copied references under Shorts/; update hero/next action if relevant, do not auto-advance stage.
- Portfolio dashboard: complete recursive scan only when explicitly requested; conservative merge, preserve assessments, refresh locations, publish and verify JSON/HTML.
