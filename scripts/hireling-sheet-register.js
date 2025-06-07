import { defineHirelingSheet } from "./hireling-sheet-class.js";

Hooks.once("ready", () => {
  const npcSheets = CONFIG.Actor.sheetClasses.npc;
  const dwEntry = npcSheets["dungeonworld.DwActorNpcSheet"];
  const DwActorSheet = dwEntry?.cls;

  if (!DwActorSheet) {
    console.error("❌ Dungeon World NPC sheet class not found");
    return;
  }

  const HirelingSheet = defineHirelingSheet(DwActorSheet);

  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  console.log("✅ Hireling sheet registered.");
});
