Hooks.once("ready", async function () {
  // Wait until the DW NPC sheet is available
  let retries = 0;
  let DwActorSheet;

  while (!DwActorSheet && retries < 10) {
    DwActorSheet = Object.values(CONFIG.Actor.sheetClasses.npc || {}).find(cls =>
      cls.id?.includes("DwActorNpcSheet")
    )?.cls;

    if (!DwActorSheet) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  if (!DwActorSheet) {
    console.error("❌ Gave up waiting for Dungeon World sheet class.");
    return;
  }

  // Import the sheet logic and extend from DwActorSheet
  const { HirelingSheet } = await import("./hireling-sheet-class.js");

  // Register the sheet
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  console.log("✅ Hireling sheet registered.");
});
