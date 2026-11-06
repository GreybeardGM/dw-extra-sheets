# 🐉 Dungeon World: Extra Sheets

**A module for Foundry VTT v12–13 that adds focused actor sheets and character-sheet helpers to Dungeon World.**  
Manage Hirelings, Animal Companions, Stashes, Merchants, and Mounts with interfaces tailored to their roles, and handle the Barbarian's Herculean Appetites without changing roll formulas by hand.

---

## ✨ Features

- **Debility Recovery Circle**
  A segmented circle replaces each character debility checkbox and tracks its remaining recovery time (0–3).
  Each click cycles through empty → full → two thirds → one third → empty (0 → 3 → 2 → 1 → 0).
  An empty circle clears the debility; any blue filling activates it, saving both values together.
  Existing active debilities without a positive recovery count display a full circle; inactive debilities display an empty circle.
  Only owners can edit the circle. Its four SVG states are bundled in `assets/icons/` inside this module.

- 📜 **Hireling Sheet**  
  A streamlined sheet for Hirelings. Includes:
  - Skill management
  - Compatibility with items and NPC moves
  - Loyalty rolls
  - Optional weight calculation
  - Quality-of-life features for hireling management

- 🐾 **Animal Companion Sheet**  
  For rangers and druids who fight alongside furry or scaly friends. Includes:
  - Basic stat tracking
  - Strengths, Trainings, and Weaknesses
  - Compatibility with items and NPC moves
  - Quality-of-life features for animal companions

- 🎁 **Stash Sheet**  
  A simplified storage sheet for loot piles, hideouts, or treasure chests. Includes:
  - Item category filters

- 🛍️ **Merchant Sheet**  
  A minimal sheet for shopkeeping NPCs. Includes:
  - Item category filters
  - Player purchases transferred directly to the character
  - Unlimited GM-defined stock
  - GM notes
  - Ownership safeguards for purchases

- 🐎 **Mount Sheet**  
  A focused sheet for mounts. Includes:
  - Current and maximum weight tracking
  - Compatibility with items and NPC moves

- 🔥 **Herculean Appetites Helper**  
  A character-sheet control for Barbarians with the Herculean Appetites move. Includes:
  - A compact `2d6` / `1d6 + 1d8` toggle
  - Preservation of an existing custom roll formula
  - Automatic evaluation of the appetite dice
  - A concise, localized complication result in the existing chat card

---

## ⚙️ Compatibility

- ✔️ Foundry VTT versions 12 and 13
- ✔️ [Dungeon World System](https://foundryvtt.com/packages/dungeonworld)

---

## 📦 Installation

### Foundry VTT

1. Install the module using this manifest URL:

[https://raw.githubusercontent.com/GreybeardGM/dw-extra-sheets/main/module.json](https://raw.githubusercontent.com/GreybeardGM/dw-extra-sheets/main/module.json)

2. Activate the module in your world under **Settings > Manage Modules**.

---

## 🔧 Usage

### Extra sheets

1. Create or open an NPC actor.
2. Open **Sheet Configuration** from the actor sheet.
3. Choose one of the available extra sheet types.

### Herculean Appetites

1. Add the **Herculean Appetites** move to a character.
2. Open the character sheet and use the button beside the roll formula.
3. Roll moves normally; the selected formula remains active until switched back.

---

## 📚 Localization

- 🇬🇧 English
- 🇩🇪 German  
_(Additional translations are welcome.)_

---

## 🧪 Development

### Stylesheets

All stylesheet filenames start with `DWES` for easier identification in browser developer tools:

- `styles/DWES-extra-sheets.css`: custom NPC sheets, scoped to `.dwes-extra-sheet`.
- `styles/DWES-sheet-fixes.css`: shared Dungeon World sheet layout fixes.
- `styles/DWES-character-sheet.css`: character-sheet controls for Herculean Appetites and debility recovery.
- `styles/DWES-chat.css`: Herculean Appetites chat results.

Module controls and custom properties use the `dwes-` prefix. See [CSS naming](docs/css-naming.md) and the [2026-11-06 review](docs/review-2026-11-06.md). Shared system overrides are scoped to `.dungeonworld.sheet`; custom sheet rules use `.dwes-extra-sheet`. Theme compatibility overrides using `!important` are retained.

This module is under active development. Feedback, suggestions, and contributions are welcome.

- Author: [GreybeardGM](https://github.com/GreybeardGM)
- Repository: [github.com/GreybeardGM/dw-extra-sheets](https://github.com/GreybeardGM/dw-extra-sheets)

---

## 🛠 Planned Features

- ⭐ **Monster Sheet Plus** – a future expansion of the default NPC sheet

---

## 📜 License

This module is released under the **MIT License**.  
Dungeon World © Sage Kobold Productions.

