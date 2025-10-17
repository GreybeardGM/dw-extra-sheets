// sheet-register.js
import { defineHirelingSheet } from "./hireling-class.js";
import { defineAnimalCompanionSheet } from "./animal-companion-class.js";
import { defineStashSheet } from "./stash-class.js";
import { defineShopSheet } from "./shop-class.js";
import { useHirelingSkill, resetHirelingSkills } from "./utils/hireling-utils.js";

Hooks.once("ready", () => {
  // Foundry V13+: namespaced Actors collection; fallback für V12
  const ActorsCollection =
    foundry?.documents?.collections?.Actors ?? globalThis.Actors;

  const npcSheets = CONFIG.Actor?.sheetClasses?.npc;
  const dwEntry = npcSheets?.["dungeonworld.DwActorNpcSheet"];
  const DwActorSheet = dwEntry?.cls;
  if (!DwActorSheet) {
    console.error("❌ Dungeon World NPC sheet class not found");
    return;
  }

  // Register Hireling Sheet
  const HirelingSheet = defineHirelingSheet(DwActorSheet);
  ActorsCollection.registerSheet("dw-extra-sheets", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  // Register Animal Companion Sheet
  const AnimalCompanionSheet = defineAnimalCompanionSheet(DwActorSheet);
  ActorsCollection.registerSheet("dw-extra-sheets", AnimalCompanionSheet, {
    types: ["npc"],
    label: "Animal Companion Sheet",
    makeDefault: false
  });

  // Register Stash Sheet
  const StashSheet = defineStashSheet(DwActorSheet);
  ActorsCollection.registerSheet("dw-extra-sheets", StashSheet, {
    types: ["npc"],
    label: "Stash Sheet",
    makeDefault: false
  });

  // Register Shop Sheet
  const ShopSheet = defineShopSheet(DwActorSheet);
  ActorsCollection.registerSheet("dw-extra-sheets", ShopSheet, {
    types: ["npc"],
    label: "Shop Sheet",
    makeDefault: false
  });

  // Expose Helpers
  window.useHirelingSkill = useHirelingSkill;
  window.resetHirelingSkills = resetHirelingSkills;

  console.log("✅📜 Greybeard.GM DW Extra Sheets ready!");
});
