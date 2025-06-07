import { HirelingSheet } from "./scripts/hireling-sheet.js";

Hooks.once("init", () => {
  console.log("dungeonworld-hirelings | Initializing hireling sheet");
  
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });
});
