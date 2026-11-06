# CSS and UI hook naming

Adapted from [Greybearded Token Frames](https://github.com/GreybeardGM/greybearded-tokens/blob/3fdc5cbd21dce115854b40d7c6f386f27d024c76/docs/css-naming.md).

- Stylesheet filenames begin with `DWES`.
- Custom UI blocks use `dwes-<feature>`; elements use `dwes-<feature>__<element>`. Existing character helpers also use namespaced standalone classes and `--<state>` modifiers.
- Custom form IDs use `dwes-<feature>-{{actor._id}}`; matching labels use the same value to avoid collisions between actors.
- Update templates, JavaScript selectors and CSS together when renaming a hook.
- Custom NPC sheet styles start at `.dwes-extra-sheet`. Shared system layout fixes start at `.dungeonworld.sheet`. Character helper and chat rules target `dwes-` controls directly or within a Dungeon World sheet.
- Custom properties use `--dwes-` and are defined on the relevant control or result, rather than `:root`.

Foundry, Dungeon World, Font Awesome and form-data integration hooks retain their existing names: for example `.item`, `.item-controls`, `.ability-debility`, `.sheet-wrapper`, `.field--checkbox`, `.rollable`, `.tags-input-source`, `.animal-companion`, `.shop`, `system.*`, and `data-item-id`. These are integration contracts rather than new module UI hooks. The module ID and asset paths remain `dw-extra-sheets`.

Theme-specific `!important` overrides remain where required by the existing Dungeon World nightmode styling. New overrides should explain why the existing theme cascade cannot supply the behavior.
