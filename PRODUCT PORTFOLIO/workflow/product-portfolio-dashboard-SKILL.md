---
name: product-portfolio-dashboard
description: Reconcile all product folders anywhere under GPT-WORK into a compact JSON portfolio index and regenerate a visual HTML Kanban dashboard with hero images, current locations, stages and next actions.
---

# Product Portfolio Dashboard

## Purpose
Maintain a visual overview of the user's **current GPT-WORK tree**. The dashboard represents every recognized product folder found anywhere inside `GPT-WORK` and its subfolders, and nothing outside that tree.

## Canonical pipeline
The dashboard has six canonical stages:
1. `idea` — idea/concept exists but no durable approved specification yet.
2. `specs` — approved product specification exists; final verified 3MF does not yet exist.
3. `3mf` — current final verified 3MF exists; marketplace package is not yet complete.
4. `to_print` — required marketplace package is complete and the product is waiting for the user's physical print.
5. `printed` — physical-print gate is complete; authoritative default evidence is the complete product folder being manually placed under `GPT-WORK/READY TO PUBLISH`.
6. `published` — product is actually published, represented by verified publication state or authoritative placement under `GPT-WORK/PUBLISHED`.

Do not invent a more advanced stage from conversation memory alone.

## Canonical files
Store in `GPT-WORK/PRODUCT PORTFOLIO/`:
- `portfolio.json`
- `index.html`
- optional `scan_report.json` only for troubleshooting.

Product folders remain authoritative. `portfolio.json` is a reconciled index/cache.

## Scan boundary — hard rule
Every explicit full reconciliation must:
- identify the main `GPT-WORK` folder;
- recursively scan **the entire `GPT-WORK` tree**, including all current and future subfolders;
- recognize product folders wherever they have been moved inside that tree;
- exclude infrastructure such as `SKILLS`, `TEMPLATES`, and `PRODUCT PORTFOLIO` from being treated as products while still traversing appropriate product-bearing descendants;
- never use folders outside `GPT-WORK` as portfolio members.

### Missing-product deletion rule
After a successful full recursive scan, if an existing `portfolio.json` product cannot be matched to any product folder anywhere under `GPT-WORK`, **remove that product entry from `portfolio.json` and therefore from the dashboard**.

Do not retain it as stale, archived, missing, or historical. The dashboard is not a lifetime catalog. If the user moves a completed product to an archive or any other folder outside `GPT-WORK`, it disappears on the next successful full scan.

Only apply this deletion rule after a successful scan of the complete configured `GPT-WORK` tree. If scanning is incomplete or errors prevent reliable reconciliation, preserve unmatched entries and flag the scan as incomplete rather than deleting them.

## Stable identity
Each product has a stable `product_id`: existing portfolio ID first, then durable ID in state/specs, otherwise derive once from the first authoritative product-folder ID. Folder names/locations are mutable and never the sole identity key.

## Minimal product inspection
For each candidate inspect only enough to classify it:
- folder ID/name/current location;
- `SPECS.md`;
- `STATE.md` / `TO_DO.md` only when needed;
- final `.3mf` existence;
- `Marketplace/marketplace.md` and required marketplace assets;
- hero/reference candidates;
- explicit publication evidence.

Do not inspect every STL, 3MF, image, or historical artifact merely to build the board.

## Stage reconciliation
Use current folder placement and verified artifacts as authoritative evidence:
- under `GPT-WORK/PUBLISHED`, or explicit verified publication evidence -> `published`;
- under `GPT-WORK/READY TO PUBLISH` with a consistent product package -> `printed`;
- required marketplace package complete but still elsewhere under GPT-WORK -> `to_print`;
- final verified 3MF exists but marketplace package is incomplete -> `3mf`;
- durable approved specs exist but no final verified 3MF -> `specs`;
- otherwise recognized product idea -> `idea`.

`READY TO PUBLISH` means the user has manually completed the physical-print gate. Do not require the dashboard to independently prove that a printer ran when this authoritative manual folder placement is present.

Resolve contradictory evidence conservatively and set `needs_review: true`.

## Folder moves and refresh behavior
On every full scan, follow each product's current folder ID/location. When a product is manually moved anywhere within `GPT-WORK`, refresh:
- `folder_id`;
- `folder_url`;
- `location`;
- `stage`;
- `next_action`;
- `updated_at`;
- hero references as needed.

A move into `READY TO PUBLISH` therefore changes the product to `printed`. A move into `PUBLISHED` changes it to `published`. A move outside `GPT-WORK` causes removal on the next successful full scan.

## Hero selection and URL refresh
Every card should have a hero when one exists. Store:
- `hero_asset_id`;
- `hero_asset_url` or current path;
- `hero_kind`: `marketplace`, `actual_model`, `concept`, or `placeholder`.

Preference:
1. explicitly selected canonical marketplace hero;
2. approved actual-model/lifestyle hero;
3. approved concept/reference image;
4. deterministic placeholder.

Never choose assembly diagrams, technical orthographic views, obsolete versions, or unrelated images when a better product image exists.

On every full scan, verify/refresh hero identity and usable URL/path. Prefer durable asset IDs so parent-folder moves do not break identity. If the previous hero no longer exists, rediscover the best current hero from the product folder.

## Merge and removal
Read existing `portfolio.json`, merge scan evidence by `product_id`, refresh mutable paths/stages/hero references, and preserve useful user-curated fields. Unlike historical catalog behavior, confidently unmatched entries are removed after a successful complete GPT-WORK scan.

## Dashboard generation
Regenerate `index.html` from the same reconciled dataset as a six-column Kanban:
`Ideas` | `Specs` | `3MF` | `To Print` | `Printed` | `Published`.

