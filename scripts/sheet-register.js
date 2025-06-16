import { defineHirelingSheet } from "./hireling-sheet-class.js";
import { defineStashSheet } from "./stash-sheet-class.js";

Hooks.once("ready", () => {
  const npcSheets = CONFIG.Actor.sheetClasses.npc;
  const dwEntry = npcSheets["dungeonworld.DwActorNpcSheet"];
  const DwActorSheet = dwEntry?.cls;

  if (!DwActorSheet) {
    console.error("❌ Dungeon World NPC sheet class not found");
    return;
  }

  // Register Hireling Sheet
  const HirelingSheet = defineHirelingSheet(DwActorSheet);
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  // Register Stash Sheet
  const StashSheet = defineStashSheet(DwActorSheet);
  Actors.registerSheet("dungeonworld-hirelings", StashSheet, {
    types: ["npc"],
    label: "Stash Sheet",
    makeDefault: false
  });

  console.log("✅📜 Greybeard.GM addon sheets ready!");
});

// handlebars-helpers
Handlebars.registerHelper('skillDots', function(value, max, options) {
  let result = '';
  for (let i = 0; i < max; i++) {
    // You can use Handlebars.SafeString for safe HTML
    const filled = i < value ? 'filled' : 'empty';
    result += `<span class="skill-dot ${filled}"></span>`;
  }
  return new Handlebars.SafeString(result);
});
