Hooks.once("init", () => {
  console.log("✅ Hook INIT triggered");

  class DummySheet extends ActorSheet {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = ["dummy-sheet"];
      options.template = "modules/dungeonworld-hirelings/templates/dummy-sheet.html";
      options.width = 400;
      options.height = 300;
      return options;
    }
  }

  Actors.registerSheet("dummy-test", DummySheet, {
    types: ["npc"],
    label: "Dummy Test Sheet",
    makeDefault: false
  });

  console.log("✅ DummySheet registered");
});
