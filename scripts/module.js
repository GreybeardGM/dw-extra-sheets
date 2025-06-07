import { HirelingSheet } from "./hireling-sheet.js";

Hooks.once("init", () => {
  console.log("Registering HirelingSheet for NPC actors");
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false,
  });
});
