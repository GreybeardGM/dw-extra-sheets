import { HirelingSheet } from "./hireling-sheet.js";

Hooks.once("init", () => {
  console.log("✅ Hireling Module: INIT");

  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  console.log("✅ HirelingSheet registered");
});