Each card shows hero image, product name, compact status badge, next action when useful, current folder/location, and last updated time. Cards may link to current Drive folders. Keep the page responsive and self-contained.

## JSON schema
```json
{
  "schema_version": 3,
  "generated_at": "ISO-8601",
  "root_folder_id": "...",
  "products": [
    {
      "product_id": "...",
      "product_name": "...",
      "stage": "idea|specs|3mf|to_print|printed|published",
      "folder_id": "...",
      "folder_url": "...",
      "location": "...",
      "hero_asset_id": "...",
      "hero_asset_url": "...",
      "hero_kind": "marketplace|actual_model|concept|placeholder",
      "has_specs": true,
      "has_3mf": false,
      "has_marketplace": false,
      "printed": false,
      "published": false,
      "next_action": "...",
      "updated_at": "ISO-8601",
      "needs_review": false
    }
  ]
}
```

## Incremental writes from other skills
Other product skills may make tiny milestone upserts. These are hints only. On every full run, current folder/artifact evidence wins over stale JSON.

## Cost controls
Use folder metadata first, file contents only when needed, never read geometry just to classify stage, never regenerate hero images for the board, and use deterministic JSON/HTML generation.

## Completion
A run is complete when:
1. the full `GPT-WORK` tree has been successfully scanned;
2. product locations and stages are reconciled;
3. products no longer found anywhere under `GPT-WORK` have been removed;
4. hero references/URLs are refreshed where possible;
5. `portfolio.json` is valid;
6. `index.html` is regenerated as the six-column Kanban;
7. both files are saved in `GPT-WORK/PRODUCT PORTFOLIO/`.



## Persistent market assessments — assess once
Before any reconciliation, load the latest canonical portfolio.json. Preserve assessment fields by stable product_id through every merge, milestone upsert, folder move, rename, stage change and HTML regeneration. Never recalculate existing valid values during routine refreshes, even when newer imagery, specs, market conditions or methodology become available. Reassess only on an explicit user request; preserve unrequested fields. Missing individual fields may be filled without changing existing ones. Zero is a valid score, not missing.

For each product lacking either score or seasonality, inspect a representative current image and available specifications/marketing. Estimate customer interest in printable files on MakerWorld/Thangs, including free downloads; separately estimate commercial-license appeal to sellers manufacturing finished products for end users. Use 0–10 numbers, normally 0.5 increments. Consider appearance, differentiation, utility/giftability and print effort; commercial appeal additionally considers batch efficiency, assembly labor, packaging, set opportunities and seasonal/geographic audience. These are qualitative estimates, never measured demand, margins or sales forecasts. Assess seasonal products for their relevant selling window, not today's proximity to the holiday. Record evidence and a concise product-specific rationale; use low confidence when concept-only evidence is insufficient. Do not invent scores for unseen products: review available materials first.

Persist these fields directly on each product:
- seasonality: seasonal | year_round (display Year-round for unseasonal products)
- seasons: array, e.g. [Christmas, Winter], [Autumn, Halloween], or [] for year-round
- customer_interest_score: number 0–10
- commercial_appeal_score: number 0–10
- assessment_rationale: {customer_interest: text, commercial_appeal: text}
- assessment_confidence: low | medium | high
- assessed_at: original ISO timestamp; never reset on routine refresh
- assessment_method: qualitative_v1
- assessment_evidence: reviewed image asset ID, folder URL and available source references

Do not conflate duplicate-named product folders: preserve their distinct stable IDs and scopes. Do not lower scores merely because a product is in an early Kanban stage. Physical validation and production cost limits belong in the rationale.

## Deterministic generation helpers
Canonical GitHub path: cstnn/GPT_sites, PRODUCT PORTFOLIO/workflow/.
Keep build_portfolio.py and portfolio_assessments.py there; use the current PRODUCT PORTFOLIO/index.html as the HTML template. Download helpers when needed. Supply the fresh reconciled product inventory as --current, latest saved portfolio as --previous, current assessment-enabled HTML as --template, and evidence-reviewed missing-field proposals keyed by product_id as optional --proposals. Write --output-json and --output-html. The builder preserves existing valid assessments and refuses completion if mandatory fields are missing. It does not perform AI inference itself: review and propose only the missing values before calling it. Never use an older unassessed portfolio as --previous once assessments exist.

Every Kanban card must show seasonality/season labels, two separately labeled horizontal bars on a fixed 0–10 scale, numeric scores, original assessment date, confidence and expandable rationale. Keep customer interest blue and commercial appeal green, with a visible estimate legend. Include seasonal/year-round filtering and sorting by either score. Generate bars solely from saved JSON; never assess in the browser. Embed the exact same JSON as the standalone portfolio.json. Preserve all six stages and existing dashboard controls. Update the existing Drive JSON/HTML and GitHub copies in place; preserve existing deployment and audience. Save updated skill instructions to the existing Drive skill file and Git-sync their source.

Completion additionally requires all products to have saved assessments, helper checks proving refresh preservation/new-product handling, and matching JSON/HTML datasets. Routine refresh must retain scores and assessed_at byte-for-byte.


## Strict assessment scale — user correction 13 October 2026
Use qualitative_v2_strict: 1–2 very limited appeal; 3–4 niche/weak differentiation; 5–6 moderate opportunity with substantial competition; 7–8 clear strong advantages; 9–10 exceptional with product-specific measured demand evidence. Do not give every attractive design 7 or 8. Compare alternatives; penalize generic designs, narrow audiences and difficult production. Commercial scores independently consider labor, part count, colors, size, packing and seller viability. Do not mechanically force a spread. Existing values remain frozen unless explicitly requested. Preserve assessment_policy and assessment_history on refresh; archive prior scores/date/method when reassessment is requested.
