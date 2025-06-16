import { defineHirelingSheet } from "./hireling-sheet-class.js";
import { defineStashSheet } from "./stash-sheet-class.js";
import { useHirelingSkill, resetHirelingSkills } from "./hireling-utils.js";

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

  // Expose Hireling Helpers
  window.useHirelingSkill = useHirelingSkill;
  window.resetHirelingSkills = resetHirelingSkills;
  
  console.log("✅📜 Greybeard.GM addon sheets ready!");
});
