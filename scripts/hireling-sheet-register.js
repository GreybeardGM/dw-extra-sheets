import { HirelingSheet } from "./hireling-sheet-class.js";

Hooks.once("ready", () => {
  const npcSheetClass = CONFIG.Actor.sheetClasses.npc?.["dungeonworld.DwActorNpcSheet"]?.cls;

  if (!npcSheetClass) {
    console.error("❌ Dungeon World NPC sheet class not found.");
    return;
  }

  console.log("✅ Registering HirelingSheet…");
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });
});
