import { HirelingSheet } from "./hireling-sheet.js";

Hooks.once("init", () => {
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });
});
