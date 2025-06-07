import { HirelingSheet } from "./hireling-sheet.js";

Hooks.once("init", () => {
  console.log("dungeonworld-hirelings | Initializing hireling sheet");
  
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["hireling"], // or ["npc"]
    label: "Hireling Sheet",
    makeDefault: true // or false, depending on your setup
  });
});
