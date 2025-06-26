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
      const context = await super.getData(options);
      const ac = system.animalCompanion;
      
      ac.active ??= false;
      ac.owner ??= "";
      ac.species ??= "";
      ac.skills.ferocity ??= 0;
      ac.skills.cunning ??= 0;
      ac.skills.armor ??= 0;
      ac.skills.instinct ??= 0;
      ac.feats.strengths ??= [];
      ac.feats.trainings ??= [];
      ac.feats.weaknesses ??= [];
      
      context.animalCompanion = ac;
      
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
