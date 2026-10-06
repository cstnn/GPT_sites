# Product Dashboard Synchronization Contract

## Purpose
This contract is the shared operational model used by the product-development skills, the portfolio reconciler, and the interactive dashboard.

## Canonical stages
`idea -> specs -> 3mf -> to_print -> printed -> published`

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

Stage: 3mf
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
Manual changes are explicit user intent. The dashboard writes a local pending override immediately. The next dashboard reconciliation/publish operation merges those overrides into `portfolio.json`, records source `dashboard` and history, then republishes the JSON and dashboard. No separate database is used.

### End-of-day reconciler
Recursively scan GPT-WORK, read product control files, merge newer evidence into the central status record, refresh folder/hero metadata, append meaningful history, and regenerate/deploy the dashboard.

## Conflict rules
1. Never silently discard a newer explicit manual dashboard change because an older TO_DO.md still contains the previous stage.
2. Newer explicit workflow evidence may supersede a manual change when the workflow genuinely progressed.
3. Authoritative folder placement wins for physical gates:
   - under `READY TO PUBLISH` -> `printed`
   - under `PUBLISHED` -> `published`
4. Contradictory evidence that cannot be safely resolved sets `needs_review: true`.
5. Products absent from a successful complete GPT-WORK scan are removed.

## History event
```json
{
  "at": "ISO-8601",
  "source": "dashboard",
  "field": "stage",
  "from": "3mf",
  "to": "to_print",
  "note": "Manual Kanban move"
}
```

## Storage
`portfolio.json` is the single portfolio status store. Product control files such as `TO_DO.md` and `STATE.md` remain workflow evidence; reconciliation merges them into the JSON according to the conflict rules above.
