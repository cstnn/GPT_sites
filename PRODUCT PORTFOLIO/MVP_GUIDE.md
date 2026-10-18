# Product Hub MVP

Open `site/index.html` through an HTTP server. Both gallery and dedicated Kanban use the unchanged `portfolio.json` (32 records). Existing Drive thumbnails are used; inaccessible images have a placeholder. Search, filters, list mode, workspace tabs and local edits work without a backend.

## Save and handoff

1. Capture an idea with name, optional description and optional image up to 1 MB. Its draft UUID survives reload and appears in both views.
2. Edit product details, notes, test results, tasks, marketplace states or scores explicitly. Saving never publishes to a marketplace, overwrites a model, creates a Drive folder, or changes physical evidence flags.
3. Export **backup** to preserve all local work. Restore backup adds missing ideas/edits without replacing this device's existing pending edits. Backups contain your product data; keep them private.
4. Export **stage updates** for the existing reconciler. Only stage and explicit boolean platform decisions for existing products are included. Use the latest canonical JSON and review output before republishing. New draft IDs are deliberately excluded.
5. Copy a context prompt in AI Workflows and paste it into the existing ChatGPT Project. Attach a backup for rich-edit reconciliation or draft promotion. Completion must be verified in the Project; website buttons only copy prompts.

The rich-edit backup is not an automated import format for the existing reconciler. Its extra fields and draft IDs need reviewed mapping. Local journal entries are pending actions; canonical history remains preserved separately. A newer canonical timestamp marks a possible conflict instead of silently publishing local data.

## Reconcile existing supported fields

From repository root:

```sh
python3 'PRODUCT PORTFOLIO/workflow/build_portfolio.py' \
  --current scanned.json --previous 'PRODUCT PORTFOLIO/portfolio.json' \
  --template 'PRODUCT PORTFOLIO/site/kanban/index.html' \
  --overrides dashboard-updates.json \
  --output-json merged.json --output-html merged.html
```

Use a successful complete recursive inventory for membership/deletion decisions. Partial scans must not replace the portfolio. Builder calls do not themselves scan Drive. Place reviewed HTML back at `site/kanban/index.html` so its data and asset paths remain correct. Preserve shared `site/assets/store.js` and the existing schema-4 status contract. Do not restore the deleted duplicate legacy dashboard.

## Backend deployment gates

This MVP deliberately does not connect its frontend to the Worker. `backend/wrangler.toml` still needs a real account-managed D1 ID. Before production:

- Use Cloudflare's secure account sign-in flow; never paste credentials into source/chat. Back up D1 before migrations/import. Fresh DB: apply schema.sql; older DB: inspect its schema and apply migrations/0002_status_publication.sql only if needed. It is not safe to reapply ALTER statements blindly.
- Configure Access for the API origin, with ACCESS_TEAM_DOMAIN (team.cloudflareaccess.com), ACCESS_AUD (Access application audience), ALLOWED_EMAILS (comma-separated owners), and DB binding in the Worker environment. These are server configuration; no client tokens. Keep private source/asset data behind authenticated hosting; existing public repository JSON is already public.
- Publish frontend and API under one authenticated origin before wiring private reads or writes; PATCH rejects foreign/missing Origin. Verify workers.dev/custom-domain bypasses still deny unauthorized requests. Health is generic and public; it does not test DB readiness.
- Seed initial records only. Seed reruns never overwrite existing rows; this is not reconciliation. Verify every imported full snapshot/assessment/history and derive a reviewed compatibility export before making D1 authoritative.
- Implement missing transactional CRUD and an audited, versioned import/export/reconciliation path, including stable draft-to-Drive identity mapping. Exercise unauthorized reads/writes and racing updates against actual D1. Do not enable dual writers prematurely.

## Publish and verify

The feature branch is reviewed through a follow-up PR because PR #1 is merged. Do not merge or deploy production as part of this development task. After review, merge and let the existing Pages configuration publish. Verify returned deployment status plus actual page content (the new gallery and assets, not just HTTP 200). Existing public Pages serves the placeholder until then. No new production URL is claimed here.

## Validation

Run the commands in tests/README.md. Browser smoke check: capture a disposable local idea, add a task, reload, verify the same ID, open Kanban, move via selector, reopen workspace, verify stage/history. Check gallery/list, all eight tabs and keyboard focus. Test a narrow phone viewport on deployment; local browser QA in this task used the available desktop viewport.
