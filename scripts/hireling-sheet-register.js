// hireling-sheet-register.js
import { createHirelingSheet } from "./hireling-sheet-class.js";

Hooks.once("ready", () => {
  const npcSheetClass = CONFIG.Actor.sheetClasses.npc?.["dungeonworld.DwActorNpcSheet"]?.cls;

  if (!npcSheetClass) {
    console.error("❌ Dungeon World NPC sheet class not found.");
    return;
  }

  const HirelingSheet = createHirelingSheet(npcSheetClass);

  console.log("✅ Registering HirelingSheet…");
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: Object.keys(CONFIG.Actor.sheetClasses.npc),
    label: "Hireling Sheet",
    makeDefault: false
  });
});
