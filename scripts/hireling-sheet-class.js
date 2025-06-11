export function defineHirelingSheet(baseClass) {
  return class HirelingSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 670;
      options.template = `modules/${game.modules.get("dungeonworld-hirelings")?.id}/templates/hireling-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    // Change the Template
    get template() {
      return "modules/dungeonworld-hirelings/templates/hireling-sheet.html";
    }

    async getData(options) {
      console.log("✔ getData reached in HirelingSheet");
    
      const context = await super.getData(options);
      const system = this.actor.system;
    
      // === Initialize blank hireling structure if missing ===
      system.hireling ??= {};

      // === Prepare Hireling Stats ===
      const h = system.hireling;    
      h.loyalty ??= { value: 0, cost: "" };
      h.skills ??= {};
      for (let i = 1; i <= 5; i++) {
        h.skills[`skill${i}`] ??= { label: "", value: 0, max: 0 };
      }
      h.active ??= false;
      h.rank ??= 0;
      h.hirelingClass ??= "";
    
      context.loyalty = [h.loyalty.value, h.loyalty.cost];
      context.skills = [
        h.skills.skill1,
        h.skills.skill2,
        h.skills.skill3,
        h.skills.skill4,
        h.skills.skill5,
      ];
      context.active = h.active;
      context.rank = h.rank;
      context.hirelingClass = h.hirelingClass;

      await this._prepareHirelingItems(context);
      console.log("HirelingSheet context.equipment:", context.equipment);
      console.log("All item types:", (context.items ?? []).map(i => i.type));
      
      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      // Config button
      html.find(".skill-configure").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = true;
        this.render();
      });
      // Config done    
      html.find(".skill-done").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = false;
        this.render();
      });

      // Use a Skill Point
      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        const path = `system.hireling.skills.${idx}.value`;
        const current = getProperty(this.actor, path);
        if (typeof current === "number" && current > 0) {
          await this.actor.update({ [path]: current - 1 });
        }
      });
      
      // Reset Skill Points
      html.find(".skill-reset").click(async ev => {
        ev.preventDefault();
        const updates = {};
        for (let i = 1; i <= 5; i++) {
          const base = `system.hireling.skills.skill${i}`;
          const max = getProperty(this.actor, `${base}.max`);
          if (typeof max === "number") {
            updates[`${base}.value`] = max;
          }
        }
        await this.actor.update(updates);
      });
    }

    // Prepare Equipment
    async _prepareHirelingItems(sheetData) {
      const equipment = [];
      const items = Array.isArray(sheetData.items)
        ? sheetData.items
        : Object.values(sheetData.items ?? {});
      for (let i of items) {
        // Optional: Enrich description for Foundry-style formatting
        if (i.system?.description) {
          i.system.descriptionEnriched = await TextEditor.enrichHTML(i.system.description, {
            async: true,
            documents: true,
            secrets: this.actor.isOwner,
            rollData: this.actor.getRollData(),
          });
        }
        if (i.type === "equipment") equipment.push(i);
      }
      sheetData.equipment = equipment;
    }

  };
}
