# Changelog

## [0.4.6] – 2026-08-08

### Added
- Added optional weight calculation support for Hirelings.
- Added a separately initialized Herculean Appetites extension for character actors that have the move.
- Added a compact sheet toggle between the normal `2d6` roll and the marked `1d6 + 1d8` appetite roll.
- Added automatic evaluation of the marked dice and a localized chat result for an additional complication.
- Added a dedicated stylesheet for the extension.

### Changed
- Implemented targeted performance upgrades and general code cleanup for improved maintainability.
- Preserved and restored any existing custom actor roll formula when toggling Herculean Appetites.
- Reduced the toggle labels and chat output to the information needed during play.
- Removed routine toggle notifications while retaining genuine error notifications.
- Gave the active toggle and both chat outcomes distinct, muted visual states.
- Scoped extension classes and CSS variables consistently under `dwes-appetites`.
- Applied the active button background inline so it remains visible when Dungeon World Night Mode uses `!important`.
- Simplified the extension code by removing redundant helpers and repeated content processing.

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
