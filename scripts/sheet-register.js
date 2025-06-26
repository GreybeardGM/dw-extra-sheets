import { defineHirelingSheet } from "./hireling-class.js";
import { defineAnimalCompanionSheet } from "./animal-companion-class.js";
import { defineStashSheet } from "./stash-class.js";
import { useHirelingSkill, resetHirelingnSkills } from "./utils/hireling-utils.js";

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
  Actors.registerSheet("dw-extra-sheets", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  // Register Animal Companion Sheet
  const AnimalCompanionSheet = defineAnimalCompanionSheet(DwActorSheet);
  Actors.registerSheet("dw-extra-sheets", AnimalCompanionSheet, {
    types: ["npc"],
    label: "Animal Companion Sheet",
    makeDefault: false
  });

  // Register Stash Sheet
  const StashSheet = defineStashSheet(DwActorSheet);
  Actors.registerSheet("dw-extra-sheets", StashSheet, {
    types: ["npc"],
    label: "Stash Sheet",
    makeDefault: false
  });

  // Expose Helpers
  window.useHirelingSkill = useHirelingSkill;
  window.resetHirelingSkills = resetHirelingSkills;
  
  console.log("✅📜 Greybeard.GM addon sheets ready!");
});
