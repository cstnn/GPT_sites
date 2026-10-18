# Product Dashboard Synchronization Contract

## Purpose
This contract is the shared operational model used by the product-development skills, the portfolio reconciler, and the interactive dashboard.

## Canonical stages
`idea -> specs_ready -> 3mf_ready -> print_ready -> to_publish -> published`

A product may additionally be `blocked: true` without creating a separate stage.

## Canonical status fields
Each portfolio product may contain:
- `stage`
- `status`
- `blocked`
- `blocker_reason`
- `next_action`
- `updated_at`
- `last_update_source`: `skill | todo_sync | dashboard | folder_reconciliation`
- `history[]`
- `has_specs`, `has_3mf`, `has_marketplace`, `printed`, `published`

## TO_DO.md machine-readable header
Product workflows should keep these fields at the top when applicable:

```md
# Product Name

Stage: 3mf_ready
Status: In Progress
Blocked: No
Next Action: Prepare marketplace package
Test Print: Not Started
Model: Complete
Marketing: Not Started
MakerWorld: Not Published
Thangs: Not Published

## Remaining Tasks
- [ ] ...
```

Human-readable tasks remain below the header.

## Writers
### Product skills
Write only at meaningful milestones. Update TO_DO.md/STATE.md first, then make a tiny portfolio upsert. Do not scan the whole portfolio.

### Dashboard
Manual changes are explicit user intent. The dashboard writes a local pending override immediately. Export updates downloads dashboard-updates.json; browser storage cannot be read by remote workflows. Pass that file as --overrides to build_portfolio.py. The next dashboard reconciliation/publish operation merges those overrides into `portfolio.json`, records source `dashboard` and history, then republishes the JSON and dashboard. No separate database is used.

### End-of-day reconciler
Recursively scan GPT-WORK, read product control files, merge newer evidence into the central status record, refresh folder/hero metadata, append meaningful history, and regenerate/deploy the dashboard.

## Conflict rules
1. Never silently discard a newer explicit manual dashboard change because an older TO_DO.md still contains the previous stage.
2. Newer explicit workflow evidence may supersede a manual change when the workflow genuinely progressed.
3. Authoritative folder placement wins for physical gates:
   - under `READY TO PUBLISH` -> `to_publish`
   - under `PUBLISHED` -> `published`
4. Contradictory evidence that cannot be safely resolved sets `needs_review: true`.
5. Products absent from a successful complete GPT-WORK scan are removed.

## History event
```json
{
  "at": "ISO-8601",
  "source": "dashboard",
  "field": "stage",
  "from": "3mf_ready",
  "to": "print_ready",
  "note": "Manual Kanban move"
}
```

## Storage
`portfolio.json` is the single portfolio status store. Product control files such as `TO_DO.md` and `STATE.md` remain workflow evidence; reconciliation merges them into the JSON according to the conflict rules above.

## Stage migration and marketplace tracking (schema 4)
Display labels: Idea / Concept, Specs ready, 3MF ready, Print ready, To Publish, Published. Stable keys: idea, specs_ready, 3mf_ready, print_ready, to_publish, published. Migrate only current stage values: idea→idea, specs→specs_ready, 3mf→3mf_ready, to_print→print_ready, printed→to_publish, published→published. Historical events and physical printed/published flags remain unchanged. Use portfolio_status.py; migration is idempotent and preserves other fields.

Each product has publication: {thangs: null|boolean, makerworld: null|boolean}. True means explicitly confirmed, false explicitly unconfirmed, null unknown/unverified. Never infer either platform from overall Published stage, published flag, folder placement, or the other platform. Preserve existing Published products even if both platforms are unknown. Checking either or both never automatically moves the stage; moving stages never changes checkboxes. Show separate THANGS and MAKERWORLD checkboxes in To Publish and Published.

Load the latest canonical JSON before every merge. Preserve saved platform decisions by product_id, including explicit false, and publication_updated_at per platform. New verified platform evidence may replace saved values only with a newer platform timestamp. Routine folder scans must not reset them. Export updates from the browser and supply --overrides dashboard-updates.json to the builder; record field-level history for changes. Browser changes persist on reload and JSON refresh, but are device-local until exported, merged and republished. Remote workflows cannot consume localStorage automatically. Reset local changes explicitly discards pending edits.

READY TO PUBLISH remains the authoritative physical gate and maps to to_publish; PUBLISHED maps to published without platform assumptions. Preserve newer explicit manual changes against older control-file evidence; newer real workflow evidence may supersede them. Contradictions require review. Keep all identity, hero, assessment, history, scan-boundary and complete-scan-only deletion rules above.

## Private Google Drive edition — cutover contract
Once the owner-only Apps Script deployment is activated, its configured Drive portfolio.json is the mutable store for that edition. All portfolio writes, including complete-scan reconciliation, must use that same Apps Script project so its script lock and content revision protect them. Do not trash/recreate or directly replace the file from legacy jobs. Source assets and control files remain in Drive; GitHub JSON becomes an explicitly exported compatibility snapshot, not a concurrent writer. See google-apps-script/README.md. These rules do not claim that a deployment or owner authorization has already completed.
