# Repository Instructions

## Scope and compatibility

- This module extends Dungeon World's actor sheets and character controls for Foundry VTT v12 and v13. Prefer the system's sheet behavior and Foundry APIs over custom implementations.
- Work on the requested branch. For ongoing development, use `dev`; changes to `main` or releases require an explicit request.
- Preserve the module ID `dw-extra-sheets`, document data paths, actor flags and existing saved data unless a migration is part of the task.
- Keep v12/v13 compatibility paths narrow and documented. Do not silently hide invalid configuration or unexpected runtime states.

## Implementation and regression safeguards

- Keep sheet preparation, listeners and character/chat helpers focused and readable. Reuse meaningful shared logic from `scripts/utils/`; avoid duplicate parsing, re-export facades and unnecessary one-off helpers.
- Use Foundry document APIs for actor and item changes. Respect ownership, sheet editability and GM-only controls; do not bypass permissions.
- Keep render-time safeguards local and lightweight. Rely on Foundry's document/render lifecycle; avoid global window sweeps, arbitrary delays, retries and repeated scheduling.
- Keep the native debility state and its recovery counter consistent in a single actor update. Preserve existing recovery values and owner-only editing.
- Preserve the previous roll formula when toggling Herculean Appetites. Keep its character controls and chat-result evaluation separate.
- Preserve native Dungeon World item, move, roll, inventory and weight behavior when extending sheets.

## CSS and UI hooks

- Follow [CSS naming](docs/css-naming.md). Stylesheet filenames start with `DWES`; custom UI hooks and custom properties use `dwes-` and `--dwes-`.
- Use functional names after the prefix; do not repeat the expanded module name. NPC styles use `.dwes-npc`.
- Update CSS, templates, JavaScript selectors and manifest paths together when renaming hooks or files.
- Preserve Foundry, Dungeon World and Font Awesome integration hooks. Scope system overrides to Dungeon World sheets and custom rules to the relevant module controls.
- Keep character-sheet helpers together in `styles/DWES-character-sheet.css` and chat results in `styles/DWES-chat.css`.
- Preserve keyboard focus, accessible labels, disabled/read-only states and documented nightmode compatibility. Explain necessary `!important` overrides.

## Language and documentation

- Keep code comments and documentation in English; user-facing strings may be localized. Use Foundry localization and keep English and German translation keys aligned when adding or changing localized UI.
- Keep the README concise and focused on what users can do. Leave implementation details in developer documentation.
- Summarize meaningful additions, behavior changes and fixes once per release in the changelog. Omit individual development steps, cosmetic churn and abandoned approaches. Use an unknown date when a release date is not established.
- Do not change the manifest version, publish a release or claim a known issue is fixed as part of a documentation-only change.

## Verification

- Check syntax, JSON and file references as appropriate to the change. For hook renames, check templates, listeners and styles together.
- Use focused behavior checks for functional changes. For visual or Foundry-specific changes, verify in the relevant Foundry versions when available and report any unverified integration or visual behavior.
- Distinguish existing review findings from regressions introduced or fixed by the current task. Record only checks actually performed.
