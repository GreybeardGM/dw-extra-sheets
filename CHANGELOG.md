# Changelog

## [0.4.8-dev.5] – 2026-11-05

### Changed
- Replaced each set of three recovery pips with one larger, segmented recovery circle.
- Each click cycles 0 → 3 → 2 → 1 → 0, updating the native debility together with its counter.
- Kept existing counter values, ownership checks, tooltips, and keyboard controls.

### Added
- Four self-contained SVG state icons in `assets/icons/`, loaded through Foundry's route helper for URL-prefix support.

## [0.4.8-dev.4] – 2026-11-04

### Changed
- Restyled recovery pips as white circles with black borders and centered blue dots when active.
- Isolated the pip visuals from Foundry button styles and pseudo-elements, including Dungeon World nightmode.
- Retained compact inline placement, hover feedback, and a visible keyboard focus indicator.

## [0.4.8-dev.3] – 2026-11-04

### Changed
- Replaced each character debility checkbox with compact recovery pips before its label.
- Removed the additional pip row and its reserved vertical space.
- Pip changes now save the recovery counter and the native debility together: 0 clears it, 1–3 activate it.
- Existing active debilities without a positive counter display three pips; inactive debilities display none.
- Kept the debility label outside a checkbox label to prevent unintended activation and stale form submissions.

## [0.4.8-dev.2] – 2026-11-02

### Added
- Three consecutive recovery pips below each of the six character debilities.
- Separate actor flags for the six remaining recovery counters (0–3), with owner-only editing.
- Localized tooltips, keyboard controls, and read-only counters for other viewers.

### Changed
- Reserved space below the original ability cells for pips, preserving field and modifier-circle positions.
- Recovery counters are manual and do not toggle the system's debility checkboxes.

## [0.4.7] – 2026-08-14

### Added
- Added optional weight calculation support for Hirelings.
- Added a separately initialized Herculean Appetites extension for character actors that have the move.
  - Added a compact sheet toggle between the normal `2d6` roll and the marked `1d6 + 1d8` appetite roll.
  - Added automatic evaluation of the marked dice and a localized chat result for an additional complication.
  - Added a dedicated stylesheet for the extension.

### Changed
- The Loyalty button on the Hireling sheet now uses Dungeon World's native roll-result configuration.
- Localized the Hireling loyalty roll chat card and its error notification in English and German.
- Implemented targeted performance upgrades and general code cleanup for improved maintainability.

## [0.4.1] – 2025-10-17

### Changed
- Updated compatibility for Foundry VTT v13.

## [0.4.0] – 2025-07-17

### Added
- Initial public release of the module.
- Hireling Sheet with skill management and loyalty rolling.
- Animal Companion Sheet with strengths, trainings, and weaknesses.
- Merchant Sheet with buying functionality and category filters.
- Stash Sheet for simple item storage.
- English and German localization.
