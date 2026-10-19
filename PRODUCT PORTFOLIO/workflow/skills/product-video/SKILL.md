---
name: product-video
description: Create short-form product-video scripts and machine-readable JSON handoffs grounded in approved product images and specifications. Use for Instagram Reels, TikTok, YouTube Shorts, and downstream image-to-video AI generation.
---

## REQUIRED FIRST STEP — NORHOLM shared contract
Before **any** Google Drive file/folder creation, update, move, rename or deletion, or any portfolio JSON edit, fetch and read the **current** `GPT-WORK/SKILLS/NORHOLM-CONTRACT.md` (Drive folder ID `1ToPGkISZmpSt3t4JKK5SOnIQUUsUejiT`). GitHub mirror: `cstnn/GPT_sites/PRODUCT PORTFOLIO/workflow/NORHOLM-CONTRACT.md`. The Drive contract is authoritative for Drive writes. Obey its exact canonical filenames, destinations, status gates, identity/upsert rules and post-write verification. If contract cannot be read, stop Drive writes and report the blocker. **This instruction supersedes any conflicting legacy status or storage instructions elsewhere in this skill.** Read current `PRODUCT PORTFOLIO/portfolio.json` to confirm live status enum before a portfolio write.



# Product Video Skill

## Purpose
Turn an approved 3D-printing product, its reference images, and its specifications into a concise 10–15 second short-form product video plan and a detailed JSON handoff for a downstream video-generation AI.

## Grounding hierarchy
1. **Approved product images are the PRIMARY VISUAL SOURCE OF TRUTH.**
2. **Approved product specifications are SECONDARY TECHNICAL GROUNDING.**
3. **The video script controls cinematography, motion, environment, timing, text, transitions, and audio.**
4. The downstream AI may generate the treatment around the product, but must not redesign the product.

If image and specification conflict on visual appearance, stop and ask the user for clarification before finalizing the video script.

## Required inputs
- Product name.
- At least one approved product image; use all useful approved views when available.
- Latest approved product specification when available.
- Optional: desired platform, duration, CTA, mood, music direction, or campaign goal.

If a product folder is supplied, inspect its approved/latest product images and latest specs before writing the script.

## Product fidelity rules
- Treat supplied approved product images as authoritative.
- Preserve exact silhouette, geometry, proportions, colors, visible surface details, component relationships, and recognizable design features.
- Use image-to-video/reference-conditioned generation whenever the downstream tool supports it.
- Do not recreate, reinterpret, substitute, morph, bend, or redesign the product.
- Do not invent geometry, decorations, accessories, patterns, colors, moving parts, assembly behavior, or product features.
- Camera, lighting, background, depth of field, shadows, reflections, and secondary environmental objects may change unless explicitly constrained.
- Keep product identity consistent across every scene and frame.
- When possible, assign each scene a specific supplied reference image or approved view.

## Default video format
- Format: vertical short-form product showcase.
- Aspect ratio: 9:16.
- Resolution target: 720x1280 (720p); use higher resolution only when requested.
- Duration: choose the shortest duration that tells the story well; normally 10–15 seconds. Never stretch a weak concept merely to reach 15 seconds.
- Platforms: Instagram Reels, TikTok, YouTube Shorts.
- Default pacing: visually clear, concise, premium.
- Product must remain the primary visual subject.

## Creative workflow
1. Inspect approved product images and specs.
2. Identify the strongest visual selling point.
3. Decide the single video story/hook.
4. Default to one continuous shot with one coherent camera movement. Describe story beats within that shot; do not turn each beat into a separately generated clip. Use multiple clips only when requested or when the selected model cannot support the required length/action, or a reviewed continuous take fails fidelity.
5. Assign exact start/end times.
6. For every scene define:
   - reference image/view
   - composition and framing
   - camera angle
   - lens/framing feel when useful
   - product position/orientation
   - camera motion type
   - motion direction
   - motion magnitude/distance/degrees when useful
   - motion speed and duration
   - permitted product motion, normally none
   - environment/background
   - lighting direction and purpose
   - focus/depth of field
   - text overlay, timing, placement, and animation
   - transition in/out
7. Add global fidelity and negative constraints.
8. Add audio/music/VO direction only when useful.
9. Output a short human-readable summary followed by the canonical JSON handoff.

## Scene design principles
- Open with the most visually distinctive feature or strongest hook.
- Favor cinematic camera motion over artificial product motion.
- Use slow, stabilized movements for sculptural/decor products unless the product concept calls for energy.
- Do not use magical self-assembly unless specifically requested.
- If assembly is important, prefer a separate assembly-focused short rather than weakening the main hero video.
- End with a clear hero frame and optional CTA.
- Keep text minimal and readable on a phone.


