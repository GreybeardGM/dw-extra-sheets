export function defineHirelingSheet(baseClass) {
  return class HirelingSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 600;
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
    
      // Fallback in case of missing skill structure
      const safeSkill = (skill) => skill ?? { label: "", value: 0, max: 0 };
    
      context.loyalty = [
        system.loyalty?.value ?? 0,
        system.loyalty?.cost ?? "",
      ];
    
      context.skills = [
        safeSkill(system.skills?.skill1),
        safeSkill(system.skills?.skill2),
        safeSkill(system.skills?.skill3),
        safeSkill(system.skills?.skill4),
        safeSkill(system.skills?.skill5),
      ];
    
      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      // Use a Skill Point
      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        const path = `system.skills.skill${idx}.value`;
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
          const skill = this.actor.system.skills[`skill${i}`];
          if (skill && typeof skill.max === "number") {
            updates[`system.skills.skill${i}.value`] = skill.max;
          }
        }
        await this.actor.update(updates);
      });

      // Loyalty Roll
      html.find(".loyalty-roll").click(async ev => {
        ev.preventDefault();
        const loyalty = this.actor.system.loyalty?.value || 0;
        const roll = new Roll("2d6 + @loyalty", { loyalty });
        await roll.roll({ async: true });
        roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: "Loyalty Check" });
      });
    }
  };
}
