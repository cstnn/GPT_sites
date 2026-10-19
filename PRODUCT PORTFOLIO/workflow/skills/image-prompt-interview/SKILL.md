---
name: image-prompt-interview
description: Interview the user one question at a time to turn a rough product/image idea into a precise, approved visual specification and image-generation brief, with minimal token overhead and milestone-based resumable state.
---

## REQUIRED FIRST STEP — NORHOLM shared contract
Before **any** Google Drive file/folder creation, update, move, rename or deletion, or any portfolio JSON edit, fetch and read the **current** `GPT-WORK/SKILLS/NORHOLM-CONTRACT.md` (Drive folder ID `1ToPGkISZmpSt3t4JKK5SOnIQUUsUejiT`). GitHub mirror: `cstnn/GPT_sites/PRODUCT PORTFOLIO/workflow/NORHOLM-CONTRACT.md`. The Drive contract is authoritative for Drive writes. Obey its exact canonical filenames, destinations, status gates, identity/upsert rules and post-write verification. If contract cannot be read, stop Drive writes and report the blocker. **This instruction supersedes any conflicting legacy status or storage instructions elsewhere in this skill.** Read current `PRODUCT PORTFOLIO/portfolio.json` to confirm live status enum before a portfolio write.



# Image Prompt Interview

## Purpose
Turn a rough idea, reference, or short prompt into a precise visual specification for image generation. Ask one concise question at a time, preserve settled decisions, and generate once essentials are clear or the user explicitly says to proceed.

This skill defines the product visually. Detailed print engineering, tolerances, joints, mesh validation and 3MF construction belong to Product-to-3MF.

## Runtime architecture
- Lead/orchestrator: GPT-6.1 Sol, Medium reasoning.
- The Lead normally conducts the interview, maintains the compact evolving spec, decides the next question, resolves ambiguity, reviews the final brief, and communicates with the user.
- Do not delegate routine extraction/bookkeeping after every answer. This usually costs more context than it saves.
- Use a lower-cost worker only when useful for a genuinely large requirement set, conflicting inputs, reference analysis, or mechanical transformation.
- Near completion, a prompt-preparation worker may convert the compact approved spec into a detailed image-generation brief. Prefer a low-reasoning capable worker. The Lead reviews it before generation.
- Do not use High reasoning by default. Escalate only for genuine ambiguity or difficult design reconciliation.

Default efficient path:
`Lead interview -> compact spec -> optional one-time prompt worker -> Lead review -> generation`

## Interview behavior
- Ask only one question at a time.
- Never ask the user to repeat settled information.
- Prefer short, decision-oriented questions and a few differentiated options when helpful.
- If the user supplies several answers at once, capture all of them and continue with the next unresolved consequential item.
- Do not mechanically ask every category; skip known or irrelevant fields.
- Minor reversible details may be labeled assumptions. Consequential visual decisions require confirmation.
- If the user says “ready”, “generate”, “go ahead”, or equivalent, stop interviewing and proceed with the best sufficiently complete spec. Do not silently invent consequential details.
- Preserve the latest accepted reference image/description as the fidelity anchor.

## Information to clarify when relevant
1. Output type/purpose.
2. Subject and essential identity/features.
3. Style and realism/stylization.
4. Silhouette, pose, proportions, expression and visible geometry.
5. Functional/physical details that visibly affect the design.
6. Approximate dimensions/scale when visually relevant.
7. Colors, materials, finishes and textures.
8. Visible part separations when relevant.
9. View, orientation, framing and aspect ratio.
10. Background/environment, lighting and presentation.
11. Immutable features and explicit exclusions.
12. Reference-image fidelity requirements.

## Compact evolving specification
The Lead maintains only the settled facts needed to make the next decision and final prompt. Avoid narrative summaries and repeated restatement.

Recommended fields:
- product/name
- purpose
- size/scale
- style
- silhouette/pose/proportions
- visible features
- parts (name, high-level dimensions/scope, intended connection relationship if visually relevant, suggested color)
- colors/materials/finish
- view/presentation
- immutable requirements
- exclusions
- reference anchor
- unresolved consequential items

When this interview is intended to feed Product-to-3MF, the modeling workflow remains responsible for final technical joinery and engineering decisions.

## Completion test
Proceed to prompt preparation when:
- subject and intended output are clear;
- essential silhouette/proportions/pose are clear enough;
- key colors/materials/details are known or safely assumable;
- view/presentation is known or safely assumable;
- no unresolved contradiction would materially change the image.