## Mandatory generation prompt
Every canonical JSON must contain a top-level `generation_prompt` immediately after `project`. Define it as a production-brief instruction: first generate one continuous clip from the top-level `flow_prompt` and uploaded references. Use separate clips only as a justified fallback. Require product preservation without claiming that JSON fields enforce geometry or exact timing.

## Canonical JSON structure
```json
{
  "schema_version": "1.2",
  "project": {
    "product_name": "",
    "video_type": "short_form_product_showcase",
    "target_duration_seconds": 0,
    "aspect_ratio": "9:16",
    "target_resolution": "720x1280",
    "platforms": []
  },
  "generation_prompt": "Use this JSON as a production brief. Generate one continuous product showcase from flow_prompt and the uploaded reference PNGs first. Select supported settings in Flow. Use multiple clips only if the supported length or reviewed result requires a fallback. Minimize external editing.",
  "generation_strategy": "single_continuous_clip_first",
  "flow_prompt": "",
  "reference_grounding": {
    "product_images": {
      "role": "PRIMARY_VISUAL_SOURCE_OF_TRUTH",
      "references": [],
      "usage": "Use supplied approved product images as the actual product reference in every scene.",
      "instructions": []
    },
    "product_specification": {
      "role": "SECONDARY_GROUNDING",
      "reference": "",
      "usage": "Use for dimensions, materials, colors, construction and behavior.",
      "conflict_rule": "For visual appearance, approved product images take precedence unless the user explicitly resolves a discrepancy."
    },
    "allowed_generation": [
      "background environment",
      "lighting",
      "shadows",
      "reflections",
      "camera movement",
      "depth of field",
      "secondary decorative objects"
    ],
    "protected_product_attributes": []
  },
  "creative_direction": {
    "style": "",
    "mood": [],
    "pace": "",
    "visual_priority": "",
    "story": ""
  },
  "product_fidelity": {
    "reference_image_required": true,
    "preservation_requested": ["geometry", "material", "proportions"],
    "limitation": "Prompting requirements, not enforceable generation controls; review the generated result.",
    "instructions": []
  },
  "global_camera_rules": {
    "motion_style": "",
    "stabilization": "perfectly stabilized",
    "motion_intensity": "",
    "avoid": []
  },
  "scenes": [
    {
      "scene": 1,
      "name": "",
      "reference_filenames": [],
      "flow_input_mode": "frames",
      "flow_prompt": "",
      "generation_duration_seconds": "Select a currently supported duration; trim to scene duration in editing.",
      "text_overlay_delivery": "omit_unless_needed; try_in_generation_if_requested; editing_fallback",
      "transition_delivery": "none_for_continuous_shot",
      "start_seconds": 0,
      "end_seconds": 0,
      "duration_seconds": 0,
      "composition": {},
      "camera_motion": {
        "type": "",
        "direction": "",
        "duration_seconds": 0,
        "speed": ""
      },
      "product_motion": "none",
      "environment": {},
      "lighting": {},
      "focus": {},
      "text_overlay": null,
      "transition_in": "",
      "transition_out": ""
    }
  ],
  "audio": {
    "music_direction": "",
    "voiceover": null,
    "sound_effects": "",
    "priority": ""
  },
  "negative_constraints": []
}
```

## Mandatory reference-grounding instructions
Always include equivalent instructions to:
- Preserve the exact product shown in the approved reference images.
- Use image-to-video or reference-conditioned generation whenever supported.
- Do not recreate, redesign, reinterpret, or substitute the product.
- Maintain identical geometry, proportions, colors, surface details, and component relationships across scenes.
- Camera angle and environment may change; protected product attributes may not.
- Specs clarify the product but must not be used to invent unspecified visual details.

## Negative constraints
Tailor these to the product, but normally include:
- no product morphing
- no geometry changes
- no invented features
- no unrequested color/material changes
- no inconsistent product between scenes
- no floating unless conceptually required
- no human hands unless requested
- no camera shake
- no aggressive camera moves unless requested
- no generated text physically embedded into the product/environment
- no logos unless supplied/approved



## Shorts handoff asset package
For every Product Video run tied to a product folder, make the `Shorts` folder a self-contained downstream-AI handoff package.

Before finalizing the JSON, inspect the existing product folder and any `Marketplace`, `Marketing`, or similarly named marketing-assets subfolder. Select and **COPY — NEVER MOVE —** the strongest approved visual references into `Shorts`. Originals must remain untouched in their original locations.

Include when available:
- 1 strongest approved hero image.
- 1–2 approved lifestyle/context images.
- 3–5 useful multi-angle geometry references, prioritizing front, three-quarter, side, back, and top only when useful.
- Assembly/detail imagery only when the planned short specifically needs it.

