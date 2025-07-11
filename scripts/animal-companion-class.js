import { prepareEquipmentItems } from "./utils/items.js";
import { useAnimalCompanionSkill, resetAnimalCompanionSkills } from "./utils/animal-companion-utils.js";

export function defineAnimalCompanionSheet(baseClass) {
  return class AnimalCompanionSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "animal-companion"];
      options.width = 560;
      options.height = 730;
      options.template = `modules/dw-extra-sheets/templates/animal-companion-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    get template() {
      return "modules/dw-extra-sheets/templates/animal-companion-sheet.html";
    }

    async getData(options) {
      const context = await super.getData(options);
      const system = this.actor.system;

      // === Initialize blank animal companion structure if missing ===
      system.animalCompanion ??= {};
      const ac = system.animalCompanion;

      // === Ensure inner structures ===
      ac.skills ??= {};
      const defaultSkill = (label) => ({ label, value: 0, max: 0 });      
      ac.skills.ferocity ??= defaultSkill("Ferocity");
      ac.skills.cunning ??= defaultSkill("Cunning");
      ac.skills.armor ??= defaultSkill("Armor");
      ac.skills.instinct ??= defaultSkill("Instinct");

      ac.feats ??= {};
      ac.feats.strengthsText ??= "";
      ac.feats.trainingsText ??= "";
      ac.feats.weaknessesText ??= "";

      ac.owner ??= "";
      ac.species ??= "";
      ac.active ??= false;

      context.animalCompanion = ac;

      await prepareEquipmentItems(context, this.actor);
      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      html.find(".skill-configure").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = true;
        this.render();
      });

      html.find(".skill-done").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = false;
        this.render();
      });

      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        await useAnimalCompanionSkill(this.actor, idx);
        this.render();
      });

      html.find(".skill-reset").click(async ev => {
        ev.preventDefault();
        await resetAnimalCompanionSkills(this.actor);
        this.render();
      });

      function autoGrow(el) {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
      
      html.find("textarea.autogrow").each((_, el) => autoGrow(el));
      html.find("textarea.autogrow").on("input", ev => autoGrow(ev.currentTarget));

    }
  };
}