Do not prolong the interview for low-impact details.

## Prompt preparation
At completion, either the Lead or one low-reasoning prompt worker converts the compact spec into the generation brief. Prefer one bounded handoff rather than repeated worker calls.

The brief should contain:
- identity and purpose;
- exact visible features;
- silhouette/proportions/pose/expression;
- colors/materials/finishes;
- visible part boundaries/functional features;
- camera/view/framing/aspect ratio;
- lighting/background/presentation;
- reference-fidelity instructions;
- immutable features;
- explicit exclusions/negative constraints;
- labeled minor assumptions.

The Lead reviews and corrects the brief before generation.

## Generation gate
Generate only when essentials are sufficiently clarified or the user explicitly instructs the system to proceed despite optional gaps.

Use the approved specification as source of truth. Image generation must not silently redesign the product.

If the image includes a rendition of the user and no usable current-conversation photo exists, request an image of the user before generation.

## Product-to-3MF handoff
Hand off only what downstream work needs:
- approved visual specification;
- approved concept image(s);
- immutable visual features;
- established dimensions/scale;
- colors/material intent;
- visible functional requirements;
- explicitly unresolved items.

Do not duplicate detailed Product-to-3MF engineering rules here.

## Milestone-based resumable state
Persistent state exists to make interruptions cheap, not to create work after every answer.

When this skill is used in a persistent product workflow, maintain a compact `STATE.md` in the product folder. The Lead owns its meaning; a low-cost worker may perform the mechanical write when economical.

### Write/update STATE.md only at major milestones
Examples:
- the main interview/specification is substantially settled;
- a concept image is generated and accepted/rejected with consequential feedback;
- a concept image is approved;
- the final image brief is approved;
- the workflow becomes blocked or is waiting for the user/capacity;
- before an expected pause/interruption;
- before handing off to Product-to-3MF;
- at completion.

Do NOT rewrite `STATE.md` after every question, minor choice, or routine clarification.

### STATE.md should stay compact
Record only:
- workflow status: `in_progress`, `blocked`, `waiting_for_user`, `waiting_for_capacity`, or `complete`;
- current stage;
- latest major settled/approved milestone;
- compact settled visual specification or pointer to the authoritative spec;
- exact next question/action;
- latest approved reference/concept image identifier when applicable;
- unresolved consequential items;
- critical resume warning, if any.

Avoid full conversation summaries, completed-step narration, repeated prompts, and verbose history.

### Resume rule
When the user says `resume`, `continue`, or equivalent—even in the same Work conversation—resume from durable state rather than replaying the conversation.

1. Read `STATE.md` first.
2. Load the authoritative compact spec/reference(s) named there.
3. Load only the exact artifact needed for the next action.
4. Continue from the recorded next question/action.
5. Do not re-read the full transcript or regenerate completed work unless state is insufficient, inconsistent, or an expected artifact is missing.
6. Use conversation history only as a fallback to repair missing/ambiguous durable state.

The same resume contract applies if the work is continued in a fresh Work conversation.

## Final persistence
When the interview/spec is complete and the user confirms creation of a dedicated product folder, store the approved product specification and relevant image prompt/brief in that product folder. Keep them concise and suitable for downstream Product-to-3MF use.

## Portfolio dashboard integration
The shared portfolio source is `GPT-WORK/PRODUCT PORTFOLIO/portfolio.json`.

This skill performs only a tiny milestone update; it must not scan the whole portfolio. When a dedicated product folder is created or the interview reaches a durable milestone:
- upsert the product by stable `product_id`;
- set `stage` to `idea` while only an idea/concept exists, or `specs` once an approved product specification exists;
- store `product_name`, current `folder_id`/`folder_url` when known, and `next_action`;
- store `hero_asset_id` plus `hero_asset_url`/path when available. Prefer the latest approved concept image until a later workflow supplies a better hero;
- update `updated_at`;
- preserve fields owned by later stages.

If the portfolio file is temporarily unavailable, do not block product work. Record a compact pending portfolio-sync note in `STATE.md`; the Product Portfolio Dashboard skill will reconcile it on its next scan.

## Quality ownership
The GPT-6.1 Sol Lead is accountable for preserving user intent, asking only useful questions, avoiding repeated context, resolving consequential ambiguity, maintaining compact durable checkpoints, reviewing any worker output, and deciding when generation is ready.

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