Selection rules:
- Prefer latest approved/final imagery over obsolete revisions.
- Geometry renders/product photos govern product fidelity; lifestyle/marketing images guide presentation/environment and must not override geometry.
- Avoid redundant near-identical references; select enough views for reliable 3D reconstruction without copying every asset.
- Never generate replacement reference images merely to fill a missing category.
- Use clear copied filenames such as `01_Hero_<Product>.png`, `02_Lifestyle_<Product>.png`, `03_Angle_Front_<Product>.png`.
- The canonical JSON must reference the copied filenames inside `Shorts` as portable visual inputs. Do not use source Drive IDs/URLs as generation inputs. Use local copied filenames; retain provenance only separately when needed.
- Never delete, move, rename, or otherwise modify the source images as part of this packaging step.

The intended `Shorts` package is: canonical JSON script + selected copied hero image(s) + selected copied lifestyle image(s) + selected copied multi-angle references + any short-specific copied detail/assembly image.

## Storage and folder convention
- For every Product Video run tied to a product folder, create or reuse a child subfolder named `Shorts`.
- Store the canonical final video-script JSON in `<product folder>/Shorts/`.
- Use a descriptive filename such as `<Product_Name>_Short_01.json`; increment the number for distinct video concepts.
- Keep all original product images, 3MF/STLs, and marketplace assets in their existing locations. Copy the selected approved visual references into `Shorts` for the self-contained handoff package; never move the originals.
- When revising the same short concept, replace/update the existing JSON rather than creating confusing duplicate revisions where the storage tool supports it.

## Output requirements
Return:
1. A concise creative summary including desired duration, supported generation duration, and generation strategy.
2. One complete, valid JSON object suitable for handoff to another AI, including the mandatory top-level `generation_prompt`.
3. Do not omit camera direction, motion duration, or grounding constraints.
4. Do not claim the video itself has been generated; this skill creates the script/handoff.


## Google Flow execution defaults
- Treat JSON as the master production brief, not an executable Flow import or API request. Do not claim that pasting JSON binds settings, attaches Drive files or locks geometry.
- Produce one top-level natural-language `flow_prompt` covering the complete continuous shot: style, subject, coherent action, one simple camera movement, environment, lighting, product preservation and audio intent. Paste that prompt into Flow. Keep scene/beat metadata for planning; it does not imply separate generation. Produce per-clip prompts only for a justified fallback.
- Set aspect ratio 9:16, resolution 720p, supported generation length and one output in the UI. Distinguish desired final duration from supported generation duration. Do not promise one-shot 10–15 seconds if the selected model does not support it. Prefer a shorter complete continuous showcase when it meets the goal; otherwise use supported extension with continuity review or the minimum number of clips. Explain the limitation before executing a fallback.
- Choose frames mode to animate an approved composition; list its start-frame PNG first. Choose ingredients mode to guide a different composition or setting. Verify current selected-model reference limits and feature availability; do not assume all package images fit one request.
- Attach actual PNG files copied into Shorts; filenames alone do not upload assets. Verify every referenced filename exists. Reuse existing approved copies rather than duplicating them. Explain that users download those PNGs before dragging them to Flow.
- Keep motion subtle and within supported views. Prefer a slight straight pullback without upward drift, and a small arc around 5 degrees instead of a large orbit, unless the user requests otherwise. Avoid pullbacks beginning on extreme detail when they require inventing unseen geometry.
- Minimize post-production by default. Use no cuts/transitions for the continuous shot. Include suitable ambience and simple audio/music intent in the generation prompt when the selected model supports audio; do not promise exact music, licensing, synchronization or clean generated captions. Omit unnecessary captions and voiceover. If requested, try short generated text/voice within supported capabilities and review readability and accuracy; use external editing only for required elements that generation cannot deliver reliably. Preserve requested caption/music intent in the master brief and clearly list any unavoidable remaining editing.
- Preserve geometry, proportions, material and details as explicit prompt requirements; never describe `geometry_lock` or similar custom fields as actual Flow controls. Inspect results for drift and reject inaccurate takes.
- Include a `flow_execution` object with settings, attachment/mode instructions, generation-versus-editing steps, reference-limit note and product-fidelity review checks.
- Verify current Flow capabilities before execution using official documentation: https://support.google.com/flow/answer/16353334 and https://support.google.com/flow/answer/16352836 . Use https://deepmind.google/models/veo/prompt-guide/ for prompt construction. Do not hard-code current credit costs or model availability.

## Continuous-shot review
- One shot may reduce mismatches between independent clips, but does not guarantee product consistency. Reject morphing, changing details or invented geometry.
- Keep the approved start composition and conservative motion; avoid revealing unsupported surfaces.
- Retry a simpler continuous take before splitting it into clips solely because of drift.

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
