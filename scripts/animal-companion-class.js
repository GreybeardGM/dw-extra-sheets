import { prepareEquipmentItems } from "./items.js";

export function defineAnimalCompanionSheet(baseClass) {
  return class AnimalCompanionSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "animal-companion"];
      options.width = 560;
      options.height = 730;
      options.template = `modules/${game.modules.get("dw-extra-sheets")?.id}/templates/animal-companion-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    // Change the Template
    get template() {
      return "modules/dw-extra-sheets/templates/animal-companion-sheet.html";
    }

    // Get Data
    async getData(options) {
      const context = await super.getData(options);
      const system = this.actor.system;
    
      // === Initialize blank hireling structure if missing ===
      system.animalCompanion ??= {};

      // === Prepare Hireling Stats ===
      const context = system.animalCompanion;    
      context.active ??= false;
      context.species ??= "";
      context.ferocity ??= 0;
      context.cunning ??= 0;
      context.armor ??= 0;
      context.instinct ??= 0;
      context.strenghts ??= {};
      context.trainings ??= {};
      context.weaknesses ??= {};
    
      await prepareEquipmentItems(context, this.actor);
      
      return context;
    }

    // Listeners
    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      // Config button
      html.find(".configure").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = true;
        this.render();
      });
      // Config done    
      html.find(".done").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = false;
        this.render();
      });
  };
}
