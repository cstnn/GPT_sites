# Private Google Drive edition

The private Apps Script deployment serves the existing Hub and Kanban interfaces and uses `google.script.run` for authenticated calls. No Cloudflare account or browser-held Drive token is required. GitHub Pages remains the separate local-draft edition.

## Build and install

```sh
python3 'PRODUCT PORTFOLIO/google-apps-script/build_app.py' \
  --output /tmp/norholm-google-app --file-id YOUR_EXISTING_FILE_ID --owner YOUR_GOOGLE_EMAIL
```

The output contains Code.gs (model, server and published schema-4 baseline), Index.html, Board.html and appsscript.json. Install them in a standalone Apps Script project. Do not put a real owner's generated package or credentials in public source. Script IDs/file IDs are not authorization.

Deploy as a web app, **execute as the accessing user**, access **only myself**. Configure `OWNER_EMAIL` and `PORTFOLIO_FILE_ID` as script properties or run the generated private `configureOwner_` helper in the editor. The manifest requests Drive and email scopes. Google first-run consent must be completed by the owner. The code independently checks active and effective identities against OWNER_EMAIL for every public entry point, so an accidental wider deployment still fails closed.

## Explicit cutover

1. Read the existing Drive file again. Run `initializePortfolio` once from the editor after review. It refuses changed product membership, backs up the original file in the same portfolio folder and records its ID in `MIGRATION_BACKUP_ID`, then applies the existing schema-4 key migration and preserves newer explicit marketplace decisions/history from the published baseline. It does not replace the file or change its ID.
2. Open the private web app. Every load/refresh calls `getPortfolio` against that same file, with no GitHub or embedded-data fallback. A failed connection displays an error and leaves local drafts intact.
3. Save uses a SHA-256 content revision, script-wide lock, field validation and audit history, then reads the file back before acknowledging success. A stale revision is rejected. Pending browser edits are cleared only when unchanged since submission; failures retain them. Request IDs make server retries idempotent.
4. New ideas retain their browser-generated ID and create a separate Drive folder under the configured portfolio's existing GPT-WORK/IDEAS folder. Folder IDs are stored separately. Pending folder mappings allow a retry without duplicating the folder. A failed connection keeps the idea locally with a retry button. No marketplace publishing occurs.
5. Export local Pages drafts before switching origins, then restore them into the private app. A restored existing-product draft that conflicts with newer canonical timestamps must be reviewed; it is not silently uploaded.

## One writer for the canonical file

All writers must go through this Apps Script project. Script locks serialize this project's operations; they **cannot lock Google Drive against unrelated scripts, connectors or direct edits**. Disable old jobs that replace, trash/recreate or directly upload portfolio.json before cutover. Assets and product control files may continue to be edited normally.

The external full-scan workflow must read a fresh `getPortfolio` result (including revision), perform the same complete recursive Drive scan, and submit `{revision, scan}` to `reconcilePortfolio` through this project's authenticated RPC. Partial scans are rejected, product IDs match by stable ID or retained folder ID, manual rich fields/marketplace decisions/assessments are preserved, physical folder gates retain authority, and an outdated scan cannot delete a newly captured idea. Any revision conflict requires a fresh read/review rather than blind resubmission. Do not write reconciler output directly to Drive or treat a public GitHub snapshot as the current mutable store.

This is not automatic Drive scanning: the existing scanner remains external. The Google-hosted edition owns mutable portfolio fields. GitHub JSON is a read-only compatibility snapshot until a deliberate export. Source assets stay in Drive.

## Verification and limitations

Run all existing suites plus `node 'PRODUCT PORTFOLIO/tests/google-drive-app.test.cjs'`. Tests use service mocks; owner consent, actual owner-only deployment, same-file readback, a harmless write/revert, refresh and stale-tab rejection must also be checked against the deployed Google service before claiming live persistence.

Apps Script has execution/storage quotas and Google requires authorization. No tokens are returned to HTML. There are no public JSON GET/POST endpoints or unauthenticated proxy routes. Recovery uses the migration backup plus Drive version history; stale/failed saves remain locally exportable. Independent direct Drive writers are not safe during a save, so cutover includes updating those workflow instructions.

Primary references: https://developers.google.com/apps-script/guides/web and https://developers.google.com/apps-script/guides/html/communication and https://developers.google.com/apps-script/reference/lock/lock-service
