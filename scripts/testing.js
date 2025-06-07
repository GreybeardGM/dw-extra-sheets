Hooks.once("ready", async function () {
  const npcSheets = CONFIG.Actor.sheetClasses.npc;
  const dwEntry = npcSheets["dungeonworld.DwActorNpcSheet"];
  const DwActorSheet = dwEntry?.cls;

  if (!DwActorSheet) {
    console.error("❌ Dungeon World NPC sheet class not found");
    return;
  }

  console.log("✅ Dungeon World NPC sheet found:", DwActorSheet);

  class HirelingSheet extends DwActorSheet {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 600;
      options.template = `modules/${game.modules.get("dungeonworld-hirelings")?.id}/templates/hireling-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    async getData(options) {
      console.log("✔ getData reached in HirelingSheet");
      const context = await super.getData(options);
      return context;
    }
  }

  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  console.log("✅ Hireling sheet registered.");
});
